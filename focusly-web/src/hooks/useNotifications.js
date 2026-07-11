import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data)
    } catch {}
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markRead = useCallback(async (id) => {
    await api.patch(`/notifications/${id}/read`)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllRead = useCallback(async () => {
    await api.patch('/notifications/read-all')
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, markRead, markAllRead, refetch: fetchNotifications }
}
