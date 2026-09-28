const axios = require("axios");
const BASE = "http://localhost:9000/api";

(async () => {
  const ts = Date.now();
  const payload = {
    name: "Phase A Tester",
    email: `phasea${ts}@example.com`,
    subject: "billing",
    message: "Testing the contact form email through Brevo during Phase A polish."
  };
  try {
    const res = await axios.post(BASE + "/contact", payload);
    console.log("status:", res.status);
    console.log("body:", res.data);
  } catch (err) {
    console.log("status:", err.response?.status);
    console.log("body:", err.response?.data);
  }
})();