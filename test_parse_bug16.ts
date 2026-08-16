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

    // Find the first and last '{' and '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    let parsedObj: any = null;
    let objLength = 0;
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const str = text.slice(firstBrace, lastBrace + 1);
        parsedObj = JSON.parse(str);
        objLength = str.length;
      } catch (e) {}
    }

    // Find the first and last '[' and ']'
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    let parsedArr: any = null;
    let arrLength = 0;
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        const str = text.slice(firstBracket, lastBracket + 1);
        parsedArr = JSON.parse(str);
        arrLength = str.length;
      } catch (e) {}
    }

    if (parsedObj && parsedArr) {
      return objLength > arrLength ? parsedObj as T : parsedArr as T;
    }
    if (parsedObj) return parsedObj as T;
    if (parsedArr) return parsedArr as T;

    return null;
  }
};
console.log(safeParseJSON('Some text with array: [1, 2] and object: {"a": 1} before main json {"data": "value", "arr": []}'));
