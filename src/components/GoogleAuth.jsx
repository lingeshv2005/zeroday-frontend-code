import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase.js';

const GoogleAuth = ({ onAuthSuccess, onAuthError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null); // 'admin' or 'student'

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    hd: 'sece.ac.in',
    prompt: 'select_account',
  });

  const signInWithGoogle = async () => {
    if (!selectedRole) {
      onAuthError('Please select a role before signing in');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      if (!user.email.endsWith('@sece.ac.in')) {
        throw new Error('Only @sece.ac.in email addresses are allowed');
      }

      // Send token and role to backend
      const response = await fetch(`https://zeroday-backend-code.onrender.com/${selectedRole}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      const sessionKey = selectedRole === 'admin' ? 'adminSession' : 'studentSession';
      localStorage.setItem(sessionKey, JSON.stringify({
        [selectedRole]: data[selectedRole],
        user: {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
        },
        token
      }));

      localStorage.setItem('role', selectedRole);
      onAuthSuccess(data[selectedRole], user);

    } catch (error) {
      console.error('GoogleAuth Error:', error);
      onAuthError(error.message || 'Sign-in error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    const studentSession = localStorage.getItem('studentSession');

    try {
      if (adminSession) {
        const { admin, user } = JSON.parse(adminSession);
        onAuthSuccess(admin, user);
      } else if (studentSession) {
        const { student, user } = JSON.parse(studentSession);
        onAuthSuccess(student, user);
      }
    } catch (err) {
      console.error('Session load error:', err);
      localStorage.removeItem('adminSession');
      localStorage.removeItem('studentSession');
    }
  }, []);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Main Auth Card */}
        <div className="glass-card rounded-3xl p-8 text-center">
{/* Logo and Header */}
<div className="mb-8 text-center">
  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white shadow-xl ring-4 ring-indigo-500/20 flex items-center justify-center relative overflow-hidden">
    <img
      src="/logo.png"
      alt="SECE Leadership & Excellence Logo"
      className="w-16 h-16 object-contain transition-opacity duration-300"
      onError={(e) => {
        e.target.style.display = 'none';
        const fallback = e.target.nextSibling;
        if (fallback) fallback.style.display = 'flex';
      }}
    />
    {/* Fallback text logo */}
    <div className="hidden absolute inset-0 items-center justify-center text-indigo-600 font-bold text-xl">
      SECE
    </div>
  </div>

  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-2">
    Eshwar Nanban
  </h1>
  <p className="text-gray-600">Welcome back! Please select your role to continue</p>
</div>

          {/* Role Selection */}
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-700 mb-4">I am signing in as:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedRole('admin')}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 transform hover:-translate-y-1 ${
                  selectedRole === 'admin'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedRole === 'admin'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className={`font-medium text-sm ${
                    selectedRole === 'admin' ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    Admin
                  </span>
                </div>
                {selectedRole === 'admin' && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>

              <button
                onClick={() => setSelectedRole('student')}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 transform hover:-translate-y-1 ${
                  selectedRole === 'student'
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedRole === 'student'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className={`font-medium text-sm ${
                    selectedRole === 'student' ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    Student
                  </span>
                </div>
                {selectedRole === 'student' && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={signInWithGoogle}
            disabled={isLoading || !selectedRole}
            className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-2xl font-medium transition-all duration-200 transform hover:-translate-y-1 ${
              !selectedRole
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'btn-primary hover:shadow-2xl'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {selectedRole && (
            <p className="text-sm text-gray-600 mt-4">
              Signing in as <span className="font-semibold text-gray-800">{selectedRole}</span>
            </p>
          )}
        </div>

        {/* Info Card */}
        <div className="glass-card rounded-2xl p-6 mt-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-800 mb-1">Important Note</p>
              <p className="text-gray-600 mb-2">Only @sece.ac.in email addresses are allowed to sign in.</p>
              <p className="text-gray-500 font-mono text-xs bg-gray-50 px-2 py-1 rounded">Example: hod.2024it@sece.ac.in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuth;
