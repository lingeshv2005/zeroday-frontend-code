import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddLostFoundForm from './AddLostFoundForm';

const LostFoundList = () => {
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchItems = async (type = 'all') => {
    setLoading(true);
    try {
      const endpoint =
        type === 'all'
          ? 'https://zeroday-backend-code.onrender.com/lostfound'
          : `https://zeroday-backend-code.onrender.com/lostfound/${type}`;
      const res = await axios.get(endpoint);
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Error fetching Lost/Found items:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems(filterType);
  }, [filterType]);

  const handleItemAdded = () => {
    setShowForm(false);
    fetchItems(filterType);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lost': return '🔍';
      case 'found': return '✨';
      default: return '🔎';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'lost': return 'from-red-500 to-pink-500';
      case 'found': return 'from-green-500 to-emerald-500';
      default: return 'from-blue-500 to-indigo-500';
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="glass-card rounded-3xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center animate-float">
                <span className="text-3xl">🔎</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gradient mb-2">Lost & Found</h1>
                <p className="text-gray-600">Help reunite lost items with their owners</p>
              </div>
            </div>
            
            {/* Filter and Add Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <select
                  className="input-modern pr-10 appearance-none cursor-pointer min-w-[180px]"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">🌟 All Items</option>
                  <option value="lost">🔍 Lost Items</option>
                  <option value="found">✨ Found Items</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <button
                onClick={() => setShowForm(!showForm)}
                className={`btn-primary flex items-center space-x-2 ${showForm ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showForm ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  )}
                </svg>
                <span>{showForm ? 'Cancel' : 'Add Item'}</span>
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-6 flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{items.length}</span>
              <span>total item{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{items.filter(item => item.type === 'lost').length}</span>
              <span>lost</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{items.filter(item => item.type === 'found').length}</span>
              <span>found</span>
            </div>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="glass-card rounded-3xl p-8 mb-8 card-hover">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Add New Item</h3>
            </div>
            <AddLostFoundForm onItemAdded={handleItemAdded} />
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-lg text-gray-600">Loading items...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500 mb-4">No items match the selected filter. Try selecting a different category or add a new item.</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-3xl p-6 card-hover group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Item Images */}
                  {item.images?.length > 0 ? (
                    <div className="lg:w-1/3">
                      <div className="grid grid-cols-2 gap-2">
                        {item.images.slice(0, 4).map((url, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={url}
                              alt={`${item.itemname}-${idx}`}
                              className="rounded-xl object-cover h-24 w-full group-hover:scale-105 transition-transform"
                            />
                            {idx === 3 && item.images.length > 4 && (
                              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                <span className="text-white font-medium text-sm">+{item.images.length - 4}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="lg:w-1/3">
                      <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <span className="text-4xl">{getTypeIcon(item.type)}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Item Details */}
                  <div className="lg:w-2/3 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <h3 className="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                        {item.itemname}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTypeColor(item.type)} text-white flex-shrink-0`}>
                        <span className="mr-1">{getTypeIcon(item.type)}</span>
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                    
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Location:</span>
                        <span>{item.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">By:</span>
                        <span>{item.updatedBy}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Date:</span>
                        <span>
                          {item.datetime?.seconds
                            ? new Date(item.datetime.seconds * 1000).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      
                      {item.images?.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">Images:</span>
                          <span>{item.images.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LostFoundList;
