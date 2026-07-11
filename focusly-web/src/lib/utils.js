// Small utility helpers
export function formatDistanceToNow(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60)    return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60)    return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)     return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)     return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

export function priorityClass(p) {
  return p === 'high' ? 'badge-high' : p === 'medium' ? 'badge-medium' : 'badge-low'
}

export function statusClass(s) {
  return s === 'done' ? 'badge-done' : s === 'in_progress' ? 'badge-in_progress' : 'badge-todo'
}

export function statusLabel(s) {
  return s === 'in_progress' ? 'In Progress' : s === 'done' ? 'Done' : 'To Do'
}
