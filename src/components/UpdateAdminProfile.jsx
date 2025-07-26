import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const UpdateAdminProfile = ({ onUpdateSuccess }) => {
  const [admin, setAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: '',
    role: '',
    photoURL: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchAdminProfile = async (uid, token) => {
    try {
      const res = await axios.get(`https://zeroday-backend-code.onrender.com/admin/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const adminData = res.data.admin;
      setAdmin(adminData);
      setFormData({
        name: adminData.name || '',
        department: adminData.department || '',
        year: adminData.year || '',
        role: adminData.role || '',
        photoURL: adminData.photoURL || ''
      });
    } catch (error) {
      console.error('❌ Failed to fetch admin profile:', error);
      setMessage('Failed to fetch profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = authInstance.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        fetchAdminProfile(user.uid, token);
      } else {
        setMessage('User not authenticated');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const uploadToCloudinary = async (file) => {
    // Step 1: Get signed signature from backend
    const { data: sigData } = await axios.get("https://zeroday-backend-code.onrender.com/api/signature");
    const { signature, timestamp, folder, api_key, cloud_name } = sigData;

    // Step 2: Prepare form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", api_key);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    // Step 3: Upload using unsigned Axios (no Authorization header)
    const uploadRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return uploadRes.data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!admin?.uid) return;

    const authInstance = getAuth();
    const user = authInstance.currentUser;
    const token = await user.getIdToken();

    let updatedData = { ...formData };

    if (imageFile) {
      try {
        const cloudUrl = await uploadToCloudinary(imageFile);
        updatedData.photoURL = cloudUrl;
      } catch (err) {
        console.error('❌ Cloudinary upload failed:', err);
        setMessage('Image upload to Cloudinary failed ❌');
        return;
      }
    }

    try {
      await axios.put(
        `https://zeroday-backend-code.onrender.com/admin/${admin.uid}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage('✅ Profile updated successfully');

      // Refresh updated profile
      const res = await axios.get(`https://zeroday-backend-code.onrender.com/admin/${admin.uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdateSuccess(res.data.admin);
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      setMessage('Failed to update profile ❌');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="glass-card rounded-3xl p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center animate-float">
              <span className="text-3xl">👤</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">Update Profile</h1>
              <p className="text-gray-600">Manage your admin profile information</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="glass-card rounded-3xl p-8">
          {/* Current Profile Preview */}
          {admin && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {formData.photoURL ? (
                    <img
                      src={formData.photoURL}
                      alt="Current Profile"
                      className="w-16 h-16 object-cover rounded-full border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-2xl text-white">👤</span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{admin.name || 'No Name Set'}</h3>
                  <p className="text-sm text-gray-600">{admin.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{admin.role || 'Admin'}</span>
                    {admin.department && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{admin.department}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Personal Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Full Name</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="input-modern"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Department</span>
                  </label>
                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science Engineering"
                    className="input-modern"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 9a2 2 0 002 2h6a2 2 0 002-2l-2-9m-6 0V7" />
                    </svg>
                    <span>Academic Year</span>
                  </label>
                  <input
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g. 2025"
                    className="input-modern"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span>Role</span>
                  </label>
                  <input
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g. Super Admin, Moderator"
                    className="input-modern"
                  />
                </div>
              </div>
            </div>

            {/* Profile Picture Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Profile Picture</span>
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  id="profile-upload"
                />
                <label htmlFor="profile-upload" className="cursor-pointer">
                  <div className="space-y-4">
                    {imageFile ? (
                      <div className="space-y-3">
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                          <img
                            src={URL.createObjectURL(imageFile)}
                            alt="New Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm font-medium text-green-700">New image selected: {imageFile.name}</p>
                      </div>
                    ) : formData.photoURL ? (
                      <div className="space-y-3">
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                          <img
                            src={formData.photoURL}
                            alt="Current Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-gray-600">Click to change profile picture</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-700">Upload Profile Picture</p>
                          <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: admin?.name || '',
                    department: admin?.department || '',
                    year: admin?.year || '',
                    role: admin?.role || '',
                    photoURL: admin?.photoURL || ''
                  });
                  setImageFile(null);
                  setMessage('');
                }}
                className="btn-secondary"
              >
                Reset Changes
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Update Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`glass-card rounded-2xl p-6 mt-6 ${
            message.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.includes('✅') ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {message.includes('✅') ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className={`font-medium ${
                message.includes('✅') ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateAdminProfile;
