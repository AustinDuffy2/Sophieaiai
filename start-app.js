const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Matric App...\n');

// Start the server starter
console.log('1. Starting server starter...');
const serverStarter = spawn('node', ['server-starter.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Wait a moment for server starter to initialize
setTimeout(() => {
  console.log('\n2. Starting Expo development server...');
  
  // Start Expo
  const expo = spawn('npx', ['expo', 'start'], {
    stdio: 'inherit',
    cwd: __dirname
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    serverStarter.kill();
    expo.kill();
    process.exit(0);
  });

  expo.on('close', (code) => {
    console.log(`\nExpo process exited with code ${code}`);
    serverStarter.kill();
    process.exit(code);
  });

}, 2000);

serverStarter.on('close', (code) => {
  console.log(`\nServer starter process exited with code ${code}`);
  process.exit(code);
});

console.log('\n✅ Both services will start automatically.');
console.log('📱 The backend will start when you click the captions icon.');
console.log('🔄 Press Ctrl+C to stop everything.\n');
