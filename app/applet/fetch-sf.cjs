const https = require("https");
https.get("https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    const matches = data.match(/[a-zA-Z0-9_]*Screen[a-zA-Z0-9_]*/gi) || [];
    console.log([...new Set(matches)]);
  });
});
