import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AddLostFoundForm = () => {
  const [formData, setFormData] = useState({
    itemname: '',
    description: '',
    location: '',
    type: 'lost',
    updatedBy: '',
    images: []
  });

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Automatically set updatedBy from Firebase user
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, user => {
      if (user) {
        setFormData(prev => ({
          ...prev,
          updatedBy: user.displayName || user.email
        }));
      }
    });
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImages = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
  };

  const uploadImagesToCloudinary = async () => {
    const uploadedUrls = [];

    const sigRes = await axios.get('https://zeroday-backend-code.onrender.com/signature');
    const { signature, timestamp, folder, api_key, cloud_name } = sigRes.data;

    for (const file of files) {
      const data = new FormData();
      data.append('file', file);
      data.append('api_key', api_key);
      data.append('timestamp', timestamp);
      data.append('signature', signature);
      data.append('folder', folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`;
      const res = await axios.post(cloudinaryUrl, data);
      uploadedUrls.push(res.data.secure_url);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      let imageUrls = [];

      if (files.length > 0) {
        imageUrls = await uploadImagesToCloudinary();
      }

      const finalData = {
        ...formData,
        images: imageUrls
      };

      await axios.post('https://zeroday-backend-code.onrender.com/lostfound', finalData);
      setMessage('✅ Item submitted successfully!');
      setFormData({
        itemname: '',
        description: '',
        location: '',
        type: 'lost',
        updatedBy: formData.updatedBy,
        images: []
      });
      setFiles([]);
    } catch (err) {
      console.error('Submission failed:', err);
      setMessage('❌ Failed to submit item.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">📥 Add Lost/Found Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="itemname"
          placeholder="Item Name"
          value={formData.itemname}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>

        {/* Automatically filled, disabled */}
        <input
          type="text"
          name="updatedBy"
          value={formData.updatedBy}
          disabled
          className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
        />

        {/* Image upload */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImages}
          className="w-full"
        />
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {files.map((file, i) => (
              <img
                key={i}
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-20 h-20 rounded object-cover"
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {uploading ? 'Uploading...' : 'Submit'}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center font-semibold text-green-600">
          {message}
        </p>
      )}
    </div>
  );
};

export default AddLostFoundForm;
