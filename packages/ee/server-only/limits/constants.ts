import type { TLimitsSchema } from './schema';

export const FREE_PLAN_LIMITS: TLimitsSchema = {
  documents: 20,
  recipients: 10,
  directTemplates: 3,
};

export const INACTIVE_PLAN_LIMITS: TLimitsSchema = {
  documents: 0,
  recipients: 0,
  directTemplates: 0,
};

export const PAID_PLAN_LIMITS: TLimitsSchema = {
  documents: Infinity,
  recipients: Infinity,
  directTemplates: Infinity,
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
