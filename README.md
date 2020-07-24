# Redmine Lite

React client for Redmine, that uses REST API

## Configuration

In root directory create `.env.local` file and define two variables:
- `REDMINE_URL` - URL of running redmine instance, without trailing slash (for example, https://redmine.org)
- `REACT_APP_API_URL` - Subpath for the API, without trailing slash (for example, /api). *It could be anything*.

So your .env.local may look like this:
```
REDMINE_URL=https://redmine.org
REACT_APP_API_URL=/api
```