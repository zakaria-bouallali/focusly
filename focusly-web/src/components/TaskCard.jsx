import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MessageSquare, Paperclip } from './Icons'
import { getInitials, priorityClass } from '../lib/utils'

export default function TaskCard({ task, onClick, isDragging, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.4 : 1,
  }

  const handleCheckboxClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (!onStatusChange) return

    let nextStatus = 'todo'
    if (task.status === 'todo') {
      nextStatus = 'in_progress'
    } else if (task.status === 'in_progress') {
      nextStatus = 'done'
    } else if (task.status === 'done') {
      nextStatus = 'todo'
    }
    onStatusChange(task, nextStatus)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      id={`task-card-${task.id}`}
      onClick={onClick}
      className={`group p-3 sm:p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none shrink-0 ${
        isDragging
          ? 'bg-[#181A26] border-white/40 shadow-xl scale-[1.02] z-50'
          : 'bg-[#13151E] border-white/10 hover:border-white/25 hover:bg-[#181A26] shadow-sm'
      }`}
    >
      {/* Top Row: Prominent Task Title with Interactive Checkbox */}
      <div className="mb-2.5 flex items-start gap-2.5">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleCheckboxClick}
          className={`mt-0.5 w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            task.status === 'done'
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
              : task.status === 'in_progress'
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 hover:bg-amber-500/30'
              : 'bg-white/5 border-white/20 hover:border-white/50 text-transparent hover:text-white/40'
          }`}
          title={
            task.status === 'todo'
              ? 'Click to move to In Progress'
              : task.status === 'in_progress'
              ? 'Click to mark Done'
              : 'Completed (Click to move to To Do)'
          }
        >
          {task.status === 'done' && (
            <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {task.status === 'in_progress' && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          )}
          {task.status === 'todo' && (
            <svg className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <p className={`m-0 text-xs sm:text-[13px] font-semibold leading-snug break-words transition-colors ${
          task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-100 group-hover:text-white'
        }`}>
          {task.title}
        </p>
      </div>

      {/* Bottom Row: Unified Metadata Baseline */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-[10px] font-mono">
        {/* Left items: Priority pill, Due date, Comments, Attachments */}
        <div className="flex items-center flex-wrap gap-1.5 text-slate-400 min-w-0">
          <span className="bg-white/10 text-slate-300 border border-white/10 text-[9px] py-0.5 px-1.5 rounded font-bold uppercase tracking-wider shrink-0">
            {task.priority === 'medium' ? 'Med' : task.priority}
          </span>

          {task.due_date && (
            <span className="flex items-center gap-1 bg-white/[0.04] px-1.5 py-0.5 rounded text-slate-300 shrink-0">
              <Calendar size={10} className="text-slate-400" />
              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}

          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1 bg-white/[0.04] px-1.5 py-0.5 rounded text-slate-300 shrink-0" title={`${task.comments.length} comment(s)`}>
              <MessageSquare size={10} className="text-slate-400" /> {task.comments.length}
            </span>
          )}

          {task.attachments?.length > 0 && (
            <span className="flex items-center gap-1 bg-white/[0.04] px-1.5 py-0.5 rounded text-slate-300 shrink-0" title={`${task.attachments.length} attachment(s)`}>
              <Paperclip size={10} className="text-slate-400" /> {task.attachments.length}
            </span>
          )}
        </div>

        {/* Right item: Assignee Avatar */}
        <div className="shrink-0 flex items-center">
          {task.assignee ? (
            <div className="avatar avatar-sm border border-white/20 w-5 h-5 text-[8px] font-bold shadow-xs" title={`Assigned to ${task.assignee.name}`}>
              {getInitials(task.assignee.name)}
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border border-dashed border-white/15 flex items-center justify-center text-[9px] text-slate-500 hover:border-white/30 hover:text-slate-400 transition-colors" title="Unassigned">
              +
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
