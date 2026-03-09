# @outro/jotform-to-markdown

Convert Jotform form submissions to clean, readable markdown. Zero dependencies.

## Install

```sh
yarn add @outro/jotform-to-markdown
```

## Usage

```ts
import { jotformToMarkdown } from "@outro/jotform-to-markdown"

const markdown = jotformToMarkdown(submission, {
  formQuestions,          // optional: filter out hidden fields
  excludeFields: ["token"], // default: ["token"]
})
```

### Input

A Jotform submission is a record of field IDs to field objects:

```ts
const submission = {
  "1": {
    name: "mood",
    type: "control_radio",
    text: "How are you feeling today?",
    order: "1",
    answer: "Good",
  },
  "2": {
    name: "notes",
    type: "control_textarea",
    text: "Any additional notes?",
    order: "2",
    answer: "Feeling much better this week.",
  },
}
```

### Output

```md
How are you feeling today?

Good

---
Any additional notes?

Feeling much better this week.
```

### Matrix fields

Matrix (table) fields are formatted with row labels:

```md
Rate your symptoms

Headache:
Mild

Nausea:
Severe

Dizziness:
(no response)
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `formQuestions` | `FormQuestions` | `undefined` | Form metadata to filter hidden fields |
| `excludeFields` | `string[]` | `["token"]` | Field names to exclude |
| `separator` | `string` | `"\n\n---\n"` | Separator between question/answer blocks |
| `emptyMatrixText` | `string` | `"(no response)"` | Placeholder for empty matrix rows |

## License

MIT
