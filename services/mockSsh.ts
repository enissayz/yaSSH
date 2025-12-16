import { SshSession } from '../types';

// Simple mock file system
const fileSystem: Record<string, string[]> = {
  '~': ['logs/', 'scripts/', 'docker-compose.yml', '.bashrc'],
  '~/logs': ['app.log', 'error.log'],
  '~/scripts': ['deploy.sh', 'backup.sh']
};

export class MockSshConnection {
  private session: SshSession;
  private onDataCallback: (data: string) => void;
  private onCloseCallback: () => void;
  private connected: boolean = false;
  private currentDir: string = '~';

  constructor(session: SshSession, onData: (data: string) => void, onClose: () => void) {
    this.session = session;
    this.onDataCallback = onData;
    this.onCloseCallback = onClose;
  }

  public connect() {
    this.onDataCallback(`\r\nConnecting to ${this.session.host} on port ${this.session.port}...\r\n`);
    
    setTimeout(() => {
      this.connected = true;
      this.onDataCallback(`Connection established.\r\n`);
      this.onDataCallback(`Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)\r\n\r\n`);
      this.onDataCallback(` * Documentation:  https://help.ubuntu.com\r\n`);
      this.onDataCallback(` * Management:     https://landscape.canonical.com\r\n`);
      this.onDataCallback(` * Support:        https://ubuntu.com/advantage\r\n\r\n`);
      this.onDataCallback(`Last login: ${new Date().toUTCString()} from 192.168.1.10\r\n`);
      this.prompt();
    }, 800 + Math.random() * 1000); // Random latency
  }

  public write(data: string) {
    if (!this.connected) return;

    // Echo back (mocking remote echo)
    // this.onDataCallback(data); // xterm usually handles local echo if configured, but for SSH usually remote echoes. 
    // We will assume the UI handles input buffering or we just echo characters.
    // For this simple mock, we'll process line by line.
  }

  public exec(command: string) {
    if (!this.connected) return;
    
    const cmd = command.trim();
    if (!cmd) {
        this.prompt();
        return;
    }

    // Simulate processing delay
    setTimeout(() => {
        this.processCommand(cmd);
        this.prompt();
    }, 50);
  }

  private processCommand(cmd: string) {
    const args = cmd.split(' ');
    const main = args[0];

    switch (main) {
      case 'ls':
      case 'll':
        const files = fileSystem[this.currentDir] || [];
        this.onDataCallback(files.join('  ') + '\r\n');
        break;
      case 'pwd':
        this.onDataCallback(this.currentDir + '\r\n');
        break;
      case 'whoami':
        this.onDataCallback(this.session.username + '\r\n');
        break;
      case 'cd':
        const target = args[1];
        if (!target) {
            this.currentDir = '~';
        } else if (target === '..') {
            if (this.currentDir !== '~') {
                this.currentDir = '~'; // Simplified
            }
        } else if (fileSystem[`${this.currentDir}/${target}`.replace('~/', '~/')]) {
             // Very basic mock path resolution
             this.currentDir = `${this.currentDir}/${target}`;
        } else if (fileSystem[target]) {
             this.currentDir = target;
        } else {
             this.onDataCallback(`cd: no such file or directory: ${target}\r\n`);
        }
        break;
      case 'exit':
        this.close();
        break;
      case 'clear':
        this.onDataCallback('\x1b[2J\x1b[H'); // ANSI clear screen
        break;
      case 'htop':
      case 'top':
         this.onDataCallback('Error: Interactive commands not fully supported in web prototype.\r\n');
         break;
      default:
        this.onDataCallback(`${main}: command not found\r\n`);
    }
  }

  private prompt() {
    // Green user@host, Blue cwd
    const promptStr = `\x1b[1;32m${this.session.username}@${this.session.host}\x1b[0m:\x1b[1;34m${this.currentDir}\x1b[0m$ `;
    this.onDataCallback(promptStr);
  }

  public close() {
    this.connected = false;
    this.onDataCallback(`\r\nConnection to ${this.session.host} closed.\r\n`);
    this.onCloseCallback();
  }
}
