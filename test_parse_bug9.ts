export const safeParseJSON = <T>(text: string): T | null => {
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    try {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        return JSON.parse(match[1]) as T;
      }

      const startObj = text.indexOf('{');
      const startArr = text.indexOf('[');
      const endObj = text.lastIndexOf('}');
      const endArr = text.lastIndexOf(']');

      let objLen = (startObj !== -1 && endObj !== -1 && endObj > startObj) ? endObj - startObj : -1;
      let arrLen = (startArr !== -1 && endArr !== -1 && endArr > startArr) ? endArr - startArr : -1;

      let actualStart = -1;
      let actualEnd = -1;

      if (objLen > arrLen) {
        actualStart = startObj;
        actualEnd = endObj;
      } else if (arrLen > objLen) {
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
console.log(safeParseJSON('Some text with array: [1, 2] and object: {"a": 1} before main json {"data": "value", "another": [1, 2, 3]}'));
console.log(safeParseJSON('Here is the json: {"a": 1} or maybe [{"a": 1}]'));
