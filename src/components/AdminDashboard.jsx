import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import UpdateAdminProfile from './UpdateAdminProfile';

const AdminDashboard = ({ auth, user, admin, onSignOut }) => {
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(admin);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Get role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setUserRole(storedRole);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      onSignOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleUpdateSuccess = (updatedAdmin) => {
    setCurrentAdmin(updatedAdmin);
    setUpdatingProfile(false);
  };

  const formatLastLogin = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  if (updatingProfile) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gradient">Update Profile</h1>
              </div>
              <button
                onClick={() => setUpdatingProfile(false)}
                className="btn-secondary flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </button>
            </div>
            <UpdateAdminProfile onUpdateSuccess={handleUpdateSuccess} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Left Sidebar */}
      <div className="w-80 p-6 flex-shrink-0">
        <div className="glass-card rounded-3xl p-6 sticky top-6">
          {/* Dashboard Title */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center animate-float">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gradient">
                {userRole === 'admin' ? 'Admin Panel' : userRole === 'student' ? 'Student Panel' : 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600">
                {userRole === 'admin' ? 'Management Tools' : userRole === 'student' ? 'Student Tools' : 'Quick Actions'}
              </p>
            </div>
          </div>

          {/* Action Buttons - Vertical Layout */}
          <div className="space-y-4">
            <button
              onClick={() => setUpdatingProfile(true)}
              className="w-full btn-primary flex items-center space-x-3 justify-start p-4 text-left"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Update Profile</div>
                <div className="text-sm opacity-80">Edit your information</div>
              </div>
            </button>
            
            {userRole === 'admin' && (
              <button
                onClick={() => navigate('/create-announcement')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center space-x-3 justify-start p-4 text-left"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Create Announcement</div>
                  <div className="text-sm opacity-80">Post new updates</div>
                </div>
              </button>
            )}
            
            {userRole === 'student' && (
              <button
                onClick={() => navigate('/coding-room')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center space-x-3 justify-start p-4 text-left"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Live Code</div>
                  <div className="text-sm opacity-80">Join coding sessions</div>
                </div>
              </button>
            )}
            
        
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-8 text-center card-hover">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden border-4 border-white shadow-xl">
                  {currentAdmin?.photoURL ? (
                    <img
                      src={currentAdmin.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl font-bold text-gradient">
                      {(currentAdmin?.name || user?.displayName)?.charAt(0)?.toUpperCase() || 
                       (userRole === 'admin' ? 'A' : userRole === 'student' ? 'S' : 'U')}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {currentAdmin?.name || user?.displayName || (userRole === 'admin' ? 'Admin' : userRole === 'student' ? 'Student' : 'User')}
              </h2>
              <p className="text-gray-600 mb-4">
                {userRole === 'admin' ? 'Administrator' : userRole === 'student' ? 'Student' : (currentAdmin?.role || 'Member')}
              </p>
              
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">Online</span>
              </div>
            </div>
          </div>

          {/* Details Cards */}
          <div className="lg:col-span-2">
            <div className="grid gap-6">
              {/* Personal Information */}
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {userRole === 'admin' ? 'Admin Information' : userRole === 'student' ? 'Student Information' : 'Personal Information'}
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <DetailCard 
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                    label="Full Name" 
                    value={currentAdmin?.name || 'N/A'} 
                  />
                  <DetailCard 
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                    label="Email Address" 
                    value={currentAdmin?.email || user?.email || 'N/A'} 
                  />
                  <DetailCard 
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                    label="Role" 
                    value={userRole === 'admin' ? 'Administrator' : userRole === 'student' ? 'Student' : (currentAdmin?.role || 'Member')} 
                  />
                  <DetailCard 
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                    label="Department" 
                    value={currentAdmin?.department || 'N/A'} 
                  />
                </div>
              </div>

              {/* Account Information */}
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    userRole === 'admin' 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : userRole === 'student'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                      : 'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}>
                    {userRole === 'admin' ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    ) : userRole === 'student' ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {userRole === 'admin' ? 'System Information' : userRole === 'student' ? 'Account Information' : 'Account Information'}
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <DetailCard 
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                    label={userRole === 'admin' ? 'Admin ID' : userRole === 'student' ? 'Student ID' : 'User ID'} 
                    value={currentAdmin?.uid || user?.uid || 'N/A'} 
                  />
                  <DetailCard 
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    label="Last Login" 
                    value={formatLastLogin(currentAdmin?.lastLogin)} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

const DetailCard = ({ icon, label, value }) => (
  <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/70 transition-all duration-200">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
        <div className="font-semibold text-gray-800 truncate">{value}</div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
