import { createElement } from 'react';

import { msg } from '@lingui/core/macro';

import { mailer } from '@documenso/email/mailer';
import { NewUserSignedUpEmailToAdminTemplate } from '@documenso/email/templates/new-user-signed-up-email-to-admin';
import { prisma } from '@documenso/prisma';

import { getI18nInstance } from '../../client-only/providers/i18n-server';
import { NEXT_PUBLIC_WEBAPP_URL } from '../../constants/app';
import { env } from '../../utils/env';
import { renderEmailWithI18N } from '../../utils/render-email-with-i18n';

export interface SendUserSignedUpEmailProps {
  userId: number;
}

export const sendUserSignedUpEmail = async ({ userId }: SendUserSignedUpEmailProps) => {
  const NEXT_PRIVATE_SMTP_FROM_NAME = env('NEXT_PRIVATE_SMTP_FROM_NAME');
  const NEXT_PRIVATE_SMTP_FROM_ADDRESS = env('NEXT_PRIVATE_SMTP_FROM_ADDRESS');
  const NEXT_PRIVATE_ADMIN_EMAIL = env('NEXT_PRIVATE_ADMIN_EMAIL') ?? 'sagidam@gmail.com';

  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });

  const assetBaseUrl = NEXT_PUBLIC_WEBAPP_URL() || 'http://localhost:3000';
  const senderName = NEXT_PRIVATE_SMTP_FROM_NAME || 'Smartsign';
  const senderAddress = NEXT_PRIVATE_SMTP_FROM_ADDRESS || 'noreply@documenso.com';

  const emailTemplate = createElement(NewUserSignedUpEmailToAdminTemplate, {
    assetBaseUrl,
    user: {
      email: user.email,
      name: user.name ?? '',
      phone: user.phone ?? '',
    },
  });

  const [html, text] = await Promise.all([
    renderEmailWithI18N(emailTemplate),
    renderEmailWithI18N(emailTemplate, { plainText: true }),
  ]);

  const i18n = await getI18nInstance();

  return mailer.sendMail({
    to: {
      address: NEXT_PRIVATE_ADMIN_EMAIL,
      name: '',
    },
    from: {
      name: senderName,
      address: senderAddress,
    },
    subject: i18n._(msg`New user signed up`),
    html,
    text,
  });
};
