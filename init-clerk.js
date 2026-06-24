const { spawn } = require('child_process');

const clerk = spawn('clerk.cmd', ['init', '--app', 'app_3FaFBglMPOVEdr26CzwYECiC87G'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

clerk.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  if (output.includes('Do you want to continue?')) {
    clerk.stdin.write('y\n');
  }
});

clerk.stderr.on('data', (data) => {
  console.error(data.toString());
});

clerk.on('close', (code) => {
  console.log(`clerk init exited with code ${code}`);
});
