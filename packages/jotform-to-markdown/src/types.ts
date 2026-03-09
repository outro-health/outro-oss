/**
 * A single row in a matrix field's row definitions.
 */
export interface MatrixRow {
  text: string
  id: string
}

/**
 * Base shape shared by all Jotform field types.
 */
interface BaseField {
  /** The field's name/identifier in the submission */
  name: string
  /** Display text / question label */
  text: string
  /** Sort order as a numeric string, e.g. "1", "12" */
  order: string
  /** Pre-formatted HTML representation of the answer (set by Jotform for some field types) */
  prettyFormat?: string
}

/**
 * A matrix/table field where the answer is a 2D array of strings.
 */
export interface MatrixField extends BaseField {
  type: "control_matrix"
  /** JSON-encoded array of MatrixRow objects */
  drows: string
  /** 2D array: each row contains the selected values */
  answer: string[][]
}

/**
 * A calculated field whose answer is a single computed string.
 */
export interface CalculatedField extends BaseField {
  type: "control_calculation"
  answer: string
}

/**
 * A standard field (radio, text, dropdown, etc.) with a string answer.
 *
 * Note: at runtime, Jotform may return structured objects for certain field
 * types (e.g. address, full name, phone). The answer value is typed loosely
 * to handle these cases safely.
 */
export interface StandardField extends BaseField {
  type: string
  answer: string | Record<string, string>
}

/**
 * Union of all recognized Jotform field types.
 */
export type JotformField = MatrixField | CalculatedField | StandardField

/**
 * A Jotform submission: a record of field IDs to their field data.
 */
export type JotformSubmission = Record<string, JotformField>

/**
 * Metadata about form questions, keyed by field name.
 * Used to determine which fields should be excluded from output.
 */
export type FormQuestions = Record<string, { hidden?: "Yes" | undefined }>

/**
 * Options for controlling markdown conversion.
 */
export interface ConvertOptions {
  /**
   * Form question metadata used to filter out hidden fields.
   * If not provided, no fields are filtered by visibility.
   */
  formQuestions?: FormQuestions

  /**
   * Field names to exclude from the output (in addition to hidden fields).
   * Defaults to ["token"].
   */
  excludeFields?: string[]

  /**
   * The separator inserted between each question/answer block.
   * Defaults to "\n\n---\n".
   */
  separator?: string

  /**
   * Placeholder text for matrix rows with no response.
   * Defaults to "(no response)".
   */
  emptyMatrixText?: string
}
