/**
 * Node.js 18 以下没有全局 fetch；undici 也需 18+，故用 node-fetch@2 兼容旧版本
 */
import { createRequire } from "module";

if (typeof globalThis.fetch !== "function") {
  const require = createRequire(import.meta.url);
  const nodeFetch = require("node-fetch");
  globalThis.fetch = nodeFetch;
  globalThis.Headers = nodeFetch.Headers;
  globalThis.Request = nodeFetch.Request;
  globalThis.Response = nodeFetch.Response;
}
