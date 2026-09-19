# KNT V1 Acceptance Matrix

The AutoBot uses this as a behavioural target alongside the durable queue. A feature is not complete because a page renders; the business action must persist, reload and remain traceable.

| Area | Must prove |
|---|---|
| Auth | Authenticated engineer can sign in; identity is available for mutations; signed-out users cannot access operational data |
| Customers/Sites | Create and reload customers and sites; sites belong to customers |
| Fleet | Create/edit/reload forklift; customer/site relationship persists; plant/make/model/serial/hours/status/due dates persist |
| Forklift history | Detail view exposes jobs and service/compliance history; moving a forklift between sites does not erase history |
| Jobs | Create/reload job; correct customer/site/forklift linkage; job number/status/date/work/problem persist |
| Evidence | Multiple photos remain attached to the job with tags/captions; original paper source remains attached; signed URLs work for private evidence |
| Signature | Customer signature is stored against the job and remains available after reload |
| Job completion | Completing a job changes status and creates an audit-history record |
| Service/LOLER | Record events; distinguish service and LOLER; safely update next due dates; display due/overdue state |
| Documents | Forklift documents/certificates persist and can be retrieved securely |
| Parts | Parts catalogue persists; quantities/costs are represented accurately |
| Suppliers | Supplier records persist; supplier orders and lines persist; order lines can link to jobs |
| Job parts | Parts consumed by a job persist with quantity/cost context |
| Commercial | Quote/invoice records persist; calculations agree with configured VAT/rates; invoice review status is explicit |
| Invoice safety | No customer invoice is automatically emailed |
| Paper capture | Original upload remains source of truth; extraction is editable; uncertainty is visible; no fabricated extraction |
| Voice | Speech/transcript becomes editable job information without silently overwriting confirmed values |
| Calendar | Compliance dates are visible centrally and from the forklift; overdue/due-soon/upcoming states are correct |
| Error handling | Network/database/storage failures produce understandable recovery states rather than silent failure |
| Mobile | Core engineer flow is usable one-handed on a phone-sized viewport |
| Security | RLS/storage rules do not expose private operational files to anonymous users |
| Build | `npm run build` passes after the batch |

## Release rule

Do not mark an area complete unless the implementation is integrated into the actual application and the acceptance behaviour can be verified. Cosmetic completeness does not count.
