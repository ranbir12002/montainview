import https from "https";
https.get("https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    let match = data.match(/[a-zA-Z0-9_]*Screen[a-zA-Z0-9_]*/gi);
    console.log("Screen:", Array.from(new Set(match)).join(", "));
    let match2 = data.match(/[a-zA-Z0-9_]*Window[a-zA-Z0-9_]*/gi);
    console.log("Window:", Array.from(new Set(match2)).join(", "));
  });
});
