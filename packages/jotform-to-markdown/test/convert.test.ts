import { describe, expect, it } from "vitest"
import { jotformToMarkdown } from "../src/convert"
import type { JotformSubmission } from "../src/types"

describe("jotformToMarkdown", () => {
  it("converts a simple submission with text fields", () => {
    const submission: JotformSubmission = {
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

    const result = jotformToMarkdown(submission)

    expect(result).toBe(
      "How are you feeling today?\n\nGood\n\n---\nAny additional notes?\n\nFeeling much better this week.",
    )
  })

  it("sorts fields by order", () => {
    const submission: JotformSubmission = {
      "1": {
        name: "second",
        type: "control_textbox",
        text: "Second question",
        order: "10",
        answer: "B",
      },
      "2": {
        name: "first",
        type: "control_textbox",
        text: "First question",
        order: "2",
        answer: "A",
      },
    }

    const result = jotformToMarkdown(submission)

    expect(result).toContain("First question\n\nA")
    expect(result.indexOf("First question")).toBeLessThan(
      result.indexOf("Second question"),
    )
  })

  it("filters out fields with no answer", () => {
    const submission: JotformSubmission = {
      "1": {
        name: "filled",
        type: "control_textbox",
        text: "Filled",
        order: "1",
        answer: "Yes",
      },
      "2": {
        name: "empty",
        type: "control_textbox",
        text: "Empty",
        order: "2",
        answer: "",
      },
    }

    const result = jotformToMarkdown(submission)

    expect(result).toBe("Filled\n\nYes")
    expect(result).not.toContain("Empty")
  })

  it("filters out the token field by default", () => {
    const submission: JotformSubmission = {
      "1": {
        name: "token",
        type: "control_textbox",
        text: "Token",
        order: "1",
        answer: "jwt-token-value",
      },
      "2": {
        name: "question",
        type: "control_textbox",
        text: "A question",
        order: "2",
        answer: "An answer",
      },
    }

    const result = jotformToMarkdown(submission)

    expect(result).toBe("A question\n\nAn answer")
    expect(result).not.toContain("token")
    expect(result).not.toContain("jwt")
  })

  it("filters out hidden fields when formQuestions is provided", () => {
    const submission: JotformSubmission = {
      "1": {
        name: "visible",
        type: "control_textbox",
        text: "Visible",
        order: "1",
        answer: "Shown",
      },
      "2": {
        name: "hidden_field",
        type: "control_textbox",
        text: "Hidden",
        order: "2",
        answer: "Not shown",
      },
    }

    const result = jotformToMarkdown(submission, {
      formQuestions: {
        hidden_field: { hidden: "Yes" },
      },
    })

    expect(result).toBe("Visible\n\nShown")
  })

  it("uses prettyFormat when available", () => {
    const submission: JotformSubmission = {
      "1": {
        name: "date",
        type: "control_datetime",
        text: "Date of birth",
        order: "1",
        answer: "2000-01-15",
        prettyFormat: "January 15, 2000",
      },
    }

    const result = jotformToMarkdown(submission)

    expect(result).toBe("Date of birth\n\nJanuary 15, 2000")
  })

  it("handles matrix fields", () => {
    const submission: JotformSubmission = {
      "1": {
        name: "symptoms",
        type: "control_matrix",
        text: "Rate your symptoms",
        order: "1",
        drows: JSON.stringify([
          { text: "Headache", id: "1" },
          { text: "Nausea", id: "2" },
          { text: "Dizziness", id: "3" },
        ]),
        answer: [["Mild"], ["Severe"], []],
      },
    }

    const result = jotformToMarkdown(submission)

    expect(result).toContain("Rate your symptoms")
    expect(result).toContain("Headache:\nMild")
    expect(result).toContain("Nausea:\nSevere")
    expect(result).toContain("Dizziness:\n(no response)")
  })

  it("allows custom empty matrix text", () => {
    const submission: JotformSubmission = {
      "1": {
        name: "matrix",
        type: "control_matrix",
        text: "Matrix",
        order: "1",
        drows: JSON.stringify([{ text: "Row 1", id: "1" }]),
        answer: [[]],
      },
    }

    const result = jotformToMarkdown(submission, {
      emptyMatrixText: "N/A",
    })

    expect(result).toContain("Row 1:\nN/A")
  })

  it("allows custom separator", () => {
    const submission: JotformSubmission = {
      "1": {
        name: "q1",
        type: "control_textbox",
        text: "Q1",
        order: "1",
        answer: "A1",
      },
      "2": {
        name: "q2",
        type: "control_textbox",
        text: "Q2",
        order: "2",
        answer: "A2",
      },
    }

    const result = jotformToMarkdown(submission, { separator: "\n\n" })

    expect(result).toBe("Q1\n\nA1\n\nQ2\n\nA2")
  })

  it("allows custom excludeFields", () => {
    const submission: JotformSubmission = {
      "1": {
        name: "token",
        type: "control_textbox",
        text: "Token",
        order: "1",
        answer: "value",
      },
      "2": {
        name: "internal_id",
        type: "control_textbox",
        text: "Internal ID",
        order: "2",
        answer: "123",
      },
      "3": {
        name: "question",
        type: "control_textbox",
        text: "Question",
        order: "3",
        answer: "Answer",
      },
    }

    // Override default excludeFields — token is no longer excluded, but internal_id is
    const result = jotformToMarkdown(submission, {
      excludeFields: ["internal_id"],
    })

    expect(result).toContain("Token")
    expect(result).not.toContain("Internal ID")
    expect(result).toContain("Question")
  })

  it("returns empty string for empty submission", () => {
    expect(jotformToMarkdown({})).toBe("")
  })

  it("returns empty string when all fields are filtered out", () => {
    const submission: JotformSubmission = {
      "1": {
        name: "token",
        type: "control_textbox",
        text: "Token",
        order: "1",
        answer: "jwt",
      },
    }

    expect(jotformToMarkdown(submission)).toBe("")
  })

  describe("object answers (address, name, phone fields)", () => {
    it("formats an address object as space-separated values", () => {
      const submission = {
        "1": {
          name: "address",
          type: "control_address",
          text: "Home Address",
          order: "1",
          answer: {
            addr_line1: "123 Main St",
            addr_line2: "Apt 4B",
            city: "Portland",
            state: "OR",
            postal: "97201",
          },
        },
      } as unknown as JotformSubmission

      const result = jotformToMarkdown(submission)

      expect(result).not.toContain("[object Object]")
      expect(result).toContain("123 Main St")
      expect(result).toContain("Apt 4B")
      expect(result).toContain("Portland")
      expect(result).toContain("OR")
      expect(result).toContain("97201")
    })

    it("formats a full name object", () => {
      const submission = {
        "1": {
          name: "fullname",
          type: "control_fullname",
          text: "Patient Name",
          order: "1",
          answer: {
            first: "Jane",
            last: "Doe",
          },
        },
      } as unknown as JotformSubmission

      const result = jotformToMarkdown(submission)

      expect(result).not.toContain("[object Object]")
      expect(result).toBe("Patient Name\n\nJane Doe")
    })

    it("formats a phone object", () => {
      const submission = {
        "1": {
          name: "phone",
          type: "control_phone",
          text: "Phone Number",
          order: "1",
          answer: {
            area: "503",
            phone: "5551234",
          },
        },
      } as unknown as JotformSubmission

      const result = jotformToMarkdown(submission)

      expect(result).not.toContain("[object Object]")
      expect(result).toContain("503")
      expect(result).toContain("5551234")
    })

    it("skips empty string values within an object answer", () => {
      const submission = {
        "1": {
          name: "address",
          type: "control_address",
          text: "Address",
          order: "1",
          answer: {
            addr_line1: "123 Main St",
            addr_line2: "",
            city: "Portland",
            state: "OR",
            postal: "97201",
          },
        },
      } as unknown as JotformSubmission

      const result = jotformToMarkdown(submission)

      // No double spaces from the empty addr_line2
      expect(result).not.toContain("  ")
      expect(result).toBe("Address\n\n123 Main St Portland OR 97201")
    })

    it("filters out object answers where all values are empty", () => {
      const submission = {
        "1": {
          name: "address",
          type: "control_address",
          text: "Address",
          order: "1",
          answer: {
            addr_line1: "",
            addr_line2: "",
            city: "",
            state: "",
            postal: "",
          },
        },
      } as unknown as JotformSubmission

      const result = jotformToMarkdown(submission)

      expect(result).toBe("")
    })

    it("prefers prettyFormat over object answer", () => {
      const submission = {
        "1": {
          name: "address",
          type: "control_address",
          text: "Address",
          order: "1",
          prettyFormat: "123 Main St, Apt 4B, Portland, OR 97201",
          answer: {
            addr_line1: "123 Main St",
            addr_line2: "Apt 4B",
            city: "Portland",
            state: "OR",
            postal: "97201",
          },
        },
      } as unknown as JotformSubmission

      const result = jotformToMarkdown(submission)

      expect(result).toBe(
        "Address\n\n123 Main St, Apt 4B, Portland, OR 97201",
      )
    })

    it("handles a deeply unexpected answer shape without crashing", () => {
      const submission = {
        "1": {
          name: "weird",
          type: "control_widget",
          text: "Widget",
          order: "1",
          answer: { nested: { deep: "value" } },
        },
      } as unknown as JotformSubmission

      const result = jotformToMarkdown(submission)

      expect(result).not.toContain("[object Object]")
    })
  })
})
