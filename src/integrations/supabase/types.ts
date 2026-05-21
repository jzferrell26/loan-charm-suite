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
          annual_income: number | null
          bk_history: string | null
          borrower_sequence: number
          city: string | null
          created_at: string
          credit_score: number | null
          dob: string | null
          ein: string | null
          email: string | null
          entity_address: string | null
          entity_city: string | null
          entity_name: string | null
          entity_state: string | null
          entity_title: string | null
          entity_zip: string | null
          experience_level: string | null
          first_name: string | null
          foreclosure_history: string | null
          id: string
          last_name: string | null
          liquid_cash: number | null
          loan_id: string
          marital_status: string | null
          phone: string | null
          properties_owned_count: number | null
          retirement_balance: number | null
          ssn: string | null
          state: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address_line?: string | null
          annual_income?: number | null
          bk_history?: string | null
          borrower_sequence: number
          city?: string | null
          created_at?: string
          credit_score?: number | null
          dob?: string | null
          ein?: string | null
          email?: string | null
          entity_address?: string | null
          entity_city?: string | null
          entity_name?: string | null
          entity_state?: string | null
          entity_title?: string | null
          entity_zip?: string | null
          experience_level?: string | null
          first_name?: string | null
          foreclosure_history?: string | null
          id?: string
          last_name?: string | null
          liquid_cash?: number | null
          loan_id: string
          marital_status?: string | null
          phone?: string | null
          properties_owned_count?: number | null
          retirement_balance?: number | null
          ssn?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address_line?: string | null
          annual_income?: number | null
          bk_history?: string | null
          borrower_sequence?: number
          city?: string | null
          created_at?: string
          credit_score?: number | null
          dob?: string | null
          ein?: string | null
          email?: string | null
          entity_address?: string | null
          entity_city?: string | null
          entity_name?: string | null
          entity_state?: string | null
          entity_title?: string | null
          entity_zip?: string | null
          experience_level?: string | null
          first_name?: string | null
          foreclosure_history?: string | null
          id?: string
          last_name?: string | null
          liquid_cash?: number | null
          loan_id?: string
          marital_status?: string | null
          phone?: string | null
          properties_owned_count?: number | null
          retirement_balance?: number | null
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
          additional_info: string | null
          additional_points_or_fee: string | null
          appraisal_fee: number | null
          arive_loan_id: string | null
          arv: number | null
          cl_fees: number | null
          cl_points_amount: number | null
          cl_points_pct: number | null
          cl_rebate_pct: number | null
          coe_date: string | null
          created_at: string
          down_payment: number | null
          escrow_fees: number | null
          exit_strategy: string | null
          funding_source: string | null
          ghl_opportunity_id: string | null
          guc_plans: string | null
          hoa_annual: number | null
          hold_back_amount: number | null
          id: string
          if_yes_terms_offered: string | null
          initial_release_amount: number | null
          inspection_fees: number | null
          insurance_annual: number | null
          insurance_fee: number | null
          interest_rate: number | null
          investor_fees: number | null
          investor_points_pct: number | null
          lender_name: string | null
          loan_amount: number | null
          loan_number: string | null
          loan_program: string | null
          loan_purpose: string | null
          loan_term: string | null
          loan_term_months: number | null
          loan_type: string | null
          ltv: number | null
          ltv_ltarv: string | null
          maturity_date: string | null
          misc_fee: number | null
          monthly_payment: number | null
          origination_fee: number | null
          points: number | null
          purchase_price: number | null
          rate_pct: number | null
          referral_points_or_fees: number | null
          refi_cashout: number | null
          refi_payoff: number | null
          stage: string
          taxes_annual: number | null
          term_sheet: string | null
          title_fees: number | null
          total_points_and_fees: number | null
          total_points_pct: number | null
          total_third_party_fees: number | null
          updated_at: string
          working_with_another_lender: string | null
        }
        Insert: {
          additional_info?: string | null
          additional_points_or_fee?: string | null
          appraisal_fee?: number | null
          arive_loan_id?: string | null
          arv?: number | null
          cl_fees?: number | null
          cl_points_amount?: number | null
          cl_points_pct?: number | null
          cl_rebate_pct?: number | null
          coe_date?: string | null
          created_at?: string
          down_payment?: number | null
          escrow_fees?: number | null
          exit_strategy?: string | null
          funding_source?: string | null
          ghl_opportunity_id?: string | null
          guc_plans?: string | null
          hoa_annual?: number | null
          hold_back_amount?: number | null
          id?: string
          if_yes_terms_offered?: string | null
          initial_release_amount?: number | null
          inspection_fees?: number | null
          insurance_annual?: number | null
          insurance_fee?: number | null
          interest_rate?: number | null
          investor_fees?: number | null
          investor_points_pct?: number | null
          lender_name?: string | null
          loan_amount?: number | null
          loan_number?: string | null
          loan_program?: string | null
          loan_purpose?: string | null
          loan_term?: string | null
          loan_term_months?: number | null
          loan_type?: string | null
          ltv?: number | null
          ltv_ltarv?: string | null
          maturity_date?: string | null
          misc_fee?: number | null
          monthly_payment?: number | null
          origination_fee?: number | null
          points?: number | null
          purchase_price?: number | null
          rate_pct?: number | null
          referral_points_or_fees?: number | null
          refi_cashout?: number | null
          refi_payoff?: number | null
          stage?: string
          taxes_annual?: number | null
          term_sheet?: string | null
          title_fees?: number | null
          total_points_and_fees?: number | null
          total_points_pct?: number | null
          total_third_party_fees?: number | null
          updated_at?: string
          working_with_another_lender?: string | null
        }
        Update: {
          additional_info?: string | null
          additional_points_or_fee?: string | null
          appraisal_fee?: number | null
          arive_loan_id?: string | null
          arv?: number | null
          cl_fees?: number | null
          cl_points_amount?: number | null
          cl_points_pct?: number | null
          cl_rebate_pct?: number | null
          coe_date?: string | null
          created_at?: string
          down_payment?: number | null
          escrow_fees?: number | null
          exit_strategy?: string | null
          funding_source?: string | null
          ghl_opportunity_id?: string | null
          guc_plans?: string | null
          hoa_annual?: number | null
          hold_back_amount?: number | null
          id?: string
          if_yes_terms_offered?: string | null
          initial_release_amount?: number | null
          inspection_fees?: number | null
          insurance_annual?: number | null
          insurance_fee?: number | null
          interest_rate?: number | null
          investor_fees?: number | null
          investor_points_pct?: number | null
          lender_name?: string | null
          loan_amount?: number | null
          loan_number?: string | null
          loan_program?: string | null
          loan_purpose?: string | null
          loan_term?: string | null
          loan_term_months?: number | null
          loan_type?: string | null
          ltv?: number | null
          ltv_ltarv?: string | null
          maturity_date?: string | null
          misc_fee?: number | null
          monthly_payment?: number | null
          origination_fee?: number | null
          points?: number | null
          purchase_price?: number | null
          rate_pct?: number | null
          referral_points_or_fees?: number | null
          refi_cashout?: number | null
          refi_payoff?: number | null
          stage?: string
          taxes_annual?: number | null
          term_sheet?: string | null
          title_fees?: number | null
          total_points_and_fees?: number | null
          total_points_pct?: number | null
          total_third_party_fees?: number | null
          updated_at?: string
          working_with_another_lender?: string | null
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
