import { safeParseJSON } from './services/aiConfig';
console.log(safeParseJSON('Some text with array: [1, 2] and object: {"a": 1} before main json {"data": "value"}'));
