import { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck } from './Icons'
import { useNotifications } from '../hooks/useNotifications'
import { formatDistanceToNow } from '../lib/utils'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button className="btn-icon relative" onClick={() => setOpen((o) => !o)} id="notification-bell">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-[#0B0C10] border border-[#0B0C10] rounded-full text-[10px] font-mono font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 w-80 glass rounded-2xl z-50 overflow-hidden animate-slide-down border border-white/20 bg-[#13151E]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/15">
            <span className="font-extrabold text-xs uppercase tracking-widest text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-white/10">
            {notifications.length === 0 ? (
              <div className="empty-state py-10">
                <Bell size={24} className="text-slate-500" />
                <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-2">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`flex items-start gap-3.5 px-5 py-4 cursor-pointer transition-colors hover:bg-white/[0.04] ${!n.read ? 'bg-white/[0.03]' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 border ${!n.read ? 'bg-white border-white' : 'bg-transparent border-slate-600'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-200 leading-relaxed">{getNotifText(n)}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">{formatDistanceToNow(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <button onClick={(e) => { e.stopPropagation(); markRead(n.id) }} className="ml-auto p-1 hover:text-white text-slate-500 transition-colors">
                      <Check size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function getNotifText(n) {
  if (n.type === 'task_assigned') return `You were assigned to: ${n.payload?.task_title}`
  if (n.type === 'new_comment')   return `${n.payload?.commenter} commented on: ${n.payload?.task_title}`
  return n.type
}
