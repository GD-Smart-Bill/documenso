import { z } from 'zod';

import type { JobDefinition } from '../../client/_internal/job';

const SEND_USER_SIGNED_UP_EMAIL_TO_ADMIN_JOB_DEFINITION_ID = 'send.user.signed.up.email.to.admin';

const SEND_USER_SIGNED_UP_EMAIL_TO_ADMIN_JOB_DEFINITION_SCHEMA = z.object({
  userId: z.number(),
});

export type TSendUserSignedUpEmailToAdminJobDefinition = z.infer<
  typeof SEND_USER_SIGNED_UP_EMAIL_TO_ADMIN_JOB_DEFINITION_SCHEMA
>;

export const SEND_USER_SIGNED_UP_EMAIL_TO_ADMIN_JOB_DEFINITION = {
  id: SEND_USER_SIGNED_UP_EMAIL_TO_ADMIN_JOB_DEFINITION_ID,
  name: 'Send User Signed Up Email To Admin',
  version: '1.0.0',
  trigger: {
    name: SEND_USER_SIGNED_UP_EMAIL_TO_ADMIN_JOB_DEFINITION_ID,
    schema: SEND_USER_SIGNED_UP_EMAIL_TO_ADMIN_JOB_DEFINITION_SCHEMA,
  },
  handler: async ({ payload }) => {
    const handler = await import('./send-user-signed-up-email-to-admin.handler');

    await handler.run({ payload });
  },
} as const satisfies JobDefinition<
  typeof SEND_USER_SIGNED_UP_EMAIL_TO_ADMIN_JOB_DEFINITION_ID,
  TSendUserSignedUpEmailToAdminJobDefinition
>;
