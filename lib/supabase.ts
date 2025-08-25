import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database types for type safety
export type Database = {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string
          consultation_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'prescription' | 'system' | 'file_attachment' | 'image'
          status: 'sent' | 'delivered' | 'read' | 'failed'
          attachment_url: string | null
          attachment_name: string | null
          attachment_size: string | null
          is_edited: boolean
          edited_at: string | null
          reply_to_message_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          consultation_id: string
          sender_id: string
          content: string
          message_type?: 'text' | 'prescription' | 'system' | 'file_attachment' | 'image'
          status?: 'sent' | 'delivered' | 'read' | 'failed'
          attachment_url?: string | null
          attachment_name?: string | null
          attachment_size?: string | null
          is_edited?: boolean
          edited_at?: string | null
          reply_to_message_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          consultation_id?: string
          sender_id?: string
          content?: string
          message_type?: 'text' | 'prescription' | 'system' | 'file_attachment' | 'image'
          status?: 'sent' | 'delivered' | 'read' | 'failed'
          attachment_url?: string | null
          attachment_name?: string | null
          attachment_size?: string | null
          is_edited?: boolean
          edited_at?: string | null
          reply_to_message_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}