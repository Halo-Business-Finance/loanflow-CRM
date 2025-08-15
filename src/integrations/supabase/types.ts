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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      account_lockouts: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          locked_at: string
          locked_by_system: boolean
          reason: string
          unlock_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          locked_at?: string
          locked_by_system?: boolean
          reason: string
          unlock_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          locked_at?: string
          locked_by_system?: boolean
          reason?: string
          unlock_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      active_sessions: {
        Row: {
          browser_fingerprint: Json | null
          click_count: number | null
          created_at: string
          device_fingerprint: string | null
          expires_at: string
          id: string
          idle_time_seconds: number | null
          ip_address: unknown | null
          is_active: boolean
          keyboard_activity_count: number | null
          last_activity: string
          last_security_check: string | null
          mouse_activity_count: number | null
          page_url: string | null
          page_views: number | null
          referrer: string | null
          risk_factors: Json | null
          screen_resolution: string | null
          scroll_activity_count: number | null
          security_alerts_count: number | null
          session_duration_seconds: number | null
          session_token: string
          timezone: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser_fingerprint?: Json | null
          click_count?: number | null
          created_at?: string
          device_fingerprint?: string | null
          expires_at: string
          id?: string
          idle_time_seconds?: number | null
          ip_address?: unknown | null
          is_active?: boolean
          keyboard_activity_count?: number | null
          last_activity?: string
          last_security_check?: string | null
          mouse_activity_count?: number | null
          page_url?: string | null
          page_views?: number | null
          referrer?: string | null
          risk_factors?: Json | null
          screen_resolution?: string | null
          scroll_activity_count?: number | null
          security_alerts_count?: number | null
          session_duration_seconds?: number | null
          session_token: string
          timezone?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser_fingerprint?: Json | null
          click_count?: number | null
          created_at?: string
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          idle_time_seconds?: number | null
          ip_address?: unknown | null
          is_active?: boolean
          keyboard_activity_count?: number | null
          last_activity?: string
          last_security_check?: string | null
          mouse_activity_count?: number | null
          page_url?: string | null
          page_views?: number | null
          referrer?: string | null
          risk_factors?: Json | null
          screen_resolution?: string | null
          scroll_activity_count?: number | null
          security_alerts_count?: number | null
          session_duration_seconds?: number | null
          session_token?: string
          timezone?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_bot_activity: {
        Row: {
          activity_type: string
          bot_id: string | null
          created_at: string | null
          details: Json
          execution_time_ms: number | null
          id: string
          status: string
        }
        Insert: {
          activity_type: string
          bot_id?: string | null
          created_at?: string | null
          details?: Json
          execution_time_ms?: number | null
          id?: string
          status?: string
        }
        Update: {
          activity_type?: string
          bot_id?: string | null
          created_at?: string | null
          details?: Json
          execution_time_ms?: number | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_bot_activity_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "ai_security_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_bot_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          auto_response_taken: boolean | null
          bot_id: string | null
          confidence_score: number
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          requires_human_review: boolean | null
          resolved: boolean | null
          resolved_at: string | null
          severity: string
          threat_indicators: Json | null
          title: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          auto_response_taken?: boolean | null
          bot_id?: string | null
          confidence_score?: number
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          requires_human_review?: boolean | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity: string
          threat_indicators?: Json | null
          title: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          auto_response_taken?: boolean | null
          bot_id?: string | null
          confidence_score?: number
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          requires_human_review?: boolean | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          threat_indicators?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_bot_alerts_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "ai_security_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_security_bots: {
        Row: {
          bot_name: string
          bot_type: string
          configuration: Json
          created_at: string | null
          id: string
          last_activity: string | null
          performance_metrics: Json | null
          sensitivity_level: string
          status: string
          updated_at: string | null
        }
        Insert: {
          bot_name: string
          bot_type: string
          configuration?: Json
          created_at?: string | null
          id?: string
          last_activity?: string | null
          performance_metrics?: Json | null
          sensitivity_level?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          bot_name?: string
          bot_type?: string
          configuration?: Json
          created_at?: string | null
          id?: string
          last_activity?: string | null
          performance_metrics?: Json | null
          sensitivity_level?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_request_analytics: {
        Row: {
          ai_confidence_score: number | null
          blocked: boolean
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown | null
          is_bot_suspected: boolean
          method: string
          rate_limit_triggered: boolean
          request_fingerprint: string | null
          request_size: number | null
          response_time: number | null
          status_code: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          ai_confidence_score?: number | null
          blocked?: boolean
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown | null
          is_bot_suspected?: boolean
          method: string
          rate_limit_triggered?: boolean
          request_fingerprint?: string | null
          request_size?: number | null
          response_time?: number | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          ai_confidence_score?: number | null
          blocked?: boolean
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          is_bot_suspected?: boolean
          method?: string
          rate_limit_triggered?: boolean
          request_fingerprint?: string | null
          request_size?: number | null
          response_time?: number | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      approval_processes: {
        Row: {
          approval_steps: Json
          created_at: string
          created_by: string
          entry_criteria: Json | null
          final_approval_actions: Json | null
          final_rejection_actions: Json | null
          id: string
          is_active: boolean
          name: string
          object_type: string
          updated_at: string
        }
        Insert: {
          approval_steps: Json
          created_at?: string
          created_by: string
          entry_criteria?: Json | null
          final_approval_actions?: Json | null
          final_rejection_actions?: Json | null
          id?: string
          is_active?: boolean
          name: string
          object_type: string
          updated_at?: string
        }
        Update: {
          approval_steps?: Json
          created_at?: string
          created_by?: string
          entry_criteria?: Json | null
          final_approval_actions?: Json | null
          final_rejection_actions?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          object_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      approval_requests: {
        Row: {
          comments: string | null
          completed_at: string | null
          current_step: number
          id: string
          process_id: string
          record_id: string
          record_type: string
          status: string
          submitted_at: string
          submitted_by: string
        }
        Insert: {
          comments?: string | null
          completed_at?: string | null
          current_step?: number
          id?: string
          process_id: string
          record_id: string
          record_type: string
          status?: string
          submitted_at?: string
          submitted_by: string
        }
        Update: {
          comments?: string | null
          completed_at?: string | null
          current_step?: number
          id?: string
          process_id?: string
          record_id?: string
          record_type?: string
          status?: string
          submitted_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "approval_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_steps: {
        Row: {
          actioned_at: string | null
          approver_id: string
          comments: string | null
          created_at: string
          id: string
          request_id: string
          status: string
          step_number: number
        }
        Insert: {
          actioned_at?: string | null
          approver_id: string
          comments?: string | null
          created_at?: string
          id?: string
          request_id: string
          status?: string
          step_number: number
        }
        Update: {
          actioned_at?: string | null
          approver_id?: string
          comments?: string | null
          created_at?: string
          id?: string
          request_id?: string
          status?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "approval_steps_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_approval_steps_request_id"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          risk_score: number | null
          session_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          risk_score?: number | null
          session_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          risk_score?: number | null
          session_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blockchain_records: {
        Row: {
          block_number: number | null
          blockchain_hash: string | null
          created_at: string
          data_hash: string
          id: string
          metadata: Json | null
          record_id: string
          record_type: string
          transaction_hash: string | null
          updated_at: string
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          block_number?: number | null
          blockchain_hash?: string | null
          created_at?: string
          data_hash: string
          id?: string
          metadata?: Json | null
          record_id: string
          record_type: string
          transaction_hash?: string | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          block_number?: number | null
          blockchain_hash?: string | null
          created_at?: string
          data_hash?: string
          id?: string
          metadata?: Json | null
          record_id?: string
          record_type?: string
          transaction_hash?: string | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      case_comments: {
        Row: {
          attachments: Json | null
          case_id: string
          comment_text: string
          comment_type: string
          created_at: string
          id: string
          is_internal: boolean
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          case_id: string
          comment_text: string
          comment_type?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          user_id: string
        }
        Update: {
          attachments?: Json | null
          case_id?: string
          comment_text?: string
          comment_type?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_comments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_case_comments_case_id"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_number: string
          case_type: string
          client_id: string
          created_at: string
          customer_satisfaction_score: number | null
          description: string
          due_date: string | null
          escalated_to: string | null
          escalation_reason: string | null
          id: string
          priority: string
          resolution: string | null
          resolution_date: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_number: string
          case_type?: string
          client_id: string
          created_at?: string
          customer_satisfaction_score?: number | null
          description: string
          due_date?: string | null
          escalated_to?: string | null
          escalation_reason?: string | null
          id?: string
          priority?: string
          resolution?: string | null
          resolution_date?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_number?: string
          case_type?: string
          client_id?: string
          created_at?: string
          customer_satisfaction_score?: number | null
          description?: string
          due_date?: string | null
          escalated_to?: string | null
          escalation_reason?: string | null
          id?: string
          priority?: string
          resolution?: string | null
          resolution_date?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cases_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          contact_entity_id: string
          created_at: string
          id: string
          join_date: string | null
          last_activity: string | null
          lead_id: string | null
          status: string
          total_loan_value: number | null
          total_loans: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_entity_id: string
          created_at?: string
          id?: string
          join_date?: string | null
          last_activity?: string | null
          lead_id?: string | null
          status?: string
          total_loan_value?: number | null
          total_loans?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_entity_id?: string
          created_at?: string
          id?: string
          join_date?: string | null
          last_activity?: string | null
          lead_id?: string | null
          status?: string
          total_loan_value?: number | null
          total_loans?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clients_contact_entity"
            columns: ["contact_entity_id"]
            isOneToOne: false
            referencedRelation: "contact_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clients_lead_id"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          community_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          community_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          community_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          client_id: string | null
          community_id: string
          created_at: string
          id: string
          joined_at: string | null
          last_activity: string | null
          role: string
          status: string
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          community_id: string
          created_at?: string
          id?: string
          joined_at?: string | null
          last_activity?: string | null
          role?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          community_id?: string
          created_at?: string
          id?: string
          joined_at?: string | null
          last_activity?: string | null
          role?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_members_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_reports: {
        Row: {
          completed_at: string | null
          created_at: string
          date_range_end: string
          date_range_start: string
          file_path: string | null
          filters: Json | null
          generated_by: string
          id: string
          report_data: Json
          report_type: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          date_range_end: string
          date_range_start: string
          file_path?: string | null
          filters?: Json | null
          generated_by: string
          id?: string
          report_data: Json
          report_type: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          date_range_end?: string
          date_range_start?: string
          file_path?: string | null
          filters?: Json | null
          generated_by?: string
          id?: string
          report_data?: Json
          report_type?: string
          status?: string
        }
        Relationships: []
      }
      contact_encrypted_fields: {
        Row: {
          contact_id: string
          created_at: string | null
          encrypted_value: string
          field_hash: string
          field_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          encrypted_value: string
          field_hash: string
          field_name: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          encrypted_value?: string
          field_hash?: string
          field_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_encrypted_fields_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_entities: {
        Row: {
          annual_revenue: number | null
          average_transaction_size: number | null
          bank_lender_name: string | null
          bdo_email: string | null
          bdo_name: string | null
          bdo_telephone: string | null
          business_address: string | null
          business_name: string | null
          call_notes: string | null
          created_at: string
          credit_score: number | null
          current_processing_rate: number | null
          email: string
          existing_loan_amount: number | null
          id: string
          income: number | null
          interest_rate: number | null
          loan_amount: number | null
          loan_type: string | null
          location: string | null
          maturity_date: string | null
          monthly_processing_volume: number | null
          naics_code: string | null
          name: string
          net_operating_income: number | null
          notes: string | null
          ownership_structure: string | null
          owns_property: boolean | null
          phone: string | null
          pos_system: string | null
          priority: string | null
          processor_name: string | null
          property_payment_amount: number | null
          stage: string | null
          updated_at: string
          user_id: string
          year_established: number | null
        }
        Insert: {
          annual_revenue?: number | null
          average_transaction_size?: number | null
          bank_lender_name?: string | null
          bdo_email?: string | null
          bdo_name?: string | null
          bdo_telephone?: string | null
          business_address?: string | null
          business_name?: string | null
          call_notes?: string | null
          created_at?: string
          credit_score?: number | null
          current_processing_rate?: number | null
          email: string
          existing_loan_amount?: number | null
          id?: string
          income?: number | null
          interest_rate?: number | null
          loan_amount?: number | null
          loan_type?: string | null
          location?: string | null
          maturity_date?: string | null
          monthly_processing_volume?: number | null
          naics_code?: string | null
          name: string
          net_operating_income?: number | null
          notes?: string | null
          ownership_structure?: string | null
          owns_property?: boolean | null
          phone?: string | null
          pos_system?: string | null
          priority?: string | null
          processor_name?: string | null
          property_payment_amount?: number | null
          stage?: string | null
          updated_at?: string
          user_id: string
          year_established?: number | null
        }
        Update: {
          annual_revenue?: number | null
          average_transaction_size?: number | null
          bank_lender_name?: string | null
          bdo_email?: string | null
          bdo_name?: string | null
          bdo_telephone?: string | null
          business_address?: string | null
          business_name?: string | null
          call_notes?: string | null
          created_at?: string
          credit_score?: number | null
          current_processing_rate?: number | null
          email?: string
          existing_loan_amount?: number | null
          id?: string
          income?: number | null
          interest_rate?: number | null
          loan_amount?: number | null
          loan_type?: string | null
          location?: string | null
          maturity_date?: string | null
          monthly_processing_volume?: number | null
          naics_code?: string | null
          name?: string
          net_operating_income?: number | null
          notes?: string | null
          ownership_structure?: string | null
          owns_property?: boolean | null
          phone?: string | null
          pos_system?: string | null
          priority?: string | null
          processor_name?: string | null
          property_payment_amount?: number | null
          stage?: string | null
          updated_at?: string
          user_id?: string
          year_established?: number | null
        }
        Relationships: []
      }
      custom_fields: {
        Row: {
          api_name: string
          created_at: string
          created_by: string
          default_value: string | null
          field_type: string
          id: string
          is_active: boolean
          is_required: boolean
          name: string
          object_id: string
          picklist_values: Json | null
          updated_at: string
        }
        Insert: {
          api_name: string
          created_at?: string
          created_by: string
          default_value?: string | null
          field_type: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          name: string
          object_id: string
          picklist_values?: Json | null
          updated_at?: string
        }
        Update: {
          api_name?: string
          created_at?: string
          created_by?: string
          default_value?: string | null
          field_type?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          name?: string
          object_id?: string
          picklist_values?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_fields_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "custom_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_objects: {
        Row: {
          api_name: string
          created_at: string
          created_by: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          api_name: string
          created_at?: string
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          api_name?: string
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_records: {
        Row: {
          created_at: string
          created_by: string
          data: Json
          id: string
          object_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          data?: Json
          id?: string
          object_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          data?: Json
          id?: string
          object_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_records_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "custom_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      data_import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          data_type: string
          error_log: Json | null
          failed_records: number | null
          file_format: string
          file_path: string | null
          id: string
          job_name: string
          job_type: string
          mapping_configuration: Json | null
          processed_records: number | null
          progress_percentage: number | null
          started_at: string | null
          status: string
          successful_records: number | null
          total_records: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          data_type: string
          error_log?: Json | null
          failed_records?: number | null
          file_format: string
          file_path?: string | null
          id?: string
          job_name: string
          job_type: string
          mapping_configuration?: Json | null
          processed_records?: number | null
          progress_percentage?: number | null
          started_at?: string | null
          status?: string
          successful_records?: number | null
          total_records?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          data_type?: string
          error_log?: Json | null
          failed_records?: number | null
          file_format?: string
          file_path?: string | null
          id?: string
          job_name?: string
          job_type?: string
          mapping_configuration?: Json | null
          processed_records?: number | null
          progress_percentage?: number | null
          started_at?: string | null
          status?: string
          successful_records?: number | null
          total_records?: number | null
          user_id?: string
        }
        Relationships: []
      }
      data_integrity_checks: {
        Row: {
          actual_hash: string | null
          check_type: string
          checked_at: string | null
          created_at: string
          discrepancies: Json | null
          expected_hash: string
          id: string
          record_id: string | null
          status: string
          table_name: string
        }
        Insert: {
          actual_hash?: string | null
          check_type: string
          checked_at?: string | null
          created_at?: string
          discrepancies?: Json | null
          expected_hash: string
          id?: string
          record_id?: string | null
          status?: string
          table_name: string
        }
        Update: {
          actual_hash?: string | null
          check_type?: string
          checked_at?: string | null
          created_at?: string
          discrepancies?: Json | null
          expected_hash?: string
          id?: string
          record_id?: string | null
          status?: string
          table_name?: string
        }
        Relationships: []
      }
      device_fingerprints: {
        Row: {
          ai_detection_flags: Json | null
          created_at: string
          device_characteristics: Json
          fingerprint_hash: string
          first_seen: string
          id: string
          is_suspicious: boolean
          last_seen: string
          risk_score: number
          user_id: string | null
        }
        Insert: {
          ai_detection_flags?: Json | null
          created_at?: string
          device_characteristics?: Json
          fingerprint_hash: string
          first_seen?: string
          id?: string
          is_suspicious?: boolean
          last_seen?: string
          risk_score?: number
          user_id?: string | null
        }
        Update: {
          ai_detection_flags?: Json | null
          created_at?: string
          device_characteristics?: Json
          fingerprint_hash?: string
          first_seen?: string
          id?: string
          is_suspicious?: boolean
          last_seen?: string
          risk_score?: number
          user_id?: string | null
        }
        Relationships: []
      }
      document_analytics: {
        Row: {
          created_at: string
          document_id: string
          document_name: string
          download_attempted: boolean | null
          id: string
          max_page_reached: number | null
          pages_viewed: Json | null
          print_attempted: boolean | null
          session_data: Json | null
          total_view_time_seconds: number | null
          updated_at: string
          user_id: string
          view_ended_at: string | null
          view_started_at: string
          viewer_type: string | null
          zoom_events: number | null
        }
        Insert: {
          created_at?: string
          document_id: string
          document_name: string
          download_attempted?: boolean | null
          id?: string
          max_page_reached?: number | null
          pages_viewed?: Json | null
          print_attempted?: boolean | null
          session_data?: Json | null
          total_view_time_seconds?: number | null
          updated_at?: string
          user_id: string
          view_ended_at?: string | null
          view_started_at?: string
          viewer_type?: string | null
          zoom_events?: number | null
        }
        Update: {
          created_at?: string
          document_id?: string
          document_name?: string
          download_attempted?: boolean | null
          id?: string
          max_page_reached?: number | null
          pages_viewed?: Json | null
          print_attempted?: boolean | null
          session_data?: Json | null
          total_view_time_seconds?: number | null
          updated_at?: string
          user_id?: string
          view_ended_at?: string | null
          view_started_at?: string
          viewer_type?: string | null
          zoom_events?: number | null
        }
        Relationships: []
      }
      document_error_logs: {
        Row: {
          browser_info: Json | null
          created_at: string
          document_id: string | null
          document_name: string | null
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          user_id: string | null
          viewer_type: string | null
        }
        Insert: {
          browser_info?: Json | null
          created_at?: string
          document_id?: string | null
          document_name?: string | null
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          user_id?: string | null
          viewer_type?: string | null
        }
        Update: {
          browser_info?: Json | null
          created_at?: string
          document_id?: string | null
          document_name?: string | null
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          user_id?: string | null
          viewer_type?: string | null
        }
        Relationships: []
      }
      email_accounts: {
        Row: {
          access_token: string
          created_at: string
          display_name: string
          email_address: string
          expires_at: string
          id: string
          is_active: boolean
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          display_name: string
          email_address: string
          expires_at: string
          id?: string
          is_active?: boolean
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          display_name?: string
          email_address?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_campaign_recipients: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          client_id: string | null
          created_at: string
          email_address: string
          id: string
          lead_id: string | null
          opened_at: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          client_id?: string | null
          created_at?: string
          email_address: string
          id?: string
          lead_id?: string | null
          opened_at?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          client_id?: string | null
          created_at?: string
          email_address?: string
          id?: string
          lead_id?: string | null
          opened_at?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_recipients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_recipients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          campaign_type: string
          created_at: string
          description: string | null
          email_template: string | null
          id: string
          name: string
          performance_metrics: Json | null
          send_schedule: Json | null
          status: string
          subject_line: string | null
          target_audience: Json | null
          trigger_conditions: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_type?: string
          created_at?: string
          description?: string | null
          email_template?: string | null
          id?: string
          name: string
          performance_metrics?: Json | null
          send_schedule?: Json | null
          status?: string
          subject_line?: string | null
          target_audience?: Json | null
          trigger_conditions?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_type?: string
          created_at?: string
          description?: string | null
          email_template?: string | null
          id?: string
          name?: string
          performance_metrics?: Json | null
          send_schedule?: Json | null
          status?: string
          subject_line?: string | null
          target_audience?: Json | null
          trigger_conditions?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_events: {
        Row: {
          auto_shutdown: boolean
          created_at: string
          event_data: Json | null
          id: string
          manual_override: boolean
          resolved_at: string | null
          severity: string
          threat_type: string
          trigger_source: string
          updated_at: string
        }
        Insert: {
          auto_shutdown?: boolean
          created_at?: string
          event_data?: Json | null
          id?: string
          manual_override?: boolean
          resolved_at?: string | null
          severity: string
          threat_type: string
          trigger_source: string
          updated_at?: string
        }
        Update: {
          auto_shutdown?: boolean
          created_at?: string
          event_data?: Json | null
          id?: string
          manual_override?: boolean
          resolved_at?: string | null
          severity?: string
          threat_type?: string
          trigger_source?: string
          updated_at?: string
        }
        Relationships: []
      }
      emergency_shutdown: {
        Row: {
          auto_restore_at: string | null
          created_at: string
          id: string
          is_active: boolean
          reason: string
          resolved_at: string | null
          shutdown_level: string
          triggered_by: string
          updated_at: string
        }
        Insert: {
          auto_restore_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          reason: string
          resolved_at?: string | null
          shutdown_level: string
          triggered_by: string
          updated_at?: string
        }
        Update: {
          auto_restore_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          reason?: string
          resolved_at?: string | null
          shutdown_level?: string
          triggered_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      encrypted_fields: {
        Row: {
          created_at: string
          encrypted_value: string
          encryption_algorithm: string
          encryption_key_id: string
          field_name: string
          id: string
          iv: string
          record_id: string
          salt: string
          table_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          encrypted_value: string
          encryption_algorithm?: string
          encryption_key_id: string
          field_name: string
          id?: string
          iv: string
          record_id: string
          salt: string
          table_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          encrypted_value?: string
          encryption_algorithm?: string
          encryption_key_id?: string
          field_name?: string
          id?: string
          iv?: string
          record_id?: string
          salt?: string
          table_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_encryption_key"
            columns: ["encryption_key_id"]
            isOneToOne: false
            referencedRelation: "encryption_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      encryption_keys: {
        Row: {
          algorithm: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_material: string | null
          key_name: string
          key_purpose: string
          last_rotated: string | null
        }
        Insert: {
          algorithm?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_material?: string | null
          key_name: string
          key_purpose: string
          last_rotated?: string | null
        }
        Update: {
          algorithm?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_material?: string | null
          key_name?: string
          key_purpose?: string
          last_rotated?: string | null
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          attendance_date: string | null
          client_id: string | null
          created_at: string
          email: string
          event_id: string
          id: string
          lead_id: string | null
          name: string
          notes: string | null
          registration_date: string | null
          registration_status: string
        }
        Insert: {
          attendance_date?: string | null
          client_id?: string | null
          created_at?: string
          email: string
          event_id: string
          id?: string
          lead_id?: string | null
          name: string
          notes?: string | null
          registration_date?: string | null
          registration_status?: string
        }
        Update: {
          attendance_date?: string | null
          client_id?: string | null
          created_at?: string
          email?: string
          event_id?: string
          id?: string
          lead_id?: string | null
          name?: string
          notes?: string | null
          registration_date?: string | null
          registration_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          event_data: Json | null
          event_type: string
          id: string
          location: string | null
          max_attendees: number | null
          name: string
          registration_required: boolean | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
          virtual_link: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          event_data?: Json | null
          event_type?: string
          id?: string
          location?: string | null
          max_attendees?: number | null
          name: string
          registration_required?: boolean | null
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
          virtual_link?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          location?: string | null
          max_attendees?: number | null
          name?: string
          registration_required?: boolean | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
          virtual_link?: string | null
        }
        Relationships: []
      }
      failed_login_attempts: {
        Row: {
          attempt_time: string
          created_at: string
          email: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          attempt_time?: string
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          attempt_time?: string
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: []
      }
      field_level_security: {
        Row: {
          created_at: string
          field_name: string
          id: string
          is_active: boolean
          role_restrictions: Json
          table_name: string
          updated_at: string
          user_restrictions: Json | null
        }
        Insert: {
          created_at?: string
          field_name: string
          id?: string
          is_active?: boolean
          role_restrictions?: Json
          table_name: string
          updated_at?: string
          user_restrictions?: Json | null
        }
        Update: {
          created_at?: string
          field_name?: string
          id?: string
          is_active?: boolean
          role_restrictions?: Json
          table_name?: string
          updated_at?: string
          user_restrictions?: Json | null
        }
        Relationships: []
      }
      forecast_periods: {
        Row: {
          created_at: string
          created_by: string
          end_date: string
          id: string
          name: string
          period_type: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          end_date: string
          id?: string
          name: string
          period_type: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          end_date?: string
          id?: string
          name?: string
          period_type?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      forecasts: {
        Row: {
          amount: number
          confidence_level: number | null
          created_at: string
          id: string
          methodology: string
          notes: string | null
          period_id: string
          quota: number | null
          submitted_at: string | null
          territory_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          confidence_level?: number | null
          created_at?: string
          id?: string
          methodology: string
          notes?: string | null
          period_id: string
          quota?: number | null
          submitted_at?: string | null
          territory_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          confidence_level?: number | null
          created_at?: string
          id?: string
          methodology?: string
          notes?: string | null
          period_id?: string
          quota?: number | null
          submitted_at?: string | null
          territory_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "forecast_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forecasts_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      immutable_audit_trail: {
        Row: {
          action: string
          blockchain_record_id: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          new_values_hash: string | null
          old_values_hash: string | null
          record_id: string | null
          table_name: string | null
          timestamp_hash: string
          user_id: string | null
          verification_proof: string | null
        }
        Insert: {
          action: string
          blockchain_record_id?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          new_values_hash?: string | null
          old_values_hash?: string | null
          record_id?: string | null
          table_name?: string | null
          timestamp_hash: string
          user_id?: string | null
          verification_proof?: string | null
        }
        Update: {
          action?: string
          blockchain_record_id?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          new_values_hash?: string | null
          old_values_hash?: string | null
          record_id?: string | null
          table_name?: string | null
          timestamp_hash?: string
          user_id?: string | null
          verification_proof?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_blockchain_record"
            columns: ["blockchain_record_id"]
            isOneToOne: false
            referencedRelation: "blockchain_records"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_restrictions: {
        Row: {
          country_code: string | null
          created_at: string
          id: string
          ip_address: unknown
          is_allowed: boolean
          reason: string | null
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          id?: string
          ip_address: unknown
          is_allowed?: boolean
          reason?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          is_allowed?: boolean
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_articles: {
        Row: {
          category: string
          content: string
          created_at: string
          helpful_count: number | null
          id: string
          last_reviewed: string | null
          not_helpful_count: number | null
          reviewed_by: string | null
          status: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
          visibility: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          last_reviewed?: string | null
          not_helpful_count?: number | null
          reviewed_by?: string | null
          status?: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
          visibility?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          last_reviewed?: string | null
          not_helpful_count?: number | null
          reviewed_by?: string | null
          status?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
          visibility?: string
        }
        Relationships: []
      }
      lead_documents: {
        Row: {
          contact_entity_id: string | null
          created_at: string
          document_name: string
          document_type: string
          file_mime_type: string | null
          file_path: string | null
          file_size: number | null
          id: string
          lead_id: string
          metadata: Json | null
          notes: string | null
          status: string
          updated_at: string
          uploaded_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          contact_entity_id?: string | null
          created_at?: string
          document_name: string
          document_type: string
          file_mime_type?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          lead_id: string
          metadata?: Json | null
          notes?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          contact_entity_id?: string | null
          created_at?: string
          document_name?: string
          document_type?: string
          file_mime_type?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          notes?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_documents_contact_entity_id_fkey"
            columns: ["contact_entity_id"]
            isOneToOne: false
            referencedRelation: "contact_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scores: {
        Row: {
          behavioral_score: number
          created_at: string
          demographic_score: number
          id: string
          last_calculated: string
          lead_id: string
          score_category: string
          score_history: Json | null
          scoring_model_id: string
          total_score: number
          updated_at: string
        }
        Insert: {
          behavioral_score?: number
          created_at?: string
          demographic_score?: number
          id?: string
          last_calculated?: string
          lead_id: string
          score_category?: string
          score_history?: Json | null
          scoring_model_id: string
          total_score?: number
          updated_at?: string
        }
        Update: {
          behavioral_score?: number
          created_at?: string
          demographic_score?: number
          id?: string
          last_calculated?: string
          lead_id?: string
          score_category?: string
          score_history?: Json | null
          scoring_model_id?: string
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_scores_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_scores_scoring_model_id_fkey"
            columns: ["scoring_model_id"]
            isOneToOne: false
            referencedRelation: "lead_scoring_models"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scoring_models: {
        Row: {
          behavioral_rules: Json
          created_at: string
          demographic_rules: Json
          description: string | null
          id: string
          is_active: boolean
          name: string
          score_thresholds: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          behavioral_rules?: Json
          created_at?: string
          demographic_rules?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          score_thresholds?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          behavioral_rules?: Json
          created_at?: string
          demographic_rules?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          score_thresholds?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          contact_entity_id: string
          converted_at: string | null
          created_at: string
          id: string
          is_converted_to_client: boolean | null
          last_contact: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_entity_id: string
          converted_at?: string | null
          created_at?: string
          id?: string
          is_converted_to_client?: boolean | null
          last_contact?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_entity_id?: string
          converted_at?: string | null
          created_at?: string
          id?: string
          is_converted_to_client?: boolean | null
          last_contact?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_leads_contact_entity"
            columns: ["contact_entity_id"]
            isOneToOne: false
            referencedRelation: "contact_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_requests: {
        Row: {
          approved_at: string | null
          client_id: string | null
          created_at: string
          documents: Json | null
          funded_at: string | null
          id: string
          interest_rate: number | null
          lead_id: string | null
          loan_amount: number
          loan_term_months: number | null
          loan_type: string
          notes: string | null
          priority: string
          purpose: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          client_id?: string | null
          created_at?: string
          documents?: Json | null
          funded_at?: string | null
          id?: string
          interest_rate?: number | null
          lead_id?: string | null
          loan_amount: number
          loan_term_months?: number | null
          loan_type?: string
          notes?: string | null
          priority?: string
          purpose?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          client_id?: string | null
          created_at?: string
          documents?: Json | null
          funded_at?: string | null
          id?: string
          interest_rate?: number | null
          lead_id?: string | null
          loan_amount?: number
          loan_term_months?: number | null
          loan_type?: string
          notes?: string | null
          priority?: string
          purpose?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_loan_requests_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_loan_requests_lead_id"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          interest_rate: number | null
          lead_id: string | null
          loan_amount: number
          loan_term_months: number | null
          loan_type: string | null
          maturity_date: string | null
          monthly_payment: number | null
          notes: string | null
          origination_date: string | null
          remaining_balance: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          interest_rate?: number | null
          lead_id?: string | null
          loan_amount: number
          loan_term_months?: number | null
          loan_type?: string | null
          maturity_date?: string | null
          monthly_payment?: number | null
          notes?: string | null
          origination_date?: string | null
          remaining_balance?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          interest_rate?: number | null
          lead_id?: string | null
          loan_amount?: number
          loan_term_months?: number | null
          loan_type?: string | null
          maturity_date?: string | null
          monthly_payment?: number | null
          notes?: string | null
          origination_date?: string | null
          remaining_balance?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          is_enabled: boolean
          last_used: string | null
          phone_number: string | null
          preferred_method: string
          secret_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_used?: string | null
          phone_number?: string | null
          preferred_method?: string
          secret_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_used?: string | null
          phone_number?: string | null
          preferred_method?: string
          secret_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          amount: number
          client_id: string | null
          close_date: string
          created_at: string
          created_by: string
          id: string
          lead_id: string | null
          name: string
          primary_owner_id: string
          probability: number | null
          stage: string
          territory_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          close_date: string
          created_at?: string
          created_by: string
          id?: string
          lead_id?: string | null
          name: string
          primary_owner_id: string
          probability?: number | null
          stage: string
          territory_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          close_date?: string
          created_at?: string
          created_by?: string
          id?: string
          lead_id?: string | null
          name?: string
          primary_owner_id?: string
          probability?: number | null
          stage?: string
          territory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_splits: {
        Row: {
          amount: number | null
          created_at: string
          created_by: string
          id: string
          opportunity_id: string
          percentage: number
          role: string | null
          split_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          created_by: string
          id?: string
          opportunity_id: string
          percentage: number
          role?: string | null
          split_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          created_by?: string
          id?: string
          opportunity_id?: string
          percentage?: number
          role?: string | null
          split_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_splits_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      password_history: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      password_policies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          max_age_days: number
          min_length: number
          prevent_reuse_count: number
          require_lowercase: boolean
          require_numbers: boolean
          require_special_chars: boolean
          require_uppercase: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_age_days?: number
          min_length?: number
          prevent_reuse_count?: number
          require_lowercase?: boolean
          require_numbers?: boolean
          require_special_chars?: boolean
          require_uppercase?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_age_days?: number
          min_length?: number
          prevent_reuse_count?: number
          require_lowercase?: boolean
          require_numbers?: boolean
          require_special_chars?: boolean
          require_uppercase?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      pipeline_entries: {
        Row: {
          amount: number | null
          client_id: string | null
          created_at: string
          id: string
          last_contact: string | null
          lead_id: string | null
          notes: string | null
          priority: string
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          client_id?: string | null
          created_at?: string
          id?: string
          last_contact?: string | null
          lead_id?: string | null
          notes?: string | null
          priority?: string
          stage: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          client_id?: string | null
          created_at?: string
          id?: string
          last_contact?: string | null
          lead_id?: string | null
          notes?: string | null
          priority?: string
          stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_entries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_encrypted_fields: {
        Row: {
          created_at: string | null
          encrypted_value: string
          field_hash: string
          field_name: string
          id: string
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          encrypted_value: string
          field_hash: string
          field_name: string
          id?: string
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          encrypted_value?: string
          field_hash?: string
          field_name?: string
          id?: string
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          daily_summary_reports: boolean | null
          email: string | null
          email_notifications: boolean | null
          first_name: string | null
          id: string
          is_active: boolean | null
          job_title: string | null
          language: string | null
          last_name: string | null
          new_application_alerts: boolean | null
          phone_number: string | null
          status_change_notifications: boolean | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          daily_summary_reports?: boolean | null
          email?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          job_title?: string | null
          language?: string | null
          last_name?: string | null
          new_application_alerts?: boolean | null
          phone_number?: string | null
          status_change_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          daily_summary_reports?: boolean | null
          email?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          language?: string | null
          last_name?: string | null
          new_application_alerts?: boolean | null
          phone_number?: string | null
          status_change_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          attempt_count: number
          block_until: string | null
          created_at: string
          id: string
          identifier: string
          is_blocked: boolean
          updated_at: string
          window_start: string
        }
        Insert: {
          action_type: string
          attempt_count?: number
          block_until?: string | null
          created_at?: string
          id?: string
          identifier: string
          is_blocked?: boolean
          updated_at?: string
          window_start?: string
        }
        Update: {
          action_type?: string
          attempt_count?: number
          block_until?: string | null
          created_at?: string
          id?: string
          identifier?: string
          is_blocked?: boolean
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      ringcentral_accounts: {
        Row: {
          client_id: string
          client_secret: string
          created_at: string
          extension: string | null
          id: string
          is_active: boolean
          server_url: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          client_id: string
          client_secret: string
          created_at?: string
          extension?: string | null
          id?: string
          is_active?: boolean
          server_url?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          client_id?: string
          client_secret?: string
          created_at?: string
          extension?: string | null
          id?: string
          is_active?: boolean
          server_url?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      ringcentral_encrypted_fields: {
        Row: {
          account_id: string
          created_at: string | null
          encrypted_value: string
          field_hash: string
          field_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          encrypted_value: string
          field_hash: string
          field_name: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          encrypted_value?: string
          field_hash?: string
          field_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ringcentral_encrypted_fields_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "ringcentral_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      role_change_mfa_verifications: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          used_at: string | null
          user_id: string
          verification_token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          user_id: string
          verification_token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
          verification_token?: string
        }
        Relationships: []
      }
      secure_session_data: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          session_key: string
          session_value: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          session_key: string
          session_value: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          session_key?: string
          session_value?: string
          user_id?: string
        }
        Relationships: []
      }
      secure_sessions: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          is_suspicious: boolean
          last_activity: string
          location_data: Json | null
          mfa_verified: boolean
          risk_score: number
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          is_suspicious?: boolean
          last_activity?: string
          location_data?: Json | null
          mfa_verified?: boolean
          risk_score?: number
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          is_suspicious?: boolean
          last_activity?: string
          location_data?: Json | null
          mfa_verified?: boolean
          risk_score?: number
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          alert_type: string
          auto_resolved: boolean | null
          created_at: string
          description: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resolved_at: string | null
          severity: string
          title: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          auto_resolved?: boolean | null
          created_at?: string
          description: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resolved_at?: string | null
          severity: string
          title: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          auto_resolved?: boolean | null
          created_at?: string
          description?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          title?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      security_configuration: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          severity: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_headers: {
        Row: {
          created_at: string | null
          header_name: string
          header_value: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          header_name: string
          header_value: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          header_name?: string
          header_value?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          notification_type: string
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          notification_type: string
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          notification_type?: string
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      session_activity_log: {
        Row: {
          action_type: string | null
          activity_type: string
          device_fingerprint: string | null
          element_id: string | null
          geolocation: Json | null
          id: string
          ip_address: unknown | null
          page_url: string | null
          performance_metrics: Json | null
          risk_indicators: Json | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type?: string | null
          activity_type: string
          device_fingerprint?: string | null
          element_id?: string | null
          geolocation?: Json | null
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          performance_metrics?: Json | null
          risk_indicators?: Json | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string | null
          activity_type?: string
          device_fingerprint?: string | null
          element_id?: string | null
          geolocation?: Json | null
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          performance_metrics?: Json | null
          risk_indicators?: Json | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      session_anomalies: {
        Row: {
          anomaly_type: string
          created_at: string
          details: Json | null
          id: string
          resolved: boolean | null
          risk_score: number
          session_token: string
          user_id: string
        }
        Insert: {
          anomaly_type: string
          created_at?: string
          details?: Json | null
          id?: string
          resolved?: boolean | null
          risk_score?: number
          session_token: string
          user_id: string
        }
        Update: {
          anomaly_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          resolved?: boolean | null
          risk_score?: number
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      session_config: {
        Row: {
          created_at: string
          id: string
          max_concurrent_sessions: number
          require_fresh_login_minutes: number
          session_timeout_minutes: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_concurrent_sessions?: number
          require_fresh_login_minutes?: number
          session_timeout_minutes?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_concurrent_sessions?: number
          require_fresh_login_minutes?: number
          session_timeout_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      social_media_profiles: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          last_updated: string | null
          lead_id: string | null
          platform: string
          profile_data: Json | null
          profile_url: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          last_updated?: string | null
          lead_id?: string | null
          platform: string
          profile_data?: Json | null
          profile_url?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          last_updated?: string | null
          lead_id?: string | null
          platform?: string
          profile_data?: Json | null
          profile_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_media_profiles_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_configurations: {
        Row: {
          configuration: Json
          created_at: string
          domain_restrictions: string[] | null
          id: string
          is_active: boolean
          provider_name: string
          provider_type: string
          updated_at: string
        }
        Insert: {
          configuration: Json
          created_at?: string
          domain_restrictions?: string[] | null
          id?: string
          is_active?: boolean
          provider_name: string
          provider_type: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          domain_restrictions?: string[] | null
          id?: string
          is_active?: boolean
          provider_name?: string
          provider_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      territories: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          manager_id: string | null
          name: string
          parent_id: string | null
          rules: Json
          territory_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name: string
          parent_id?: string | null
          rules: Json
          territory_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name?: string
          parent_id?: string | null
          rules?: Json
          territory_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "territories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      territory_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          id: string
          is_active: boolean
          role: string
          territory_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          id?: string
          is_active?: boolean
          role: string
          territory_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          id?: string
          is_active?: boolean
          role?: string
          territory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "territory_assignments_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_incidents: {
        Row: {
          ai_generated: boolean
          created_at: string
          id: string
          incident_data: Json
          incident_type: string
          ip_address: unknown | null
          is_resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          response_action: string | null
          severity: string
          threat_vector: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          ai_generated?: boolean
          created_at?: string
          id?: string
          incident_data?: Json
          incident_type: string
          ip_address?: unknown | null
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          response_action?: string | null
          severity: string
          threat_vector: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          ai_generated?: boolean
          created_at?: string
          id?: string
          incident_data?: Json
          incident_type?: string
          ip_address?: unknown | null
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          response_action?: string | null
          severity?: string
          threat_vector?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_behavior_patterns: {
        Row: {
          action_sequence: Json
          ai_likelihood_score: number
          anomaly_flags: Json | null
          created_at: string
          id: string
          keyboard_patterns: Json | null
          mouse_patterns: Json | null
          session_id: string
          timing_patterns: Json
          user_id: string | null
        }
        Insert: {
          action_sequence?: Json
          ai_likelihood_score?: number
          anomaly_flags?: Json | null
          created_at?: string
          id?: string
          keyboard_patterns?: Json | null
          mouse_patterns?: Json | null
          session_id: string
          timing_patterns?: Json
          user_id?: string | null
        }
        Update: {
          action_sequence?: Json
          ai_likelihood_score?: number
          anomaly_flags?: Json | null
          created_at?: string
          id?: string
          keyboard_patterns?: Json | null
          mouse_patterns?: Json | null
          session_id?: string
          timing_patterns?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          data_protection_settings: Json | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_protection_settings?: Json | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_protection_settings?: Json | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          error_message: string | null
          execution_data: Json | null
          id: string
          record_id: string
          started_at: string
          status: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          record_id: string
          started_at?: string
          status: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          record_id?: string
          started_at?: string
          status?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          flow_definition: Json
          id: string
          is_active: boolean
          name: string
          object_type: string
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          flow_definition: Json
          id?: string
          is_active?: boolean
          name: string
          object_type: string
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          flow_definition?: Json
          id?: string
          is_active?: boolean
          name?: string
          object_type?: string
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      anonymize_user_data: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      archive_user: {
        Args: { p_archived_by?: string; p_reason?: string; p_user_id: string }
        Returns: boolean
      }
      assign_user_role: {
        Args: {
          p_mfa_verified?: boolean
          p_new_role: Database["public"]["Enums"]["user_role"]
          p_reason?: string
          p_target_user_id: string
        }
        Returns: Json
      }
      can_access_approval_request: {
        Args: { request_id: string }
        Returns: boolean
      }
      can_access_approval_step: {
        Args: { step_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      check_user_rate_limit_secure: {
        Args: {
          p_action_type: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_sessions_optimized: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      clear_secure_session_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_audit_log: {
        Args: {
          p_action: string
          p_new_values?: Json
          p_old_values?: Json
          p_record_id?: string
          p_table_name?: string
        }
        Returns: string
      }
      create_blockchain_record: {
        Args: {
          p_data_hash: string
          p_metadata?: Json
          p_record_id: string
          p_record_type: string
        }
        Returns: string
      }
      create_secure_session: {
        Args:
          | {
              p_device_fingerprint: string
              p_ip_address: unknown
              p_session_token: string
              p_user_agent: string
              p_user_id: string
            }
          | {
              p_device_fingerprint: string
              p_session_token: string
              p_user_agent: string
            }
        Returns: undefined
      }
      decrypt_token: {
        Args: { p_encrypted_token: string }
        Returns: string
      }
      detect_ai_behavior: {
        Args: {
          p_request_pattern: Json
          p_timing_data: Json
          p_user_id: string
        }
        Returns: number
      }
      detect_login_anomalies: {
        Args: {
          p_geo_data: Json
          p_ip_address: unknown
          p_user_agent: string
          p_user_id: string
        }
        Returns: Json
      }
      detect_security_threats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      emergency_shutdown_ai_bots: {
        Args: { p_reason?: string }
        Returns: Json
      }
      encrypt_contact_field: {
        Args: {
          p_contact_id: string
          p_field_name: string
          p_field_value: string
        }
        Returns: undefined
      }
      encrypt_contact_field_enhanced: {
        Args: {
          p_contact_id: string
          p_field_name: string
          p_field_value: string
        }
        Returns: undefined
      }
      encrypt_existing_contact_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      encrypt_profile_field: {
        Args: {
          p_field_name: string
          p_field_value: string
          p_profile_id: string
        }
        Returns: undefined
      }
      encrypt_ringcentral_credential: {
        Args: {
          p_account_id: string
          p_field_name: string
          p_field_value: string
        }
        Returns: undefined
      }
      encrypt_token: {
        Args: { p_token: string }
        Returns: string
      }
      enhanced_rate_limit_check: {
        Args: {
          p_action_type: string
          p_identifier: string
          p_request_fingerprint?: string
          p_user_agent?: string
        }
        Returns: Json
      }
      ensure_ai_bots_active: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fix_null_numeric_fields: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_role_change_mfa_verification: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_active_encryption_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_email_tokens_secure: {
        Args: { p_email_address: string }
        Returns: {
          access_token: string
          expires_at: string
          is_expired: boolean
          refresh_token: string
        }[]
      }
      get_masked_contact_data: {
        Args: { p_contact_id: string; p_requesting_user_id?: string }
        Returns: Json
      }
      get_masked_contact_data_enhanced: {
        Args: { p_contact_id: string; p_requesting_user_id?: string }
        Returns: Json
      }
      get_masked_profile_data: {
        Args: { p_profile_id: string; p_requesting_user_id: string }
        Returns: Json
      }
      get_masked_ringcentral_credentials: {
        Args: { p_account_id: string; p_requesting_user_id?: string }
        Returns: Json
      }
      get_recent_failed_attempts: {
        Args: { user_email: string }
        Returns: number
      }
      get_secure_contact_data: {
        Args: { contact_id_param: string }
        Returns: Json
      }
      get_secure_email_tokens: {
        Args: { p_email_address: string; p_user_id: string }
        Returns: {
          decrypted_access_token: string
          decrypted_refresh_token: string
          expires_at: string
        }[]
      }
      get_secure_ringcentral_credentials: {
        Args: { p_account_id: string }
        Returns: Json
      }
      get_secure_session_data: {
        Args: { p_key: string }
        Returns: string
      }
      get_security_config: {
        Args: { p_config_key: string }
        Returns: Json
      }
      get_user_role: {
        Args: { p_user_id?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_verified_blockchain_records_final: {
        Args: { p_record_id?: string; p_record_type?: string }
        Returns: {
          action: string
          audit_created_at: string
          audit_id: string
          blockchain_hash: string
          blockchain_id: string
          data_hash: string
          new_values_hash: string
          old_values_hash: string
          record_id: string
          record_type: string
          table_name: string
          timestamp_hash: string
          transaction_hash: string
          user_id: string
          verification_status: string
          verified_at: string
        }[]
      }
      get_verified_blockchain_records_masked: {
        Args: { p_record_id?: string; p_record_type?: string }
        Returns: {
          action: string
          audit_verified: boolean
          block_number: number
          blockchain_hash_masked: string
          created_at: string
          data_hash_masked: string
          id: string
          record_id: string
          record_type: string
          transaction_hash_masked: string
          user_id: string
          verification_status: string
          verified_at: string
        }[]
      }
      get_verified_blockchain_records_safe: {
        Args: { p_record_id?: string; p_record_type?: string }
        Returns: {
          action: string
          audit_verified: boolean
          block_number: number
          blockchain_hash: string
          created_at: string
          data_hash: string
          id: string
          metadata: Json
          record_id: string
          record_type: string
          transaction_hash: string
          updated_at: string
          user_id: string
          verification_status: string
          verified_at: string
        }[]
      }
      get_verified_blockchain_records_secure: {
        Args:
          | Record<PropertyKey, never>
          | { p_record_id?: string; p_record_type?: string }
        Returns: {
          action: string
          audit_verified: boolean
          block_number: number
          blockchain_hash: string
          created_at: string
          data_hash: string
          id: string
          metadata: Json
          record_id: string
          record_type: string
          transaction_hash: string
          updated_at: string
          user_id: string
          verification_status: string
          verified_at: string
        }[]
      }
      get_verified_blockchain_records_secure_view: {
        Args: { p_record_id?: string; p_record_type?: string }
        Returns: {
          action: string
          audit_verified: boolean
          block_number: number
          blockchain_hash: string
          created_at: string
          data_hash: string
          id: string
          metadata: Json
          record_id: string
          record_type: string
          transaction_hash: string
          updated_at: string
          user_id: string
          verification_status: string
          verified_at: string
        }[]
      }
      has_role: {
        Args:
          | {
              required_role: Database["public"]["Enums"]["user_role"]
              user_id?: string
            }
          | { required_role: string; user_id?: string }
        Returns: boolean
      }
      initiate_gdpr_data_deletion: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_account_locked: {
        Args: { user_email: string }
        Returns: boolean
      }
      is_ip_allowed: {
        Args: { client_ip: unknown }
        Returns: boolean
      }
      is_system_shutdown: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      lock_account: {
        Args: { lock_reason?: string; user_email: string }
        Returns: string
      }
      log_enhanced_security_event: {
        Args: {
          p_details?: Json
          p_device_fingerprint?: string
          p_event_type?: string
          p_ip_address?: unknown
          p_location?: Json
          p_severity?: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_details?: Json
          p_event_type?: string
          p_ip_address?: unknown
          p_severity?: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      log_verified_blockchain_view_access: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      monitor_system_performance: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      process_automated_security_response: {
        Args: { p_event_data: Json; p_event_type: string }
        Returns: Json
      }
      remove_secure_session_data: {
        Args: { p_key: string }
        Returns: undefined
      }
      restore_user: {
        Args: { p_restored_by?: string; p_user_id: string }
        Returns: boolean
      }
      revoke_user_role: {
        Args: {
          p_mfa_verified?: boolean
          p_reason?: string
          p_target_user_id: string
        }
        Returns: Json
      }
      store_secure_email_tokens: {
        Args: {
          p_access_token: string
          p_display_name: string
          p_email_address: string
          p_expires_at: string
          p_refresh_token: string
          p_user_id: string
        }
        Returns: undefined
      }
      store_secure_session_data: {
        Args: { p_key: string; p_value: string }
        Returns: undefined
      }
      store_secure_session_token: {
        Args: {
          p_device_fingerprint: string
          p_session_token: string
          p_user_agent: string
          p_user_id: string
        }
        Returns: undefined
      }
      trigger_emergency_shutdown: {
        Args: {
          p_severity: string
          p_threat_data?: Json
          p_threat_type: string
          p_trigger_source: string
        }
        Returns: boolean
      }
      update_profile_secure: {
        Args: { p_profile_id: string; p_updates: Json }
        Returns: Json
      }
      user_has_opportunity_split: {
        Args: { opportunity_id: string; user_id?: string }
        Returns: boolean
      }
      user_owns_opportunity: {
        Args: { opportunity_id: string; user_id?: string }
        Returns: boolean
      }
      validate_and_sanitize_input: {
        Args: {
          p_allow_html?: boolean
          p_field_type?: string
          p_input: string
          p_max_length?: number
        }
        Returns: Json
      }
      validate_and_sanitize_input_enhanced: {
        Args: {
          p_allow_html?: boolean
          p_field_type?: string
          p_input: string
          p_max_length?: number
        }
        Returns: Json
      }
      validate_blockchain_access: {
        Args: { operation_param?: string; record_id_param?: string }
        Returns: boolean
      }
      validate_contact_access_enhanced: {
        Args: {
          p_contact_id: string
          p_operation?: string
          p_requesting_user_id?: string
        }
        Returns: boolean
      }
      validate_credential_access: {
        Args: {
          p_access_type: string
          p_record_id: string
          p_table_name: string
        }
        Returns: boolean
      }
      validate_critical_operation_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_document_access: {
        Args: { p_action?: string; p_document_id: string }
        Returns: boolean
      }
      validate_enhanced_session: {
        Args: {
          p_device_fingerprint?: Json
          p_ip_address?: unknown
          p_session_token: string
          p_user_id: string
        }
        Returns: Json
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: Json
      }
      validate_secure_session_token: {
        Args: { p_session_token: string; p_user_id: string }
        Returns: boolean
      }
      validate_session_security: {
        Args:
          | {
              p_ip_address: unknown
              p_session_token: string
              p_user_agent: string
              p_user_id: string
            }
          | { p_session_token: string; p_user_id: string }
        Returns: Json
      }
      validate_session_with_security_checks: {
        Args: {
          p_ip_address?: unknown
          p_session_token: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: Json
      }
      verify_data_integrity: {
        Args: { p_record_id?: string; p_table_name: string }
        Returns: Json
      }
      verify_role_change_mfa: {
        Args: { p_token: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "admin"
        | "manager"
        | "agent"
        | "viewer"
        | "super_admin"
        | "loan_processor"
        | "underwriter"
        | "funder"
        | "closer"
        | "tech"
        | "loan_originator"
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
      user_role: [
        "admin",
        "manager",
        "agent",
        "viewer",
        "super_admin",
        "loan_processor",
        "underwriter",
        "funder",
        "closer",
        "tech",
        "loan_originator",
      ],
    },
  },
} as const
