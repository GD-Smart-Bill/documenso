import { DocumentSource } from '@prisma/client';
import { DateTime } from 'luxon';

import { prisma } from '@documenso/prisma';

import { FREE_PLAN_LIMITS, TEAM_PLAN_LIMITS } from './constants';
import { ERROR_CODES } from './errors';
import type { TLimitsResponseSchema } from './schema';

export type GetServerLimitsOptions = {
  email: string;
  teamId?: number | null;
};

export const getServerLimits = async ({
  email,
  teamId,
}: GetServerLimitsOptions): Promise<TLimitsResponseSchema> => {
  // if (!IS_BILLING_ENABLED()) {
  // 	return {
  // 		quota: SELFHOSTED_PLAN_LIMITS,
  // 		remaining: SELFHOSTED_PLAN_LIMITS,
  // 	};
  // }

  if (!email) {
    throw new Error(ERROR_CODES.UNAUTHORIZED);
  }

  return teamId ? handleTeamLimits({ email, teamId }) : handleUserLimits({ email });
};

type HandleUserLimitsOptions = {
  email: string;
};

const handleUserLimits = async ({ email }: HandleUserLimitsOptions) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
    // include: {
    //   subscriptions: true,
    // },
  });

  if (!user) {
    throw new Error(ERROR_CODES.USER_FETCH_FAILED);
  }

  const documentsLimit = user.documentsLimit ?? 0;
  const quota = structuredClone(FREE_PLAN_LIMITS);
  const remaining = structuredClone(FREE_PLAN_LIMITS);

  // const activeSubscriptions = user.subscriptions.filter(
  // 	({ status }) => status === SubscriptionStatus.ACTIVE,
  // );

  // if (activeSubscriptions.length > 0) {
  // 	const documentPlanPrices = await getDocumentRelatedPrices();

  // 	for (const subscription of activeSubscriptions) {
  // 		const price = documentPlanPrices.find(
  // 			(price) => price.id === subscription.priceId,
  // 		);

  // 		if (
  // 			!price ||
  // 			typeof price.product === "string" ||
  // 			price.product.deleted
  // 		) {
  // 			continue;
  // 		}

  // 		const currentQuota = ZLimitsSchema.parse(
  // 			"metadata" in price.product ? price.product.metadata : {},
  // 		);

  // 		// Use the subscription with the highest quota.
  // 		if (
  // 			currentQuota.documents > quota.documents &&
  // 			currentQuota.recipients > quota.recipients
  // 		) {
  // 			quota = currentQuota;
  // 			remaining = structuredClone(quota);
  // 		}
  // 	}

  // 	// Assume all active subscriptions provide unlimited direct templates.
  // 	remaining.directTemplates = Number.POSITIVE_INFINITY;
  // }

  const [allTimeDocuments, documents, directTemplates] = await Promise.all([
    prisma.document.count({
      where: {
        userId: user.id,
        // teamId: null,
        source: {
          not: DocumentSource.TEMPLATE_DIRECT_LINK,
        },
      },
    }),

    prisma.document.count({
      where: {
        userId: user.id,
        // teamId: null,
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
        userId: user.id,
        // teamId: null,
        directLink: {
          isNot: null,
        },
      },
    }),
  ]);

  remaining.directTemplates = Math.max(remaining.directTemplates - directTemplates, 0);
  remaining.documents =
    allTimeDocuments > quota.documents
      ? Math.max(documentsLimit - documents, 0)
      : Math.max(quota.documents - allTimeDocuments, 0);
  quota.documents = documentsLimit;

  return {
    quota,
    remaining,
  };
};

type HandleTeamLimitsOptions = {
  email: string;
  teamId: number;
};

const handleTeamLimits = async ({ email, teamId }: HandleTeamLimitsOptions) => {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          user: {
            email,
          },
        },
      },
    },
    include: {
      // subscription: true,
      owner: {
        select: {
          documentsLimit: true,
        },
      },
    },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  const documentsLimit = team.owner.documentsLimit ?? 0;

  const [allTimeDocuments, documents, directTemplates] = await Promise.all([
    prisma.document.count({
      where: {
        userId: team.ownerUserId,
        // teamId: null,
        source: {
          not: DocumentSource.TEMPLATE_DIRECT_LINK,
        },
      },
    }),

    prisma.document.count({
      where: {
        OR: [
          { userId: team.ownerUserId },
          // {
          // 	teamId: teamId,
          // },
        ],
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
        userId: team.ownerUserId,
        // teamId: teamId,
        directLink: {
          isNot: null,
        },
      },
    }),
  ]);

  // const { subscription } = team;

  // if (subscription && subscription.status === SubscriptionStatus.INACTIVE) {
  // 	return {
  // 		quota: {
  // 			documents: 0,
  // 			recipients: 0,
  // 			directTemplates: 0,
  // 		},
  // 		remaining: {
  // 			documents: 0,
  // 			recipients: 0,
  // 			directTemplates: 0,
  // 		},
  // 	};
  // }

  const quota = structuredClone(TEAM_PLAN_LIMITS);
  const remaining = structuredClone(TEAM_PLAN_LIMITS);

  remaining.documents =
    allTimeDocuments > quota.documents
      ? Math.max(documentsLimit - documents, 0)
      : Math.max(quota.documents - allTimeDocuments, 0);
  quota.documents = documentsLimit;

  return {
    quota,
    remaining,
  };
};
