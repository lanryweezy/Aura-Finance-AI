export const safeParseJSON2 = <T>(text: string): T | null => {
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    try {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        return JSON.parse(match[1]) as T;
      }

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
console.log(safeParseJSON2<any>('```json\n[{"data": {}}]\n```'));
