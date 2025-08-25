"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageData } from '@/actions/messages'

interface UseMessagesProps {
  consultationId: string
  enabled?: boolean
}

interface UseMessagesReturn {
  messages: MessageData[]
  loading: boolean
  error: string | null
  sendMessage: (content: string, messageType?: 'text' | 'prescription' | 'system') => Promise<void>
  sendingMessage: boolean
  refreshMessages: () => Promise<void>
}

export function useMessages({ consultationId, enabled = true }: UseMessagesProps): UseMessagesReturn {
  const [messages, setMessages] = useState<MessageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!consultationId || !enabled) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/messages/${consultationId}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setMessages(data.messages)
      } else {
        throw new Error(data.error || 'Failed to fetch messages')
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }, [consultationId, enabled])

  // Send a new message
  const sendMessage = useCallback(async (
    content: string,
    messageType: 'text' | 'prescription' | 'system' = 'text'
  ) => {
    if (!consultationId || !content.trim()) return

    try {
      setSendingMessage(true)
      setError(null)

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultationId,
          content: content.trim(),
          messageType,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Message will be added via real-time subscription
      // But we can optimistically add it here for better UX
      setMessages(prev => [...prev, data.message])

    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      throw err // Re-throw so the component can handle it
    } finally {
      setSendingMessage(false)
    }
  }, [consultationId])

  // Refresh messages manually
  const refreshMessages = useCallback(async () => {
    await fetchMessages()
  }, [fetchMessages])

  // Set up real-time subscription
  useEffect(() => {
    if (!consultationId || !enabled) return

    // Initial fetch
    fetchMessages()

    // Set up real-time subscription
    const channel = supabase
      .channel(`messages-${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `consultation_id=eq.${consultationId}`,
        },
        async (payload) => {
          console.log('New message received:', payload)
          
          // Fetch the complete message with sender info
          try {
            const response = await fetch(`/api/messages/${consultationId}`)
            const data = await response.json()
            
            if (response.ok && data.success) {
              setMessages(data.messages)
            }
          } catch (err) {
            console.error('Error refreshing messages after real-time update:', err)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `consultation_id=eq.${consultationId}`,
        },
        async (payload) => {
          console.log('Message updated:', payload)
          
          // Refresh messages to get updated status
          try {
            const response = await fetch(`/api/messages/${consultationId}`)
            const data = await response.json()
            
            if (response.ok && data.success) {
              setMessages(data.messages)
            }
          } catch (err) {
            console.error('Error refreshing messages after update:', err)
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time messages')
        }
      })

    return () => {
      console.log('Unsubscribing from real-time messages')
      supabase.removeChannel(channel)
    }
  }, [consultationId, enabled, fetchMessages])

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendingMessage,
    refreshMessages,
  }
}