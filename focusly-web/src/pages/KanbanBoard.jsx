import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, ArrowLeft, Sparkles, X } from '../components/Icons'
import AppLayout from '../components/AppLayout'
import KanbanColumn from '../components/KanbanColumn'
import TaskCard from '../components/TaskCard'
import TaskDetailModal from '../components/TaskDetailModal'
import CreateTaskModal from '../components/CreateTaskModal'
import api from '../lib/api'
import echo from '../lib/echo'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: '#94A3B8' },
  { id: 'in_progress', label: 'In Progress',  color: '#FFFFFF' },
  { id: 'done',        label: 'Done',         color: '#64748B' },
]

export default function KanbanBoard() {
  const { id: projectId } = useParams()
  const [tasks, setTasks] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createStatus, setCreateStatus] = useState('todo')
  const [mobileTab, setMobileTab] = useState('todo')
  const [mobileViewMode, setMobileViewMode] = useState('tabs')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    api.get(`/projects/${projectId}`)
      .then(({ data }) => {
        setProject(data.project || data)
        setTasks(data.tasks || [])
      })
      .catch(() => toast.error('Failed to load project tasks'))
      .finally(() => setLoading(false))
  }, [projectId])

  // Real-time echo subscription
  useEffect(() => {
    if (!echo || !projectId) return
    const channel = echo.private(`project.${projectId}`)
    channel.listen('.TaskCreated', (e) => {
      setTasks((prev) => [e.task, ...prev.filter((t) => t.id !== e.task.id)])
    })
    channel.listen('.TaskUpdated', (e) => {
      setTasks((prev) => prev.map((t) => t.id === e.task.id ? e.task : t))
      setSelectedTask((prev) => prev?.id === e.task.id ? e.task : prev)
    })
    channel.listen('.TaskDeleted', (e) => {
      setTasks((prev) => prev.filter((t) => t.id !== e.taskId && t.id !== e.task?.id))
      setSelectedTask((prev) => prev?.id === e.taskId ? null : prev)
    })
    return () => {
      echo.leave(`project.${projectId}`)
    }
  }, [projectId])

  const tasksByStatus = useCallback((status) => {
    return tasks.filter((t) => t.status === status)
  }, [tasks])

  const handleDragStart = (event) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const draggedTask = tasks.find((t) => t.id === active.id)
    if (!draggedTask) return

    // Determine target status — over can be column or another task
    let newStatus = over.data?.current?.status ?? over.id
    if (!COLUMNS.find((c) => c.id === newStatus)) {
      const overTask = tasks.find((t) => t.id === over.id)
      newStatus = overTask?.status ?? newStatus
    }
    if (newStatus === draggedTask.status) return

    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === draggedTask.id ? { ...t, status: newStatus } : t))
    try {
      await api.patch(`/tasks/${draggedTask.id}`, { status: newStatus })
    } catch {
      toast.error('Failed to move task')
      setTasks((prev) => prev.map((t) => t.id === draggedTask.id ? { ...t, status: draggedTask.status } : t))
    }
  }

  const handleTaskCreated = (task) => {
    setTasks((prev) => [task, ...prev])
    setShowCreate(false)
  }

  const handleTaskUpdated = (updated) => {
    setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t))
    setSelectedTask(updated)
  }

  const handleTaskDeleted = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setSelectedTask(null)
  }

  const handleStatusChange = async (task, newStatus) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t))
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus })
      toast.success(newStatus === 'done' ? 'Task marked as Done!' : newStatus === 'in_progress' ? 'Task moved to In Progress' : 'Task moved to To Do')
    } catch {
      toast.error('Failed to update task status')
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: task.status } : t))
    }
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
        <Link to={`/workspaces/${project?.workspace_id}`} className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-400 hover:text-white mb-8 transition-colors text-decoration-none">
          <ArrowLeft size={13} /> Back to Workspace
        </Link>

        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/15 pb-8 mb-8 gap-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-slate-400 block mb-2">
              KANBAN WORKFLOW
            </span>
            <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-[-0.04em] text-white">
              {project?.name}
            </h1>
            {project?.description && <p className="text-sm text-slate-400 mt-2 m-0">{project.description}</p>}
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto self-start md:self-auto">
            <Link to={`/projects/${projectId}/import`} className="btn btn-secondary btn-sm justify-center w-full sm:w-auto text-decoration-none">
              <Sparkles size={13} /> AI Parser
            </Link>
            <button id="create-task-btn" className="btn btn-primary btn-sm justify-center w-full sm:w-auto" onClick={() => { setCreateStatus(mobileTab || 'todo'); setShowCreate(true) }}>
              <Plus size={13} /> New Task
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Column Switcher Tabs */}
        <div className="lg:hidden flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
            <span>Column View Mode</span>
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setMobileViewMode('tabs')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all border-none cursor-pointer ${
                  mobileViewMode === 'tabs' ? 'bg-white text-[#0B0C10]' : 'text-slate-400 bg-transparent'
                }`}
              >
                Tab View
              </button>
              <button
                onClick={() => setMobileViewMode('stacked')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all border-none cursor-pointer ${
                  mobileViewMode === 'stacked' ? 'bg-white text-[#0B0C10]' : 'text-slate-400 bg-transparent'
                }`}
              >
                All Stacked
              </button>
            </div>
          </div>

          {mobileViewMode === 'tabs' && (
            <div className="flex items-center gap-1.5 p-1 bg-[#13151E] border border-white/15 rounded-xl">
              {COLUMNS.map((col) => {
                const count = tasksByStatus(col.id).length
                const active = mobileTab === col.id
                return (
                  <button
                    key={col.id}
                    onClick={() => setMobileTab(col.id)}
                    className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                      active
                        ? 'bg-white text-[#0B0C10] shadow-sm'
                        : 'text-slate-400 hover:text-white bg-transparent'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: active ? '#0B0C10' : col.color }} />
                    <span className="truncate">{col.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ${active ? 'bg-[#0B0C10]/10 text-[#0B0C10]' : 'bg-white/10 text-slate-300'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Board */}
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasksByStatus(col.id)}
                onAddTask={() => { setCreateStatus(col.id); setShowCreate(true) }}
                onTaskClick={setSelectedTask}
                onStatusChange={handleStatusChange}
                className={mobileViewMode === 'tabs' && mobileTab !== col.id ? 'hidden lg:flex' : 'flex'}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdated}
          onDelete={handleTaskDeleted}
          workspaceRole={project?.workspace?.current_user_role}
        />
      )}

      {/* Create task modal */}
      {showCreate && (
        <CreateTaskModal
          projectId={projectId}
          defaultStatus={createStatus}
          onCreated={handleTaskCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </AppLayout>
  )
}
