/**
 * Translation key helpers for product spec tables.
 *
 * Converts display strings (column headers, cell values) to camelCase translation keys
 * for lookup via next-intl's t() function.
 */

/**
 * Convert column header display string to camelCase translation key.
 *
 * @example
 * columnToKey("Wall Thickness") -> "wallThickness"
 * columnToKey("Outer Diameter") -> "outerDiameter"
 */
export function columnToKey(col: string): string {
  return col
    .replace(/\s+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (c) => c.toLowerCase());
}

/**
 * Convert row cell display string to camelCase translation key.
 *
 * Handles hyphens and slashes by treating them as word separators.
 *
 * @example
 * cellToKey("Bell End") -> "bellEnd"
 * cellToKey("Push-fit") -> "pushFit"
 * cellToKey("Y-Diverter") -> "yDiverter"
 */
export function cellToKey(cell: string): string {
  return cell
    .replace(/[-/]/g, " ")
    .replace(/\s+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (c) => c.toLowerCase());
}
