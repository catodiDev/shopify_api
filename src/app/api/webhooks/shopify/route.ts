import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // Validar método HTTP
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Método no permitido' },
        { status: 405 }
      );
    }

    // Obtener el cuerpo de la solicitud
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Validar HMAC
    const hmac = request.headers.get('x-shopify-hmac-sha256');
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.error('Webhook secret no configurado');
      return NextResponse.json(
        { error: 'Error de configuración' },
        { status: 500 }
      );
    }

    const calculatedHmac = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('base64');

    if (hmac !== calculatedHmac) {
      logger.error('HMAC inválido');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Registrar el evento
    const timestamp = dayjs().format('YYYY-MM-DD, HH:mm:ss');
    const eventType = request.headers.get('x-shopify-topic') || 'unknown';
    const logMessage = `${timestamp}, ${eventType}, ${JSON.stringify(body)}`;
    
    logger.log(logMessage);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logger.error(errorMessage);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 