# Installation guide (Android tablet)

Nothing gets installed on the tablet. Everything runs in Claude Code cloud sessions, and GitHub
stores the system.

## 1. What you need
| Item | Cost | Notes |
|---|---|---|
| GitHub account | Free | Keep this repository **private** (Settings → General → Danger Zone → Change visibility) |
| Claude subscription with Claude Code | Paid (your existing plan) | Used at **claude.ai/code** or in the Claude Android app |
| GitHub Android app (optional) | Free | Lets you read files, review pull requests and see Actions results |

You don't need API keys, servers, Node/Python installs or paid tools.

## 2. Connect GitHub to Claude
1. Open **claude.ai/code** in Chrome on the tablet (or open the Claude app and go to Code).
2. If prompted, connect GitHub and install the **Claude GitHub App** on this repository
   (https://claude.ai/connect-github).
3. Start a new session and pick the repository `RyomenArker-dev/Ryomen-Everthing`.

## 3. Cloud environment
The default environment works as it is:
- Python 3 and Node are preinstalled, so the scripts and tests run with no setup.
- Chromium and Playwright are preinstalled, so the website checks work.
- **No environment variables or secrets are needed.** If an approved integration needs one later,
  add it in the environment's settings (the cloud environment menu in the session title bar, then Edit).
  Never put it in a file in this repo.

## 4. First session checklist
Ask Claude:
1. "Run the quality checks and tests." Both should pass (see [QUALITY.md](QUALITY.md)).
2. "Help me fill in agency/services.md, pricing.md and positioning.md." This uses the business-strategist.
   Only you decide prices.
3. "Create a test client called Demo Co and generate a proposal for website and SEO." This tries out the full flow.

## 5. Daily use
- Start a session on the repo and say what you need. Claude picks the right agent and skill
  (see the table in [CLAUDE.md](../CLAUDE.md)).
- Claude drafts. You approve anything that is sent, published, deployed or paid for.
- Changes to the system (templates, SOPs, scripts) are committed on a branch. Ask Claude to open a
  pull request and merge it in the GitHub app when you're happy.

## Keeping client files

**Read this.** You chose to keep client data **out of git**. A cloud session's files live in a
temporary container that is reclaimed after a period of inactivity. That means:

> Client folders (`clients/<slug>/`) and lead data (`leads/data/`) created in a session will be
> **lost** when that session's container is reclaimed, unless you copy them somewhere first.

Until you choose a permanent option, use these habits:
1. **Finish client work within one session** and copy the final deliverables out. Open the file
   in the Claude app and copy its text into your own storage, such as Google Drive or Notes.
2. Keep the **source of truth for client facts outside this repo** (your email, Drive or notes), and
   paste the brief in when you start a session.

Permanent options (see [ROADMAP.md](ROADMAP.md), phase 1). Nothing is built until you choose one:
| Option | Effort | Privacy |
|---|---|---|
| A. A second **private** GitHub repo just for client data, attached to sessions when needed | Low | Good (GitHub private repo) |
| B. Save deliverables to **Google Drive** through a connector | Medium | Good. The connector needs testing |
| C. Encrypted archive committed to git | Medium | Strong, but you must manage a password |

## 6. Updating installed third-party skills
Third-party skills are recorded in `skills-lock.json`. To update them, ask Claude:
"Update the installed skills with `npx skills update`, review the changes, and run the checks."
Never edit them by hand. Put customisations in `ryomen-*` skills instead.

## Troubleshooting
| Problem | Fix |
|---|---|
| Push refused (403) | Reconnect GitHub at https://claude.ai/connect-github and check the Claude GitHub App is installed on the repo |
| Checks fail with "private data … tracked" | A client file was force-added. Ask Claude to remove it from git with `git rm --cached` (this keeps the file) |
| A skill doesn't trigger | Name it directly, e.g. "use the ryomen-proposal skill" |
| Claude asks permission for a command | That's the safety settings in `.claude/settings.json`. Approve only if you agree |
