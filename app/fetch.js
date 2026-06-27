const https = require("https");
https.get("https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    console.log("Got data length:", data.length);
    let match = data.match(/[a-zA-Z0-9_]*(Window|Screen)[a-zA-Z0-9_]*/gi);
    if(match) {
        console.log("Matches:", Array.from(new Set(match)).join(", "));
    }
  });
});
