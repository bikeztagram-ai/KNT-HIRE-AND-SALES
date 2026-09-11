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

## KNT AutoBot file/path contract
The KNT repository is the only product context for the autonomous builder. The exact filenames and repository paths in `builder/brain/feature-objectives.json` are authoritative. Never rename, substitute, guess or invent a product filename when selecting or editing work.

The Aider feature engineer receives those exact objective-scoped paths and, when all paths are under `src/`, runs from the `src/` subtree with the exact relative filenames. Repository intelligence is generated from `git ls-files` for the current KNT repository and is never imported from another project.

Every objective file must exist and be tracked before the autonomous feature pass starts. The KNT file-contract check must remain green. Product-engineering prompts must use only KNT business requirements, current repository files and current KNT contracts.

## Decisions still requiring validation
Exact technology stack, authentication roles, pricing/tax rules, invoice numbering, data retention, backup strategy, and production deployment configuration.

## Current state
Repository is at the foundation stage. No production application feature should be assumed complete unless verified in the repository and against acceptance criteria.
