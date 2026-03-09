import type {
  CreateAllergyInput,
  CreateAppointmentInput,
  CreateHistoryItemInput,
  CreateNonVisitNoteInput,
  CreatePatientInput,
  CreateVisitNoteInput,
  ElationConfig,
  NonVisitNote,
  PaginationInput,
  Patient,
  Physician,
  UpdateAppointmentInput,
  UpdatePatientInput,
  VisitNote,
  VisitNoteTemplate,
} from "./types.js"

const ACCESS_TOKEN_BUFFER_MS = 5 * 60 * 1000

type TokenResponse = {
  access_token: string
  expires_in: number
}

export class ElationClient {
  #config: ElationConfig
  #accessToken: string | null = null
  #accessTokenExpiresAt = 0

  constructor(config: ElationConfig) {
    this.#config = config
  }

  async #getAccessToken(): Promise<string> {
    if (this.#accessToken && Date.now() < this.#accessTokenExpiresAt) {
      return this.#accessToken
    }

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.#config.clientId,
      client_secret: this.#config.clientSecret,
    })

    const response = await fetch(
      `${this.#config.baseUrl}/api/2.0/oauth2/token/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    )

    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        `Elation auth failed (${response.status}): ${text || response.statusText}`,
      )
    }

    const data = (await response.json()) as TokenResponse
    this.#accessToken = data.access_token
    this.#accessTokenExpiresAt =
      Date.now() + data.expires_in * 1000 - ACCESS_TOKEN_BUFFER_MS

    return this.#accessToken
  }

  async #request<T>(
    path: string,
    options?: {
      method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
      query?: Record<string, string | undefined>
      body?: unknown
    },
  ): Promise<T> {
    const accessToken = await this.#getAccessToken()
    const url = new URL(
      `api/2.0/${path}`,
      this.#config.baseUrl.endsWith("/")
        ? this.#config.baseUrl
        : `${this.#config.baseUrl}/`,
    )

    for (const [key, value] of Object.entries(options?.query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, value)
      }
    }

    const response = await fetch(url, {
      method: options?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const text = await response.text()
      const method = options?.method ?? "GET"
      throw new Error(
        `Elation API error (${response.status}) for ${method} ${url.pathname}: ${text || response.statusText}`,
      )
    }

    const text = await response.text()
    return text ? (JSON.parse(text) as T) : (undefined as T)
  }

  // --- Appointments ---

  async createAppointment(
    input: CreateAppointmentInput,
  ): Promise<{ id: string }> {
    return this.#request("appointments/", {
      method: "POST",
      body: {
        scheduled_date: input.scheduled_date,
        patient: input.patient,
        physician: input.physician,
        practice: this.#config.practiceId,
        duration: input.duration,
        description: input.description,
        reason: input.reason,
      },
    })
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.#request(`appointments/${id}`, { method: "DELETE" })
  }

  async updateAppointment(
    id: string,
    data: UpdateAppointmentInput,
  ): Promise<void> {
    await this.#request(`appointments/${id}`, {
      method: "PATCH",
      body: { status: { status: data.status } },
    })
  }

  // --- Notes ---

  async createNonVisitNote(
    input: CreateNonVisitNoteInput,
  ): Promise<{ id: string }> {
    const date = new Date().toISOString()
    return this.#request("non_visit_notes/", {
      method: "POST",
      body: {
        patient: input.patient,
        chart_date: date,
        document_date: date,
        type: "nonvisit",
        bullets: [{ text: input.text }],
      },
    })
  }

  async getNonVisitNote(id: string): Promise<NonVisitNote> {
    return this.#request(`non_visit_notes/${id}`)
  }

  async updateNonVisitNote(id: string, text: string): Promise<{ id: string }> {
    const note = await this.getNonVisitNote(id)
    return this.#request(`non_visit_notes/${id}`, {
      method: "PATCH",
      body: {
        bullets: [{ id: note.bullets[0].id, text }],
      },
    })
  }

  async deleteNonVisitNote(id: string): Promise<void> {
    await this.#request(`non_visit_notes/${id}`, { method: "DELETE" })
  }

  async listNonVisitNotes(
    patientId: string,
    pagination?: PaginationInput,
  ): Promise<{ results: NonVisitNote[] }> {
    return this.#request("non_visit_notes/", {
      query: {
        patient: patientId,
        ...(pagination?.limit != null
          ? { limit: pagination.limit.toString() }
          : {}),
        ...(pagination?.offset != null
          ? { offset: pagination.offset.toString() }
          : {}),
      },
    })
  }

  async createVisitNote(input: CreateVisitNoteInput): Promise<{ id: string }> {
    const date = new Date().toISOString()
    return this.#request("visit_notes/", {
      method: "POST",
      body: {
        patient: input.patient,
        physician: input.physician,
        chart_date: date,
        document_date: date,
        template: "Simple",
        type: input.category,
        bullets: [{ text: input.text, category: "Narrative" }],
      },
    })
  }

  async deleteVisitNote(id: string): Promise<void> {
    await this.#request(`visit_notes/${id}`, { method: "DELETE" })
  }

  async listVisitNotes(
    patientId: string,
    pagination?: PaginationInput,
  ): Promise<{ results: VisitNote[] }> {
    return this.#request("visit_notes/", {
      query: {
        patient: patientId,
        ...(pagination?.limit ? { limit: pagination.limit.toString() } : {}),
        ...(pagination?.offset ? { offset: pagination.offset.toString() } : {}),
      },
    })
  }

  async listNotes(
    patientId: string,
  ): Promise<{ results: Array<NonVisitNote | VisitNote> }> {
    const [nonVisit, visit] = await Promise.all([
      this.listNonVisitNotes(patientId),
      this.listVisitNotes(patientId),
    ])
    return {
      results: [...nonVisit.results, ...visit.results],
    }
  }

  // --- Patients ---

  async createPatient(input: CreatePatientInput): Promise<{ id: string }> {
    return this.#request("patients/", {
      method: "POST",
      body: {
        first_name: input.first_name,
        last_name: input.last_name,
        sex: input.sex,
        dob: input.dob,
        primary_physician: input.primary_physician,
        caregiver_practice: this.#config.practiceId,
        phones: [{ phone: input.phone, phone_type: "Main" }],
        emails: [{ email: input.email }],
      },
    })
  }

  async getPatient(id: string): Promise<Patient> {
    return this.#request(`patients/${id}`)
  }

  async updatePatient(
    id: string,
    data: UpdatePatientInput,
  ): Promise<{ id: string }> {
    return this.#request(`patients/${id}`, {
      method: "PATCH",
      body: {
        ...data,
        ...(data.phone
          ? { phones: [{ phone: data.phone, phone_type: "Main" }] }
          : {}),
        ...(data.email ? { emails: [{ email: data.email }] } : {}),
      },
    })
  }

  async deletePatient(id: string): Promise<void> {
    await this.#request(`patients/${id}`, { method: "DELETE" })
  }

  // --- Physicians ---

  async listPhysicians(): Promise<{ results: Physician[] }> {
    return this.#request("physicians/")
  }

  // --- History & Allergies ---

  async createHistoryItem(
    input: CreateHistoryItemInput,
  ): Promise<{ id: string }> {
    return this.#request("histories/", {
      method: "POST",
      body: {
        patient: input.patient,
        text: input.text,
        type: input.historyType,
      },
    })
  }

  async createAllergy(input: CreateAllergyInput): Promise<{ id: string }> {
    return this.#request("allergies/", {
      method: "POST",
      body: {
        patient: input.patient,
        name: input.name,
      },
    })
  }

  // --- Templates ---

  async getVisitNoteTemplate(id: string): Promise<VisitNoteTemplate> {
    return this.#request(`visit_note_templates/${id}`)
  }

  async listVisitNoteTemplates(): Promise<{ results: VisitNoteTemplate[] }> {
    return this.#request("visit_note_templates/")
  }
}
