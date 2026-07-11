import { useState, useEffect, useCallback } from 'react'
import { Shield, Users, FolderOpen, RefreshCw, LogIn, LogOut, Activity } from '../components/Icons'
import AppLayout from '../components/AppLayout'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useScrollReveal, useScrollProgress } from '../hooks/useScrollReveal'

function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function isOnline(user) {
  if (!user.last_login_at) return false
  if (!user.last_logout_at) return true
  return new Date(user.last_login_at) > new Date(user.last_logout_at)
}

function StatCard({ icon: Icon, label, value, subtitle, className = '' }) {
  return (
    <div className={`glass p-6 bg-[#13151E] border border-white/15 flex flex-col justify-between min-h-[140px] rounded-2xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">{label}</span>
        <Icon size={16} className="text-slate-400" />
      </div>
      <div>
        <div className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mb-1">
          {value}
        </div>
        {subtitle && <div className="text-xs font-mono text-slate-400 uppercase">{subtitle}</div>}
      </div>
    </div>
  )
}

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const { data } = await api.get('/admin/stats')
      setUsers(data.users || [])
      setStats({
        total_users: data.total_members,
        total_workspaces: data.total_workspaces
      })
      if (isRefresh) toast.success('Telemetry refreshed')
    } catch (err) {
      console.error(err)
      toast.error('Failed to load telemetry')
    } finally {
      setLoading(false)
      if (isRefresh) setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const progress = useScrollProgress()
  const [headerRef, headerVisible] = useScrollReveal()
  const [cardsRef, cardsVisible] = useScrollReveal({ threshold: 0.1 })
  const [tableRef, tableVisible] = useScrollReveal({ threshold: 0.05 })

  return (
    <AppLayout>
      <div
        className="scroll-progress-bar"
        style={{ width: `${progress * 100}%` }}
      />
      <div className="max-w-7xl mx-auto">
        {/* Editorial Header */}
        <div
          ref={headerRef}
          className={`fade-up ${headerVisible ? 'in-view' : ''} flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/15 pb-8 mb-10 gap-4`}
        >
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-slate-400 block mb-2">
              SYSTEM TELEMETRY & AUDIT LOGS
            </span>
            <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-[-0.04em] text-white flex items-center gap-3">
              <Shield size={32} className="text-red-400 shrink-0" /> Super Admin Dashboard
            </h1>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="btn btn-secondary w-full sm:w-auto self-start sm:self-auto"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh Telemetry'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><div className="spinner w-8 h-8" /></div>
        ) : (
          <>
            {/* Stat Cards Grid — Stagger Fade Up */}
            <div
              ref={cardsRef}
              className={`stagger-group ${cardsVisible ? 'in-view' : ''} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10`}
            >
              <StatCard className="stagger-item" icon={Users} label="Total Registered" value={stats?.total_users ?? users.length} subtitle="System Accounts" />
              <StatCard className="stagger-item" icon={Activity} label="Currently Online" value={stats?.online_users ?? users.filter(isOnline).length} subtitle="Active Sessions" />
              <StatCard className="stagger-item" icon={FolderOpen} label="Total Workspaces" value={stats?.total_workspaces ?? '—'} subtitle="Across All Tenants" />
              <StatCard className="stagger-item" icon={Shield} label="Super Admins" value={users.filter((u) => u.is_super_admin).length} subtitle="Root Privilege" />
            </div>

            {/* Users Telemetry Table — Blur In */}
            <div
              ref={tableRef}
              className={`blur-in ${tableVisible ? 'in-view' : ''} glass bg-[#13151E] border border-white/15 overflow-hidden rounded-2xl`}
            >
              <div className="p-6 border-b border-white/15 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold uppercase tracking-tight text-white m-0">
                    User Session Logs & Workspace Footprint
                  </h2>
                  <p className="text-xs font-mono text-slate-400 uppercase mt-1 m-0">
                    Showing all registered users sorted by recent activity
                  </p>
                </div>
              </div>

              {/* Responsive table container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-wider text-slate-400 bg-white/[0.02]">
                      <th className="p-4 pl-6">User / Email</th>
                      <th className="p-4">Role / Status</th>
                      <th className="p-4">Last Login</th>
                      <th className="p-4">Last Logout</th>
                      <th className="p-4">Workspaces</th>
                      <th className="p-4 pr-6">Projects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm font-sans">
                    {users.map((user) => {
                      const online = isOnline(user)
                      return (
                        <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                          {/* User info */}
                          <td className="p-4 pl-6">
                            <div className="font-extrabold text-white">{user.name}</div>
                            <div className="text-xs font-mono text-slate-400">{user.email}</div>
                          </td>

                          {/* Role / Online badge */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {user.is_super_admin ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/30">
                                  <Shield size={10} /> Super Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/5 text-slate-300 border border-white/15">
                                  User
                                </span>
                              )}

                              {online ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500">
                                  <span className="w-2 h-2 rounded-full bg-slate-600" /> Offline
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Last Login */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <LogIn size={13} className="text-emerald-400 shrink-0" />
                              <div>
                                <div className="text-xs font-sans text-slate-200">{formatDateTime(user.last_login_at)}</div>
                                {user.last_login_at && (
                                  <div className="text-[10px] font-mono uppercase text-slate-500">{timeAgo(user.last_login_at)}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Last Logout */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <LogOut size={13} className="text-slate-400 shrink-0" />
                              <div>
                                <div className="text-xs font-sans text-slate-200">{formatDateTime(user.last_logout_at)}</div>
                                {user.last_logout_at && (
                                  <div className="text-[10px] font-mono uppercase text-slate-500">{timeAgo(user.last_logout_at)}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Workspaces */}
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold uppercase bg-white/5 border border-white/15 text-slate-300">
                              <FolderOpen size={12} className="text-slate-400" />
                              {user.workspace_count ?? 0}
                            </span>
                          </td>

                          {/* Projects */}
                          <td className="p-4 pr-6">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold uppercase bg-white/5 border border-white/15 text-slate-300">
                              <Activity size={12} className="text-slate-400" />
                              {user.project_count ?? 0}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
