import { useState, useEffect, useRef } from 'react'
import { apiClient } from '../lib/api-client'
import { Task } from './useDelegation'

/**
 * Hook for real-time task polling
 *
 * Polls the API at regular intervals to get real-time task updates.
 * Can be replaced with WebSocket connection for production.
 */
export const useTaskPolling = (interval: number = 3000) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isPolling, setIsPolling] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchTasks = async () => {
    try {
      const response = await apiClient.get('/v1/tasks')
      setTasks(response.data.tasks || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Task polling error:', err)
    }
  }

  useEffect(() => {
    if (isPolling) {
      // Fetch immediately
      fetchTasks()

      // Set up polling interval
      intervalRef.current = setInterval(fetchTasks, interval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPolling, interval])

  const startPolling = () => setIsPolling(true)
  const stopPolling = () => setIsPolling(false)

  return {
    tasks,
    isPolling,
    error,
    startPolling,
    stopPolling,
    refetch: fetchTasks,
  }
}

/**
 * Hook for WebSocket-based real-time updates (alternative to polling)
 *
 * This is a template for WebSocket implementation.
 * Uncomment and configure when WebSocket backend is available.
 */
export const useTaskWebSocket = (url?: string) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!url) return

    // Create WebSocket connection
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'task_update') {
          setTasks(data.tasks)
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    }

    return () => {
      ws.close()
    }
  }, [url])

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

  return {
    tasks,
    isConnected,
    sendMessage,
  }
}
