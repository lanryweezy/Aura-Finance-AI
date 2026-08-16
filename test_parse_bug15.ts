export const safeParseJSON = <T>(text: string): T | null => {
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    // Try to extract markdown block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
        try {
            return JSON.parse(match[1]) as T;
        } catch (e2) {}
    }

    try {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');

      const objStr = (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace)
          ? text.slice(firstBrace, lastBrace + 1) : "";

      const arrStr = (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket)
          ? text.slice(firstBracket, lastBracket + 1) : "";

      let parsedObj: any = null;
      let parsedArr: any = null;

      try { if (objStr) parsedObj = JSON.parse(objStr); } catch (e) {}
      try { if (arrStr) parsedArr = JSON.parse(arrStr); } catch (e) {}

      if (parsedObj && parsedArr) {
          return objStr.length > arrStr.length ? parsedObj as T : parsedArr as T;
      }
      if (parsedObj) return parsedObj as T;
      if (parsedArr) return parsedArr as T;

      return null;
    } catch (innerError) {
      return null;
    }
  }
};
console.log(safeParseJSON('Some text with array: [1, 2] and object: {"a": 1} before main json {"data": "value", "arr": []}'));
