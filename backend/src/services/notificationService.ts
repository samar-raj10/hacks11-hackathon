import { Notification } from '../models/Notification.js';

export async function notifyUser(userId: string, title: string, message: string, type = 'SYSTEM_NOTIFICATION', metadata?: unknown) {
  return Notification.create({ userId, title, message, type, metadata });
}
