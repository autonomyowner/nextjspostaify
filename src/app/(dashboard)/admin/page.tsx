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

type Tab = 'overview' | 'users' | 'emails' | 'botleads' | 'roadmap'

// Local storage key for admin token
const ADMIN_TOKEN_KEY = 'postaify_admin_token'
const ROADMAP_PROGRESS_KEY = 'postaify_roadmap_progress'

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
    if (activeTab === 'roadmap') {
      setIsLoading(false)
      return
    }

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

  if (isLoading && activeTab !== 'roadmap') {
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
            { id: 'roadmap', label: 'Acquisition Roadmap' },
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
          {activeTab === 'roadmap' && <RoadmapTab />}
        </div>
      </div>
    </div>
  )
}

// Roadmap Tab
function RoadmapTab() {
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [activeSection, setActiveSection] = useState<string>('phase1')
  const [metrics, setMetrics] = useState({
    dmsSent: 0,
    repliesReceived: 0,
    freeSignups: 0,
    waitlistSignups: 0,
    paidCustomers: 0,
    revenue: 0,
  })
  const [copiedScript, setCopiedScript] = useState<string | null>(null)

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(ROADMAP_PROGRESS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      setProgress(parsed.checkboxes || {})
      setMetrics(parsed.metrics || metrics)
    }
  }, [])

  // Save progress to localStorage
  const saveProgress = (newProgress: Record<string, boolean>, newMetrics = metrics) => {
    setProgress(newProgress)
    setMetrics(newMetrics)
    localStorage.setItem(ROADMAP_PROGRESS_KEY, JSON.stringify({
      checkboxes: newProgress,
      metrics: newMetrics,
    }))
  }

  const toggleCheckbox = (id: string) => {
    const newProgress = { ...progress, [id]: !progress[id] }
    saveProgress(newProgress)
  }

  const updateMetric = (key: string, value: number) => {
    const newMetrics = { ...metrics, [key]: value }
    saveProgress(progress, newMetrics)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedScript(id)
    setTimeout(() => setCopiedScript(null), 2000)
  }

  const CheckItem = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <label className="flex items-start gap-3 cursor-pointer group py-1">
      <input
        type="checkbox"
        checked={progress[id] || false}
        onChange={() => toggleCheckbox(id)}
        className="mt-1 w-4 h-4 rounded border-border bg-muted accent-primary cursor-pointer"
      />
      <span className={`text-sm ${progress[id] ? 'text-muted-foreground line-through' : 'text-foreground'} group-hover:text-primary transition-colors`}>
        {children}
      </span>
    </label>
  )

  const ScriptBlock = ({ id, title, content }: { id: string; title: string; content: string }) => (
    <div className="bg-muted/50 rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <button
          onClick={() => copyToClipboard(content, id)}
          className="px-2 py-1 text-xs rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
        >
          {copiedScript === id ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{content}</pre>
    </div>
  )

  // Calculate phase progress
  const calculatePhaseProgress = (prefix: string) => {
    const phaseItems = Object.keys(progress).filter(k => k.startsWith(prefix))
    if (phaseItems.length === 0) return 0
    const completed = phaseItems.filter(k => progress[k]).length
    return Math.round((completed / phaseItems.length) * 100)
  }

  const phase1Progress = calculatePhaseProgress('p1')
  const phase2Progress = calculatePhaseProgress('p2')
  const phase3Progress = calculatePhaseProgress('p3')
  const overallProgress = Math.round((phase1Progress + phase2Progress + phase3Progress) / 3)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Overall Progress</p>
          <p className="text-2xl font-bold text-primary">{overallProgress}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">DMs Sent</p>
          <input
            type="number"
            value={metrics.dmsSent}
            onChange={(e) => updateMetric('dmsSent', parseInt(e.target.value) || 0)}
            className="w-full text-2xl font-bold text-foreground bg-transparent border-none outline-none"
          />
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Free Signups</p>
          <input
            type="number"
            value={metrics.freeSignups}
            onChange={(e) => updateMetric('freeSignups', parseInt(e.target.value) || 0)}
            className="w-full text-2xl font-bold text-foreground bg-transparent border-none outline-none"
          />
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Waitlist</p>
          <input
            type="number"
            value={metrics.waitlistSignups}
            onChange={(e) => updateMetric('waitlistSignups', parseInt(e.target.value) || 0)}
            className="w-full text-2xl font-bold text-foreground bg-transparent border-none outline-none"
          />
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Paid Customers</p>
          <input
            type="number"
            value={metrics.paidCustomers}
            onChange={(e) => updateMetric('paidCustomers', parseInt(e.target.value) || 0)}
            className="w-full text-2xl font-bold text-green-400 bg-transparent border-none outline-none"
          />
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Revenue</p>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-green-400">$</span>
            <input
              type="number"
              value={metrics.revenue}
              onChange={(e) => updateMetric('revenue', parseInt(e.target.value) || 0)}
              className="w-full text-2xl font-bold text-green-400 bg-transparent border-none outline-none"
            />
          </div>
        </Card>
      </div>

      {/* Phase Progress Bars */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Phase Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Phase 1: SEED (Week 1-2) - $0</span>
              <span className="text-primary">{phase1Progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${phase1Progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Phase 2: CONVERT (Week 3-4) - $200</span>
              <span className="text-blue-400">{phase2Progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${phase2Progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Phase 3: SCALE (Week 5-8) - $400</span>
              <span className="text-green-400">{phase3Progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-400"
                initial={{ width: 0 }}
                animate={{ width: `${phase3Progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Section Navigation */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'phase1', label: 'Phase 1: SEED' },
          { id: 'phase2', label: 'Phase 2: CONVERT' },
          { id: 'phase3', label: 'Phase 3: SCALE' },
          { id: 'scripts', label: 'DM Scripts' },
          { id: 'posts', label: 'Post Templates' },
          { id: 'groups', label: 'FB Groups' },
          { id: 'daily', label: 'Daily Routine' },
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Phase 1 Content */}
      {activeSection === 'phase1' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Week 1: Foundation & First Users</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Day 1: Research & Setup</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p1-d1-1">Find 20 Facebook Groups (search: "life coach community", "business coaches")</CheckItem>
                  <CheckItem id="p1-d1-2">Request to join ALL 20 groups</CheckItem>
                  <CheckItem id="p1-d1-3">Optimize Facebook profile (photo, bio, POSTAIFY link)</CheckItem>
                  <CheckItem id="p1-d1-4">Optimize LinkedIn profile (headline, about, featured link)</CheckItem>
                  <CheckItem id="p1-d1-5">Record 2-3 minute Loom demo video</CheckItem>
                  <CheckItem id="p1-d1-6">Save all DM scripts and post templates</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Day 2: Enter the Groups</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p1-d2-1">Introduce yourself in accepted groups (no pitching!)</CheckItem>
                  <CheckItem id="p1-d2-2">Study group rules and top posts</CheckItem>
                  <CheckItem id="p1-d2-3">Find 20 "pain point" posts about content struggles</CheckItem>
                  <CheckItem id="p1-d2-4">Comment on 15 posts with genuine value</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Day 3: Start Outreach</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p1-d3-1">Send first 10 DMs (use Script #1)</CheckItem>
                  <CheckItem id="p1-d3-2">Comment on 20 posts</CheckItem>
                  <CheckItem id="p1-d3-3">Create first value post (Post Template #1)</CheckItem>
                  <CheckItem id="p1-d3-4">LinkedIn: Connect with 20 coaches</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Day 4: Follow Up & Scale</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p1-d4-1">Follow up on Day 3 DMs (no reply after 24h)</CheckItem>
                  <CheckItem id="p1-d4-2">Send 15 new DMs</CheckItem>
                  <CheckItem id="p1-d4-3">Comment on 25 posts</CheckItem>
                  <CheckItem id="p1-d4-4">Post in 3 new groups</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Day 5: Get First Free Users</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p1-d5-1">Review all conversations, prioritize warm leads</CheckItem>
                  <CheckItem id="p1-d5-2">Invite warm leads to free trial (goal: 5 signups)</CheckItem>
                  <CheckItem id="p1-d5-3">Onboard first users (Zoom calls if needed)</CheckItem>
                  <CheckItem id="p1-d5-4">Help them create their first content</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Day 6: Content Blitz</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p1-d6-1">Create 3 value posts for the weekend</CheckItem>
                  <CheckItem id="p1-d6-2">Send 15 more DMs</CheckItem>
                  <CheckItem id="p1-d6-3">Check in with free users</CheckItem>
                  <CheckItem id="p1-d6-4">Document what's working</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Day 7: Review & Optimize</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p1-d7-1">Analyze Week 1 metrics</CheckItem>
                  <CheckItem id="p1-d7-2">Identify top performing DMs and posts</CheckItem>
                  <CheckItem id="p1-d7-3">Plan Week 2 adjustments</CheckItem>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Week 2: Testimonials & Waitlist Push</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Day 8-9: Testimonial Harvest</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p1-d8-1">Contact all free users asking for feedback</CheckItem>
                  <CheckItem id="p1-d8-2">Get screenshot testimonial</CheckItem>
                  <CheckItem id="p1-d8-3">Get written quote (2-3 sentences)</CheckItem>
                  <CheckItem id="p1-d8-4">Get video testimonial (even 30 seconds)</CheckItem>
                  <CheckItem id="p1-d8-5">Continue daily outreach (15 DMs, 20 comments)</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Day 10-11: Waitlist Campaign</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p1-d10-1">Create urgency post (50% off for first 50)</CheckItem>
                  <CheckItem id="p1-d10-2">Post waitlist offer in all groups (where allowed)</CheckItem>
                  <CheckItem id="p1-d10-3">Shift DM strategy to waitlist focus</CheckItem>
                  <CheckItem id="p1-d10-4">LinkedIn content push - share testimonial</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Day 12-13: Partnership Outreach</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p1-d12-1">Find 10 micro-influencers (1K-10K followers)</CheckItem>
                  <CheckItem id="p1-d12-2">Send partnership DMs (free lifetime Pro access)</CheckItem>
                  <CheckItem id="p1-d12-3">Find 5 coach communities/newsletters</CheckItem>
                  <CheckItem id="p1-d12-4">Offer guest posts or affiliate commission</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Day 14: Week 2 Review & Prep for Paid</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p1-d14-1">Compile all testimonials with permissions</CheckItem>
                  <CheckItem id="p1-d14-2">Calculate final Phase 1 metrics</CheckItem>
                  <CheckItem id="p1-d14-3">Test Stripe payment flow</CheckItem>
                  <CheckItem id="p1-d14-4">Prepare launch announcement</CheckItem>
                  <CheckItem id="p1-d14-5">Create "launch list" of all warm leads</CheckItem>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Phase 2 Content */}
      {activeSection === 'phase2' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Week 3: Stripe Launch & First Conversions</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-3">Day 15: LAUNCH DAY</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p2-d15-1">Test Stripe - make test purchase</CheckItem>
                  <CheckItem id="p2-d15-2">Verify email confirmations work</CheckItem>
                  <CheckItem id="p2-d15-3">Email entire waitlist (50% off offer)</CheckItem>
                  <CheckItem id="p2-d15-4">DM all warm leads with discount link</CheckItem>
                  <CheckItem id="p2-d15-5">DM all free users with early supporter discount</CheckItem>
                  <CheckItem id="p2-d15-6">Post launch announcement in Facebook groups</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-3">Day 16-18: Conversion Sprint</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p2-d16-1">Follow up with non-converters</CheckItem>
                  <CheckItem id="p2-d16-2">Continue daily outreach (15 DMs, 20 comments)</CheckItem>
                  <CheckItem id="p2-d16-3">Collect testimonials from paying users</CheckItem>
                  <CheckItem id="p2-d16-4">Create Facebook Business Manager</CheckItem>
                  <CheckItem id="p2-d16-5">Set up Meta Pixel on POSTAIFY</CheckItem>
                  <CheckItem id="p2-d16-6">Create Custom Audience (website visitors)</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-3">Day 19-21: First Paid Ads ($50-75)</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p2-d19-1">Create first ad creative (testimonial + hook)</CheckItem>
                  <CheckItem id="p2-d19-2">Set up campaign: Conversions objective</CheckItem>
                  <CheckItem id="p2-d19-3">Target: Life coach, Business coach, Online coaching interests</CheckItem>
                  <CheckItem id="p2-d19-4">Budget: $10/day for 3 days</CheckItem>
                  <CheckItem id="p2-d19-5">Monitor but DON'T TOUCH for 3 days</CheckItem>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Week 4: Optimize & Referral Launch</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-3">Day 22-24: Analyze & Optimize</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p2-d22-1">Review ad performance (target CPL &lt;$3, CPA &lt;$30)</CheckItem>
                  <CheckItem id="p2-d22-2">Double down on winning channels</CheckItem>
                  <CheckItem id="p2-d22-3">Cut losing channels</CheckItem>
                  <CheckItem id="p2-d22-4">Adjust audiences or creative if needed</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-3">Day 25-26: Launch Referral Program</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p2-d25-1">Set up referral system (manual or Rewardful)</CheckItem>
                  <CheckItem id="p2-d25-2">Create referral offer (1 month free for referrer)</CheckItem>
                  <CheckItem id="p2-d25-3">Email all paying customers about referral</CheckItem>
                  <CheckItem id="p2-d25-4">Create shareable assets for customers</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-3">Day 27-28: Week 4 Review</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p2-d27-1">Calculate Phase 2 metrics (target: 25 customers)</CheckItem>
                  <CheckItem id="p2-d27-2">Identify best acquisition channel</CheckItem>
                  <CheckItem id="p2-d27-3">Prepare Phase 3 scaling plan</CheckItem>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Phase 3 Content */}
      {activeSection === 'phase3' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Week 5-6: Scale Winning Channels ($200)</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3">Paid Ads Scaling</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p3-ads-1">Increase budget on winning ads to $15-20/day</CheckItem>
                  <CheckItem id="p3-ads-2">Test new audiences (lookalikes)</CheckItem>
                  <CheckItem id="p3-ads-3">Test new creatives (different testimonials/hooks)</CheckItem>
                  <CheckItem id="p3-ads-4">Set up retargeting campaign ($3-5/day)</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3">Content Scaling</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p3-content-1">Post 1 LinkedIn post/day</CheckItem>
                  <CheckItem id="p3-content-2">Post 1 Facebook group post/day</CheckItem>
                  <CheckItem id="p3-content-3">Create 1-2 Instagram reels/week</CheckItem>
                  <CheckItem id="p3-content-4">Repurpose testimonials into posts</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3">Outreach Scaling</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p3-outreach-1">Maintain minimum 10 DMs/day</CheckItem>
                  <CheckItem id="p3-outreach-2">Consider hiring VA for initial outreach ($50-100)</CheckItem>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Week 7-8: Partnerships & Automation ($200)</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3">Micro-Influencer Partnerships ($100-150)</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p3-inf-1">Identify 5 coaches with 5K-20K followers</CheckItem>
                  <CheckItem id="p3-inf-2">Offer $20-30 per post/story</CheckItem>
                  <CheckItem id="p3-inf-3">Give affiliate codes (10-20% commission)</CheckItem>
                  <CheckItem id="p3-inf-4">Track ROI per influencer</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3">Community Building</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p3-comm-1">Create free lead magnet (30 Days of Content Ideas PDF)</CheckItem>
                  <CheckItem id="p3-comm-2">Guest on coach podcasts</CheckItem>
                  <CheckItem id="p3-comm-3">Partner with coach communities</CheckItem>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3">Automation Setup</h4>
                <div className="space-y-1 ml-2">
                  <CheckItem id="p3-auto-1">Set up welcome email sequence (5 emails)</CheckItem>
                  <CheckItem id="p3-auto-2">Create free trial → paid sequence</CheckItem>
                  <CheckItem id="p3-auto-3">Keep retargeting always on ($3-5/day)</CheckItem>
                  <CheckItem id="p3-auto-4">Reach 100 paying customers!</CheckItem>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* DM Scripts */}
      {activeSection === 'scripts' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">DM Scripts</h3>
            <div className="space-y-4">
              <ScriptBlock
                id="dm1"
                title="Script #1: Initial Outreach (Cold)"
                content={`Hey [Name]!

Saw your post about [specific struggle they mentioned]. I totally get it - I used to spend 8+ hours a week on social media content too.

Quick question: what's your biggest content headache right now - coming up with ideas, writing captions, or creating visuals?`}
              />

              <ScriptBlock
                id="dm2"
                title="Script #2: After They Reply"
                content={`That's exactly why I built POSTAIFY - it's an AI tool that creates a full month of content in about 15 minutes.

I'm looking for 10 coaches to try it free and give honest feedback before we launch publicly.

Want me to set you up with early access?`}
              />

              <ScriptBlock
                id="dm3"
                title="Script #3: Follow-Up (No Reply)"
                content={`Hey [Name]! Just floating this back up in case you missed it.

I know content creation is a huge time suck. If you ever want to try an AI tool that handles it in minutes, the offer for free early access is still open.

No pressure either way!`}
              />

              <ScriptBlock
                id="dm4"
                title="Script #4: Partnership Outreach"
                content={`Hey [Name]!

Love your content on [specific thing]. Your posts about [topic] really resonate.

I built an AI tool called POSTAIFY that helps coaches create a month of content in 15 minutes. I'd love to offer you lifetime Pro access to try it.

If you find it valuable, maybe you could share it with your audience? No obligation at all - just want to get it in the hands of coaches who "get it."

Interested?`}
              />

              <ScriptBlock
                id="dm5"
                title="Script #5: Waitlist to Paid"
                content={`Hey [Name]!

Great news - POSTAIFY Pro is officially live!

As promised, here's your early supporter discount: 50% off your first 3 months.

[LINK]

This offer expires in 48 hours. Let me know if you have any questions!`}
              />

              <ScriptBlock
                id="dm6"
                title="Script #6: Testimonial Request"
                content={`Hey [Name]! So glad POSTAIFY is helping you.

Quick favor - would you mind sharing a 2-sentence testimonial about your experience? It would really help other coaches discover the tool.

I can even write a draft for you to edit if that's easier!`}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Post Templates */}
      {activeSection === 'posts' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Facebook Group Post Templates</h3>
            <div className="space-y-4">
              <ScriptBlock
                id="post1"
                title="Post #1: Value Post (Content Ideas)"
                content={`5 content ideas for coaches this week (steal these):

1. Share a client win (anonymized) + the lesson
2. "Myth vs Reality" about your niche
3. Your morning routine and why it matters
4. Answer a FAQ you get from clients
5. Share a tool that saves you time

Which one are you posting first?`}
              />

              <ScriptBlock
                id="post2"
                title="Post #2: Pain Point Post"
                content={`Real question for coaches:

How many hours do you spend on social media content each week?

I used to spend 8+ hours and it was killing my productivity.

Curious if others feel the same...`}
              />

              <ScriptBlock
                id="post3"
                title="Post #3: Tips Post"
                content={`3 ways to create content faster (what actually works):

- Batch your content - create a week's worth in one sitting
- Repurpose everything - one idea = 5 posts
- Use templates - stop starting from scratch

What's your best content hack? Share below`}
              />

              <ScriptBlock
                id="post4"
                title="Post #4: Story Post"
                content={`I almost quit coaching because of social media.

Spending 10+ hours a week on content, feeling like I was running on a hamster wheel, watching other coaches grow faster...

Then I realized: the problem wasn't my content. It was my PROCESS.

Now I create a month of content in one afternoon.

The secret? Having a system.

Anyone else feel this content burnout?`}
              />

              <ScriptBlock
                id="post5"
                title="Post #5: Waitlist Urgency Post"
                content={`Building something for coaches and I need beta testers...

It's an AI tool that creates social media content in minutes instead of hours.

Looking for 20 coaches to try it FREE before we launch next week.

In exchange, just honest feedback.

First 50 who join the waitlist also get 50% off when we launch.

Comment "INTERESTED" and I'll send details.`}
              />

              <ScriptBlock
                id="post6"
                title="Post #6: Launch Post"
                content={`After 3 months of building and testing with 20+ coaches...

POSTAIFY is officially live!

It's an AI tool that creates your social media content - posts, images, even voiceovers - in minutes.

Early testers are saving 8+ hours per week.

Special launch offer: 50% off for the first 50 coaches.

Link in comments (or DM me "LAUNCH" for the discount).`}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Facebook Groups */}
      {activeSection === 'groups' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Facebook Groups to Join</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-primary mb-3">Life Coaches</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Life Coaches Connect</li>
                <li>The Life Coach Collective</li>
                <li>Life Coaching Business Community</li>
                <li>Mindset Coaches Community</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-3">Business Coaches</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Business Coaches & Consultants Network</li>
                <li>Online Coaches and Course Creators</li>
                <li>Coaches & Consultants Who Scale</li>
                <li>Business Coaching Success</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-3">Fitness/Health Coaches</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Online Fitness Coaches</li>
                <li>Health & Wellness Coaches Community</li>
                <li>Fitness Business Coaches</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-3">General Coaching</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Coach Nation</li>
                <li>The Coaching Business Hub</li>
                <li>Coaches Supporting Coaches</li>
                <li>New Coaches Starting Out</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Search Tips</h4>
            <p className="text-sm text-muted-foreground">
              Try: "coach + community", "coaches + business", "online coach + support", "[niche] coach"
            </p>
          </div>
        </Card>
      )}

      {/* Daily Routine */}
      {activeSection === 'daily' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Daily Routines</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="text-sm font-medium text-primary mb-3">Phase 1 (Week 1-2)</h4>
              <div className="space-y-2 text-xs">
                <p className="font-medium text-foreground">Morning (2.5h):</p>
                <ul className="space-y-1 text-muted-foreground ml-2">
                  <li>30 min: Check/reply to DMs</li>
                  <li>60 min: Send 10-15 new DMs</li>
                  <li>30 min: Comment on 10 posts</li>
                  <li>30 min: Post in 2 groups</li>
                </ul>
                <p className="font-medium text-foreground mt-3">Afternoon (2.5h):</p>
                <ul className="space-y-1 text-muted-foreground ml-2">
                  <li>30 min: LinkedIn outreach</li>
                  <li>60 min: Comment on 15 more posts</li>
                  <li>30 min: Follow up yesterday's DMs</li>
                  <li>30 min: Document learnings</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h4 className="text-sm font-medium text-blue-400 mb-3">Phase 2 (Week 3-4)</h4>
              <div className="space-y-2 text-xs">
                <p className="font-medium text-foreground">Morning (2.5h):</p>
                <ul className="space-y-1 text-muted-foreground ml-2">
                  <li>30 min: Check DMs and emails</li>
                  <li>60 min: Outreach (10 DMs + 10 comments)</li>
                  <li>30 min: Check ad performance</li>
                  <li>30 min: Post in groups</li>
                </ul>
                <p className="font-medium text-foreground mt-3">Afternoon (2.5h):</p>
                <ul className="space-y-1 text-muted-foreground ml-2">
                  <li>60 min: Follow up with leads</li>
                  <li>30 min: Onboard new users</li>
                  <li>30 min: Collect testimonials</li>
                  <li>30 min: Create tomorrow's content</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <h4 className="text-sm font-medium text-green-400 mb-3">Phase 3 (Week 5-8)</h4>
              <div className="space-y-2 text-xs">
                <p className="font-medium text-foreground">Morning (2h):</p>
                <ul className="space-y-1 text-muted-foreground ml-2">
                  <li>30 min: Check metrics</li>
                  <li>60 min: Outreach (maintain volume)</li>
                  <li>30 min: Reply to all messages</li>
                </ul>
                <p className="font-medium text-foreground mt-3">Afternoon (2h):</p>
                <ul className="space-y-1 text-muted-foreground ml-2">
                  <li>60 min: Content creation</li>
                  <li>30 min: Partner outreach</li>
                  <li>30 min: Optimize ads/systems</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Daily Non-Negotiables</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-2 bg-background rounded">
                <div className="text-lg font-bold text-primary">10+</div>
                <div className="text-xs text-muted-foreground">DMs/day</div>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <div className="text-lg font-bold text-primary">20+</div>
                <div className="text-xs text-muted-foreground">Comments/day</div>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <div className="text-lg font-bold text-primary">2+</div>
                <div className="text-xs text-muted-foreground">Group posts/day</div>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <div className="text-lg font-bold text-primary">&lt;4h</div>
                <div className="text-xs text-muted-foreground">Reply time</div>
              </div>
            </div>
          </div>
        </Card>
      )}
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
