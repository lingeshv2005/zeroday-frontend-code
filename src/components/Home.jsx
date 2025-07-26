import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  // Fetch all announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get('https://zeroday-backend-code.onrender.com/announcements');
        setAnnouncements(res.data.announcements || []);
        setFilteredAnnouncements(res.data.announcements || []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Filter announcements based on selected category
  useEffect(() => {
    if (category === 'all') {
      setFilteredAnnouncements(announcements);
    } else {
      const filtered = announcements.filter(a => a.Category === category);
      setFilteredAnnouncements(filtered);
    }
  }, [category, announcements]);

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
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="glass-card rounded-3xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center animate-float">
                <span className="text-3xl">📢</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gradient mb-2">Latest Announcements</h1>
                <p className="text-gray-600">Stay updated with the latest news and events</p>
              </div>
            </div>
            
            {/* Enhanced Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-modern pr-10 appearance-none cursor-pointer min-w-[200px]"
                >
                  <option value="all">🌟 All Categories</option>
                  <option value="exam">📝 Exams</option>
                  <option value="holiday">🏖️ Holidays</option>
                  <option value="event">🎉 Events</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">{filteredAnnouncements.length}</span>
                <span>announcement{filteredAnnouncements.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg text-gray-600">Loading announcements...</span>
            </div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No announcements found</h3>
            <p className="text-gray-500">No announcements match the selected category. Try selecting a different filter.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAnnouncements.map((a, idx) => (
              <div
                key={idx}
                className="glass-card rounded-3xl p-6 card-hover group"
              >
                <div className="flex items-start space-x-4">
                  {/* Category Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(a.Category)} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <span className="text-xl">{getCategoryIcon(a.Category)}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {a.title}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(a.Category)} text-white flex-shrink-0`}>
                        {a.Category}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">{a.content}</p>
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{a.updatedBy}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{new Date(a.timestamp?.seconds * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Attachments */}
                    {a.docs?.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">Attachments ({a.docs.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {a.docs.map((doc, i) => (
                            <a
                              key={i}
                              href={doc}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Document {i + 1}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
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

export default Home;
