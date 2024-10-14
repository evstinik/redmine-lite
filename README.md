# Redmine Lite

React client for Redmine, that uses REST API

## Configuration

In root directory create `.env.local` file and define two variables:

- `REDMINE_URL` - URL of running redmine instance, without trailing slash (for example, <https://redmine.org>)
- `VITE_API_URL` - Subpath for the API, without trailing slash (for example, /api). _It could be anything_.

So your .env.local may look like this:

```
VITE_REDMINE_URL=https://redmine.org
VITE_API_URL=/api
```

## Scripts instructions

### Load entries

1. Install dependencies (`yarn install`)
2. Create `.env.local` file and put your values instead of placeholders. You can get your access token on your profile page (right panel).

```
REDMINE_URL=https://redmine.example.com
SCRIPT_REDMINE_ACCESS_TOKEN=<YOUR-ACCESS-TOKEN>
```

Optionally, you can add following variables. If they are not set script will ask for values interactively.

```
SCRIPT_REDMINE_PROJECT_ID=<PROJECT-ID-NUMBER-OR-STRING>
SCRIPT_REDMINE_TIME_SPAN=2023-02-01,2023-02-24
```

3. Run `yarn timelog:export`
