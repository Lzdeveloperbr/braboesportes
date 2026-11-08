export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          club_id: string
          created_at: string
          id: string
          pinned: boolean
          title: string
        }
        Insert: {
          body?: string
          club_id?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title: string
        }
        Update: {
          body?: string
          club_id?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          club_id: string
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          club_id?: string
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          club_id?: string
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_members: {
        Row: {
          club_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_settings: {
        Row: {
          city: string | null
          club_id: string
          club_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          crest_url: string | null
          founded_year: number | null
          id: string
          instagram: string | null
          monthly_fee: number
          singleton: boolean
          stadium: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          club_id?: string
          club_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          crest_url?: string | null
          founded_year?: number | null
          id?: string
          instagram?: string | null
          monthly_fee?: number
          singleton?: boolean
          stadium?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          club_id?: string
          club_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          crest_url?: string | null
          founded_year?: number | null
          id?: string
          instagram?: string | null
          monthly_fee?: number
          singleton?: boolean
          stadium?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_settings_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          created_at: string
          created_by: string | null
          crest_url: string | null
          id: string
          name: string
          primary_color: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          crest_url?: string | null
          id?: string
          name: string
          primary_color?: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          crest_url?: string | null
          id?: string
          name?: string
          primary_color?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          club_id: string
          created_at: string
          doc_type: string
          expires_on: string | null
          file_path: string
          id: string
          player_id: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          club_id?: string
          created_at?: string
          doc_type?: string
          expires_on?: string | null
          file_path: string
          id?: string
          player_id?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string
          doc_type?: string
          expires_on?: string | null
          file_path?: string
          id?: string
          player_id?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          attitude: number
          club_id: string
          comment: string | null
          created_at: string
          defending: number
          evaluated_on: string
          finishing: number
          id: string
          passing: number
          physical: number
          player_id: string
          speed: number
          technique: number
        }
        Insert: {
          attitude?: number
          club_id?: string
          comment?: string | null
          created_at?: string
          defending?: number
          evaluated_on?: string
          finishing?: number
          id?: string
          passing?: number
          physical?: number
          player_id: string
          speed?: number
          technique?: number
        }
        Update: {
          attitude?: number
          club_id?: string
          comment?: string | null
          created_at?: string
          defending?: number
          evaluated_on?: string
          finishing?: number
          id?: string
          passing?: number
          physical?: number
          player_id?: string
          speed?: number
          technique?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_entries: {
        Row: {
          amount: number
          category: string
          club_id: string
          created_at: string
          description: string
          entry_date: string
          id: string
          kind: string
          sponsor_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          club_id?: string
          created_at?: string
          description: string
          entry_date?: string
          id?: string
          kind?: string
          sponsor_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          club_id?: string
          created_at?: string
          description?: string
          entry_date?: string
          id?: string
          kind?: string
          sponsor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_entries_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_entries_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          club_id: string
          created_at: string
          id: string
          player_id: string
          relationship: string
          user_id: string
        }
        Insert: {
          club_id?: string
          created_at?: string
          id?: string
          player_id: string
          relationship?: string
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          player_id?: string
          relationship?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardians_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardians_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      injuries: {
        Row: {
          club_id: string
          created_at: string
          description: string
          expected_return: string | null
          id: string
          player_id: string
          severity: string
          started_on: string
          status: string
          updated_at: string
        }
        Insert: {
          club_id?: string
          created_at?: string
          description: string
          expected_return?: string | null
          id?: string
          player_id: string
          severity?: string
          started_on?: string
          status?: string
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          description?: string
          expected_return?: string | null
          id?: string
          player_id?: string
          severity?: string
          started_on?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "injuries_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "injuries_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_lineups: {
        Row: {
          club_id: string
          created_at: string
          id: string
          match_id: string
          player_id: string
          slot: string
          spot: number | null
        }
        Insert: {
          club_id?: string
          created_at?: string
          id?: string
          match_id: string
          player_id: string
          slot?: string
          spot?: number | null
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          match_id?: string
          player_id?: string
          slot?: string
          spot?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_lineups_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_lineups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_lineups_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_stats: {
        Row: {
          assists: number
          club_id: string
          created_at: string
          goals: number
          id: string
          match_id: string
          minutes: number
          mvp: boolean
          passes: number
          player_id: string
          rating: number
          red_cards: number
          saves: number
          shots: number
          tackles: number
          updated_at: string
          yellow_cards: number
        }
        Insert: {
          assists?: number
          club_id?: string
          created_at?: string
          goals?: number
          id?: string
          match_id: string
          minutes?: number
          mvp?: boolean
          passes?: number
          player_id: string
          rating?: number
          red_cards?: number
          saves?: number
          shots?: number
          tackles?: number
          updated_at?: string
          yellow_cards?: number
        }
        Update: {
          assists?: number
          club_id?: string
          created_at?: string
          goals?: number
          id?: string
          match_id?: string
          minutes?: number
          mvp?: boolean
          passes?: number
          player_id?: string
          rating?: number
          red_cards?: number
          saves?: number
          shots?: number
          tackles?: number
          updated_at?: string
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_stats_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria"]
          club_id: string
          competition: string | null
          created_at: string
          formation: string
          goals_against: number | null
          goals_for: number | null
          home: boolean
          id: string
          match_date: string
          notes: string | null
          opponent: string
          venue: string | null
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["categoria"]
          club_id?: string
          competition?: string | null
          created_at?: string
          formation?: string
          goals_against?: number | null
          goals_for?: number | null
          home?: boolean
          id?: string
          match_date: string
          notes?: string | null
          opponent: string
          venue?: string | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria"]
          club_id?: string
          competition?: string | null
          created_at?: string
          formation?: string
          goals_against?: number | null
          goals_for?: number | null
          home?: boolean
          id?: string
          match_date?: string
          notes?: string | null
          opponent?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          club_id: string
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          paid_at: string | null
          player_id: string
          reference_month: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          club_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          player_id: string
          reference_month: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          club_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          player_id?: string
          reference_month?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          address: string | null
          assists: number
          birth_date: string | null
          categoria: Database["public"]["Enums"]["categoria"]
          club_id: string
          cpf: string | null
          created_at: string
          defending: number
          dominant_foot: string
          email: string | null
          finishing: number
          full_name: string
          goals: number
          height_cm: number | null
          history: string | null
          id: string
          joined_on: string | null
          matches_played: number
          notes: string | null
          passing: number
          phone: string | null
          photo_url: string | null
          physical: number
          position: string
          red_cards: number
          rg: string | null
          shirt_number: number | null
          speed: number
          status: string
          technique: number
          updated_at: string
          user_id: string | null
          weight_kg: number | null
          yellow_cards: number
        }
        Insert: {
          address?: string | null
          assists?: number
          birth_date?: string | null
          categoria?: Database["public"]["Enums"]["categoria"]
          club_id?: string
          cpf?: string | null
          created_at?: string
          defending?: number
          dominant_foot?: string
          email?: string | null
          finishing?: number
          full_name: string
          goals?: number
          height_cm?: number | null
          history?: string | null
          id?: string
          joined_on?: string | null
          matches_played?: number
          notes?: string | null
          passing?: number
          phone?: string | null
          photo_url?: string | null
          physical?: number
          position?: string
          red_cards?: number
          rg?: string | null
          shirt_number?: number | null
          speed?: number
          status?: string
          technique?: number
          updated_at?: string
          user_id?: string | null
          weight_kg?: number | null
          yellow_cards?: number
        }
        Update: {
          address?: string | null
          assists?: number
          birth_date?: string | null
          categoria?: Database["public"]["Enums"]["categoria"]
          club_id?: string
          cpf?: string | null
          created_at?: string
          defending?: number
          dominant_foot?: string
          email?: string | null
          finishing?: number
          full_name?: string
          goals?: number
          height_cm?: number | null
          history?: string | null
          id?: string
          joined_on?: string | null
          matches_played?: number
          notes?: string | null
          passing?: number
          phone?: string | null
          photo_url?: string | null
          physical?: number
          position?: string
          red_cards?: number
          rg?: string | null
          shirt_number?: number | null
          speed?: number
          status?: string
          technique?: number
          updated_at?: string
          user_id?: string | null
          weight_kg?: number | null
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "players_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          active: boolean
          amount: number
          club_id: string
          created_at: string
          ends_on: string | null
          id: string
          logo_url: string | null
          name: string
          starts_on: string | null
          tier: string
          updated_at: string
          website: string | null
        }
        Insert: {
          active?: boolean
          amount?: number
          club_id?: string
          created_at?: string
          ends_on?: string | null
          id?: string
          logo_url?: string | null
          name: string
          starts_on?: string | null
          tier?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          active?: boolean
          amount?: number
          club_id?: string
          created_at?: string
          ends_on?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          starts_on?: string | null
          tier?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsors_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_attendance: {
        Row: {
          checked_in_at: string | null
          club_id: string
          created_at: string
          id: string
          method: string
          note: string | null
          player_id: string
          status: string
          training_id: string
          updated_at: string
        }
        Insert: {
          checked_in_at?: string | null
          club_id?: string
          created_at?: string
          id?: string
          method?: string
          note?: string | null
          player_id: string
          status?: string
          training_id: string
          updated_at?: string
        }
        Update: {
          checked_in_at?: string | null
          club_id?: string
          created_at?: string
          id?: string
          method?: string
          note?: string | null
          player_id?: string
          status?: string
          training_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_attendance_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_attendance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_attendance_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria"]
          checkin_code: string | null
          checkin_expires_at: string | null
          club_id: string
          created_at: string
          exercises: string | null
          id: string
          load_level: number
          location: string | null
          notes: string | null
          status: string
          title: string
          training_date: string
          training_type: string
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["categoria"]
          checkin_code?: string | null
          checkin_expires_at?: string | null
          club_id?: string
          created_at?: string
          exercises?: string | null
          id?: string
          load_level?: number
          location?: string | null
          notes?: string | null
          status?: string
          title: string
          training_date: string
          training_type?: string
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria"]
          checkin_code?: string | null
          checkin_expires_at?: string | null
          club_id?: string
          created_at?: string
          exercises?: string | null
          id?: string
          load_level?: number
          location?: string | null
          notes?: string | null
          status?: string
          title?: string
          training_date?: string
          training_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainings_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_club_id: { Args: never; Returns: string }
      list_club_managers: { Args: never; Returns: { user_id: string; email: string; role: string }[] }
      set_club_manager: { Args: { _email: string; _role: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_club_member: { Args: { _club_id: string }; Returns: boolean }
      is_president: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      owns_player: { Args: { _player_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "presidente"
        | "treinador"
        | "jogador"
        | "responsavel"
        | "admin"
        | "comissao"
        | "superadmin"
        | "diretor"
        | "auxiliar"
      categoria:
        | "Sub-9"
        | "Sub-11"
        | "Sub-13"
        | "Sub-15"
        | "Sub-17"
        | "Sub-20"
        | "Adulto"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "presidente",
        "treinador",
        "jogador",
        "responsavel",
        "admin",
        "comissao",
        "superadmin",
        "diretor",
        "auxiliar",
      ],
      categoria: [
        "Sub-9",
        "Sub-11",
        "Sub-13",
        "Sub-15",
        "Sub-17",
        "Sub-20",
        "Adulto",
      ],
    },
  },
} as const
