import type { Organisation } from '@prisma/client';
import { DocumentSource, SubscriptionStatus } from '@prisma/client';
import { DateTime } from 'luxon';

import { IS_BILLING_ENABLED } from '@documenso/lib/constants/app';
import { INTERNAL_CLAIM_ID } from '@documenso/lib/types/subscription';
import { prisma } from '@documenso/prisma';

import {
  FREE_PLAN_LIMITS,
  FREE_TRIAL_LIMITS,
  INACTIVE_PLAN_LIMITS,
  PAID_PLAN_LIMITS,
} from './constants';
import { ERROR_CODES } from './errors';
import type { TLimitsResponseSchema } from './schema';

const IS_SMARTSIGN_LIMITS_ENABLED = true;
export type GetServerLimitsOptions = {
  userId: number;
  teamId: number;
};

export const getServerLimits = async ({
  userId,
  teamId,
}: GetServerLimitsOptions): Promise<TLimitsResponseSchema> => {
  // if (!IS_BILLING_ENABLED()) {
  //   return {
  //     quota: SELFHOSTED_PLAN_LIMITS,
  //     remaining: SELFHOSTED_PLAN_LIMITS,
  //   };
  // }

  const organisation = await prisma.organisation.findFirst({
    where: {
      teams: {
        some: {
          id: teamId,
        },
      },
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      subscription: true,
      organisationClaim: true,
    },
  });

  if (!organisation) {
    throw new Error(ERROR_CODES.USER_FETCH_FAILED);
  }

  if (IS_SMARTSIGN_LIMITS_ENABLED && !IS_BILLING_ENABLED()) {
    return getSmartsignLimitsBeforeBillingIsEnabled({ organisation });
  }

  const quota = structuredClone(FREE_PLAN_LIMITS);
  const remaining = structuredClone(FREE_PLAN_LIMITS);

  const subscription = organisation.subscription;

  // Bypass all limits even if plan expired for ENTERPRISE.
  if (organisation.organisationClaimId === INTERNAL_CLAIM_ID.ENTERPRISE) {
    return {
      quota: PAID_PLAN_LIMITS,
      remaining: PAID_PLAN_LIMITS,
    };
  }

  // Early return for users with an expired subscription.
  if (subscription && subscription.status !== SubscriptionStatus.ACTIVE) {
    return {
      quota: INACTIVE_PLAN_LIMITS,
      remaining: INACTIVE_PLAN_LIMITS,
    };
  }

  // Allow unlimited documents for users with an unlimited documents claim.
  // This also allows "free" claim users without subscriptions if they have this flag.
  if (organisation.organisationClaim.flags.unlimitedDocuments) {
    return {
      quota: PAID_PLAN_LIMITS,
      remaining: PAID_PLAN_LIMITS,
    };
  }

  const [documents, directTemplates] = await Promise.all([
    prisma.document.count({
      where: {
        team: {
          organisationId: organisation.id,
        },
        createdAt: {
          gte: DateTime.utc().startOf('month').toJSDate(),
        },
        source: {
          not: DocumentSource.TEMPLATE_DIRECT_LINK,
        },
      },
    }),
    prisma.template.count({
      where: {
        team: {
          organisationId: organisation.id,
        },
        directLink: {
          isNot: null,
        },
      },
    }),
  ]);

  remaining.directTemplates = Math.max(remaining.directTemplates - directTemplates, 0);
  remaining.documents = Math.max(quota.documents - documents, 0);

  return {
    quota,
    remaining,
  };
};

/**
 *
 * @param param0 We don;t care for per months. We only look at 2 things.
 * For a new user that has created less then FREE_TRIAL_LIMITS.documents documents, we will return FREE_TRIAL_LIMITS.documents - the amount of docs created.
 * For other users, we check the user.documentLimit and return the difference between that and the amount of docs created.
 * @returns
 */
async function getSmartsignLimitsBeforeBillingIsEnabled({
  organisation,
}: {
  organisation: Organisation;
}): Promise<TLimitsResponseSchema> {
  console.log('getSmartsignLimitsBeforeBillingIsEnabled');

  const [user, documents, directTemplates] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: organisation.ownerUserId,
      },
    }),
    prisma.document.count({
      where: {
        team: {
          organisationId: organisation.id,
        },
        source: {
          not: DocumentSource.TEMPLATE_DIRECT_LINK,
        },
      },
    }),
    prisma.template.count({
      where: {
        team: {
          organisationId: organisation.id,
        },
        directLink: {
          isNot: null,
        },
      },
    }),
  ]);

  const documentsLimit = user?.documentsLimit ?? FREE_TRIAL_LIMITS.documents;
  const quota = structuredClone(FREE_TRIAL_LIMITS);
  const remaining = structuredClone(FREE_TRIAL_LIMITS);

  quota.documents = documentsLimit;
  remaining.directTemplates = Math.max(remaining.directTemplates - directTemplates, 0);

  // for new users, we let them have free documents.
  if (documents < FREE_TRIAL_LIMITS.documents) {
    remaining.documents = Math.max(FREE_TRIAL_LIMITS.documents - documents, 0);
  } else {
    remaining.documents = Math.max(documentsLimit - documents, 0);
  }

  console.log({
    quota,
    remaining,
  });

  return {
    quota,
    remaining,
  };
}
