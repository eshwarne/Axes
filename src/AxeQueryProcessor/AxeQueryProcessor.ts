export interface AxeQueryStatment {
  Entity: string;
  Condition: string;
  Match: string;
}
export type ProcessedAxeQuery = AxeQueryStatment[];
// Sort the conditional delimiters by length descending
const ConditionalDelimiters = [
  "===",
  "==",
  "=",
  "!=",
  " has ",
  " startswith ",
  " endswith ",
].sort((a, b) => b.length - a.length);

/**
 * Axe Queries are of the form
 * Syntax: Entity condition Match; Repeat (or) only string defaults to Name has Match
 * Entity: Name, Type, Tenant,
 * condition: =, !=, has, startsWith, endsWith
 * @param queryString the AXE Query String
 * @returns Processed Axe Query
 */
const AXEQueryProcessor = (queryString: string): ProcessedAxeQuery => {
  let sanitizedQueryString = queryString
    .trim()
    .toLowerCase()
    .replace(/\s*/, " ");
  const queryParts = sanitizedQueryString.split(";");
  let processedAxeQuery: ProcessedAxeQuery = [];
  processedAxeQuery = queryParts
    .filter((queryPart) => queryPart.length >= 3)
    .map((queryPart) => {
      queryPart = queryPart.trim();
      console.log("QUERY PART", queryPart);
      const { start: ConditionalStart, end: ConditionalEnd } =
        getConditionalStartAndEndIndexInQueryPart(queryPart);

      if (
        ConditionalStart == -1 ||
        ConditionalStart == 0 ||
        ConditionalEnd == queryPart.length
      ) {
        return {
          Entity: "name",
          Condition: "=",
          Match: queryPart.trim(),
        };
      }
      return {
        Entity: queryPart.substring(0, ConditionalStart).trim(),
        Condition: queryPart.substring(ConditionalStart, ConditionalEnd),
        Match: queryPart.substring(ConditionalEnd, queryPart.length).trim(),
      };
    });
  return processedAxeQuery;
};
const getConditionalStartAndEndIndexInQueryPart = (
  queryPart: string
): { start: number; end: number } => {
  // TODO(ALGORITHM CHANGE): Use a more efficient Algorithm
  for (let idx = 0; idx < ConditionalDelimiters.length; idx++) {
    let delimiter = ConditionalDelimiters[idx];
    let start = queryPart.indexOf(delimiter);
    if (start >= 0) {
      return { start, end: start + delimiter.length };
    }
  }
  // No Match
  return { start: -1, end: -1 };
};
export { AXEQueryProcessor };
