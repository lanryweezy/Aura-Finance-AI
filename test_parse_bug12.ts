export const safeParseJSON = <T>(text: string): T | null => {
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    // Better strategy: Use regex to extract the markdown block if it exists
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      try {
        return JSON.parse(match[1]) as T;
      } catch (innerE) {
        // Fallthrough
      }
    }

    // Fallback: search for first { or [ and last } or ]
    try {
      const startObj = text.indexOf('{');
      const startArr = text.indexOf('[');
      const endObj = text.lastIndexOf('}');
      const endArr = text.lastIndexOf(']');

      let actualStart = -1;
      let actualEnd = -1;

      // Determine if the outermost structure is likely an object or an array
      // by finding the first occurring opening brace/bracket
      if (startObj !== -1 && (startArr === -1 || startObj < startArr)) {
        actualStart = startObj;
        actualEnd = endObj;
      } else if (startArr !== -1 && (startObj === -1 || startArr < startObj)) {
        actualStart = startArr;
        actualEnd = endArr;
      }

      if (actualStart !== -1 && actualEnd !== -1 && actualEnd > actualStart) {
        const jsonText = text.slice(actualStart, actualEnd + 1);
        return JSON.parse(jsonText) as T;
      }
      return null;
    } catch (innerError) {
      return null;
    }
  }
};
console.log(safeParseJSON('Some text with array: [1, 2] and object: {"a": 1} before main json {"data": "value", "arr": []}'));
