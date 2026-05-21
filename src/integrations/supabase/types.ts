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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      borrowers: {
        Row: {
          address_line: string | null
          borrower_sequence: number
          city: string | null
          created_at: string
          dob: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          loan_id: string
          marital_status: string | null
          phone: string | null
          ssn: string | null
          state: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address_line?: string | null
          borrower_sequence: number
          city?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          loan_id: string
          marital_status?: string | null
          phone?: string | null
          ssn?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address_line?: string | null
          borrower_sequence?: number
          city?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          loan_id?: string
          marital_status?: string | null
          phone?: string | null
          ssn?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "borrowers_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          company_name: string | null
          contact_type: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          contact_type?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          contact_type?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          arive_loan_id: string | null
          arv: number | null
          created_at: string
          down_payment: number | null
          ghl_opportunity_id: string | null
          id: string
          interest_rate: number | null
          lender_name: string | null
          loan_amount: number | null
          loan_number: string | null
          loan_purpose: string | null
          loan_term_months: number | null
          loan_type: string | null
          ltv: number | null
          maturity_date: string | null
          origination_fee: number | null
          points: number | null
          purchase_price: number | null
          stage: string
          updated_at: string
        }
        Insert: {
          arive_loan_id?: string | null
          arv?: number | null
          created_at?: string
          down_payment?: number | null
          ghl_opportunity_id?: string | null
          id?: string
          interest_rate?: number | null
          lender_name?: string | null
          loan_amount?: number | null
          loan_number?: string | null
          loan_purpose?: string | null
          loan_term_months?: number | null
          loan_type?: string | null
          ltv?: number | null
          maturity_date?: string | null
          origination_fee?: number | null
          points?: number | null
          purchase_price?: number | null
          stage?: string
          updated_at?: string
        }
        Update: {
          arive_loan_id?: string | null
          arv?: number | null
          created_at?: string
          down_payment?: number | null
          ghl_opportunity_id?: string | null
          id?: string
          interest_rate?: number | null
          lender_name?: string | null
          loan_amount?: number | null
          loan_number?: string | null
          loan_purpose?: string | null
          loan_term_months?: number | null
          loan_type?: string | null
          ltv?: number | null
          maturity_date?: string | null
          origination_fee?: number | null
          points?: number | null
          purchase_price?: number | null
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          loan_id: string
          note_text: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          loan_id: string
          note_text: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          loan_id?: string
          note_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address_line: string | null
          appraisal_value: number | null
          arv: number | null
          city: string | null
          county: string | null
          created_at: string
          id: string
          loan_id: string
          property_type: string | null
          property_usage: string | null
          purchase_price: number | null
          state: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address_line?: string | null
          appraisal_value?: number | null
          arv?: number | null
          city?: string | null
          county?: string | null
          created_at?: string
          id?: string
          loan_id: string
          property_type?: string | null
          property_usage?: string | null
          purchase_price?: number | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address_line?: string | null
          appraisal_value?: number | null
          arv?: number | null
          city?: string | null
          county?: string | null
          created_at?: string
          id?: string
          loan_id?: string
          property_type?: string | null
          property_usage?: string | null
          purchase_price?: number | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          loan_id: string
          new_stage: string
          old_stage: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          loan_id: string
          new_stage: string
          old_stage?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          loan_id?: string
          new_stage?: string
          old_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stage_history_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
