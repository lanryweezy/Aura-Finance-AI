export const safeParseJSON = <T>(text: string): T | null => {
  try {
    // First, try standard parsing in case it's already clean
    return JSON.parse(text) as T;
  } catch (e) {
    // If it fails, try to extract JSON from the text
    try {
      const start = text.indexOf('{');
      const startArray = text.indexOf('[');
      const end = text.lastIndexOf('}');
      const endArray = text.lastIndexOf(']');

      let actualStart = start;
      let actualEnd = end;

      if (startArray !== -1 && (start === -1 || startArray < start)) {
          actualStart = startArray;
          actualEnd = endArray;
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
console.log(safeParseJSON('Some text with array: [1, 2] and object: {"a": 1} before main json {"data": "value"}'));
