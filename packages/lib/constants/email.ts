import { env } from '../utils/env';

export const FROM_ADDRESS = env('NEXT_PRIVATE_SMTP_FROM_ADDRESS') || 'noreply@smartbill.co.il';
export const FROM_NAME = env('NEXT_PRIVATE_SMTP_FROM_NAME') || 'Smartsign';

export const SERVICE_USER_EMAIL = 'serviceaccount@smartbill.co.il';

export const EMAIL_VERIFICATION_STATE = {
  NOT_FOUND: 'NOT_FOUND',
  VERIFIED: 'VERIFIED',
  EXPIRED: 'EXPIRED',
  ALREADY_VERIFIED: 'ALREADY_VERIFIED',
} as const;
