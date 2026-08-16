export const safeParseJSON = <T>(text: string): T | null => {
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    try {
      const start = text.indexOf('{');
      const startArray = text.indexOf('[');
      const end = text.lastIndexOf('}');
      const endArray = text.lastIndexOf(']');

      let actualStart = start;
      let actualEnd = end;

      // The logic has a bug when there is an array before the main object
      // or an object before the main array

      if (startArray !== -1 && (start === -1 || startArray < start)) {
          actualStart = startArray;
          actualEnd = endArray; // Here, if the main thing is an object but there's a [ before {, this will incorrectly use endArray
      } else {
          // It implies actualStart = start
          // but what if end < endArray? It uses end instead of endArray, which might be wrong
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

console.log(safeParseJSON<any>('some array like [1, 2, 3] before \n {"data": "value"}'));
console.log(safeParseJSON<any>('some object like {} before \n [{"data": "value"}]'));
