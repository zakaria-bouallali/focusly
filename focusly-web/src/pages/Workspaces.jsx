import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, X, Pencil, Trash2 } from '../components/Icons'
import AppLayout from '../components/AppLayout'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useScrollReveal, useScrollProgress } from '../hooks/useScrollReveal'

export default function Workspaces() {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  // Edit state
  const [editingWs, setEditingWs] = useState(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/workspaces').then(({ data }) => setWorkspaces(data)).catch(() => toast.error('Failed to load workspaces')).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const { data } = await api.post('/workspaces', { name })
      setWorkspaces((prev) => [data, ...prev])
      setShowCreate(false)
      setName('')
      toast.success('Workspace created!')
    } catch { toast.error('Failed to create workspace') }
    finally { setCreating(false) }
  }

  const openEdit = (ws, e) => {
    e.stopPropagation()
    setEditingWs(ws)
    setEditName(ws.name)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put(`/workspaces/${editingWs.id}`, { name: editName })
      setWorkspaces((prev) => prev.map((w) => w.id === data.id ? data : w))
      setEditingWs(null)
      toast.success('Workspace renamed')
    } catch { toast.error('Failed to update workspace') }
    finally { setSaving(false) }
  }

  const handleDelete = async (ws, e) => {
    e.stopPropagation()
    if (!confirm(`Delete workspace "${ws.name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/workspaces/${ws.id}`)
      setWorkspaces((prev) => prev.filter((w) => w.id !== ws.id))
      toast.success('Workspace deleted')
    } catch { toast.error('Failed to delete workspace') }
  }

  const progress = useScrollProgress()
  const [headerRef, headerVisible] = useScrollReveal()
  const [gridRef, gridVisible] = useScrollReveal({ threshold: 0.05 })

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
              WORKSPACE DIRECTORY
            </span>
            <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-[-0.04em] text-white">
              YOUR WORKSPACES.
            </h1>
          </div>
          <button
            id="create-workspace-btn"
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={16} /> New Workspace
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-24"><div className="spinner w-8 h-8" /></div>
        ) : workspaces.length === 0 ? (
          <div className="empty-state border border-white/10 rounded-2xl p-12 text-center">
            <FolderOpen size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-sm text-slate-400 font-mono uppercase tracking-wider mb-6">No workspaces assigned to your account</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Create Your First Workspace
            </button>
          </div>
        ) : (
          /* Grid — Stagger */
          <div ref={gridRef} className={`stagger-group ${gridVisible ? 'in-view' : ''} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`}>
            {workspaces.map((ws, i) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                index={i}
                isOwner={ws.owner_id === user?.id}
                onEdit={(e) => openEdit(ws, e)}
                onDelete={(e) => handleDelete(ws, e)}
                className="stagger-item"
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}>
          <div className="modal-box">
            <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Tenant Creation</span>
                <h2 className="m-0 text-lg font-extrabold uppercase tracking-tight text-white">New Workspace</h2>
              </div>
              <button className="btn-icon" onClick={() => setShowCreate(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="label">Workspace Name</label>
                <input id="workspace-name-input" type="text" className="input" placeholder="e.g. Acme Corp Engineering" required
                  value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              </div>
              <div className="flex gap-3 justify-end mt-8">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating…' : 'Create Workspace →'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingWs && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingWs(null) }}>
          <div className="modal-box">
            <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Tenant Modification</span>
                <h2 className="m-0 text-lg font-extrabold uppercase tracking-tight text-white">Rename Workspace</h2>
              </div>
              <button className="btn-icon" onClick={() => setEditingWs(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="label">Workspace Name</label>
                <input id="edit-workspace-name-input" type="text" className="input" required
                  value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
              </div>
              <div className="flex gap-3 justify-end mt-8">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingWs(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes →'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

function WorkspaceCard({ workspace, index, isOwner, onEdit, onDelete, className = '' }) {
  const navigate = useNavigate()

  return (
    <div
      id={`workspace-card-${workspace.id}`}
      onClick={() => navigate(`/workspaces/${workspace.id}`)}
      className={`glass p-6 bg-[#13151E] hover:bg-white/[0.04] transition-all cursor-pointer group flex flex-col justify-between border border-white/15 hover:border-white/30 rounded-2xl min-h-[180px] ${className}`}
    >
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 tracking-wider mb-4">
          <span>0 {index + 1} / WORKSPACE</span>
          {isOwner ? (
            <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded text-[10px]">OWNER</span>
          ) : (
            <span className="text-slate-400 text-[10px]">MEMBER</span>
          )}
        </div>

        <h3 className="text-xl font-extrabold uppercase tracking-tight text-white mb-2 group-hover:text-slate-200 transition-colors">
          {workspace.name}
        </h3>
        <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-6">
          Admin: {workspace.owner?.name || 'Unknown'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="flex items-center gap-2 text-xs font-mono text-slate-300 uppercase tracking-wider">
          <FolderOpen size={13} className="text-slate-400" /> {workspace.projects_count ?? 0} Projects
        </span>

        {isOwner && (
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              id={`edit-workspace-${workspace.id}`}
              className="btn-icon p-1.5"
              title="Rename workspace"
              onClick={onEdit}
            >
              <Pencil size={13} />
            </button>
            <button
              id={`delete-workspace-${workspace.id}`}
              className="btn-icon p-1.5 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
              title="Delete workspace"
              onClick={onDelete}
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
