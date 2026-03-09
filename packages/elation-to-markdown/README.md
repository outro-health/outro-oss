# @outro-health/elation-to-markdown

Convert Elation EHR visit notes and non-visit notes to clean, readable markdown. Zero dependencies.

## Install

```sh
yarn add @outro-health/elation-to-markdown
```

## Usage

### Single note

```ts
import { elationNoteToMarkdown } from "@outro-health/elation-to-markdown"

const markdown = elationNoteToMarkdown(note)
```

### Multiple notes

```ts
import { elationNotesToMarkdown } from "@outro-health/elation-to-markdown"

const markdown = elationNotesToMarkdown(notes, {
  sort: "desc",   // newest first (default)
  limit: 5,       // only include 5 most recent
})
```

### Input

Elation note objects as returned by the Elation API:

```ts
const note = {
  id: "123",
  type: "Psychiatric Evaluation",
  patient: "patient-1",
  chart_date: "2025-06-15T10:30:00Z",
  document_date: "2025-06-15T10:30:00Z",
  bullets: [
    {
      id: "b1",
      text: "Patient reports improved mood.",
      version: 1,
      category: "Narrative",
    },
  ],
}
```

### Output

```md
## Visit Note (Psychiatric Evaluation) (2025-06-15)

ID: 123

### Narrative

Patient reports improved mood.
```

Non-visit notes render as:

```md
## Non-Visit Note (2025-06-10)

ID: 456

Patient completed form: PHQ-9
```

## Options

### `elationNoteToMarkdown(note, options?)`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `includeHeader` | `boolean` | `true` | Include note type, date, and ID |
| `includeBulletCategories` | `boolean` | `true` | Show bullet categories as sub-headings |
| `headingLevel` | `1-6` | `2` | Markdown heading level for the note title |
| `includeDrafts` | `boolean` | `true` | Include draft notes |

### `elationNotesToMarkdown(notes, options?)`

All options from above, plus:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `separator` | `string` | `"\n\n---\n\n"` | Separator between notes |
| `limit` | `number` | all | Max notes to include |
| `sort` | `"asc" \| "desc"` | `"desc"` | Sort by chart_date |

## License

MIT
