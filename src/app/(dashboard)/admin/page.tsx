'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/ui/Logo'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

type Tab = 'overview' | 'users' | 'emails' | 'botleads'

// Local storage key for admin token
const ADMIN_TOKEN_KEY = 'postaify_admin_token'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Convex actions
  const loginAction = useAction(api.admin.login)
  const getStatsAction = useAction(api.admin.getStats)
  const getUsersAction = useAction(api.admin.getUsers)
  const getEmailCapturesAction = useAction(api.admin.getEmailCaptures)
  const updateUserPlanAction = useAction(api.admin.updateUserPlan)
  const getBotLeadsAction = useAction(api.admin.getBotLeads)
  const getBotLeadsStatsAction = useAction(api.admin.getBotLeadsStats)

  // Login state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Overview data
  const [stats, setStats] = useState<any>(null)

  // Users data
  const [users, setUsers] = useState<any[]>([])
  const [usersPage, setUsersPage] = useState(1)
  const [usersPagination, setUsersPagination] = useState<any>(null)

  // Email captures data
  const [emailCaptures, setEmailCaptures] = useState<any[]>([])
  const [emailsPage, setEmailsPage] = useState(1)
  const [emailsPagination, setEmailsPagination] = useState<any>(null)

  // Bot leads data
  const [botLeads, setBotLeads] = useState<any[]>([])
  const [botLeadsPage, setBotLeadsPage] = useState(1)
  const [botLeadsPagination, setBotLeadsPagination] = useState<any>(null)
  const [botLeadsStats, setBotLeadsStats] = useState<any>(null)

  const loadData = useCallback(async (token: string) => {
    setIsLoading(true)
    setError('')

    try {
      if (activeTab === 'overview') {
        const data = await getStatsAction({ token })
        setStats(data)
        // Also load bot leads stats for overview
        const botStats = await getBotLeadsStatsAction({ token })
        setBotLeadsStats(botStats)
      } else if (activeTab === 'users') {
        const data = await getUsersAction({ token, page: usersPage, limit: 50 })
        setUsers(data.users)
        setUsersPagination(data.pagination)
      } else if (activeTab === 'emails') {
        const data = await getEmailCapturesAction({ token, page: emailsPage, limit: 50 })
        setEmailCaptures(data.captures)
        setEmailsPagination(data.pagination)
      } else if (activeTab === 'botleads') {
        const data = await getBotLeadsAction({ token, page: botLeadsPage, limit: 50 })
        setBotLeads(data.leads)
        setBotLeadsPagination(data.pagination)
      }
    } catch (err: any) {
      if (err.message.includes('Access denied')) {
        setError('Access denied. You must be an admin to view this page.')
        // Clear invalid token
        localStorage.removeItem(ADMIN_TOKEN_KEY)
        setIsLoggedIn(false)
        setAdminToken(null)
      } else {
        setError(err.message || 'Failed to load data')
      }
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, usersPage, emailsPage, botLeadsPage, getStatsAction, getUsersAction, getEmailCapturesAction, getBotLeadsAction, getBotLeadsStatsAction])

  useEffect(() => {
    // Check if already logged in
    const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (storedToken) {
      setIsLoggedIn(true)
      setAdminToken(storedToken)
      loadData(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (adminToken) {
      loadData(adminToken)
    }
  }, [activeTab, usersPage, emailsPage, botLeadsPage, adminToken, loadData])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)

    try {
      const result = await loginAction({ username, password })
      localStorage.setItem(ADMIN_TOKEN_KEY, result.token)
      setAdminToken(result.token)
      setIsLoggedIn(true)
      setPassword('')
      loadData(result.token)
    } catch (err: any) {
      setLoginError(err.message || 'Invalid username or password')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    setIsLoggedIn(false)
    setAdminToken(null)
    setUsername('')
    setPassword('')
  }

  // Simple Navbar for admin
  const AdminNavbar = () => (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-white transition-colors">Dashboard</Link>
            <Link href="/admin" className="text-sm text-white font-medium">Admin</Link>
          </nav>
        </div>
      </div>
    </header>
  )

  // Show login form if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md p-8">
            <h1 className="text-2xl font-bold text-foreground mb-6 text-center">Admin Login</h1>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter password"
                  required
                />
              </div>

              {loginError && (
                <div className="text-red-500 text-sm">{loginError}</div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="text-red-500 text-xl font-semibold mb-4">{error}</div>
          <button
            onClick={handleLogout}
            className="text-primary hover:underline"
          >
            Logout and try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, view analytics, and monitor email captures</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/70 transition-colors w-fit"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users' },
            { id: 'emails', label: 'Email Captures' },
            { id: 'botleads', label: 'Bot Leads' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as Tab)
                if (tab.id === 'users') setUsersPage(1)
                if (tab.id === 'emails') setEmailsPage(1)
                if (tab.id === 'botleads') setBotLeadsPage(1)
              }}
              className={`px-4 py-2 font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && stats && <OverviewTab stats={stats} botLeadsStats={botLeadsStats} />}
          {activeTab === 'users' && (
            <UsersTab
              users={users}
              pagination={usersPagination}
              onPageChange={setUsersPage}
              adminToken={adminToken}
              updateUserPlanAction={updateUserPlanAction}
              onUserUpdated={() => adminToken && loadData(adminToken)}
            />
          )}
          {activeTab === 'emails' && (
            <EmailsTab
              captures={emailCaptures}
              pagination={emailsPagination}
              onPageChange={setEmailsPage}
            />
          )}
          {activeTab === 'botleads' && (
            <BotLeadsTab
              leads={botLeads}
              pagination={botLeadsPagination}
              onPageChange={setBotLeadsPage}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ stats, botLeadsStats }: { stats: any; botLeadsStats: any }) {
  // Prepare chart data
  const userDistributionData = [
    { name: 'Free', value: stats.users.free, color: '#9ca3af' },
    { name: 'Pro', value: stats.users.pro, color: '#FACC15' },
    { name: 'Business', value: stats.users.business, color: '#60a5fa' },
  ]

  const emailConversionData = [
    { name: 'With Consent', value: stats.emailCaptures.withConsent, color: '#4ade80' },
    { name: 'Without Consent', value: stats.emailCaptures.total - stats.emailCaptures.withConsent, color: '#6b7280' },
  ]

  const activityData = [
    { name: 'New Users', value: stats.users.recentSignups, color: '#60a5fa' },
    { name: 'Email Captures', value: stats.emailCaptures.recentCaptures, color: '#FACC15' },
    { name: 'Posts', value: stats.content.totalPosts > 100 ? Math.floor(stats.content.totalPosts / 10) : stats.content.totalPosts, color: '#4ade80' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.users.total} />
        <StatCard title="Pro Users" value={stats.users.pro} color="text-yellow-400" />
        <StatCard title="Business Users" value={stats.users.business} color="text-blue-400" />
        <StatCard title="Free Users" value={stats.users.free} color="text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Posts" value={stats.content.totalPosts} />
        <StatCard title="Total Brands" value={stats.content.totalBrands} />
        <StatCard title="Email Captures" value={stats.emailCaptures.total} />
        <StatCard
          title="Consent Rate"
          value={`${stats.emailCaptures.consentRate}%`}
          color="text-green-400"
        />
      </div>

      {/* Bot Leads Stats */}
      {botLeadsStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Bot Leads (Total)" value={botLeadsStats.total} color="text-purple-400" />
          <StatCard title="Bot Leads (7 days)" value={botLeadsStats.recentLeads} color="text-purple-400" />
          <StatCard title="Bot Leads (30 days)" value={botLeadsStats.monthlyLeads} color="text-purple-400" />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">User Distribution by Plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Legend
                wrapperStyle={{ color: '#9ca3af' }}
                formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Email Conversion Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Email Capture Conversion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emailConversionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {emailConversionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Legend
                wrapperStyle={{ color: '#9ca3af' }}
                formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              style={{ fontSize: '14px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '14px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
              cursor={{ fill: '#374151' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {activityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">New Signups (30d)</p>
            <p className="text-2xl font-bold text-foreground">{stats.users.recentSignups}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Email Captures (7d)</p>
            <p className="text-2xl font-bold text-foreground">{stats.emailCaptures.recentCaptures}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">With Consent</p>
            <p className="text-2xl font-bold text-foreground">{stats.emailCaptures.withConsent}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Users Tab
function UsersTab({ users, pagination, onPageChange, adminToken, updateUserPlanAction, onUserUpdated }: any) {
  const [editingUser, setEditingUser] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')

  const handleEditPlan = (user: any) => {
    setEditingUser(user)
    setSelectedPlan(user.plan)
    setUpdateMessage('')
  }

  const handleUpdatePlan = async () => {
    if (!editingUser || !selectedPlan || !adminToken) return

    setIsUpdating(true)
    setUpdateMessage('')

    try {
      const result = await updateUserPlanAction({
        token: adminToken,
        email: editingUser.email,
        plan: selectedPlan,
      })

      if (result.success) {
        setUpdateMessage(result.message)
        setEditingUser(null)
        onUserUpdated()
      } else {
        setUpdateMessage(result.message)
      }
    } catch (error: any) {
      setUpdateMessage(error.message || 'Failed to update user plan')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Plan</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Brands</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Posts</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">This Month</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-foreground">{user.email}</td>
                  <td className="p-4 text-sm text-muted-foreground">{user.name || '-'}</td>
                  <td className="p-4 text-center">
                    <PlanBadge plan={user.plan} />
                  </td>
                  <td className="p-4 text-center text-sm text-foreground">{user.brandsCount}</td>
                  <td className="p-4 text-center text-sm text-foreground">{user.postsCount}</td>
                  <td className="p-4 text-center text-sm text-foreground">{user.postsThisMonth}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleEditPlan(user)}
                      className="px-3 py-1 text-xs font-medium rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    >
                      Edit Plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}

      {/* Edit Plan Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">
              Edit User Plan
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  User
                </label>
                <p className="text-sm text-foreground">{editingUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Current Plan
                </label>
                <PlanBadge plan={editingUser.plan} />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  New Plan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['FREE', 'PRO', 'BUSINESS'].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setSelectedPlan(plan)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all ${
                        selectedPlan === plan
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-border bg-muted/50 text-muted-foreground hover:border-border/50'
                      }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              </div>

              {updateMessage && (
                <div className={`text-sm p-3 rounded-lg ${
                  updateMessage.includes('Successfully')
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {updateMessage}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdatePlan}
                disabled={isUpdating || selectedPlan === editingUser.plan}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update Plan'}
              </button>
              <button
                onClick={() => {
                  setEditingUser(null)
                  setUpdateMessage('')
                }}
                className="px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Emails Tab
function EmailsTab({ captures, pagination, onPageChange }: any) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Plan Interest</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Marketing</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Source</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Captured</th>
              </tr>
            </thead>
            <tbody>
              {captures.map((capture: any) => (
                <tr key={capture.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-foreground">{capture.email}</td>
                  <td className="p-4 text-center">
                    {capture.planInterest && (
                      <Badge variant="secondary">{capture.planInterest}</Badge>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {capture.marketingConsent ? (
                      <span className="text-green-400">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{capture.source || '-'}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(capture.capturedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

// Bot Leads Tab
function BotLeadsTab({ leads, pagination, onPageChange }: any) {
  const [expandedLead, setExpandedLead] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Messages</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Captured</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead: any) => (
                <Fragment key={lead.id}>
                  <tr className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm text-foreground">{lead.email}</td>
                    <td className="p-4 text-center text-sm text-foreground">{lead.messageCount}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(lead.capturedAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                        className="px-3 py-1 text-xs font-medium rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                      >
                        {expandedLead === lead.id ? 'Hide Chat' : 'View Chat'}
                      </button>
                    </td>
                  </tr>
                  {expandedLead === lead.id && (
                    <tr className="bg-muted/20">
                      <td colSpan={4} className="p-4">
                        <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg bg-background p-4 border border-border">
                          {lead.messageHistory.map((msg: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg max-w-[80%] ${
                                msg.role === 'user'
                                  ? 'bg-primary/20 ml-auto text-right'
                                  : 'bg-muted mr-auto'
                              }`}
                            >
                              <p className="text-xs text-muted-foreground mb-1 font-medium">
                                {msg.role === 'user' ? 'User' : 'Bot'}
                              </p>
                              <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          ))}
                          {lead.messageHistory.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No messages recorded
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {leads.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No bot leads captured yet
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

// Helper Components
function StatCard({ title, value, color = 'text-primary' }: any) {
  return (
    <Card className="p-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
      </div>
    </Card>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const colors = {
    FREE: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    PRO: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    BUSINESS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  }

  return (
    <Badge className={colors[plan as keyof typeof colors] || colors.FREE}>
      {plan}
    </Badge>
  )
}

function Pagination({ page, totalPages, onPageChange }: any) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}
