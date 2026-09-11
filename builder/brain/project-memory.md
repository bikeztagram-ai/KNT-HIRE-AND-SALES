# KNT Project Memory

## Confirmed business requirements
KNT Hire & Sales Ltd operates a forklift hire/sales/service business. The system must support shared cloud data for two engineers and provide permanent records for customers, sites, forklifts, jobs, parts, supplier orders, service/LOLER records, quotes, invoices and payments.

Core hierarchy:
Customer → Site → Forklift → Job/Problem → Work + Parts + Photos + Hours → Completion/Signature → Quote/Invoice/Payment.

Forklifts retain history when moved between sites. Jobs and photo evidence remain attached to the relevant forklift/job. Supplier paperwork can be linked to jobs. Invoices are generated for human review and are not automatically sent to customers.

## Product direction
Android-friendly responsive web app/PWA, shared authenticated cloud data, with a production database and file storage.

## Non-goals
Do not treat the original paper jobsheet as the whole product. Do not build isolated features without preserving the business hierarchy and auditability.

## Decisions still requiring validation
Exact technology stack, authentication roles, pricing/tax rules, invoice numbering, data retention, backup strategy, and production deployment configuration.

## Current state
Repository is at the foundation stage. No production application feature should be assumed complete unless verified in the repository and against acceptance criteria.
