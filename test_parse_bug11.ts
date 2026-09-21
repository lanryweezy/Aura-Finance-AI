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

      // Bug: If JSON is an array of objects `[{}, {}]`, then `startArray < start` is true.
      // So `actualStart = startArray` and `actualEnd = endArray`. This is correct.

      // Bug: If JSON is an object with an array inside `{"a": [1, 2]}`, then `start < startArray` is true.
      // So it falls through the `if` block. `actualStart = start` and `actualEnd = end`. This is correct.

      // Bug: If text has an array BEFORE the actual object:
      // "Here is the array [1,2,3]. Here is the result: {"a": 1}"
      // startArray < start is true.
      // actualStart = startArray
      // actualEnd = endArray (which might be the `]` from `[1,2,3]` if there are no other arrays, or maybe there's another array later)
      // It attempts to parse from the first `[` to the last `]`.

      const firstBracket = startArray !== -1 && startArray < start ? '[' : '{';
      const firstBrace = start !== -1 && (startArray === -1 || start < startArray) ? '{' : '[';

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
console.log(safeParseJSON('Some text with array: [1, 2] and object: {"a": 1} before main json {"data": "value", "arr": []}'));
