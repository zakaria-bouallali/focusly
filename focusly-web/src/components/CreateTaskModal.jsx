import { useState, useEffect } from 'react'
import { X, Plus } from './Icons'
import api from '../lib/api'
import { priorityClass } from '../lib/utils'
import toast from 'react-hot-toast'

export default function CreateTaskModal({ projectId, defaultStatus = 'todo', onCreated, onClose }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium',
    assignee_id: '',
    due_date: '',
  })
  const [members, setMembers] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/projects/${projectId}`)
      .then(({ data }) => {
        const wsId = data.project?.workspace_id || data.workspace_id
        if (wsId) {
          api.get(`/workspaces/${wsId}/members`)
            .then(({ data: memData }) => setMembers(memData || []))
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [projectId])

  const handleSubmit = async (e) => {
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
      const { data } = await api.post(`/projects/${projectId}/tasks`, payload)
      toast.success('Task deployed!')
      if (onCreated) onCreated(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Task Deployment</span>
            <h2 className="m-0 text-lg font-extrabold uppercase tracking-tight text-white">Create New Task</h2>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label className="label">Task Title</label>
            <input
              id="task-title-input"
              type="text"
              className="input font-bold"
              placeholder="e.g. Implement OAuth2 Refresh Token Rotation"
              required
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="form-group mb-4">
            <label className="label">Description (Optional)</label>
            <textarea
              className="input font-sans text-xs leading-relaxed"
              rows={3}
              placeholder="Add technical specification, requirements or references..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="label">Status Column</label>
              <select
                className="input text-xs"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Priority Level</label>
              <select
                className="input text-xs"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="form-group">
              <label className="label">Assignee</label>
              <select
                className="input text-xs"
                value={form.assignee_id}
                onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.user_id || m.user?.id}>
                    {m.user?.name || `Member #${m.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Due Date (Optional)</label>
              <input
                type="date"
                className="input text-xs font-mono"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-8 border-t border-white/10 pt-6">
            <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={onClose}>Cancel</button>
            <button id="submit-create-task" type="submit" className="btn btn-primary w-full sm:w-auto" disabled={saving}>
              {saving ? 'Deploying…' : 'Deploy Task →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
