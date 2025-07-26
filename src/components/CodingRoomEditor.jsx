// src/pages/CodingRoomPage.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Editor from '../components/Editor';
import { io } from 'socket.io-client';

const BASE_URL = 'https://zeroday-backend-code.onrender.com';
const socket = io(BASE_URL);

const CodingRoomPage = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('// Loading...');
  const [logs, setLogs] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantDetails, setParticipantDetails] = useState({});
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [uidToAdd, setUidToAdd] = useState('');
  const [roleToAdd, setRoleToAdd] = useState('view');

  // Refs for debouncing and tracking last synced code
  const saveTimeout = useRef(null);
  const lastCodeRef = useRef('');
  const TYPING_PAUSE = 2000; // ms

  const userSession =
    JSON.parse(localStorage.getItem('adminSession')) ||
    JSON.parse(localStorage.getItem('studentSession'));
  const user = userSession?.user;

  // 1️⃣ Fetch room metadata and participants
  useEffect(() => {
    let isMounted = true;
    axios
      .get(`${BASE_URL}/coding-room/${roomId}`)
      .then(res => {
        if (!isMounted) return;
        setRoom(res.data);
        setParticipants(res.data.participants || []);
        socket.emit('join-room', roomId);
      })
      .catch(err => console.error('❌ Load room failed:', err));

    return () => {
      isMounted = false;
      socket.emit('leave-room', roomId);
      socket.disconnect();
    };
  }, [roomId]);

  // 2️⃣ Fetch initial code content from Firestore once
  useEffect(() => {
    (async () => {
      try {
        const docRef = doc(db, 'codingRooms', roomId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const initial = data.codeContent || '';
          setCode(initial);
          lastCodeRef.current = initial;
        }
      } catch (err) {
        console.error('❌ Firestore initial fetch failed:', err);
      }
    })();
  }, [roomId]);

  // 3️⃣ Listen for Socket.IO code updates
  useEffect(() => {
    const onSocketCode = ({ code: incoming }) => {
      if (incoming !== lastCodeRef.current) {
        setCode(incoming);
        lastCodeRef.current = incoming;
        setLogs(logs => [
          ...logs.slice(-29),
          '🔄 Synced from another user'
        ]);
      }
    };
    socket.on('codeUpdate', onSocketCode);
    return () => {
      socket.off('codeUpdate', onSocketCode);
    };
  }, []);

  // 4️⃣ Listen for participant list updates
  useEffect(() => {
    const onPartUpdate = ({ participants }) => {
      setParticipants(participants);
    };
    socket.on('participants-update', onPartUpdate);
    return () => socket.off('participants-update', onPartUpdate);
  }, []);

  // 5️⃣ Fetch participant names in batch
  useEffect(() => {
    if (!participants.length) return;
    (async () => {
      const details = {};
      await Promise.all(
        participants.map(async ({ uid }) => {
          try {
            const res = await axios.get(
              `${BASE_URL}/student/profile/${uid}`
            );
            details[uid] = res.data.student.name;
          } catch {
            details[uid] = 'Unknown';
          }
        })
      );
      setParticipantDetails(details);
    })();
  }, [participants]);

  // 6️⃣ Handle code edits: socket emit + debounced Firestore save
  const handleCodeChange = useCallback(
    value => {
      setCode(value);
      lastCodeRef.current = value;

      // Fast real-time
      socket.emit('codeUpdate', {
        roomId,
        code: value,
        username: user?.displayName || 'Anonymous'
      });

      // Debounced persistence
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        try {
          await axios.put(
            `${BASE_URL}/coding-room/${roomId}/code`,
            {
              uid: user?.uid,
              codeContent: lastCodeRef.current
            }
          );
          setLogs(logs => [
            ...logs.slice(-29),
            '✅ Firestore saved'
          ]);
        } catch (err) {
          setLogs(logs => [
            ...logs.slice(-29),
            `🔥 Save error: ${err.message}`
          ]);
        }
      }, TYPING_PAUSE);
    },
    [roomId, user]
  );

  // 7️⃣ Run code in editor
  const handleRun = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/editor/compile`,
        { code, language: room?.language || 'javascript' }
      );
      setLogs(logs => [
        ...logs.slice(-29),
        `▶ ${res.data.output}`
      ]);
    } catch (err) {
      setLogs(logs => [
        ...logs.slice(-29),
        `❌ ${err.response?.data?.error || 'Compilation failed'}`
      ]);
    }
  };

  // 8️⃣ Participant search & add
  const handleSearch = query => {
    setSearchName(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/student/search?name=${query}`
        );
        setSearchResults(res.data.results || []);
      } catch {
        setSearchResults([]);
      }
    }, 400);
  };

  const handleAddParticipant = async () => {
    if (!uidToAdd) return alert('Select a user to add');
    try {
      await axios.post(
        `${BASE_URL}/coding-room/${roomId}/participant`,
        {
          uidToAdd,
          role: roleToAdd,
          addedBy: user?.uid
        }
      );
      setUidToAdd('');
      setSearchName('');
      setSearchResults([]);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add participant');
    }
  };

  if (!room) return <div className="p-6">Loading Room...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Editor Panel */}
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          Room: {room.roomName || room.roomId}
        </h2>

        <Editor code={code} onChange={handleCodeChange} />

        <button
          onClick={handleRun}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Run Code
        </button>

        <div className="mt-4 bg-white p-4 rounded shadow">
          <h4 className="font-semibold text-lg mb-2">Logs:</h4>
          <pre className="text-sm whitespace-pre-wrap text-gray-800">
            {logs.join('\n')}
          </pre>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l p-4 shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">
          Participants
        </h3>

        <input
          type="text"
          value={searchName}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name"
          className="w-full px-2 py-1 border rounded text-sm"
        />

        {searchResults.length > 0 && (
          <div className="border rounded bg-white shadow max-h-40 overflow-y-auto mt-1">
            {searchResults.map(student => (
              <div
                key={student.uid}
                onClick={() => {
                  setUidToAdd(student.uid);
                  setSearchName(student.name);
                  setSearchResults([]);
                }}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {student.name} ({student.uid})
              </div>
            ))}
          </div>
        )}

        <select
          value={roleToAdd}
          onChange={e => setRoleToAdd(e.target.value)}
          className="w-full mt-2 px-2 py-1 border rounded text-sm"
        >
          <option value="edit">Editor</option>
          <option value="view">Viewer</option>
        </select>

        <button
          onClick={handleAddParticipant}
          className="w-full mt-2 bg-blue-500 text-white py-1 rounded hover:bg-blue-600 text-sm"
        >
          Add Participant
        </button>

        <ul className="mt-4 space-y-2 max-h-[300px] overflow-y-auto text-sm">
          {participants.length === 0 ? (
            <li className="text-gray-500">No participants yet</li>
          ) : (
            participants.map(p => (
              <li
                key={p.uid}
                className="px-3 py-2 bg-gray-100 rounded"
              >
                {participantDetails[p.uid] || 'Loading...'} ({p.role})
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default CodingRoomPage;
