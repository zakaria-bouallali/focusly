import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, ChevronDown, User, Shield, Sparkles, FolderOpen, Activity, Plus } from './Icons'
import { useAuth } from '../hooks/useAuth'
import { getInitials } from '../lib/utils'
import NotificationBell from './NotificationBell'
import FocuslyLogo from './FocuslyLogo'
import api from '../lib/api'

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [userWorkspaces, setUserWorkspaces] = useState([])

  useEffect(() => {
    if (user) {
      api.get('/workspaces').then(({ data }) => setUserWorkspaces(data)).catch(() => { })
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F8FAFC] flex flex-col font-sans antialiased select-none">
      {/* Top Sticky Editorial Header */}
      <header className="sticky top-0 z-40 bg-[#0B0C10]/90 backdrop-blur-md border-b border-white/15 px-6 lg:px-12 h-20 flex items-center justify-between">

        {/* Left: Brand Logo + Primary Directory Nav */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 text-decoration-none shrink-0">
            <FocuslyLogo size={32} showText={true} />
          </Link>

          {/* Minimalist Editorial Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-[0.18em] text-slate-400">
            <Link
              to="/workspaces"
              className={`flex items-center gap-2 py-1 transition-colors text-decoration-none ${location.pathname === '/workspaces'
                  ? 'text-white font-bold border-b-2 border-white'
                  : 'hover:text-slate-200'
                }`}
            >
              <FolderOpen size={13} /> Workspaces
            </Link>

            <Link
              to={location.pathname.startsWith('/projects') ? location.pathname : '/workspaces'}
              className={`flex items-center gap-2 py-1 transition-colors text-decoration-none ${location.pathname.startsWith('/projects')
                  ? 'text-white font-bold border-b-2 border-white'
                  : 'hover:text-slate-200'
                }`}
            >
              <Activity size={13} /> Kanban
            </Link>

            {user?.is_super_admin && (
              <Link
                to="/super-admin"
                className={`flex items-center gap-2 py-1 transition-colors text-decoration-none ${location.pathname.startsWith('/super-admin') || location.pathname.startsWith('/admin')
                    ? 'text-white font-bold border-b-2 border-white'
                    : 'hover:text-slate-200'
                  }`}
              >
                <Shield size={13} /> Super Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right: Quick Action + Notifications + User Identity Profile */}
        <div className="flex items-center gap-5">

          {/* Notification Bell */}
          <NotificationBell />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              id="profile-menu-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/15 cursor-pointer"
            >
              <div className="avatar avatar-sm border border-white/30">
                {getInitials(user?.name)}
              </div>
              <span className="hidden lg:inline-block text-xs font-bold text-white uppercase tracking-tight max-w-[120px] truncate">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown size={14} className="text-slate-400 hidden lg:inline-block" />
            </button>

            {/* Profile Dropdown Popup Card without shadow */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-[#13151E] border border-white/20 rounded-xl p-2 z-50 animate-slide-up">

                {/* User Identity Header */}
                <div className="p-3 border-b border-white/10 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="avatar avatar-sm">{getInitials(user?.name)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-white truncate">{user?.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate uppercase">{user?.email}</div>
                    </div>
                  </div>
                  {user?.is_super_admin && (
                    <span className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-white/10 text-white border border-white/20">
                      <Shield size={10} /> Super Administrator
                    </span>
                  )}
                </div>

                {/* Menu items */}
                <div className="flex flex-col gap-1 py-1">
                  <Link
                    to="/workspaces"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-decoration-none transition-colors"
                  >
                    <FolderOpen size={14} className="text-slate-400" /> Workspaces Directory
                  </Link>

                  <Link
                    to={location.pathname.startsWith('/projects') ? location.pathname : '/workspaces'}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-decoration-none transition-colors"
                  >
                    <Activity size={14} className="text-slate-400" /> Kanban Board
                  </Link>

                  {user?.is_super_admin && (
                    <Link
                      to="/super-admin"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-decoration-none transition-colors"
                    >
                      <Shield size={14} className="text-slate-400" /> Super Admin Portal
                    </Link>
                  )}
                </div>

                <div className="border-t border-white/10 mt-1 pt-1">
                  <button
                    id="profile-logout-btn"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono uppercase tracking-wider text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent text-left"
                  >
                    <LogOut size={14} /> Terminate Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 lg:px-12 py-10">
        {children}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-white/15 px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono uppercase tracking-[0.15em] text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <FocuslyLogo size={18} />
          <span>© 2026 FOCUSLY INC.</span>
        </div>
        <div className="flex gap-6">
          <span>SYSTEM RBAC ACTIVE</span>
          <span>SUB-50MS REVERB SYNC</span>
        </div>
      </footer>
    </div>
  )
}
