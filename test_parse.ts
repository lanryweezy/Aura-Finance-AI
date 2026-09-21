import { safeParseJSON } from './services/aiConfig';

const res = safeParseJSON<any>('{"test": 123}');
console.log(res);
