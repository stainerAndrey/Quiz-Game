# Username-Based Authentication Changes

## Summary
The quiz game has been modified to use **username-based authentication** instead of browser cookie/localStorage-based identification. This allows multiple participants to join from the same browser in different windows/tabs.

## Changes Made

### Frontend (`frontend/src/components/ParticipantApp.jsx`)
1. **Removed localStorage dependency**: No longer stores `participant_id` in browser storage
2. **Username state**: Changed from `participantId` to `username` and `isLoggedIn` states
3. **Login flow**: Users enter a username and join directly without UUID generation
4. **Session-based**: Each browser tab/window maintains its own independent session
5. **API calls updated**: All API calls now use `username` instead of `participant_id`

### Backend (`backend/app/main.py`)
1. **Username as key**: Participants are now stored with username as the dictionary key instead of UUID
2. **Removed UUID generation**: No longer generates UUIDs for participants
3. **Case-sensitive usernames**: Usernames are case-sensitive (e.g., "Alice" and "alice" are different)
4. **Updated endpoints**:
   - `/join` - Returns username instead of participant_id
   - `/participant/{username}` - Changed from participant_id to username
   - `/answer_status/{username}/{question_id}` - Uses username parameter
   - `/answer` - Accepts username in request body as participant_id

### Backend Models (`backend/app/models.py`)
1. **JoinResponse**: Changed from `participant_id: str` to `username: str`

## How It Works Now

### Joining the Quiz
1. User opens the quiz app in browser
2. Enters a unique username (e.g., "Alice")
3. If username is available, they join immediately
4. If username is taken, they see an error and must choose a different one

### Multiple Windows/Tabs
- ✅ **Same browser, different tabs**: You can open multiple tabs with different usernames
- ✅ **Different browsers**: Each browser can use the same or different usernames
- ✅ **Same device**: Multiple participants can join from one device

### Example Scenarios
```
Browser 1, Tab 1: Username "Alice" ✅
Browser 1, Tab 2: Username "Bob" ✅
Browser 1, Tab 3: Username "Alice" ❌ (username already taken)
Browser 2, Tab 1: Username "Alice" ❌ (username already taken)
```

## Testing the Changes

### Test Case 1: Multiple Tabs, Same Browser
1. Open browser tab 1, join as "Alice"
2. Open browser tab 2, join as "Bob"
3. Both should be able to participate independently
4. Try opening tab 3 and joining as "Alice" - should see error

### Test Case 2: Unique Usernames
1. Try to join with an empty username - should see validation error
2. Try to join with a username already in use - should see "already in use" error
3. Join with a unique username - should succeed

### Test Case 3: Answer Persistence
1. Join as "Alice" in tab 1
2. Answer a question
3. Refresh the page or open new tab with "Alice" - should see error (username taken)
4. Open new tab with "Bob" - should work and show different answer state

## API Changes

### Before (UUID-based)
```javascript
// Join
POST /join
{ "name": "Alice" }
Response: { "participant_id": "a1b2c3d4-..." }

// Answer status
GET /answer_status/a1b2c3d4-.../1

// Submit answer
POST /answer
{ "participant_id": "a1b2c3d4-...", ... }
```

### After (Username-based)
```javascript
// Join
POST /join
{ "name": "Alice" }
Response: { "username": "Alice" }

// Answer status
GET /answer_status/Alice/1

// Submit answer
POST /answer
{ "participant_id": "Alice", ... }
```

## Backward Compatibility
⚠️ **Breaking Change**: This is a breaking change. Old clients using localStorage-based participant_id will no longer work. All participants need to rejoin with usernames.

## Security Notes
- Usernames are **case-sensitive**
- No password/authentication required
- Anyone can use any available username
- Admin should use `/admin/reset` to clear all participants between quiz sessions

## Future Improvements (Optional)
1. Add password protection for usernames
2. Add session timeout/expiry
3. Add ability to "logout" and change username
4. Add username length validation (currently limited to 40 chars in backend)
5. Add pattern validation (e.g., alphanumeric only)

