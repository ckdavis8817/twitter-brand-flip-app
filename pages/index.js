import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Eye, Send, Save, RefreshCw, Twitter, CheckCircle, Clock, AlertCircle, Globe, Newspaper } from 'lucide-react';

export default function Dashboard() {
  const [trends, setTrends] = useState([]);
  const [newsArticles, setNewsArticles] = useState({});
  const [generatedContent, setGeneratedContent] = useState([]);
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [activeTab, setActiveTab] = useState('trends');
  const [selectedTrend, setSelectedTrend] = useState(null);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setIsLoadingTrends(true);
    try {
      const response = await fetch('/api/trends');
      const data = await response.json();
      setTrends(data.trends || []);
      setNewsArticles(data.newsArticles || {});
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  const generateContent = async (trend) => {
    setIsGenerating(true);
    setSelectedTrend(trend);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trend: trend,
          newsContext: newsArticles[trend.topic] || []
        }),
      });
      
      const data = await response.json();
      
      const newContent = {
        id: Date.now(),
        trend: trend.topic,
        trendData: trend,
        newsContext: newsArticles[trend.topic] || [],
        content: data.content,
        status: 'pending',
        createdAt: new Date().toISOString(),
        scheduled: null,
        source: 'Google Trends + News API'
      };
      
      setApprovalQueue(prev => [newContent, ...prev]);
      setActiveTab('approval');
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const approvePost = async (id) => {
    try {
      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      if (response.ok) {
        setApprovalQueue(prev => 
          prev.map(post => 
            post.id === id 
              ? { ...post, status: 'approved', scheduled: new Date(Date.now() + Math.random() * 8 * 60 * 60 * 1000) }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error approving post:', error);
    }
  };

  const rejectPost = (id) => {
    setApprovalQueue(prev => 
      prev.map(post => 
        post.id === id 
          ? { ...post, status: 'rejected' }
          : post
      )
    );
  };

  const editPost = (id, newContent) => {
    setApprovalQueue(prev => 
      prev.map(post => 
        post.id === id 
          ? { ...post, content: newContent }
          : post
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Brand Flip Generator</h1>
                <p className="text-purple-200 text-sm">Google Trends → Brand Gold | 100% Free Data</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white font-semibold">4 posts/day</div>
                <div className="text-purple-200 text-sm">$0 monthly cost</div>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
          {[
            { id: 'trends', label: 'Google Trends', icon: TrendingUp },
            { id: 'approval', label: 'Approval Queue', icon: Eye },
            { id: 'scheduled', label: 'Scheduled Posts', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-purple-900 shadow-lg' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              {tab.id === 'approval' && approvalQueue.filter(p => p.status === 'pending').length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {approvalQueue.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Google Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Google Trends + News</h2>
                <p className="text-purple-200">Negative stories → Brand strategy gold</p>
              </div>
              <button 
                onClick={fetchTrends}
                disabled={isLoadingTrends}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingTrends ? 'animate-spin' : ''}`} />
                <span>{isLoadingTrends ? 'Loading...' : 'Refresh Trends'}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trends.map((trend, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{trend.topic}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-purple-200">Trend: {trend.trendValue}/100</span>
                          <span className="text-purple-200">{trend.newsCount} articles</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            trend.sentiment === 'negative' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                          }`}>
                            {trend.sentiment}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Globe className="w-3 h-3 text-purple-300" />
                          <span className="text-purple-300 text-xs">{trend.region}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => generateContent(trend)}
                      disabled={isGenerating}
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 ml-4"
                    >
                      <Zap className="w-4 h-4" />
                      <span>{isGenerating && selectedTrend?.topic === trend.topic ? 'Generating...' : 'Generate'}</span>
                    </button>
                  </div>
                  
                  {/* Related Queries */}
                  <div className="mb-4">
                    <p className="text-purple-200 text-xs mb-2">Related searches:</p>
                    <div className="flex flex-wrap gap-1">
                      {trend.relatedQueries?.slice(0, 3).map((query, i) => (
                        <span key={i} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                          {query}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* News Articles Preview */}
                  {newsArticles[trend.topic] && (
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Newspaper className="w-3 h-3 text-purple-300" />
                        <span className="text-purple-300 text-xs">Latest news</span>
                      </div>
                      <div className="space-y-1">
                        {newsArticles[trend.topic].slice(0, 2).map((article, i) => (
                          <p key={i} className="text-purple-200 text-xs truncate">
                            {article.title}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isGenerating && selectedTrend?.topic === trend.topic && (
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                        <span className="text-blue-300">Analyzing trends + news with Claude AI...</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval Queue Tab */}
        {activeTab === 'approval' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Approval Queue</h2>
            
            {approvalQueue.filter(post => post.status === 'pending').length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border border-white/20">
                <AlertCircle className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No posts pending approval</h3>
                <p className="text-purple-200">Generate content from Google Trends to see posts here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {approvalQueue.filter(post => post.status === 'pending').map(post => (
                  <div key={post.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Based on: {post.trend}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-purple-200 text-sm">Generated {new Date(post.createdAt).toLocaleTimeString()}</p>
                          <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                            {post.source}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => rejectPost(post.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => approvePost(post.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                        >
                          Approve & Schedule
                        </button>
                      </div>
                    </div>
                    
                    {/* News Context */}
                    {post.newsContext && post.newsContext.length > 0 && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                        <p className="text-blue-300 text-xs mb-2">📰 News context used:</p>
                        {post.newsContext.slice(0, 2).map((article, i) => (
                          <p key={i} className="text-blue-200 text-xs">• {article.title}</p>
                        ))}
                      </div>
                    )}
                    
                    <div className="bg-black/30 rounded-lg p-4 mb-4">
                      <textarea
                        value={post.content}
                        onChange={(e) => editPost(post.id, e.target.value)}
                        className="w-full h-80 bg-transparent text-white resize-none border-none outline-none placeholder-gray-400"
                        placeholder="Your thread content..."
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-purple-200">
                      <span>Character count: {post.content.length}</span>
                      <div className="flex space-x-4">
                        <span>Thread format detected</span>
                        <span>{post.content.split('\n\n').length} tweets</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scheduled Posts Tab */}
        {activeTab === 'scheduled' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Scheduled Posts</h2>
            
            <div className="space-y-4">
              {approvalQueue.filter(post => post.status === 'approved').map(post => (
                <div key={post.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{post.trend}</h3>
                      <p className="text-purple-200 text-sm">
                        Scheduled for: {post.scheduled ? new Date(post.scheduled).toLocaleString() : 'Next available slot'}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                          {post.source}
                        </span>
                        <Twitter className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300 text-xs">Ready to post</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                        Approved
                      </div>
                      <Send className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
