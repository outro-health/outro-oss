import type {
  ConvertManyOptions,
  ConvertOptions,
  ElationBullet,
  ElationNote,
} from "./types"

function heading(level: number, text: string): string {
  return `${"#".repeat(level)} ${text}`
}

function formatBullet(
  bullet: ElationBullet,
  options: { includeBulletCategories: boolean; headingLevel: number },
): string {
  const parts: string[] = []

  if (options.includeBulletCategories && bullet.category) {
    parts.push(heading(options.headingLevel + 1, bullet.category))
  }

  parts.push(bullet.text)

  return parts.join("\n\n")
}

function noteTypeLabel(note: ElationNote): string {
  if (note.type === "nonvisit") return "Non-Visit Note"
  return `Visit Note (${note.type})`
}

function formatDate(isoString: string): string {
  return isoString.split("T")[0] ?? isoString
}

/**
 * Convert a single Elation note to markdown.
 *
 * @param note - An Elation visit note or non-visit note
 * @param options - Formatting options
 * @returns Markdown string representation of the note
 */
export function elationNoteToMarkdown(
  note: ElationNote,
  options: ConvertOptions = {},
): string {
  const {
    includeHeader = true,
    includeBulletCategories = true,
    headingLevel = 2,
    includeDrafts = true,
  } = options

  if (!includeDrafts && note.is_draft) {
    return ""
  }

  const parts: string[] = []

  if (includeHeader) {
    const label = noteTypeLabel(note)
    const date = formatDate(note.chart_date)
    parts.push(heading(headingLevel, `${label} (${date})`))
    parts.push(`ID: ${note.id}`)
  }

  for (const bullet of note.bullets) {
    parts.push(
      formatBullet(bullet, {
        includeBulletCategories,
        headingLevel,
      }),
    )
  }

  return parts.join("\n\n")
}

/**
 * Convert multiple Elation notes to markdown.
 *
 * Notes are sorted by chart_date (newest first by default) and
 * separated by horizontal rules.
 *
 * @param notes - Array of Elation notes
 * @param options - Formatting and filtering options
 * @returns Markdown string representation of all notes
 */
export function elationNotesToMarkdown(
  notes: ElationNote[],
  options: ConvertManyOptions = {},
): string {
  const {
    separator = "\n\n---\n\n",
    limit,
    sort = "desc",
    includeDrafts = true,
    ...noteOptions
  } = options

  let filtered = includeDrafts ? notes : notes.filter((n) => !n.is_draft)

  filtered = [...filtered].sort((a, b) => {
    const cmp = a.chart_date.localeCompare(b.chart_date)
    return sort === "desc" ? -cmp : cmp
  })

  if (limit !== undefined) {
    filtered = filtered.slice(0, limit)
  }

  return filtered
    .map((note) =>
      elationNoteToMarkdown(note, { ...noteOptions, includeDrafts: true }),
    )
    .filter(Boolean)
    .join(separator)
}
