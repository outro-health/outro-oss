# @outro-health/helpscout-inbox-client

Typed client for the Help Scout Mailbox API v2. Handles OAuth2 token management, conversations, customers, and users. Zero dependencies (uses native `fetch`).

## Install

```sh
yarn add @outro-health/helpscout-inbox-client
```

## Usage

```ts
import { HelpScoutInboxClient } from "@outro-health/helpscout-inbox-client"

const client = new HelpScoutInboxClient({
  clientId: process.env.HELP_SCOUT_CLIENT_ID,
  clientSecret: process.env.HELP_SCOUT_CLIENT_SECRET,
})
```

### Mailboxes

```ts
const mailboxes = await client.listMailboxes()
```

### Conversations

```ts
// List conversations
const response = await client.listConversations({
  status: "active",
  mailbox: "12345",
  embed: "threads",
})

// Get a single conversation with threads
const conversation = await client.getConversation(123, { embed: "threads" })

// Create a conversation
const id = await client.createConversation({
  mailboxId: 12345,
  subject: "Welcome",
  customer: { email: "patient@example.com" },
  text: "Hello!",
})
```

### Threads

```ts
// Add an internal note
await client.addNote({
  conversationId: 123,
  text: "Internal note content",
})

// Add a reply
await client.addReply({
  conversationId: 123,
  text: "Reply to customer",
  customer: { id: 456 },
})
```

### Customers

```ts
const id = await client.createCustomer({
  firstName: "Jane",
  lastName: "Doe",
  emails: [{ type: "home", value: "jane@example.com" }],
})

const customer = await client.getCustomer("jane@example.com")

await client.updateCustomer(id, { firstName: "Janet" })

await client.deleteCustomer(id)
```

### Users

```ts
const users = await client.listUsers()
const [user] = await client.listUsers({ email: "staff@example.com" })
```

## Auth

Uses OAuth2 client credentials flow. Tokens are cached and automatically refreshed 5 minutes before expiry.

## License

MIT
