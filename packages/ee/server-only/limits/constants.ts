import type { TLimitsSchema } from './schema';

export const FREE_PLAN_LIMITS: TLimitsSchema = {
  documents: 20,
  recipients: 10,
  directTemplates: 3,
};

export const TEAM_PLAN_LIMITS: TLimitsSchema = {
  documents: Number.POSITIVE_INFINITY,
  recipients: Number.POSITIVE_INFINITY,
  directTemplates: Number.POSITIVE_INFINITY,
};

export const SELFHOSTED_PLAN_LIMITS: TLimitsSchema = {
  documents: Number.POSITIVE_INFINITY,
  recipients: Number.POSITIVE_INFINITY,
  directTemplates: Number.POSITIVE_INFINITY,
};
