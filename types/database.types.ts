export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      care_task: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          due_date: string
          id: string
          listing_id: string
          task_description: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          listing_id: string
          task_description: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          listing_id?: string
          task_description?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_task_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_item: {
        Row: {
          id: string
          price: number
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          id?: string
          price: number
          product_id: string
          quantity: number
          user_id?: string
        }
        Update: {
          id?: string
          price?: number
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_message: {
        Row: {
          chat_session_id: string
          id: number
          score: number | null
          sender: string
          text: string
          timestamp: string
        }
        Insert: {
          chat_session_id: string
          id?: never
          score?: number | null
          sender: string
          text: string
          timestamp?: string
        }
        Update: {
          chat_session_id?: string
          id?: never
          score?: number | null
          sender?: string
          text?: string
          timestamp?: string
        }
        Relationships: []
      }
      favorite: {
        Row: {
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["id"]
          },
        ]
      }
      listing: {
        Row: {
          care_details: string
          care_tips: string[] | null
          created_at: string
          id: string
          images: string[]
          light_level: string | null
          price: number
          size: string | null
          species: string
          tags: string[] | null
          updated_at: string
          user_id: string
          watering_frequency: string | null
        }
        Insert: {
          care_details: string
          care_tips?: string[] | null
          created_at?: string
          id?: string
          images: string[]
          light_level?: string | null
          price: number
          size?: string | null
          species: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          watering_frequency?: string | null
        }
        Update: {
          care_details?: string
          care_tips?: string[] | null
          created_at?: string
          id?: string
          images?: string[]
          light_level?: string | null
          price?: number
          size?: string | null
          species?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          watering_frequency?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          id: number
          title: string
          user_id: string
        }
        Insert: {
          content: string
          id?: number
          title: string
          user_id?: string
        }
        Update: {
          content?: string
          id?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      search_preference: {
        Row: {
          id: number
          light_level: string | null
          size: string | null
          user_id: string
          watering_frequency: string | null
        }
        Insert: {
          id?: never
          light_level?: string | null
          size?: string | null
          user_id?: string
          watering_frequency?: string | null
        }
        Update: {
          id?: never
          light_level?: string | null
          size?: string | null
          user_id?: string
          watering_frequency?: string | null
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          id: string
          plan_active: boolean
          plan_expires: number | null
          stripe_customer_id: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          plan_active?: boolean
          plan_expires?: number | null
          stripe_customer_id: string
          subscription_id?: string | null
          user_id?: string
        }
        Update: {
          id?: string
          plan_active?: boolean
          plan_expires?: number | null
          stripe_customer_id?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string | null
          id: string
          image: string | null
          name: string | null
        }
        Insert: {
          email?: string | null
          id: string
          image?: string | null
          name?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          image?: string | null
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      requesting_app_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
