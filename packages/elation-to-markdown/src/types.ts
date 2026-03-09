/**
 * A single bullet (text section) within an Elation note.
 */
export interface ElationBullet {
  id: string
  text: string
  version: number
  /** The category label for this bullet (e.g. "Narrative", "HPI"). Only present on visit notes. */
  category?: string
}

/**
 * An Elation visit note.
 */
export interface ElationVisitNote {
  id: string
  type: string
  patient: string
  physician?: string
  chart_date: string
  document_date: string
  is_draft?: boolean
  template?: string
  bullets: ElationBullet[]
}

/**
 * An Elation non-visit note.
 */
export interface ElationNonVisitNote {
  id: string
  type: "nonvisit"
  patient: string
  chart_date: string
  document_date: string
  is_draft?: boolean
  bullets: ElationBullet[]
}

/**
 * Union type for any Elation note.
 */
export type ElationNote = ElationVisitNote | ElationNonVisitNote

/**
 * Options for controlling markdown conversion.
 */
export interface ConvertOptions {
  /**
   * Whether to include the note metadata header (date, type, ID).
   * Defaults to true.
   */
  includeHeader?: boolean

  /**
   * Whether to include bullet category labels as sub-headings.
   * Defaults to true.
   */
  includeBulletCategories?: boolean

  /**
   * Heading level for the note title (1-6).
   * Defaults to 2 (##).
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6

  /**
   * Whether to include draft notes. Defaults to true.
   */
  includeDrafts?: boolean
}

/**
 * Options for converting multiple notes.
 */
export interface ConvertManyOptions extends ConvertOptions {
  /**
   * The separator between notes. Defaults to "\n\n---\n\n".
   */
  separator?: string

  /**
   * Maximum number of notes to include. If not set, includes all.
   */
  limit?: number

  /**
   * Sort order for notes by chart_date. Defaults to "desc" (newest first).
   */
  sort?: "asc" | "desc"
}
