'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSessionRefresh } from '@/hooks/useSessionRefresh';
import { useAdminStatusChecker } from '@/hooks/useAdminStatusChecker';
import { useStats } from '@/hooks/useStats';
import StatsDashboard from './StatsDashboard';
interface Article {
  _id: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: string;
  featured: boolean;
  tags: string[];
}
export default function AdminDashboard() {
  const { data: session, update: updateSession } = useSession();
  const { forceRefreshFromDatabase } = useSessionRefresh();
  const { checkAndUpdateAdminStatus } = useAdminStatusChecker();
  const { stats, loading: statsLoading, fetchStats } = useStats(false); // Don't auto-refresh
  // Using simplified admin status checker without automatic monitoring
  const [activeTab, setActiveTab] = useState('overview');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean; article: Article | null}>({
    show: false,
    article: null
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [adminConfirm, setAdminConfirm] = useState<{show: boolean; user: any | null; action: 'grant' | 'revoke'}>({
    show: false,
    user: null,
    action: 'grant'
  });
  // Refresh function to trigger data reload
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchStats(); // Also refresh the stats data
  };
  useEffect(() => {
    if (activeTab === 'articles' || activeTab === 'overview') {
      fetchArticles();
    }
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, refreshTrigger]);
  // Fetch articles on component mount for overview statistics
  useEffect(() => {
    fetchArticles();
  }, [refreshTrigger]);
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/articles?limit=20');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };
  const showAdminConfirm = (user: any, action: 'grant' | 'revoke') => {
    setAdminConfirm({ show: true, user, action });
  };
  const hideAdminConfirm = () => {
    setAdminConfirm({ show: false, user: null, action: 'grant' });
  };
  const confirmAdminChange = () => {
    if (adminConfirm.user) {
      updateUserAdminStatus(adminConfirm.user.id, adminConfirm.action === 'grant');
      hideAdminConfirm();
    }
  };
  // Clean up session invalidation records for a user
  const clearSessionInvalidation = async (email: string) => {
    try {
      const response = await fetch('/api/auth/clear-session-invalidation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        console.warn('Failed to clear session invalidation for:', email);
      }
    } catch (error) {
      console.warn('Error clearing session invalidation:', error);
    }
  };
  const updateUserAdminStatus = async (userId: string, isAdmin: boolean) => {
    setUpdatingUser(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, isAdmin }),
      });
      if (response.ok) {
        const data = await response.json();
        // Update the local users state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isAdmin } : user
        ));
        const updatedUser = users.find(user => user.id === userId);
        const isCurrentUser = updatedUser && session?.user?.email === updatedUser.email;
        if (isCurrentUser) {
          // Current user's admin status was changed - check for updates
          const checkResult = await checkAndUpdateAdminStatus();
          if (checkResult.success && checkResult.changed) {
            alert(`Your admin privileges have been ${checkResult.isAdmin ? 'granted' : 'revoked'}. The page will refresh to apply changes.`);
            // Give time for the session to update, then refresh
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            // Try the old method as fallback
            const refreshResult = await forceRefreshFromDatabase();
            if (refreshResult.success) {
              alert(`Your admin privileges have been ${isAdmin ? 'granted' : 'revoked'}. The page will refresh to apply changes.`);
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } else {
              alert(`${data.message}\n\nPlease sign out and sign in again to see the changes.`);
            }
          }
        } else {
          // Different user's admin status was changed
          alert(`${data.message}\n\nThe user will need to refresh their browser to see the changes take effect.`);
          // Clear the session invalidation after a short delay
          setTimeout(() => {
            if (data.targetUserEmail) {
              clearSessionInvalidation(data.targetUserEmail);
            }
          }, 30000); // Clear after 30 seconds
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update user admin status');
      }
    } catch (error) {
      console.error('Error updating user admin status:', error);
      alert('Error updating user admin status');
    } finally {
      setUpdatingUser(null);
    }
  };
  const toggleFeatured = async (articleId: string, featured: boolean) => {
    try {
      const article = articles.find(a => a._id === articleId);
      if (!article) return;
      const response = await fetch(`/api/articles/${article.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !featured }),
      });
      if (response.ok) {
        setArticles(articles.map(a => 
          a._id === articleId ? { ...a, featured: !featured } : a
        ));
        // Refresh data to update overview statistics
        refreshData();
      }
    } catch (error) {
      console.error('Error updating article:', error);
    }
  };
  const deleteArticle = async (article: Article) => {
    try {
      const response = await fetch(`/api/articles/${article.slug}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setArticles(articles.filter(a => a._id !== article._id));
        setDeleteConfirm({ show: false, article: null });
        alert('Article deleted successfully');
        // Refresh data to update overview statistics
        refreshData();
      } else {
        alert('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Error deleting article');
    }
  };
  const showDeleteConfirm = (article: Article) => {
    setDeleteConfirm({ show: true, article });
  };
  const hideDeleteConfirm = () => {
    setDeleteConfirm({ show: false, article: null });
  };
  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'ðŸ“Š' },
    { id: 'articles', name: 'Articles', icon: 'ðŸ“' },
    { id: 'users', name: 'User Management', icon: 'ðŸ‘¥' },
  ];
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to NeuraPress Admin</h3>
                  <p className="text-gray-700">
                    Manage your content with powerful analytics and AI-powered article generation.
                  </p>
                </div>
              </div>
            </div>
            {/* Content Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">Total Articles</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {statsLoading ? (
                    <span className="animate-pulse bg-blue-200 rounded w-16 h-8 inline-block"></span>
                  ) : (
                    stats?.overview.totalArticles || 0
                  )}
                </p>
                <p className="text-sm text-blue-700">Articles published on your site</p>
              </div>
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-900">Featured Articles</h3>
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {statsLoading ? (
                    <span className="animate-pulse bg-green-200 rounded w-16 h-8 inline-block"></span>
                  ) : (
                    stats?.overview.featuredArticles || 0
                  )}
                </p>
                <p className="text-sm text-green-700">Articles highlighted on homepage</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-purple-900">Categories</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600 mb-1">
                  {statsLoading ? (
                    <span className="animate-pulse bg-purple-200 rounded w-16 h-8 inline-block"></span>
                  ) : (
                    stats?.categories.filter(cat => cat.count > 0).length || 0
                  )}
                </p>
                <p className="text-sm text-purple-700">Different content categories</p>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('articles')}
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-green-900">Manage Articles</div>
                    <div className="text-sm text-green-700">Edit and organize content</div>
                  </div>
                </button>
                <a
                  href="/admin/article-generation"
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-purple-900">Advanced Generation</div>
                    <div className="text-sm text-purple-700">Real-time news & AI</div>
                  </div>
                </a>
              </div>
            </div>
            {/* Detailed Statistics Dashboard */}
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Detailed Analytics & Media Statistics
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Real-time data about your content including images, videos, and tweets</p>
                  </div>
                  <button
                    onClick={refreshData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                  </button>
                </div>
              </div>
              <div className="p-6">
                <StatsDashboard 
                  showMediaStats={true} 
                  showCategoryBreakdown={true} 
                  autoRefresh={false}
                  key={refreshTrigger}
                />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'articles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Articles Management</h2>
              <button
                onClick={fetchArticles}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Published</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Featured</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {article.title}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {article.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleFeatured(article._id, article.featured)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              article.featured
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {article.featured ? 'â­ Featured' : 'Not Featured'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <a
                              href={`/article/${article.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              View
                            </a>
                            <button
                              onClick={() => showDeleteConfirm(article)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">User Management</h2>
              <button
                onClick={fetchUsers}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-blue-100 rounded">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-blue-800">Admin Management</h3>
              </div>
              <p className="text-sm text-blue-700">
                Grant or revoke admin privileges to registered users. Only existing admins can manage user permissions.
              </p>
            </div>
            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">User</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Joined</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                            )}
                            <div className="font-medium text-gray-900">
                              {user.name || 'Unknown User'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isAdmin
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isAdmin ? 'ðŸ‘‘ Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => showAdminConfirm(user, user.isAdmin ? 'revoke' : 'grant')}
                            disabled={updatingUser === user.id}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              user.isAdmin
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {updatingUser === user.id ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                {user.isAdmin ? 'Revoking...' : 'Granting...'}
                              </div>
                            ) : (
                              user.isAdmin ? 'Revoke Admin' : 'Make Admin'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && deleteConfirm.article && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Article
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deleteConfirm.article.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={hideDeleteConfirm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteArticle(deleteConfirm.article!)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Admin Status Change Confirmation Modal */}
      {adminConfirm.show && adminConfirm.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {adminConfirm.action === 'grant' ? 'Grant Admin Access' : 'Revoke Admin Access'}
            </h3>
            <p className="text-gray-600 mb-4">
              {adminConfirm.action === 'grant' 
                ? `Are you sure you want to grant admin privileges to "${adminConfirm.user.name}"? They will have full access to the admin dashboard.`
                : `Are you sure you want to revoke admin privileges from "${adminConfirm.user.name}"? They will lose access to the admin dashboard.`
              }
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={hideAdminConfirm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAdminChange}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  adminConfirm.action === 'grant'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {adminConfirm.action === 'grant' ? 'Grant Admin' : 'Revoke Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}