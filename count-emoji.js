const fs = require("fs");
const path = require("path");
const dirs = ["Frontend/src", "Admin/src"];
const re = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{FE0F}\u{1F900}-\u{1F9FF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F18E}-\u{1F19F}\u{1F200}-\u{1F2FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}]/u;
let total = 0;
const files = [];
for (const d of dirs) {
  fs.readdirSync(d, { recursive: true }).forEach((f) => {
    const p = path.join(d, f);
    if (!fs.statSync(p).isFile()) return;
    const c = fs.readFileSync(p, "utf8");
    const m = c.match(re);
    if (m && m.length) { total += m.length; files.push(p + ":" + m.length); }
  });
}
console.log("TOTAL emoji in Frontend/src + Admin/src:", total);
console.log(files.join("\n"));