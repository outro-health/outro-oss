import type {
  ConvertOptions,
  JotformField,
  JotformSubmission,
  MatrixField,
  MatrixRow,
} from "./types"

const DEFAULT_EXCLUDE_FIELDS = ["token"]
const DEFAULT_SEPARATOR = "\n\n---\n"
const DEFAULT_EMPTY_MATRIX_TEXT = "(no response)"

function isMatrixField(field: JotformField): field is MatrixField {
  return field.type === "control_matrix"
}

function formatMatrixAnswer(field: MatrixField, emptyText: string): string {
  const rows: MatrixRow[] = JSON.parse(field.drows)
  return rows
    .map((row, i) => {
      const responses = field.answer[i]
      const responseText =
        responses && responses.length > 0 ? responses.join("") : emptyText
      return `${row.text}:\n${responseText}`
    })
    .join("\n\n")
}

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean")
    return String(value)
  if (typeof value === "object" && value !== null) {
    return Object.values(value).map(stringifyValue).filter(Boolean).join(" ")
  }
  return ""
}

function formatObjectAnswer(answer: Record<string, unknown>): string {
  return Object.values(answer).map(stringifyValue).filter(Boolean).join(" ")
}

function formatAnswer(field: JotformField, emptyMatrixText: string): string {
  if (isMatrixField(field)) {
    return formatMatrixAnswer(field, emptyMatrixText)
  }
  if (field.prettyFormat) {
    return field.prettyFormat
  }
  if (typeof field.answer === "object" && field.answer !== null) {
    return formatObjectAnswer(field.answer as Record<string, string>)
  }
  return String(field.answer)
}

function hasAnswer(field: JotformField): boolean {
  if (Array.isArray(field.answer)) {
    return field.answer.length > 0
  }
  if (typeof field.answer === "object" && field.answer !== null) {
    return Object.values(field.answer).some(Boolean)
  }
  return Boolean(field.answer)
}

/**
 * Convert a Jotform submission to markdown.
 *
 * Each visible, non-empty field becomes a section with the question text
 * followed by the answer, separated by horizontal rules.
 *
 * @param submission - The Jotform submission (record of field ID to field data)
 * @param options - Optional configuration for filtering and formatting
 * @returns Markdown string representation of the submission
 */
export function jotformToMarkdown(
  submission: JotformSubmission,
  options: ConvertOptions = {},
): string {
  const {
    formQuestions,
    excludeFields = DEFAULT_EXCLUDE_FIELDS,
    separator = DEFAULT_SEPARATOR,
    emptyMatrixText = DEFAULT_EMPTY_MATRIX_TEXT,
  } = options

  const excludeSet = new Set(excludeFields)

  return Object.values(submission)
    .sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10))
    .filter((field) => {
      if (!hasAnswer(field)) return false
      if (excludeSet.has(field.name)) return false
      if (formQuestions?.[field.name]?.hidden) return false
      return true
    })
    .map((field) => {
      const answerText = formatAnswer(field, emptyMatrixText)
      return `${field.text}\n\n${answerText}`
    })
    .join(separator)
}
