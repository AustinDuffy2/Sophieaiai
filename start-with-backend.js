const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Matric App with Backend...\n');

let pythonProcess = null;
let expoProcess = null;

// Function to start Python backend in a new terminal window
function startPythonBackend() {
  return new Promise((resolve, reject) => {
    console.log('1. Starting Python backend in new terminal...');
    
    const pythonPath = path.join(__dirname, 'python-backend');
    const scriptPath = path.join(pythonPath, 'api_server.py');
    
    // Check if the Python backend directory exists
    if (!fs.existsSync(scriptPath)) {
      console.error('❌ Python backend not found at:', scriptPath);
      reject(new Error('Python backend not found'));
      return;
    }

    // Start the Python server in a new terminal window
    // On macOS, use 'osascript' to open a new terminal
    const isMac = process.platform === 'darwin';
    
    if (isMac) {
      const command = `cd "${pythonPath}" && source venv/bin/activate && python api_server.py`;
      pythonProcess = spawn('osascript', [
        '-e', `tell application "Terminal"`,
        '-e', `do script "${command}"`,
        '-e', `end tell`
      ]);
    } else {
      // For other platforms, use the default approach
      pythonProcess = spawn('python', [scriptPath], {
        cwd: pythonPath,
        env: {
          ...process.env,
          PATH: `${path.join(pythonPath, 'venv', 'bin')}:${process.env.PATH}`
        }
      });
    }

    // Wait a bit for the backend to start
    setTimeout(() => {
      console.log('✅ Python backend should be starting in new terminal');
      resolve();
    }, 3000);
  });
}

// Function to start Expo in a new terminal window
function startExpo() {
  return new Promise((resolve, reject) => {
    console.log('\n2. Starting Expo development server in new terminal...');
    
    const isMac = process.platform === 'darwin';
    
    if (isMac) {
      const command = `cd "${__dirname}" && npx expo start`;
      expoProcess = spawn('osascript', [
        '-e', `tell application "Terminal"`,
        '-e', `do script "${command}"`,
        '-e', `end tell`
      ]);
    } else {
      // For other platforms, use the default approach
      expoProcess = spawn('npx', ['expo', 'start'], {
        stdio: 'inherit',
        cwd: __dirname
      });
    }

    // Wait a bit for Expo to start
    setTimeout(() => {
      console.log('✅ Expo should be starting in new terminal');
      resolve();
    }, 3000);
  });
}

// Main startup function
async function startApp() {
  try {
    // Start Python backend first
    await startPythonBackend();
    
    // Wait a moment for backend to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start Expo
    await startExpo();
    
    console.log('\n🎉 Both services started in separate terminals!');
    console.log('📱 Check the new terminal windows for:');
    console.log('   - Python backend (download progress)');
    console.log('   - Expo development server (QR code)');
    console.log('\n🔄 Press Ctrl+C in this terminal to stop everything.\n');
    
    // Keep this process running to handle cleanup
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ Startup failed:', error);
    cleanup();
    process.exit(1);
  }
}

// Cleanup function
function cleanup() {
  console.log('\n🛑 Shutting down...');
  
  if (pythonProcess) {
    console.log('🛑 Stopping Python backend...');
    pythonProcess.kill();
  }
  
  if (expoProcess) {
    console.log('🛑 Stopping Expo...');
    expoProcess.kill();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  cleanup();
  process.exit(1);
});

console.log('✅ Backend will start in a separate terminal window.');
console.log('📱 Expo will start in another separate terminal window.');
console.log('🔄 This terminal will stay clean for monitoring.\n');

// Start the app
startApp();
