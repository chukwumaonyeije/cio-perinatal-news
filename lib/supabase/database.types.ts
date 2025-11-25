export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      news_items: {
        Row: {
          id: string
          url: string
          title: string
          source: 'twitter' | 'linkedin' | 'reddit' | 'news'
          content: string
          ai_summary: string | null
          relevance_score: number
          category: 'billing' | 'gdm' | 'preeclampsia' | 'other'
          bookmarked: boolean
          created_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          url: string
          title: string
          source: 'twitter' | 'linkedin' | 'reddit' | 'news'
          content: string
          ai_summary?: string | null
          relevance_score: number
          category: 'billing' | 'gdm' | 'preeclampsia' | 'other'
          bookmarked?: boolean
          created_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          url?: string
          title?: string
          source?: 'twitter' | 'linkedin' | 'reddit' | 'news'
          content?: string
          ai_summary?: string | null
          relevance_score?: number
          category?: 'billing' | 'gdm' | 'preeclampsia' | 'other'
          bookmarked?: boolean
          created_at?: string
          published_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
