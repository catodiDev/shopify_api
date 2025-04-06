import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';

const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_LOG_FILES = 5;

export class Logger {
  private logPath: string;
  private errorLogPath: string;

  constructor() {
    this.logPath = path.join(process.cwd(), 'logs', 'log.txt');
    this.errorLogPath = path.join(process.cwd(), 'logs', 'error.log');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  private rotateLogs() {
    if (!fs.existsSync(this.logPath)) return;

    const stats = fs.statSync(this.logPath);
    if (stats.size > MAX_LOG_SIZE) {
      // Crear backup del archivo actual
      const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
      const backupPath = path.join(
        process.cwd(),
        'logs',
        `log_${timestamp}.txt`
      );
      fs.renameSync(this.logPath, backupPath);

      // Mantener solo los últimos MAX_LOG_FILES archivos
      const logFiles = fs
        .readdirSync(path.join(process.cwd(), 'logs'))
        .filter(file => file.startsWith('log_') && file.endsWith('.txt'))
        .sort()
        .reverse();

      if (logFiles.length > MAX_LOG_FILES) {
        logFiles.slice(MAX_LOG_FILES).forEach(file => {
          fs.unlinkSync(path.join(process.cwd(), 'logs', file));
        });
      }
    }
  }

  public log(message: string) {
    this.rotateLogs();
    fs.appendFileSync(this.logPath, message + '\n');
  }

  public error(error: Error | string) {
    const errorMessage = error instanceof Error ? error.message : error;
    const timestamp = dayjs().format('YYYY-MM-DD, HH:mm:ss');
    const logMessage = `${timestamp} - ERROR: ${errorMessage}\n`;
    fs.appendFileSync(this.errorLogPath, logMessage);
  }
}

export const logger = new Logger(); 