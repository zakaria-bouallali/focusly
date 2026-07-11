import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Sparkles, ArrowLeft, Check } from '../components/Icons'
import AppLayout from '../components/AppLayout'
import api from '../lib/api'
import { priorityClass } from '../lib/utils'
import toast from 'react-hot-toast'

export default function ImportNotes() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const [notes, setNotes] = useState('')
  const [parsing, setParsing] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [creating, setCreating] = useState(false)
  const [members, setMembers] = useState([])

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

  const handleParse = async (e) => {
    e.preventDefault()
    if (!notes.trim()) return
    setParsing(true)
    try {
      const { data } = await api.post('/ai/parse-notes', { notes })
      setSuggestions(data.tasks.map((t) => {
        let matchedId = null
        if (t.suggested_assignee_name && members.length > 0) {
          const lower = t.suggested_assignee_name.toLowerCase()
          const found = members.find((m) => {
            const userName = (m.user?.name || '').toLowerCase()
            return userName === lower || userName.includes(lower) || lower.includes(userName) || userName.split(' ')[0] === lower
          })
          if (found) {
            matchedId = found.user_id || found.user?.id || null
          }
        }
        return {
          ...t,
          selected: true,
          priority: t.suggested_priority || 'medium',
          suggested_assignee_id: matchedId,
        }
      }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI parsing failed. Check your API key.')
    } finally { setParsing(false) }
  }

  const handleConfirm = async () => {
    const toCreate = suggestions.filter((s) => s.selected)
    if (!toCreate.length) return toast.error('Select at least one task')
    setCreating(true)
    try {
      await Promise.all(toCreate.map((s) =>
        api.post(`/projects/${projectId}/tasks`, {
          title: s.title, description: s.description, priority: s.priority, status: 'todo',
          assignee_id: s.suggested_assignee_id || null
        })
      ))
      toast.success(`Imported ${toCreate.length} tasks!`)
      navigate(`/projects/${projectId}`)
    } catch { toast.error('Failed to create tasks') }
    finally { setCreating(false) }
  }

  const updateField = (index, field, value) => {
    setSuggestions((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const toggleSelect = (index) => {
    setSuggestions((prev) => prev.map((s, i) => i === index ? { ...s, selected: !s.selected } : s))
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-400 hover:text-white mb-8 transition-colors text-decoration-none">
          <ArrowLeft size={13} /> Back to Kanban Board
        </Link>

        <div className="border-b border-white/15 pb-8 mb-8">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-slate-400 block mb-2">
            AI TASK PARSER
          </span>
          <h1 className="font-extrabold text-3xl sm:text-4xl uppercase tracking-[-0.04em] text-white">
            IMPORT MEETING NOTES.
          </h1>
          <p className="text-sm text-slate-400 mt-2 m-0">
            Paste unstructured notes, brain dumps, or meeting minutes. Our AI will extract actionable tasks, deadlines, and suggested assignees.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleParse} className="mb-10">
          <div className="form-group mb-4">
            <textarea
              className="input font-mono text-xs p-4 sm:p-6 leading-relaxed bg-[#13151E]"
              rows={8}
              placeholder="- John to redesign the onboarding flow by Friday [High priority]&#10;- Fix the CSS overflow bug on mobile header [Medium priority]&#10;- Sarah will draft the technical spec for WebSocket sync"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={parsing || !notes.trim()}
            className="btn btn-primary w-full sm:w-auto px-8 py-3.5"
          >
            {parsing ? (
              <><div className="spinner w-4 h-4 border-2 border-t-black border-black/20 mr-2" /> Extracting Tasks…</>
            ) : (
              <><Sparkles size={16} /> Parse Notes With AI →</>
            )}
          </button>
        </form>

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <div className="glass p-6 sm:p-8 bg-[#13151E] border border-white/15 rounded-2xl animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl uppercase tracking-tight text-white m-0">
                  Extracted Tasks ({suggestions.filter((s) => s.selected).length} selected)
                </h3>
                <p className="text-xs font-mono text-slate-400 uppercase mt-1 m-0">Review and tweak before creating</p>
              </div>
              <button
                onClick={handleConfirm}
                disabled={creating || !suggestions.some((s) => s.selected)}
                className="btn btn-primary w-full sm:w-auto"
              >
                {creating ? 'Creating Tasks…' : `Confirm & Import (${suggestions.filter((s) => s.selected).length}) →`}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border transition-all ${
                    s.selected ? 'bg-white/[0.04] border-white/30' : 'bg-transparent border-white/10 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => toggleSelect(i)}
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-2.5 transition-colors cursor-pointer border ${
                        s.selected ? 'bg-white text-[#0B0C10] border-white' : 'border-white/30 bg-transparent'
                      }`}
                    >
                      {s.selected && <Check size={14} strokeWidth={3} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <input
                        className="input font-bold text-sm mb-2.5 py-2 px-3"
                        value={s.title}
                        onChange={(e) => updateField(i, 'title', e.target.value)}
                      />
                      <textarea className="input font-sans text-xs mb-3 py-2 px-3 leading-relaxed" rows={2}
                        value={s.description} onChange={(e) => updateField(i, 'description', e.target.value)} />

                      <div className="flex flex-wrap items-center gap-3">
                        <select className="input max-w-[160px] py-1.5 text-xs font-semibold"
                          value={s.priority} onChange={(e) => updateField(i, 'priority', e.target.value)}>
                          <option value="low">Priority: Low</option>
                          <option value="medium">Priority: Medium</option>
                          <option value="high">Priority: High</option>
                        </select>
                        <span className={`badge ${priorityClass(s.priority)}`}>{s.priority}</span>
                        <select
                          className="input max-w-[210px] py-1.5 text-xs font-semibold"
                          value={s.suggested_assignee_id || ''}
                          onChange={(e) => updateField(i, 'suggested_assignee_id', e.target.value ? Number(e.target.value) : null)}
                        >
                          <option value="">Assignee: Unassigned</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.user_id || m.user?.id}>
                              Assignee: {m.user?.name || `Member #${m.id}`}
                            </option>
                          ))}
                        </select>
                        {s.suggested_assignee_name && !s.suggested_assignee_id && (
                          <span className="text-xs font-mono uppercase text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                            AI Suggested: {s.suggested_assignee_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
