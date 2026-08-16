export const safeParseJSON = <T>(text: string): T | null => {
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
        try {
            return JSON.parse(match[1]) as T;
        } catch (e2) {}
    }

    // Because there could be extraneous braces before/after, we need to extract from first `{` to last `}`.
    // However, if there are multiple unconnected objects (e.g., `{"a": 1} ... {"b": 2}`),
    // taking from first `{` to last `}` yields `{"a": 1} ... {"b": 2}` which is NOT valid JSON!

    // Instead of completely rewriting, let's look at the actual code in aiConfig.ts.

    // Let's implement a fix for the existing code logic:
    // When the existing code does:
    // if (startArray !== -1 && (start === -1 || startArray < start)) { actualStart = startArray; actualEnd = endArray; }
    // It assumes that if the FIRST brace is `[`, then the outermost structure is an array.
    // However, it incorrectly uses `endArray` which is the LAST `]`, even if the actual array ends earlier!

    // The previous implementation is actually generally fine for simple model outputs that are just surrounded by text.
    // But we found a bug when markdown block contains an array ````json\n[...]\n````,
    // it was already handled by the basic logic. Wait, earlier test_parse2.ts showed:
    // ````json\n[{"test": 123}]\n```` -> `[ { test: 123 } ]`

    // The REAL issue I spotted in my journal .jules/astra.md:
    // 2026-06-25 - Validate JSON.parse Arrays
    // 2026-06-26 - Validate Structured AI JSON Object Responses
    // 2026-06-27 - Safely Validate AI JSON Field Types
  }
};
