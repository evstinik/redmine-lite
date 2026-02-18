# Jira Integration Setup Guide

## Problem: 401 Authentication Error

If you're getting a 401 error when importing Jira tickets, it means the authentication credentials are not properly configured.

## Solution: Configure Jira Authentication

There are three ways to authenticate with Jira. Choose the one that works for your setup:

### Option 1: Username + API Token (Recommended)

This is the most common method for Jira Cloud:

1. **Generate a Jira API Token:**
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Click "Create API token"
   - Give it a name (e.g., "Redmine Lite")
   - Copy the generated token

2. **Update your `.env.local` file:**
   ```env
   VITE_JIRA_USERNAME=your.email@example.com
   VITE_JIRA_API_TOKEN=your_generated_api_token_here
   VITE_JIRA_DOMAIN=https://your-domain.atlassian.net
   ```

3. **Remove or comment out `VITE_JIRA_ACCESS_TOKEN`** if present

### Option 2: Pre-encoded Basic Auth Token

If you have a Base64-encoded username:token string:

1. **Encode your credentials:**
   ```bash
   echo -n "your.email@example.com:your_api_token" | base64
   ```

2. **Update your `.env.local` file:**
   ```env
   VITE_JIRA_ACCESS_TOKEN=your_base64_encoded_credentials
   VITE_JIRA_DOMAIN=https://your-domain.atlassian.net
   ```

### Option 3: Bearer Token (Personal Access Token)

For Jira Data Center/Server with PAT:

1. **Generate a Personal Access Token** in Jira

2. **Update your `.env.local` file:**
   ```env
   VITE_JIRA_ACCESS_TOKEN=your_personal_access_token
   VITE_JIRA_DOMAIN=https://your-jira-server.com
   ```

## Current Configuration Check

Your current `.env.local` has:
- `VITE_JIRA_API_TOKEN`: ✓ Present
- `VITE_JIRA_USERNAME`: ✗ **EMPTY** (This is likely causing the 401 error!)
- `VITE_JIRA_ACCESS_TOKEN`: ✓ Present (but may be invalid)
- `VITE_JIRA_DOMAIN`: ✓ Present

## Recommended Fix for Your Setup

Since you have `VITE_JIRA_API_TOKEN` but `VITE_JIRA_USERNAME` is empty, do this:

1. **Add your Jira email to `.env.local`:**
   ```env
   VITE_JIRA_USERNAME=your.email@vwgroup.com
   ```

2. **Verify your API token is correct:**
   - The current token is: `vwhAtOMN1QTLEs0VO3JMyydmTxbmm6yF3qHWo6`
   - If this doesn't work, generate a new one

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

## Testing the Configuration

After updating the credentials:

1. Stop the dev server (Ctrl+C)
2. Start it again: `npm run dev`
3. Try importing a Jira ticket (e.g., "AP-41414")
4. Check the browser console for authentication logs

## Troubleshooting

### Still getting 401?

1. **Verify credentials are correct:**
   - Test your credentials directly with Jira API:
     ```bash
     curl -u "your.email@example.com:your_api_token" \
       "https://your-domain.atlassian.net/rest/api/2/myself"
     ```

2. **Check Jira domain is correct:**
   - Ensure `VITE_JIRA_DOMAIN` matches your Jira instance
   - Don't include trailing slashes

3. **Check API token hasn't expired:**
   - Jira API tokens don't expire, but they can be revoked
   - Generate a new one if needed

### Getting 403 (Forbidden)?

- Your account doesn't have permission to view that specific issue
- Ask your Jira admin to grant you the necessary permissions

### Getting 404 (Not Found)?

- The ticket number is incorrect
- You don't have access to that project

## For VW DevStack Jira

Based on your domain (`https://devstack.vwgroup.com`), you're using an enterprise Jira instance. You'll need:

1. Your VW email address
2. Either:
   - A Personal Access Token from DevStack Jira, OR
   - Your VW credentials to generate the Basic Auth token

Contact your DevStack admin if you need help getting credentials.
