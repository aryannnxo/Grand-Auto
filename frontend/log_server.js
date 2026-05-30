import http from 'http';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    console.log("=== BROWSER ERROR LOG ===");
    console.log(body);
    console.log("=========================");
    res.writeHead(200);
    res.end('OK');
  });
});

server.listen(9999, () => {
  console.log("Diagnostic server listening on port 9999...");
});
