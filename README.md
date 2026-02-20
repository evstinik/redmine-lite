# Redmine Lite

React client for Redmine, that uses REST API

## Configuration

Copy `.env.example` to `.env.local` and fill in your values:

```
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `VITE_REDMINE_URL` | Yes | Full URL of your Redmine instance (e.g. `https://redmine.example.com`) |
| `VITE_API_URL` | Yes | API subpath prefix used by the frontend (e.g. `/api`) |
| `VITE_JIRA_URL` | Yes (for Jira import) | Full URL of your Jira instance (e.g. `https://jira.example.com`) |
| `VITE_TRACKER_USER_STORY_ID` | No | Redmine tracker ID for User Story type (default: `14`) |
| `VITE_TRACKER_BUG_ID` | No | Redmine tracker ID for Bug type (default: `1`) |
| `REDMINE_URL` | Scripts only | Redmine URL used by CLI scripts (can match `VITE_REDMINE_URL`) |
| `SCRIPT_REDMINE_ACCESS_TOKEN` | Scripts only | Redmine personal access token for CLI scripts |
| `SCRIPT_REDMINE_PROJECT_ID` | No | Project ID/identifier to filter script output (prompted if omitted) |
| `SCRIPT_REDMINE_TIME_SPAN` | No | Date range for script export, e.g. `2024-01-01,2024-01-31` (prompted if omitted) |

## Scripts instructions

### Load entries

1. Install dependencies (`yarn install`)
2. Copy `.env.example` to `.env.local` and fill in at least `REDMINE_URL` and `SCRIPT_REDMINE_ACCESS_TOKEN`. You can get your access token on your Redmine profile page (right panel).

Optionally set `SCRIPT_REDMINE_PROJECT_ID` and `SCRIPT_REDMINE_TIME_SPAN`; if omitted the script will prompt for them interactively.

3. Run `yarn timelog:export`
