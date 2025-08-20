const { exec } = require('child_process');

console.log('🛑 Stopping all Matric App processes...\n');

// Kill Python processes
exec('pkill -f "python.*api_server.py"', (error, stdout, stderr) => {
  if (error) {
    console.log('🐍 No Python backend processes found');
  } else {
    console.log('✅ Python backend stopped');
  }
});

// Kill Expo processes
exec('pkill -f "expo start"', (error, stdout, stderr) => {
  if (error) {
    console.log('📱 No Expo processes found');
  } else {
    console.log('✅ Expo stopped');
  }
});

// Kill Node processes related to our app
exec('pkill -f "node.*start-with-backend"', (error, stdout, stderr) => {
  if (error) {
    console.log('🔄 No startup processes found');
  } else {
    console.log('✅ Startup processes stopped');
  }
});

console.log('\n🎉 All processes stopped!');
console.log('💡 You can now run `npm start` again to restart everything.\n');
