import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';

import GoogleAuth from './components/GoogleAuth';
import AdminDashboard from './components/AdminDashboard';
import CreateAnnouncement from './components/CreateAnnouncement';
import Home from './components/Home';
import Navbar from './components/Navbar';
import LostFoundList from './components/LostFound';
import CodingRoomPage from './components/CodingRoomEditor';
import CodingRoomListPage from './components/CodingRoomListPage';

const App = () => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const res = await fetch(`https://zeroday-backend-code.onrender.com/admin/${firebaseUser.uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.ok) {
            const data = await res.json();
            setAdmin(data.admin);
            setUser(firebaseUser);
          } else {
            setError('Unauthorized access');
            await signOut(auth);
          }
        } catch (err) {
          console.error(err);
          setError('Failed to load admin profile.');
        }
      } else {
        setUser(null);
        setAdmin(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (adminData, firebaseUser) => {
    setAdmin(adminData);
    setUser(firebaseUser);
    setError('');
  };

  const handleAuthError = (message) => {
    setError(message);
    setUser(null);
    setAdmin(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      setUser(null);
      setAdmin(null);
      setError('');
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Error signing out.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col justify-center items-center p-6">
        <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-xl font-semibold text-gray-700">Loading SECE Portal...</span>
          </div>
          <p className="text-gray-500">Please wait while we prepare your experience</p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center space-x-1 mt-6">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-red-800 mb-1">Error</h4>
                <p className="text-sm">{error}</p>
              </div>
              <button 
                onClick={() => setError('')} 
                className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar user={user} admin={admin} onSignOut={handleSignOut} />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            user && admin ? (
              <Navigate to="/" />
            ) : (
              <GoogleAuth
                onAuthSuccess={handleAuthSuccess}
                onAuthError={handleAuthError}
              />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user && admin ? (
              <AdminDashboard
                auth={auth}
                user={user}
                admin={admin}
                onSignOut={handleSignOut}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/create-announcement"
          element={
            user && admin ? <CreateAnnouncement /> : <Navigate to="/login" />
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/lost-found" element={<LostFoundList />} />
        <Route path="/coding-room/:roomId" element={<CodingRoomPage />} />
        <Route path="/coding-room" element={<CodingRoomListPage />} />

      </Routes>
    </div>
  );
};

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
