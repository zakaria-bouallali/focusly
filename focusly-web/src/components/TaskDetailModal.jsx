import { useState, useEffect } from 'react'
import { X, Pencil, Trash2, Calendar, Clock, AlertCircle, MessageSquare } from './Icons'
import api from '../lib/api'
import { priorityClass, getInitials } from '../lib/utils'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

export default function TaskDetailModal({ task, onClose, onUpdate, onDelete, workspaceRole }) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    assignee_id: task.assignee_id || '',
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
  })
  const [comments, setComments] = useState(task.comments || [])
  const [commentText, setCommentText] = useState('')
  const [members, setMembers] = useState([])
  const [saving, setSaving] = useState(false)
  const [addingComment, setAddingComment] = useState(false)

  const canManage = Boolean(workspaceRole || task.assignee_id === user?.id || task.created_by === user?.id || user?.is_super_admin)

  useEffect(() => {
    if (task.project_id) {
      api.get(`/projects/${task.project_id}`)
        .then(({ data }) => {
          const wsId = data.project?.workspace_id || data.workspace_id
          if (wsId) {
            api.get(`/workspaces/${wsId}/members`)
              .then(({ data: memData }) => setMembers(memData || []))
              .catch(() => {})
          }
        })
        .catch(() => {})
    }
    api.get(`/tasks/${task.id}/comments`)
      .then(({ data }) => setComments(data || []))
      .catch(() => {})
  }, [task.id, task.project_id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
        due_date: form.due_date || null,
      }
      const { data } = await api.put(`/tasks/${task.id}`, payload)
      toast.success('Task updated')
      setEditing(false)
      if (onUpdate) onUpdate(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete task "${task.title}"? This cannot be undone.`)) return
    try {
      await api.delete(`/tasks/${task.id}`)
      toast.success('Task deleted')
      onClose()
      if (onDelete) onDelete(task.id)
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setAddingComment(true)
    try {
      const { data } = await api.post(`/tasks/${task.id}/comments`, { body: commentText.trim() })
      setComments((prev) => [...prev, data])
      setCommentText('')
      toast.success('Comment posted')
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setAddingComment(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className={`badge ${priorityClass(form.priority)}`}>{form.priority} priority</span>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded">
              Status: {form.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canManage && !editing && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                  <Pencil size={12} /> Edit
                </button>
                <button className="btn-icon text-red-400 hover:bg-red-500/10" title="Delete task" onClick={handleDelete}>
                  <Trash2 size={15} />
                </button>
              </>
            )}
            <button className="btn-icon" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        {editing ? (
          /* Edit Form */
          <form onSubmit={handleUpdate} className="mb-6">
            <div className="form-group mb-4">
              <label className="label">Task Title</label>
              <input type="text" className="input font-bold" required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            </div>

            <div className="form-group mb-4">
              <label className="label">Description</label>
              <textarea className="input font-sans text-xs leading-relaxed" rows={4}
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label className="label">Status Column</label>
                <select className="input text-xs" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Priority Level</label>
                <select className="input text-xs" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="form-group">
                <label className="label">Assignee</label>
                <select className="input text-xs" value={form.assignee_id} onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}>
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.user_id || m.user?.id}>
                      {m.user?.name || `Member #${m.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Due Date</label>
                <input type="date" className="input text-xs font-mono" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end border-t border-white/10 pt-4">
              <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes →'}
              </button>
            </div>
          </form>
        ) : (
          /* Read-only View */
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white mb-4">
              {task.title}
            </h1>

            {task.description ? (
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-white/[0.02] border border-white/10 p-4 rounded-xl mb-6 m-0">
                {task.description}
              </p>
            ) : (
              <p className="text-xs font-mono text-slate-500 italic mb-6">No description provided for this task.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-white/10 py-4 my-6">
              <div className="flex items-center gap-3">
                <div className="avatar avatar-sm">
                  {task.assignee?.name ? getInitials(task.assignee.name) : '?'}
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">Assigned To</div>
                  <div className="text-xs font-bold text-white">{task.assignee?.name || 'Unassigned'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Calendar size={14} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">Due Date</div>
                  <div className="text-xs font-bold text-white">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-tight text-white mb-4 flex items-center gap-2">
            <MessageSquare size={14} className="text-slate-400" /> Comments ({comments.length})
          </h3>

          <div className="flex flex-col gap-3 mb-6 max-h-[250px] overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 italic">No comments yet. Start the discussion below.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-3.5 bg-white/[0.02] border border-white/10 rounded-xl flex items-start gap-3">
                  <div className="avatar avatar-sm shrink-0">
                    {getInitials(comment.user?.name || 'User')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-white truncate">{comment.user?.name || 'Unknown User'}</span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {comment.created_at ? new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 m-0 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              className="input text-xs flex-1"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm w-full sm:w-auto shrink-0" disabled={addingComment || !commentText.trim()}>
              {addingComment ? 'Posting…' : 'Comment →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
