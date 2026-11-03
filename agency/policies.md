# Agency policies

## Approvals
- Nothing is sent, published, deployed or paid for without the owner's explicit approval for that
  specific action (see `ryomen-approval-gate`).
- Client approvals of deliverables are recorded in `clients/<slug>/log.md`.

## Data handling
- Client and lead data stay in `clients/<slug>/` and `leads/data/`, which are git-ignored.
- One client per folder; no client data reused for another client.
- Only collect what the project needs. Delete client data on request or at offboarding
  (see `sops/client-offboarding.md`), with owner approval.
- Secrets (passwords, API keys) are never stored in files in this repo. Use a password manager.

## Honesty
- No invented results, testimonials, reviews or credentials.
- No guaranteed rankings, followers or revenue.

## Revisions, timelines, cancellations
- Revisions: TODO: owner to set
- Response time: TODO
- Cancellation/refund: TODO
