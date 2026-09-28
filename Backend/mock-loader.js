// Patches axios globally BEFORE the app loads, so verifyTransaction() returns
// a mock Paystack response read from a shared JSON file. Only intercepts
// /transaction/verify/ URLs so the real initialize call still hits Paystack.
// Usage: node -r ./mock-loader.js index.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const MOCK_FILE = path.join(__dirname, "paystack-mock.json");

const readMock = () => {
  try {
    return JSON.parse(fs.readFileSync(MOCK_FILE, "utf8"));
  } catch {
    return null;
  }
};

const origGet = axios.get;
const origPost = axios.post;

axios.get = async (url, config) => {
  if (/\/transaction\/verify\//.test(url)) {
    const mock = readMock();
    return { data: mock, status: 200, statusText: "OK", headers: {}, config: {}, request: {} };
  }
  return origGet(url, config);
};

axios.post = async (url, data, config) => {
  if (/\/transaction\/verify\//.test(url)) {
    const mock = readMock();
    return { data: mock, status: 200, statusText: "OK", headers: {}, config: {}, request: {} };
  }
  return origPost(url, data, config);
};

global.__setPaystackMock = (resp) => {
  fs.writeFileSync(MOCK_FILE, JSON.stringify(resp));
};

console.log("[mock-loader] axios patched; mock file:", MOCK_FILE);