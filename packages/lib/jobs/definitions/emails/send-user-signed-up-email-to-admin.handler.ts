import { sendUserSignedUpEmail } from '../../../server-only/admin/send-user-signed-up-email';
import type { TSendUserSignedUpEmailToAdminJobDefinition } from './send-user-signed-up-email-to-admin';

export const run = async ({ payload }: { payload: TSendUserSignedUpEmailToAdminJobDefinition }) => {
  await sendUserSignedUpEmail({
    userId: payload.userId,
  });
};
