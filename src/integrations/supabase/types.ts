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
          created_at: string
          id: string
          pinned: boolean
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria"]
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
        Relationships: []
      }
      players: {
        Row: {
          assists: number
          birth_date: string | null
          categoria: Database["public"]["Enums"]["categoria"]
          created_at: string
          defending: number
          dominant_foot: string
          finishing: number
          full_name: string
          goals: number
          height_cm: number | null
          id: string
          matches_played: number
          passing: number
          phone: string | null
          photo_url: string | null
          physical: number
          position: string
          red_cards: number
          shirt_number: number | null
          speed: number
          technique: number
          updated_at: string
          user_id: string | null
          weight_kg: number | null
          yellow_cards: number
        }
        Insert: {
          assists?: number
          birth_date?: string | null
          categoria?: Database["public"]["Enums"]["categoria"]
          created_at?: string
          defending?: number
          dominant_foot?: string
          finishing?: number
          full_name: string
          goals?: number
          height_cm?: number | null
          id?: string
          matches_played?: number
          passing?: number
          phone?: string | null
          photo_url?: string | null
          physical?: number
          position?: string
          red_cards?: number
          shirt_number?: number | null
          speed?: number
          technique?: number
          updated_at?: string
          user_id?: string | null
          weight_kg?: number | null
          yellow_cards?: number
        }
        Update: {
          assists?: number
          birth_date?: string | null
          categoria?: Database["public"]["Enums"]["categoria"]
          created_at?: string
          defending?: number
          dominant_foot?: string
          finishing?: number
          full_name?: string
          goals?: number
          height_cm?: number | null
          id?: string
          matches_played?: number
          passing?: number
          phone?: string | null
          photo_url?: string | null
          physical?: number
          position?: string
          red_cards?: number
          shirt_number?: number | null
          speed?: number
          technique?: number
          updated_at?: string
          user_id?: string | null
          weight_kg?: number | null
          yellow_cards?: number
        }
        Relationships: []
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
      trainings: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria"]
          created_at: string
          id: string
          location: string | null
          notes: string | null
          title: string
          training_date: string
          training_type: string
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["categoria"]
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          title: string
          training_date: string
          training_type?: string
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria"]
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          title?: string
          training_date?: string
          training_type?: string
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "presidente" | "treinador" | "jogador" | "responsavel"
      categoria: "Sub-15" | "Sub-17" | "Sub-20" | "Adulto"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["presidente", "treinador", "jogador", "responsavel"],
      categoria: ["Sub-15", "Sub-17", "Sub-20", "Adulto"],
    },
  },
} as const
