// Explicit static inline types to satisfy the compiler without an internet network connection
declare const require: (module: string) => any;
declare const process: { env: { [key: string]: string | undefined } };

const http = require('http');

const server = http.createServer((req: any, res: any) => {
  res.setHeader('Content-Type', 'application/json');

  // Production health check endpoint required by Cloud Ingress and Kubernetes Probes
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'DeployFlow Core Engine (Native Offline Mode)'
    }));
    return;
  }

  // Root metadata entry point
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      name: 'DeployFlow Enterprise API',
      phase: 'Phase 2 — Core Application Development',
      environment: process.env.NODE_ENV || 'development',
      network: 'Offline Mock Isolated Core'
    }));
    return;
  }

  // Fallback Route
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not Found' }));
});

const port = parseInt(process.env.PORT || '3000', 10);
server.listen(port, '0.0.0.0', () => {
  console.log(`[DeployFlow Engine] Server successfully booted and listening on http://0.0.0:${port}`);
});
