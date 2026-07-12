/**
 * AdminDashboard — What admins see when logged in.
 *
 * - Platform stats
 * - User management (list, change roles, delete)
 * - All reviews and homestays
 */
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { fetchAdminStats, fetchAllUsers, updateUserRole, deleteUser, fetchAllReviews, fetchHomestays } from '../services/api'

export default function AdminDashboard() {
  const { darkMode } = useTheme()

  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [homestays, setHomestays] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [actionMsg, setActionMsg] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [sRes, uRes, rRes, hRes] = await Promise.all([
        fetchAdminStats(),
        fetchAllUsers(),
        fetchAllReviews(),
        fetchHomestays(),
      ])
      setStats(sRes.data)
      setUsers(uRes.data || [])
      setReviews(rRes.data || [])
      setHomestays(hRes.data || [])
    } catch (err) {
      console.warn('Failed to load admin data:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const showAction = (msg, isError = false) => {
    setActionMsg({ msg, isError })
    setTimeout(() => setActionMsg(null), 3000)
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole)
      showAction(`Role updated to ${newRole}`)
      loadData()
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to update role', true)
    }
  }

  const handleDeleteUser = async (userId, name) => {
    if (!confirm(`Delete user "${name}" and all their data?`)) return
    try {
      await deleteUser(userId)
      showAction(`User "${name}" deleted`)
      loadData()
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to delete user', true)
    }
  }

  const roleBadge = (role) => {
    const styles = {
      admin: darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600',
      owner: darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600',
      customer: darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600',
    }
    const icons = { admin: '👑', owner: '🏠', customer: '👤' }
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[role] || styles.customer}`}>
        {icons[role]} {role}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading admin panel...</span>
        </div>
      </div>
    )
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast */}
        {actionMsg && (
          <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 ${actionMsg.isError ? (darkMode ? 'bg-red-900/90 text-red-200 border border-red-800' : 'bg-red-500 text-white') : (darkMode ? 'bg-green-900/90 text-green-200 border border-green-800' : 'bg-green-500 text-white')}`} style={{ animation: 'slideDown 0.3s ease-out' }}>
            <span>{actionMsg.isError ? '❌' : '✅'}</span>{actionMsg.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Admin Panel 👑
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Full platform oversight and user management
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
            👑 Administrator
          </span>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
              { label: 'Customers', value: stats.totalCustomers, icon: '👤' },
              { label: 'Owners', value: stats.totalOwners, icon: '🏠' },
              { label: 'Homestays', value: stats.totalHomestays, icon: '🏡' },
              { label: 'Reviews', value: stats.totalReviews, icon: '⭐' },
              { label: 'Pending', value: stats.pendingReviews, icon: '⏳' },
            ].map(({ label, value, icon }) => (
              <div key={label} className={`rounded-2xl border p-4 text-center ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
                <span className="text-xl">{icon}</span>
                <div className={`text-xl font-heading font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
                <div className={`text-[10px] mt-0.5 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl mb-8 w-fit ${darkMode ? 'bg-dark-800' : 'bg-gray-100'}`}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'users', label: '👥 Users' },
            { id: 'reviews', label: '⭐ Reviews' },
            { id: 'homestays', label: '🏡 Homestays' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === id ? 'bg-primary-500 text-white shadow-md' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className={`rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
              <h3 className={`font-heading font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>User Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'Customers', count: stats.totalCustomers, color: 'bg-blue-500', pct: Math.round((stats.totalCustomers / stats.totalUsers) * 100) || 0 },
                  { label: 'Owners', count: stats.totalOwners, color: 'bg-green-500', pct: Math.round((stats.totalOwners / stats.totalUsers) * 100) || 0 },
                  { label: 'Admins', count: stats.totalAdmins, color: 'bg-purple-500', pct: Math.round((stats.totalAdmins / stats.totalUsers) * 100) || 0 },
                ].map(({ label, count, color, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{label}</span>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{count} ({pct}%)</span>
                    </div>
                    <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
              <h3 className={`font-heading font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Review Status</h3>
              <div className="space-y-3">
                {[
                  { label: 'Replied', count: stats.repliedReviews, color: 'bg-green-500', pct: stats.totalReviews > 0 ? Math.round((stats.repliedReviews / stats.totalReviews) * 100) : 0 },
                  { label: 'Pending', count: stats.pendingReviews, color: 'bg-amber-500', pct: stats.totalReviews > 0 ? Math.round((stats.pendingReviews / stats.totalReviews) * 100) : 0 },
                ].map(({ label, count, color, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{label}</span>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{count} ({pct}%)</span>
                    </div>
                    <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={darkMode ? 'bg-dark-900' : 'bg-gray-50'}>
                    {['User', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                  {users.map((u) => (
                    <tr key={u._id} className={`${darkMode ? 'hover:bg-dark-900/50' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{u.name}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</td>
                      <td className="px-6 py-4">{roleBadge(u.role)}</td>
                      <td className={`px-6 py-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className={`text-xs rounded-lg px-2 py-1 border cursor-pointer ${darkMode ? 'bg-dark-900 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}
                          >
                            <option value="customer">Customer</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button onClick={() => handleDeleteUser(u._id, u.name)} className={`text-xs px-2 py-1 rounded-lg cursor-pointer ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}>
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {reviews.map((r) => (
                <div key={r._id} className={`p-6 ${darkMode ? 'hover:bg-dark-900/50' : 'hover:bg-gray-50/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{r.customer?.name}</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>→</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>{r.homestay?.name}</span>
                    <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'replied' ? (darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600') : (darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600')}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400' : darkMode ? 'text-gray-600' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{r.text}</p>
                  {r.ownerReply?.text && (
                    <div className={`mt-2 text-xs pl-4 border-l-2 ${darkMode ? 'border-green-700 text-green-400' : 'border-green-300 text-green-700'}`}>
                      💬 {r.ownerReply.text}
                    </div>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="flex flex-col items-center py-16">
                  <span className="text-4xl mb-3">📭</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No reviews on the platform</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Homestays Tab */}
        {activeTab === 'homestays' && (
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={darkMode ? 'bg-dark-900' : 'bg-gray-50'}>
                    {['Property', 'Location', 'Owner', 'Rating', 'Reviews', 'Price/Night'].map((h) => (
                      <th key={h} className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                  {homestays.map((h) => (
                    <tr key={h._id} className={`${darkMode ? 'hover:bg-dark-900/50' : 'hover:bg-gray-50/50'}`}>
                      <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{h.name}</td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{h.location}</td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{h.owner?.name || '—'}</td>
                      <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>⭐ {h.rating}</td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{h.totalReviews}</td>
                      <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>₹{h.pricePerNight?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
