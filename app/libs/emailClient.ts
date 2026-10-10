import emailjs from '@emailjs/browser';

import {
  EMAIL_SENDER_KEY,
  EMAIL_SERVICE_ID,
  EMAIL_TEMPLATE_ID,
} from '@/app/config/env';

export function sendEmail(parameters: Record<string, unknown>) {
  if (!EMAIL_SERVICE_ID || !EMAIL_TEMPLATE_ID || !EMAIL_SENDER_KEY) {
    throw new Error('Email service configuration is missing.');
  }
  return emailjs.send(
    EMAIL_SERVICE_ID,
    EMAIL_TEMPLATE_ID,
    parameters,
    EMAIL_SENDER_KEY,
  );
}
