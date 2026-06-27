import https from 'https';
https.get('https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const methods = [...new Set([...data.matchAll(/([a-zA-Z0-9_]+)\s*:\s*function/g)].map(m => m[1]))];
    console.log("METHODS:", methods.join(', '));
  });
});
