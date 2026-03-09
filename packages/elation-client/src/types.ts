export type ElationConfig = {
  baseUrl: string
  clientId: string
  clientSecret: string
  practiceId?: string
}

export type Patient = {
  id: string
  dob: string
  primary_physician: string
  gender_identity: string
  [key: string]: unknown
}

export type Physician = {
  id: number
  user_id: number
  first_name: string
  last_name: string
}

export type NonVisitNote = {
  id: string
  type: "nonvisit"
  bullets: Array<{ id: string; text: string; version: number }>
  patient: string
  chart_date: string
  document_date: string
  is_draft?: boolean
}

export type VisitNote = {
  id: string
  bullets: Array<{ id: string; text: string; version: number }>
  chart_date: string
  is_draft?: boolean
}

export type VisitNoteTemplate = {
  id: string
  name: string
  content: string
}

export type CreateAppointmentInput = {
  scheduled_date: string
  patient: string
  physician: string
  duration: number
  description?: string
  reason: string
}

export type UpdateAppointmentInput = {
  status: "Cancelled"
}

export type CreatePatientInput = {
  first_name: string
  last_name: string
  sex: "Unknown" | "Male" | "Female" | "Other"
  dob: string
  primary_physician: string
  phone: string
  email: string
}

export type UpdatePatientInput = {
  primary_physician?: string
  address?: {
    address_line1: string
    address_line2: string
    city: string
    state: string
    zip: string
  }
  emergency_contact?: {
    first_name: string
    last_name: string
    phone: string
  }
  sex?: "Unknown" | "Male" | "Female" | "Other"
  gender_identity?:
    | "unknown"
    | "man"
    | "woman"
    | "transgender_man"
    | "transgender_woman"
    | "nonbinary"
    | "option_not_listed"
    | "prefer_not_to_say"
    | "two_spirit"
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

export type CreateNonVisitNoteInput = {
  patient: string
  text: string
}

export type CreateVisitNoteInput = {
  patient: string
  physician: string
  text: string
  category: string
}

export type HistoryType =
  | "Past"
  | "Psychological"
  | "Family"
  | "Social"
  | "Habits"
  | "Diet"
  | "Exercise"
  | "Immunization"
  | "Legal"
  | "Consultation"
  | "Health Maintenance"
  | "Past Surgical"
  | "Cognitive Status"
  | "Functional Status"

export type CreateHistoryItemInput = {
  patient: string
  text: string
  historyType: HistoryType
}

export type CreateAllergyInput = {
  patient: string
  name: string
}

export type PaginationInput = {
  limit?: number
  offset?: number
}
