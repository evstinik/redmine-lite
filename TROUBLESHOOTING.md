# Troubleshooting "Project cannot be blank" Error

## Quick Checklist

When you get the "Project cannot be blank" error, check these items in order:

### 1. ✅ Check Browser Console
Open the browser developer console (F12) and look for these logs:
- `JiraImport - Debug Info:` - Shows available projects and selected project
- `➜ Creating Redmine issue in project:` - Shows which project ID is being used
- `RedmineService.createIssue called with:` - Shows the exact data being sent
- `RedmineService HTTP Request:` - Shows the full HTTP request payload

### 2. ✅ Verify Project Selection

**Problem:** You have "Any project" selected in the dropdown

**Solution:** 
1. In the UI, find the "Project" dropdown
2. Change it from "Any project" to a **specific project name**
3. Try importing the Jira ticket again

### 3. ✅ Check if Projects Are Loaded

Look in the console for `JiraImport - Debug Info:`. You should see:
```javascript
{
  projects: [
    { id: 1, name: "My Project" },
    { id: 2, name: "Another Project" }
  ],
  "projects length": 2
}
```

**If `projects: undefined` or `projects length: 0`:**
- Your Redmine API key might be invalid
- You don't have access to any projects in Redmine
- Projects haven't loaded yet (wait a moment and try again)

### 4. ✅ Verify API Key

Check the console for `apiKey: '***set***'`. If you see `apiKey: 'NOT SET'`:
1. Log out and log back in
2. Check your Redmine API key is correct
3. Verify you're logged into Redmine

### 5. ✅ Check the Actual Request Payload

Look for `RedmineService HTTP Request:` in the console. You should see:
```json
{
  "method": "POST",
  "url": "/api/issues.json",
  "body": {
    "issue": {
      "project_id": 1,  // <-- This should be a NUMBER, not null/undefined
      "subject": "AP-12345 Some ticket title",
      "description": "...",
      "tracker_id": 1
    }
  }
}
```

**If `project_id` is `null`, `undefined`, or `0`:**
- The project selection logic failed
- Check the earlier logs to see why

## Common Scenarios

### Scenario 1: "Any project" is Selected
**Console shows:**
```
projectId: 0
```

**Solution:** Select a specific project from the dropdown

### Scenario 2: No Projects Available
**Console shows:**
```
projects: []
projects length: 0
```

**Solution:** 
1. Create at least one project in Redmine first
2. Make sure your Redmine user has access to at least one project
3. Check your API key has the right permissions

### Scenario 3: Projects Not Loaded Yet
**Console shows:**
```
projects: undefined
```

**Solution:** 
1. Wait a few seconds for projects to load
2. Refresh the page
3. Check network tab for any failed API calls to `/api/projects.json`

### Scenario 4: Project ID Is Not Being Set
**Console shows:**
```
✗ Project selection failed: No project selected.
```

**Solution:** This means the logic couldn't determine a valid project ID. Check:
1. Is a project selected in the dropdown?
2. Are there any projects available?
3. Check all the debug logs above this error

## Testing Steps

1. **Open browser console** (F12)
2. **Navigate to Issues Search** page
3. **Select a specific project** from the dropdown (not "Any project")
4. **Search for something** that returns no results
5. **Scroll down** to see the Jira import section
6. **Enter a Jira ticket number** (e.g., AP-41414)
7. **Click "Import from Jira"**
8. **Watch the console logs** - they will show exactly what's happening

## Expected Console Output (Success)

```
JiraImport - Debug Info: {
  projectId: 1,
  projects: [{id: 1, name: "My Project"}],
  projects length: 1,
  apiKey: "***set***",
  user: {id: 123, name: "John Doe"}
}
✓ Using selected project: 1
➜ Creating Redmine issue in project: 1
Fetching Jira issue: AP-41414 from proxy: /jira-api/rest/api/2/issue/AP-41414
✓ Successfully fetched Jira issue: AP-41414
➜ Creating Redmine issue with data: {
  project_id: 1,
  subject: "AP-41414 Some ticket title...",
  ...
}
RedmineService.createIssue called with: {
  "project_id": 1,
  "subject": "AP-41414 Some ticket title",
  ...
}
RedmineService HTTP Request: {
  "method": "POST",
  "body": "{\"issue\":{\"project_id\":1,\"subject\":\"AP-41414...\"}}"
}
```

## Still Not Working?

If you've checked all the above and it still doesn't work:

1. **Copy all console logs** and share them
2. **Check the Network tab** in browser dev tools for the POST request to `/api/issues.json`
3. **Look at the Request Payload** - is `project_id` actually in the JSON being sent?
4. **Check the Response** - what exactly does Redmine return?

## Quick Fix Commands

If nothing else works, try:

1. **Hard refresh:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Clear cache and reload**
3. **Restart dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```
