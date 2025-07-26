import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const CreateAnnouncement = () => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    docs: [],
    updatedBy: '',
    Category: 'exam',
  });

  const [files, setFiles] = useState([]); // multiple files
  const [message, setMessage] = useState('');
  const [searchCategory, setSearchCategory] = useState('exam');
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Set updatedBy from Firebase user
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, user => {
      if (user) {
        setForm(prev => ({
          ...prev,
          updatedBy: user.displayName || user.email,
        }));
      }
    });
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileSelect = (e) => {
    setFiles(Array.from(e.target.files)); // convert FileList to Array
  };

  const uploadFilesToCloudinary = async () => {
    const uploadedUrls = [];

    const sigRes = await axios.get('https://zeroday-backend-code.onrender.com/api/signature');
    const { signature, timestamp, folder, api_key, cloud_name } = sigRes.data;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', api_key);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`;

      const uploadRes = await axios.post(cloudinaryUrl, formData);
      uploadedUrls.push(uploadRes.data.secure_url);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setUploading(true);

    try {
      let uploadedUrls = [];

      // Upload files if any
      if (files.length > 0) {
        uploadedUrls = await uploadFilesToCloudinary();
      }

      // Update form with uploaded file URLs
      const finalForm = {
        ...form,
        docs: uploadedUrls,
      };

      await axios.post('https://zeroday-backend-code.onrender.com/announcements', finalForm);
      setMessage('✅ Announcement created successfully!');

      // Reset form
      setForm({
        title: '',
        content: '',
        docs: [],
        updatedBy: form.updatedBy,
        Category: 'exam',
      });
      setFiles([]);
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to create announcement.');
    } finally {
      setUploading(false);
    }
  };


  const getCategoryIcon = (category) => {
    switch (category) {
      case 'exam': return '📝';
      case 'holiday': return '🏖️';
      case 'event': return '🎉';
      default: return '📢';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'exam': return 'from-red-500 to-pink-500';
      case 'holiday': return 'from-emerald-500 to-teal-500';
      case 'event': return 'from-blue-500 to-indigo-500';
      default: return 'from-blue-600 to-indigo-600';
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="glass-card rounded-3xl p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center animate-float">
              <span className="text-3xl">📢</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">Create Announcement</h1>
              <p className="text-gray-600">Share important updates with the community</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="glass-card rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Announcement Title</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter a clear and descriptive title..."
                value={form.title}
                onChange={handleChange}
                required
                className="input-modern"
              />
            </div>

            {/* Content Textarea */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Content</span>
              </label>
              <textarea
                name="content"
                placeholder="Write your announcement content here..."
                value={form.content}
                onChange={handleChange}
                required
                rows={6}
                className="input-modern resize-none"
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Category</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['exam', 'holiday', 'event'].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, Category: category }))}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 transform hover:-translate-y-1 ${
                      form.Category === category
                        ? `border-transparent bg-gradient-to-br ${getCategoryColor(category)} text-white shadow-lg`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md text-gray-700'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <span className="font-medium text-sm capitalize">{category}</span>
                    </div>
                    {form.Category === category && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>Attachments (Optional)</span>
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">Click to upload files</p>
                      <p className="text-sm text-gray-500">PDF, DOC, DOCX, PNG, JPG up to 10MB each</p>
                    </div>
                  </div>
                </label>
              </div>
              
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                  <div className="grid gap-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">{file.name}</p>
                          <p className="text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    title: '',
                    content: '',
                    docs: [],
                    updatedBy: form.updatedBy,
                    Category: 'exam',
                  });
                  setFiles([]);
                  setMessage('');
                }}
                className="btn-secondary"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={uploading || !form.title || !form.content}
                className={`btn-primary flex items-center space-x-2 ${
                  uploading || !form.title || !form.content
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Publish Announcement</span>
                  </>
                )}
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

export default CreateAnnouncement;
