const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Python backend server...');

const pythonPath = path.join(__dirname, 'python-backend');
const scriptPath = path.join(pythonPath, 'api_server.py');

// Start the Python server
const pythonProcess = spawn('python', [scriptPath], {
  cwd: pythonPath,
  env: {
    ...process.env,
    PATH: `${path.join(pythonPath, 'venv', 'bin')}:${process.env.PATH}`
  },
  stdio: 'inherit' // This will show the output in the terminal
});

pythonProcess.on('close', (code) => {
  console.log(`Python backend process closed with code: ${code}`);
});

pythonProcess.on('error', (error) => {
  console.error('Failed to start Python backend:', error);
});

console.log('✅ Backend server starting...');
console.log('📱 You can now use the transcription feature in the app!');
