import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logPath = path.join(process.cwd(), 'logs', 'log.txt');
    
    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ logs: [] });
    }

    const logs = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error reading logs:', error);
    return NextResponse.json(
      { error: 'Error al leer los logs' },
      { status: 500 }
    );
  }
} 