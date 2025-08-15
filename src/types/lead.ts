export interface Lead {
  id: string
  contact_entity_id: string
  user_id: string
  last_contact: string
  created_at: string
  updated_at?: string
  is_converted_to_client: boolean
  converted_at?: string
  contact_entity?: ContactEntity
  // Team member assignments
  loan_originator_id?: string | null
  loan_processor_id?: string | null
  closer_id?: string | null
  funder_id?: string | null
  // Computed fields (mapped from contact_entity for convenience)
  name?: string
  email?: string
  phone?: string
  location?: string
  business_name?: string
  business_address?: string
  business_city?: string
  business_state?: string
  business_zip_code?: string
  naics_code?: string
  ownership_structure?: string
  owns_property?: boolean
  property_payment_amount?: number
  year_established?: number
  loan_amount?: number
  loan_type?: string
  stage?: string
  priority?: string
  credit_score?: number
  net_operating_income?: number
  bank_lender_name?: string
  annual_revenue?: number
  interest_rate?: number
  maturity_date?: string
  existing_loan_amount?: number
  notes?: string
  call_notes?: string
  income?: number
  bdo_name?: string
  bdo_telephone?: string
  bdo_email?: string
}

export interface Client {
  id: string
  user_id: string
  lead_id?: string
  contact_entity_id: string
  status: string
  total_loans?: number
  total_loan_value?: number
  join_date?: string
  last_activity?: string
  created_at: string
  updated_at?: string
  contact_entity?: ContactEntity
  // Computed fields (mapped from contact_entity for convenience)
  name?: string
  email?: string
  phone?: string
  location?: string
  business_name?: string
  business_address?: string
  business_city?: string
  business_state?: string
  business_zip_code?: string
  stage?: string
}

export interface ContactEntity {
  id?: string
  user_id?: string
  name: string
  email: string
  phone?: string
  business_name?: string
  business_address?: string
  business_city?: string
  business_state?: string
  business_zip_code?: string
  annual_revenue?: number
  location?: string
  loan_amount?: number
  loan_type?: string
  stage?: string
  priority?: string
  credit_score?: number
  net_operating_income?: number
  notes?: string
  call_notes?: string
  naics_code?: string
  ownership_structure?: string
  owns_property?: boolean
  property_payment_amount?: number
  year_established?: number
  interest_rate?: number
  maturity_date?: string
  existing_loan_amount?: number
  income?: number
  bdo_name?: string
  bdo_telephone?: string
  bdo_email?: string
  created_at?: string
  updated_at?: string
}

export const STAGES = [
  "All", 
  "Initial Contact", 
  "Loan Application Signed", 
  "Waiting for Documentation", 
  "Pre-Approved", 
  "Term Sheet Signed", 
  "Loan Approved", 
  "Closing", 
  "Loan Funded", 
  "Archive"
] as const

export const PRIORITIES = ["All", "High", "Medium", "Low"] as const

export const LOAN_TYPES = [
  "SBA 7(a) Loan",
  "SBA 504 Loan", 
  "Bridge Loan",
  "Conventional Loan",
  "Equipment Financing",
  "USDA B&I Loan",
  "Working Capital Loan",
  "Line of Credit",
  "Land Loan",
  "Factoring"
] as const

export type Stage = typeof STAGES[number]
export type Priority = typeof PRIORITIES[number]
export type LoanType = typeof LOAN_TYPES[number]