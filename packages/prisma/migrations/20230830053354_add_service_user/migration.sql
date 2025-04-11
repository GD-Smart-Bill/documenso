INSERT INTO "User" ("email", "name") VALUES (
  'serviceaccount@smartbill.co.il',
  'Service Account'
) ON CONFLICT DO NOTHING;
