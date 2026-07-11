import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from './Icons'
import TaskCard from './TaskCard'

export default function KanbanColumn({ column, tasks = [], onAddTask, onTaskClick, onStatusChange, className = '' }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', status: column.id }
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col glass bg-[#13151E] border border-white/15 rounded-2xl p-3 sm:p-4 max-h-[calc(100vh-220px)] transition-colors ${
        isOver ? 'border-white/40 bg-white/[0.04]' : ''
      } ${className}`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: column.color }} />
          <h3 className="font-extrabold text-sm uppercase tracking-tight text-white m-0 truncate">
            {column.label}
          </h3>
          <span className="bg-white/10 text-slate-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={onAddTask}
          className="btn-icon p-1.5 hover:bg-white/10 hover:text-white text-slate-400 shrink-0 border-none cursor-pointer"
          title={`Add task to ${column.label}`}
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Task List container */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 min-h-[150px] custom-scrollbar">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl p-6 text-center">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">No Tasks</span>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} onStatusChange={onStatusChange} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
