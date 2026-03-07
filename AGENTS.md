Always use playwright-cli, instead of playwright tests, and playwright-mcp

## Preferences sync rule

The `PreferencesDialog` and `NotificationsDialog` forms in `src/components/profile-sheet-content.tsx` and the `UserPreferences` type in `src/lib/preferences-store.ts` must stay in sync:

- **Adding a field**: add it to `UserPreferences`, `DEFAULT_PREFERENCES`, and add a matching form control in `PreferencesDialog` or `NotificationsDialog`.
- **Removing a field**: remove from all three locations.
- **Internal-only fields** (`lastTopicId`, `lastProjectId`, `lastActiveView`, `agentOpen`, `templateId`) are not shown in any form — they are managed programmatically.
- **PreferencesDialog** manages: `vizType`, `dailyMinutes`, `difficulty`, `reviewFrequency`, `timezone`.
- **NotificationsDialog** manages: `emailNotifications`, `weeklyDigest`, `dailyReminders`.
- Every user-facing preference must appear in both the type and the appropriate dialog form.
