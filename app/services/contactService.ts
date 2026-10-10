import { sendEmail } from '@/app/libs/emailClient';

export type ContactMessage = {
  name: string;
  email: string;
  phone: string;
};

export function sendContactEmail(message: ContactMessage) {
  return sendEmail({
    ...message,
    from_name: message.name,
    replay_to: message.email,
  });
}
