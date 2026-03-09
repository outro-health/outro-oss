import { describe, expect, it } from "vitest"
import { elationNoteToMarkdown, elationNotesToMarkdown } from "../src/convert"
import type { ElationNonVisitNote, ElationVisitNote } from "../src/types"

const visitNote: ElationVisitNote = {
  id: "123",
  type: "Psychiatric Evaluation",
  patient: "patient-1",
  physician: "dr-1",
  chart_date: "2025-06-15T10:30:00Z",
  document_date: "2025-06-15T10:30:00Z",
  template: "Simple",
  bullets: [
    {
      id: "b1",
      text: "Patient reports improved mood since last visit.\nSleep quality has improved.",
      version: 1,
      category: "Narrative",
    },
  ],
}

const nonVisitNote: ElationNonVisitNote = {
  id: "456",
  type: "nonvisit",
  patient: "patient-1",
  chart_date: "2025-06-10T14:00:00Z",
  document_date: "2025-06-10T14:00:00Z",
  bullets: [
    {
      id: "b2",
      text: "Patient completed form: PHQ-9\n\n---------\nOver the last 2 weeks, how often have you been bothered by the following problems?\n\nLittle interest or pleasure in doing things\n\nNot at all",
      version: 1,
    },
  ],
}

describe("elationNoteToMarkdown", () => {
  it("converts a visit note with header and bullet category", () => {
    const result = elationNoteToMarkdown(visitNote)

    expect(result).toContain(
      "## Visit Note (Psychiatric Evaluation) (2025-06-15)",
    )
    expect(result).toContain("ID: 123")
    expect(result).toContain("### Narrative")
    expect(result).toContain("Patient reports improved mood")
  })

  it("converts a non-visit note", () => {
    const result = elationNoteToMarkdown(nonVisitNote)

    expect(result).toContain("## Non-Visit Note (2025-06-10)")
    expect(result).toContain("ID: 456")
    expect(result).toContain("Patient completed form: PHQ-9")
  })

  it("omits header when includeHeader is false", () => {
    const result = elationNoteToMarkdown(visitNote, { includeHeader: false })

    expect(result).not.toContain("## Visit Note")
    expect(result).not.toContain("ID: 123")
    expect(result).toContain("### Narrative")
    expect(result).toContain("Patient reports improved mood")
  })

  it("omits bullet categories when includeBulletCategories is false", () => {
    const result = elationNoteToMarkdown(visitNote, {
      includeBulletCategories: false,
    })

    expect(result).not.toContain("### Narrative")
    expect(result).toContain("Patient reports improved mood")
  })

  it("uses custom heading level", () => {
    const result = elationNoteToMarkdown(visitNote, { headingLevel: 3 })

    expect(result).toContain("### Visit Note")
    expect(result).toContain("#### Narrative")
  })

  it("filters out draft notes when includeDrafts is false", () => {
    const draftNote: ElationVisitNote = {
      ...visitNote,
      is_draft: true,
    }

    const result = elationNoteToMarkdown(draftNote, { includeDrafts: false })

    expect(result).toBe("")
  })

  it("includes draft notes by default", () => {
    const draftNote: ElationVisitNote = {
      ...visitNote,
      is_draft: true,
    }

    const result = elationNoteToMarkdown(draftNote)

    expect(result).toContain("Patient reports improved mood")
  })

  it("handles note with multiple bullets", () => {
    const multiBulletNote: ElationVisitNote = {
      ...visitNote,
      bullets: [
        {
          id: "b1",
          text: "First section content",
          version: 1,
          category: "HPI",
        },
        {
          id: "b2",
          text: "Second section content",
          version: 1,
          category: "Assessment",
        },
      ],
    }

    const result = elationNoteToMarkdown(multiBulletNote)

    expect(result).toContain("### HPI")
    expect(result).toContain("First section content")
    expect(result).toContain("### Assessment")
    expect(result).toContain("Second section content")
  })

  it("handles note with no bullets", () => {
    const emptyNote: ElationVisitNote = {
      ...visitNote,
      bullets: [],
    }

    const result = elationNoteToMarkdown(emptyNote)

    expect(result).toContain("## Visit Note")
    expect(result).toContain("ID: 123")
  })
})

describe("elationNotesToMarkdown", () => {
  it("converts multiple notes sorted by date descending", () => {
    const result = elationNotesToMarkdown([nonVisitNote, visitNote])

    // visitNote (June 15) should come before nonVisitNote (June 10) in desc order
    const visitIdx = result.indexOf("Visit Note (Psychiatric Evaluation)")
    const nonVisitIdx = result.indexOf("Non-Visit Note")
    expect(visitIdx).toBeLessThan(nonVisitIdx)
  })

  it("sorts ascending when specified", () => {
    const result = elationNotesToMarkdown([nonVisitNote, visitNote], {
      sort: "asc",
    })

    const visitIdx = result.indexOf("Visit Note (Psychiatric Evaluation)")
    const nonVisitIdx = result.indexOf("Non-Visit Note")
    expect(nonVisitIdx).toBeLessThan(visitIdx)
  })

  it("limits output notes", () => {
    const result = elationNotesToMarkdown([nonVisitNote, visitNote], {
      limit: 1,
    })

    // Should only include the newest (visitNote)
    expect(result).toContain("Psychiatric Evaluation")
    expect(result).not.toContain("Non-Visit Note")
  })

  it("uses custom separator", () => {
    const result = elationNotesToMarkdown([nonVisitNote, visitNote], {
      separator: "\n\n===\n\n",
    })

    expect(result).toContain("\n\n===\n\n")
    expect(result).not.toContain("\n\n---\n\n")
  })

  it("filters draft notes when includeDrafts is false", () => {
    const draftNote: ElationVisitNote = {
      ...visitNote,
      id: "789",
      is_draft: true,
    }

    const result = elationNotesToMarkdown([nonVisitNote, draftNote], {
      includeDrafts: false,
    })

    expect(result).toContain("Non-Visit Note")
    expect(result).not.toContain("789")
  })

  it("returns empty string for empty array", () => {
    expect(elationNotesToMarkdown([])).toBe("")
  })

  it("passes through note-level options", () => {
    const result = elationNotesToMarkdown([visitNote], {
      includeHeader: false,
      includeBulletCategories: false,
    })

    expect(result).not.toContain("## Visit Note")
    expect(result).not.toContain("### Narrative")
    expect(result).toContain("Patient reports improved mood")
  })
})
