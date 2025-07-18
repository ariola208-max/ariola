import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      commands: {
        Row: {
          id: string
          name: string
          description: string
          command: string
          category: string
          created_at: string
          updated_at: string
          created_by: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description: string
          command: string
          category: string
          created_at?: string
          updated_at?: string
          created_by: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string
          command?: string
          category?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          is_active?: boolean
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}