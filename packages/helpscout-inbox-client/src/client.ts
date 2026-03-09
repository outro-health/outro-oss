import type {
  AddNoteInput,
  AddReplyInput,
  Conversation,
  CreateConversationInput,
  CreateCustomerInput,
  Customer,
  HelpScoutInboxConfig,
  ListConversationsInput,
  ListConversationsResponse,
  Mailbox,
  UpdateCustomerInput,
} from "./types.js"

const BASE_URL = "https://api.helpscout.net/v2"
const ACCESS_TOKEN_BUFFER_MS = 5 * 60 * 1000

type TokenResponse = {
  access_token: string
  expires_in: number
}

/**
 * Recursively removes undefined values from objects to prevent
 * JSON serialization issues with the Help Scout API.
 */
function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(stripUndefined) as T
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)]),
    ) as T
  }
  return obj
}

export class HelpScoutInboxClient {
  #config: HelpScoutInboxConfig
  #accessToken: string | null = null
  #accessTokenExpiresAt = 0

  constructor(config: HelpScoutInboxConfig) {
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

    const response = await fetch(`${BASE_URL}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        `Help Scout auth failed (${response.status}): ${text || response.statusText}`,
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
      method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
      query?: Record<string, string | undefined>
      body?: unknown
    },
  ): Promise<{ data: T | undefined; headers: Headers }> {
    const accessToken = await this.#getAccessToken()
    const url = new URL(path, `${BASE_URL}/`)

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
      body: options?.body
        ? JSON.stringify(stripUndefined(options.body))
        : undefined,
    })

    if (!response.ok) {
      const text = await response.text()
      const method = options?.method ?? "GET"
      throw new Error(
        `Help Scout API error (${response.status}) for ${method} ${url.pathname}${url.search}: ${text || response.statusText}`,
      )
    }

    const text = await response.text()
    return {
      data: text ? (JSON.parse(text) as T) : undefined,
      headers: response.headers,
    }
  }

  // --- Mailboxes ---

  async listMailboxes(): Promise<Mailbox[]> {
    const { data } = await this.#request<{
      _embedded?: { mailboxes?: Mailbox[] }
    }>("mailboxes")
    return data?._embedded?.mailboxes ?? []
  }

  // --- Conversations ---

  async listConversations(
    input: ListConversationsInput = {},
  ): Promise<ListConversationsResponse> {
    const { data } = await this.#request<ListConversationsResponse>(
      "conversations",
      {
        query: {
          mailbox: input.mailbox,
          status: input.status,
          assigned_to: input.assignedTo?.toString(),
          query: input.query,
          tag: input.tag,
          page: input.page?.toString(),
          embed: input.embed,
        },
      },
    )
    return data ?? {}
  }

  async getConversation(
    id: number,
    options?: { embed?: "threads" },
  ): Promise<Conversation> {
    const { data } = await this.#request<Conversation>(`conversations/${id}`, {
      query: { embed: options?.embed },
    })
    return data as Conversation
  }

  async createConversation(input: CreateConversationInput): Promise<number> {
    const { headers } = await this.#request<undefined>("conversations", {
      method: "POST",
      body: {
        mailboxId: input.mailboxId,
        type: input.type ?? "email",
        subject: input.subject,
        customer: input.customer,
        status: input.status ?? "active",
        threads: [
          {
            type: "reply",
            customer: input.customer,
            text: input.text,
            user: input.user,
          },
        ],
      },
    })

    const resourceId = headers.get("resource-id") ?? headers.get("Resource-ID")
    return Number(resourceId)
  }

  // --- Threads ---

  async addNote(input: AddNoteInput): Promise<number | null> {
    const { headers } = await this.#request<undefined>(
      `conversations/${input.conversationId}/threads`,
      {
        method: "POST",
        body: {
          type: "note",
          text: input.text,
          user: input.userId,
          status: input.status,
          imported: input.imported ?? false,
        },
      },
    )

    const resourceId = headers.get("resource-id") ?? headers.get("Resource-ID")
    return resourceId ? Number(resourceId) : null
  }

  async addReply(input: AddReplyInput): Promise<number | null> {
    const { headers } = await this.#request<undefined>(
      `conversations/${input.conversationId}/threads`,
      {
        method: "POST",
        body: {
          type: "reply",
          text: input.text,
          customer: input.customer,
          user: input.userId,
          status: input.status,
        },
      },
    )

    const resourceId = headers.get("resource-id") ?? headers.get("Resource-ID")
    return resourceId ? Number(resourceId) : null
  }

  // --- Customers ---

  async createCustomer(input: CreateCustomerInput): Promise<number> {
    const { headers } = await this.#request<undefined>("customers", {
      method: "POST",
      body: {
        firstName: input.firstName,
        lastName: input.lastName,
        emails: input.emails,
        phone: input.phone,
      },
    })

    const resourceId = headers.get("resource-id") ?? headers.get("Resource-ID")
    return Number(resourceId)
  }

  async getCustomer(email: string): Promise<Customer | undefined> {
    const { data } = await this.#request<{
      _embedded?: { customers?: Customer[] }
    }>("customers", {
      query: { query: `(email:"${email}")` },
    })
    return data?._embedded?.customers?.[0]
  }

  async updateCustomer(id: number, input: UpdateCustomerInput): Promise<void> {
    await this.#request<undefined>(`customers/${id}`, {
      method: "PATCH",
      body: input,
    })
  }

  async deleteCustomer(id: number): Promise<void> {
    await this.#request<undefined>(`customers/${id}`, {
      method: "DELETE",
    })
  }

  // --- Users ---

  async listUsers(filter?: {
    email: string
  }): Promise<
    Array<{ id: number; firstName: string; lastName: string; email: string }>
  > {
    const { data } = await this.#request<{
      _embedded?: {
        users?: Array<{
          id: number
          firstName: string
          lastName: string
          email: string
        }>
      }
    }>("users", {
      query: filter ? { email: filter.email } : undefined,
    })
    return data?._embedded?.users ?? []
  }
}
