// src/pages/CodingRoomListPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CodingRoomListPage = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get the user UID from session
  const getUserUID = () => {
    const session =
      JSON.parse(localStorage.getItem('adminSession')) ||
      JSON.parse(localStorage.getItem('studentSession'));
    return session?.user?.uid;
  };

  const fetchRooms = async () => {
    const uid = getUserUID();
    if (!uid) return;

    try {
      const res = await axios.get(`https://zeroday-backend-code.onrender.com/coding-room?uid=${uid}`);
      setRooms(res.data.rooms || []);
    } catch (error) {
      console.error('❌ Failed to fetch rooms:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    const uid = getUserUID();
    if (!uid) return alert('You must be logged in');

    try {
      setLoading(true);
      const res = await axios.post('https://zeroday-backend-code.onrender.com/coding-room', {
        roomName: newRoomName,
        admin: uid,
      });

      setNewRoomName('');
      fetchRooms();
      navigate(`/coding-room/${res.data.roomId}`);
    } catch (error) {
      console.error('❌ Failed to create room:', error);
      alert('Error creating room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (roomId) => {
    navigate(`/coding-room/${roomId}`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Available Coding Rooms</h1>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className="px-4 py-2 border rounded w-1/2"
        />
        <button
          onClick={handleCreateRoom}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </div>

      {rooms.length === 0 ? (
        <p className="text-gray-600">No coding rooms found.</p>
      ) : (
        <ul className="space-y-4">
          {rooms.map((room) => (
            <li key={room._id || room.roomId} className="bg-white shadow p-4 rounded-md flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{room.roomName || room.roomId}</h2>
                <p className="text-sm text-gray-500">Room ID: {room.roomId}</p>
              </div>
              <button
                onClick={() => handleJoin(room.roomId)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Join Room
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CodingRoomListPage;
