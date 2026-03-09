export type HelpScoutInboxConfig = {
  clientId: string
  clientSecret: string
}

export type Mailbox = {
  id: number
  name: string
  slug: string
  type?: string
  status?: string
}

export type Thread = {
  id: number
  type: string
  status?: string
  createdAt?: string
  body?: string
  createdBy?: {
    id: number
    type: string
    first?: string
    last?: string
    email?: string
  }
}

export type Conversation = {
  id: number
  number?: number
  mailboxId?: number
  subject?: string
  preview?: string
  status?: string
  createdAt?: string
  modifiedAt?: string
  closedAt?: string | null
  assignee?: {
    id: number
    first?: string
    last?: string
    email?: string
  } | null
  primaryCustomer?: {
    id: number
    first?: string
    last?: string
    email?: string
  }
  tags?: Array<{ id: number; name: string }>
  _embedded?: {
    threads?: Thread[]
  }
}

export type Customer = {
  id: number
  firstName?: string
  lastName?: string
  emails?: Array<{ type: string; value: string }>
  [key: string]: unknown
}

export type ListConversationsResponse = {
  _embedded?: {
    conversations?: Conversation[]
  }
  page?: {
    number: number
    totalPages: number
    totalElements: number
    size: number
  }
}

export type ListConversationsInput = {
  mailbox?: string
  status?: "active" | "pending" | "closed"
  assignedTo?: number
  query?: string
  tag?: string
  page?: number
  embed?: "threads"
}

export type CreateCustomerInput = {
  firstName?: string
  lastName?: string
  emails: Array<{ type: "work" | "home" | "other"; value: string }>
  phone?: string
}

export type UpdateCustomerInput = {
  firstName?: string
  lastName?: string
  emails?: Array<{ type: "work" | "home" | "other"; value: string }>
  phone?: string
}

export type CreateConversationInput = {
  mailboxId: number
  subject: string
  customer:
    | { id: number }
    | { email: string; firstName?: string; lastName?: string }
  text: string
  user?: number
  type?: "email" | "phone" | "chat"
  status?: "active" | "pending" | "closed"
}

export type AddNoteInput = {
  conversationId: number
  text: string
  userId?: number
  status?: "active" | "pending" | "closed"
  imported?: boolean
}

export type AddReplyInput = {
  conversationId: number
  text: string
  customer: { id: number } | { email: string }
  userId?: number
  status?: "active" | "pending" | "closed"
}
