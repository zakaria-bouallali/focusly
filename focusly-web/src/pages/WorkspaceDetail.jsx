import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, ArrowLeft, Users, X, FolderOpen, Pencil, Trash2, UserMinus, Crown, User } from '../components/Icons'
import AppLayout from '../components/AppLayout'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { getInitials } from '../lib/utils'

export default function WorkspaceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState(null)
  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [creating, setCreating] = useState(false)
  const [projectForm, setProjectForm] = useState({ name: '', description: '' })
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  // Edit project state
  const [editingProject, setEditingProject] = useState(null)
  const [editProjectForm, setEditProjectForm] = useState({ name: '', description: '' })
  const [savingProject, setSavingProject] = useState(false)

  // Inline confirm state — replaces window.confirm() which browsers can silently block
  const [confirmDialog, setConfirmDialog] = useState(null)
  // confirmDialog shape: { title, message, onConfirm }

  useEffect(() => {
    Promise.all([
      api.get(`/workspaces/${id}`),
      api.get(`/workspaces/${id}/projects`),
      api.get(`/workspaces/${id}/members`),
    ]).then(([wsRes, projRes, memRes]) => {
      setWorkspace(wsRes.data)
      setProjects(projRes.data)
      setMembers(memRes.data)
    }).catch(() => toast.error('Failed to load workspace details'))
      .finally(() => setLoading(false))
  }, [id])

  const isOwner = workspace?.current_user_role === 'owner' || workspace?.current_user_role === 'admin'

  const handleCreateProject = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const { data } = await api.post(`/workspaces/${id}/projects`, projectForm)
      setProjects((prev) => [data, ...prev])
      setShowCreate(false)
      setProjectForm({ name: '', description: '' })
      toast.success('Project created!')
    } catch { toast.error('Failed to create project') }
    finally { setCreating(false) }
  }

  const openEditProject = (proj, e) => {
    e.stopPropagation()
    setEditingProject(proj)
    setEditProjectForm({ name: proj.name, description: proj.description || '' })
  }

  const handleUpdateProject = async (e) => {
    e.preventDefault()
    setSavingProject(true)
    try {
      const { data } = await api.put(`/projects/${editingProject.id}`, editProjectForm)
      setProjects((prev) => prev.map((p) => p.id === data.id ? data : p))
      setEditingProject(null)
      toast.success('Project updated')
    } catch { toast.error('Failed to update project') }
    finally { setSavingProject(false) }
  }

  const handleDeleteProject = async (proj, e) => {
    e.stopPropagation()
    setConfirmDialog({
      title: 'Delete Project',
      message: `Delete "${proj.name}"? All tasks inside will be permanently removed.`,
      onConfirm: async () => {
        try {
          await api.delete(`/projects/${proj.id}`)
          setProjects((prev) => prev.filter((p) => p.id !== proj.id))
          toast.success('Project deleted')
        } catch { toast.error('Failed to delete project') }
        setConfirmDialog(null)
      }
    })
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    try {
      const { data } = await api.post(`/workspaces/${id}/invite`, { email: inviteEmail })
      // data is now the full WorkspaceMember object (with .user nested)
      setMembers((prev) => [...prev, data])
      setShowInvite(false)
      setInviteEmail('')
      toast.success(`${data.user?.name ?? 'Member'} invited successfully!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite member')
    } finally { setInviting(false) }
  }

  const handleRemoveMember = (memberId, memberName) => {
    setConfirmDialog({
      title: 'Remove Member',
      message: `Remove ${memberName} from this workspace? They will lose access to all projects inside.`,
      onConfirm: async () => {
        try {
          await api.delete(`/workspaces/${id}/members/${memberId}`)
          setMembers((prev) => prev.filter((m) => m.id !== memberId))
          toast.success(`${memberName} removed from workspace`)
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to remove member')
        }
        setConfirmDialog(null)
      }
    })
  }

  if (loading) return (
    <AppLayout>
      <div className="flex justify-center py-24"><div className="spinner w-8 h-8" /></div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Link to="/workspaces" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-400 hover:text-white mb-8 transition-colors text-decoration-none">
          <ArrowLeft size={13} /> Back to Workspaces
        </Link>

        {/* Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/15 pb-8 mb-10 gap-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-slate-400 block mb-2">
              WORKSPACE ARCHITECTURE
            </span>
            <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-[-0.04em] text-white">
              {workspace?.name}
            </h1>
            
            {/* Members row */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="flex -space-x-2 overflow-hidden">
                {members.slice(0, 5).map((m) => (
                  <div key={m.id} className="avatar avatar-sm border border-white/30" title={m.user?.name}>
                    {getInitials(m.user?.name)}
                  </div>
                ))}
              </div>
              {members.length > 5 && <span className="text-xs font-mono text-slate-400">+{members.length - 5}</span>}
              <button
                onClick={() => setShowMembers(true)}
                className="bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-full text-slate-300 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ml-1 border-none"
              >
                <Users size={12} /> {members.length} Members →
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto self-start lg:self-auto">
            {isOwner && (
              <div className="grid grid-cols-2 sm:flex gap-2.5 sm:gap-3">
                <button className="btn btn-secondary btn-sm justify-center" onClick={() => setShowMembers(true)}><Users size={13} /> Team</button>
                <button className="btn btn-secondary btn-sm justify-center" onClick={() => setShowInvite(true)}><Plus size={13} /> Invite</button>
              </div>
            )}
            <button id="create-project-btn" className="btn btn-primary btn-sm justify-center w-full sm:w-auto" onClick={() => setShowCreate(true)}>
              <Plus size={13} /> New Project
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="empty-state border border-white/10 rounded-2xl p-12 text-center">
            <FolderOpen size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-sm text-slate-400 font-mono uppercase tracking-wider mb-6">No projects created inside this workspace yet</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj, i) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                index={i}
                isOwner={isOwner}
                onEdit={(e) => openEditProject(proj, e)}
                onDelete={(e) => handleDeleteProject(proj, e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Create Project Modal ── */}
      {showCreate && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}>
          <div className="modal-box">
            <div className="flex items-center justify-between border-b border-white/15 pb-5 mb-7">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-0.5">Project Deployment</span>
                <h2 className="m-0 text-lg font-extrabold uppercase tracking-tight text-white">New Project</h2>
              </div>
              <button className="btn-icon" onClick={() => setShowCreate(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="label">Project Title</label>
                <input id="project-name-input" type="text" className="input" placeholder="e.g. Q3 Mobile App Redesign" required
                  value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} autoFocus />
              </div>
              <div className="form-group">
                <label className="label">Brief Description (Optional)</label>
                <textarea className="input font-sans text-xs" rows={3} placeholder="What is the main objective of this project?"
                  value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-8">
                <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={() => setShowCreate(false)}>Cancel</button>
                <button id="submit-create-project" type="submit" className="btn btn-primary w-full sm:w-auto" disabled={creating}>{creating ? 'Deploying…' : 'Deploy Project →'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Project Modal ── */}
      {editingProject && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingProject(null) }}>
          <div className="modal-box">
            <div className="flex items-center justify-between border-b border-white/15 pb-5 mb-7">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-0.5">Project Configuration</span>
                <h2 className="m-0 text-lg font-extrabold uppercase tracking-tight text-white">Edit Project</h2>
              </div>
              <button className="btn-icon" onClick={() => setEditingProject(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdateProject}>
              <div className="form-group">
                <label className="label">Project Title</label>
                <input id="edit-project-name-input" type="text" className="input" required
                  value={editProjectForm.name} onChange={(e) => setEditProjectForm({ ...editProjectForm, name: e.target.value })} autoFocus />
              </div>
              <div className="form-group">
                <label className="label">Brief Description (Optional)</label>
                <textarea className="input font-sans text-xs" rows={3}
                  value={editProjectForm.description} onChange={(e) => setEditProjectForm({ ...editProjectForm, description: e.target.value })} />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-8">
                <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={() => setEditingProject(null)}>Cancel</button>
                <button id="save-project-btn" type="submit" className="btn btn-primary w-full sm:w-auto" disabled={savingProject}>
                  {savingProject ? 'Saving…' : 'Save Changes →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Team Members Modal ── */}
      {showMembers && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowMembers(false) }}>
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Access Control</span>
                <h2 className="m-0 text-lg font-extrabold uppercase tracking-tight text-white">Team Members ({members.length})</h2>
              </div>
              <div className="flex items-center gap-2">
                {isOwner && (
                  <button className="btn btn-primary btn-sm" onClick={() => { setShowMembers(false); setShowInvite(true) }}>
                    <Plus size={12} /> Invite
                  </button>
                )}
                <button className="btn-icon" onClick={() => setShowMembers(false)}><X size={16} /></button>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {members.map((m) => {
                const memberIsOwner = m.role === 'owner'
                return (
                  <div key={m.id} className="glass p-4 bg-[#13151E] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="avatar avatar-lg shrink-0">
                        {getInitials(m.user?.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white flex items-center gap-2 truncate">
                          {m.user?.name}
                          {memberIsOwner ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded shrink-0">
                              <Crown size={10} /> Owner
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10 px-2 py-0.5 rounded shrink-0">
                              <User size={10} /> Member
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-400 truncate">{m.user?.email}</div>
                      </div>
                    </div>

                    {/* Show remove button for non-owner members when current user can manage */}
                    {isOwner && m.role !== 'owner' && (
                      <button
                        className="btn-icon p-2 text-red-400 hover:bg-red-500/10 self-end sm:self-center shrink-0"
                        title="Remove member"
                        onClick={() => handleRemoveMember(m.id, m.user?.name)}
                      >
                        <UserMinus size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Invite Modal ── */}
      {showInvite && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowInvite(false) }}>
          <div className="modal-box">
            <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">RBAC Invitation</span>
                <h2 className="m-0 text-lg font-extrabold uppercase tracking-tight text-white">Invite Member</h2>
              </div>
              <button className="btn-icon" onClick={() => setShowInvite(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="form-group">
                <label className="label">Work Email Address</label>
                <input id="invite-email-input" type="email" className="input" placeholder="colleague@company.com" required
                  value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} autoFocus />
                <p className="text-xs font-mono text-slate-400 mt-2 uppercase">Must be a registered Focusly user</p>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-8">
                <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={() => setShowInvite(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={inviting}>{inviting ? 'Inviting…' : 'Invite Member →'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Dialog Modal ── */}
      {confirmDialog && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDialog(null) }}>
          <div className="modal-box max-w-md">
            <div className="flex items-start justify-between border-b border-white/15 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block mb-1">Destructive Action</span>
                <h2 className="m-0 text-lg font-extrabold uppercase tracking-tight text-white">{confirmDialog.title}</h2>
              </div>
              <button className="btn-icon shrink-0" onClick={() => setConfirmDialog(null)}><X size={16} /></button>
            </div>
            <p className="text-sm text-slate-300 font-sans leading-relaxed mb-8">{confirmDialog.message}</p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button className="btn btn-secondary w-full sm:w-auto" onClick={() => setConfirmDialog(null)}>Cancel</button>
              <button
                className="btn w-full sm:w-auto bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all"
                onClick={confirmDialog.onConfirm}
              >
                Confirm →
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

function ProjectCard({ project, index, isOwner, onEdit, onDelete }) {
  const navigate = useNavigate()

  return (
    <div
      id={`project-card-${project.id}`}
      onClick={() => navigate(`/projects/${project.id}`)}
      className="glass p-6 bg-[#13151E] hover:bg-white/[0.04] transition-all cursor-pointer group flex flex-col justify-between border border-white/15 hover:border-white/30 rounded-2xl min-h-[180px]"
    >
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 tracking-wider mb-4">
          <span>0 {index + 1} / PROJECT</span>
          <span className="bg-white/10 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
            {project.tasks_count ?? 0} TASKS
          </span>
        </div>

        <h3 className="text-xl font-extrabold uppercase tracking-tight text-white mb-2 group-hover:text-slate-200 transition-colors">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-6 m-0">
            {project.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-6">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          Kanban Board →
        </span>

        {isOwner && (
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              id={`edit-project-${project.id}`}
              className="btn-icon p-1.5"
              title="Edit project"
              onClick={onEdit}
            >
              <Pencil size={13} />
            </button>
            <button
              id={`delete-project-${project.id}`}
              className="btn-icon p-1.5 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
              title="Delete project"
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
