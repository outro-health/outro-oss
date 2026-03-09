# @outro-health/elation-client

Typed client for the Elation EHR API v2. Handles OAuth2 token management, patients, appointments, notes, physicians, allergies, and history items. Zero dependencies (uses native `fetch`).

## Install

```sh
yarn add @outro-health/elation-client
```

## Usage

```ts
import { ElationClient } from "@outro-health/elation-client"

const client = new ElationClient({
  baseUrl: "https://sandbox.elationemr.com",
  clientId: process.env.ELATION_CLIENT_ID,
  clientSecret: process.env.ELATION_CLIENT_SECRET,
  practiceId: process.env.ELATION_PRACTICE_ID, // optional, used for patient/appointment creation
})
```

### Patients

```ts
const { id } = await client.createPatient({
  first_name: "Jane",
  last_name: "Doe",
  sex: "Female",
  dob: "1990-01-15",
  primary_physician: "physician_id",
  phone: "555-0100",
  email: "jane@example.com",
})

const patient = await client.getPatient(id)

await client.updatePatient(id, { first_name: "Janet" })

await client.deletePatient(id)
```

### Appointments

```ts
const { id } = await client.createAppointment({
  scheduled_date: "2025-07-01T14:00:00Z",
  patient: "patient_id",
  physician: "physician_id",
  duration: 30,
  reason: "Follow-up",
})

await client.updateAppointment(id, { status: "Cancelled" })
await client.deleteAppointment(id)
```

### Notes

```ts
// Non-visit notes
const { id } = await client.createNonVisitNote({
  patient: "patient_id",
  text: "Patient called to discuss medication.",
})
const note = await client.getNonVisitNote(id)
await client.updateNonVisitNote(id, "Updated note text.")
const { results } = await client.listNonVisitNotes("patient_id")

// Visit notes
await client.createVisitNote({
  patient: "patient_id",
  physician: "physician_id",
  text: "Follow-up visit notes.",
  category: "Follow Up",
})
const { results } = await client.listVisitNotes("patient_id")

// All notes combined
const { results } = await client.listNotes("patient_id")
```

### Physicians

```ts
const { results } = await client.listPhysicians()
```

### History & Allergies

```ts
await client.createHistoryItem({
  patient: "patient_id",
  text: "Previous SSRI use",
  historyType: "Past",
})

await client.createAllergy({
  patient: "patient_id",
  name: "Penicillin",
})
```

### Templates

```ts
const { results } = await client.listVisitNoteTemplates()
const template = await client.getVisitNoteTemplate("template_id")
```

## Auth

Uses OAuth2 client credentials flow. Tokens are cached and automatically refreshed 5 minutes before expiry.

## License

MIT
