const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let pythonProcess = null;
let isStarting = false;

function startPythonBackend() {
  return new Promise((resolve, reject) => {
    if (pythonProcess) {
      console.log('Python backend already running');
      resolve(true);
      return;
    }

    if (isStarting) {
      console.log('Python backend already starting');
      resolve(false);
      return;
    }

    isStarting = true;
    console.log('Starting Python backend...');

    const pythonPath = path.join(__dirname, 'python-backend');
    const scriptPath = path.join(pythonPath, 'api_server.py');
    const venvPath = path.join(pythonPath, 'venv', 'bin', 'activate');

    // Check if the Python backend directory exists
    if (!fs.existsSync(scriptPath)) {
      console.error('Python backend not found at:', scriptPath);
      isStarting = false;
      reject(new Error('Python backend not found'));
      return;
    }

    // Start the Python server
    pythonProcess = spawn('python', [scriptPath], {
      cwd: pythonPath,
      env: {
        ...process.env,
        PATH: `${path.join(pythonPath, 'venv', 'bin')}:${process.env.PATH}`
      }
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log('Python backend:', data.toString());
      
      // Check if server is ready
      if (data.toString().includes('Running on http://127.0.0.1:5001')) {
        console.log('Python backend started successfully');
        isStarting = false;
        resolve(true);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python backend error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      console.log('Python backend process closed with code:', code);
      pythonProcess = null;
      isStarting = false;
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python backend:', error);
      pythonProcess = null;
      isStarting = false;
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (isStarting) {
        console.log('Timeout starting Python backend');
        isStarting = false;
        if (pythonProcess) {
          pythonProcess.kill();
          pythonProcess = null;
        }
        reject(new Error('Timeout starting Python backend'));
      }
    }, 10000);
  });
}

function stopPythonBackend() {
  return new Promise((resolve) => {
    if (pythonProcess) {
      console.log('Stopping Python backend...');
      pythonProcess.kill();
      pythonProcess = null;
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

// Simple HTTP server to handle start/stop requests
const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/start' && req.method === 'POST') {
    startPythonBackend()
      .then((success) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success, message: success ? 'Backend started' : 'Backend already running' }));
      })
      .catch((error) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      });
  } else if (req.url === '/stop' && req.method === 'POST') {
    stopPythonBackend()
      .then((stopped) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, stopped, message: stopped ? 'Backend stopped' : 'Backend not running' }));
      });
  } else if (req.url === '/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      running: pythonProcess !== null, 
      starting: isStarting 
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server starter running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /start - Start Python backend');
  console.log('  POST /stop - Stop Python backend');
  console.log('  GET /status - Check backend status');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  stopPythonBackend().then(() => {
    server.close(() => {
      console.log('Server starter stopped');
      process.exit(0);
    });
  });
});
