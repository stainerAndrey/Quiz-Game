# How to Use Multiple Participants in Same Browser

## Overview
The quiz game now supports **username-based authentication**, allowing you to open multiple browser windows/tabs on the same device with different usernames.

## Quick Start

### Option 1: Multiple Browser Tabs (Same Browser)
1. Open your browser and go to the quiz URL (e.g., `http://192.168.1.100:5173`)
2. Enter username "Player1" and click "Join Quiz"
3. Open a **new tab** in the same browser
4. Go to the same URL
5. Enter username "Player2" and click "Join Quiz"
6. Repeat for as many players as needed

✅ Each tab maintains its own session with a different username

### Option 2: Multiple Browser Windows
1. Open first browser window → join as "Alice"
2. Open second browser window → join as "Bob"
3. Both can participate independently

### Option 3: Different Browsers
1. Chrome → join as "Player1"
2. Firefox → join as "Player2"
3. Edge → join as "Player3"

### Option 4: Incognito/Private Windows
1. Regular window → join as "Alice"
2. Incognito window → join as "Bob"
3. Each can participate independently

## Important Rules

### ✅ What Works
- ✅ Multiple tabs in the same browser with **different usernames**
- ✅ Multiple windows in the same browser with **different usernames**
- ✅ Same username in different browsers (after first one disconnects)
- ✅ Usernames are case-sensitive: "Alice" ≠ "alice"

### ❌ What Doesn't Work
- ❌ Same username in multiple tabs/windows simultaneously
- ❌ Empty usernames
- ❌ Username already in use by another active session

## Error Messages

### "This username is already in use"
**Problem**: Someone else (or another tab) is already using this username.

**Solution**: 
- Choose a different username (e.g., "Alice2", "Bob", "Player3")
- Or wait for the other session to disconnect

### "Username cannot be empty"
**Problem**: You tried to join without entering a username.

**Solution**: Enter a valid username before clicking "Join Quiz"

## Testing Multiple Players on One Device

### Scenario 1: Testing with 3 Players
```
Tab 1: http://localhost:5173 → Username: "Player1"
Tab 2: http://localhost:5173 → Username: "Player2"
Tab 3: http://localhost:5173 → Username: "Player3"
```

All three tabs can participate in the quiz independently!

### Scenario 2: Testing with Named Players
```
Tab 1: Username: "Alice"
Tab 2: Username: "Bob"
Tab 3: Username: "Charlie"
```

### Scenario 3: Teams
```
Tab 1: Username: "Team Red"
Tab 2: Username: "Team Blue"
Tab 3: Username: "Team Green"
```

## For Quiz Administrators

### Resetting Between Quiz Sessions
After a quiz is finished, use the admin reset function to clear all participants:

**Option 1: Via API**
```bash
curl -X POST "http://localhost:8000/admin/reset?admin_token=changeme"
```

**Option 2: Via Admin Interface**
Click the "Reset Quiz" button in the presenter view

This will:
- Clear all participants
- Clear all answers
- Reset quiz state
- Allow everyone to rejoin with new (or same) usernames

### Viewing Active Participants
The admin/presenter view shows all active participants and their usernames.

## Technical Details

### How It Works
1. When you join with a username, it's stored in memory on the server
2. The username becomes your unique identifier
3. All your answers are linked to your username
4. The session persists until:
   - The quiz is reset by admin
   - The server restarts
   - You close all browser tabs with that username

### No Password Required
- Usernames are **not password-protected**
- This is intentional for quick, casual quiz sessions
- Anyone can claim any available username
- Only one person can use a username at a time

### Data Persistence
- Participant data is stored in `backend/quiz_state.json`
- Survives server restarts (until admin reset)
- Each username can only be used once per quiz session

## Examples

### Example 1: Family Quiz Night
```
Dad's Phone (Chrome):     → Username: "Dad"
Mom's Phone (Safari):     → Username: "Mom"
Laptop Tab 1:             → Username: "Kid1"
Laptop Tab 2:             → Username: "Kid2"
```

### Example 2: Classroom
```
Teacher Computer:         → Username: "Teacher" (presenter mode)
Student 1 Device:         → Username: "Alice"
Student 2 Device:         → Username: "Bob"
Demo Computer Tab 1:      → Username: "Team1"
Demo Computer Tab 2:      → Username: "Team2"
```

### Example 3: Solo Testing
```
Browser Tab 1: → Username: "TestPlayer1"
Browser Tab 2: → Username: "TestPlayer2"
Browser Tab 3: → Username: "TestPlayer3"
```
Test the entire quiz flow by yourself!

## Troubleshooting

### Issue: "This username is already in use"
**Check**:
- Did you already join in another tab/window?
- Is someone else using that username?

**Solution**: Choose a different username

### Issue: Lost connection after refresh
**Why**: The WebSocket connection is re-established automatically

**Note**: Your username is NOT stored in cookies/localStorage, so refreshing the page will ask you to join again

### Issue: Want to change username
**Solution**: 
1. Close the current tab
2. Open a new tab
3. Join with a new username

(Your old username remains reserved until admin resets the quiz)

## Running the Test Script

To verify everything is working:

```powershell
# Start the backend server first
cd backend
..\venv\Scripts\python.exe -m uvicorn app.main:app --reload

# In another terminal, run the test
python test_username_auth.py
```

The test will verify:
- ✅ Joining with unique usernames works
- ✅ Duplicate usernames are rejected
- ✅ Case sensitivity works correctly
- ✅ Participant lookup works

## Summary

🎯 **Key Takeaway**: Each browser tab can now have its own participant session with a unique username. This makes it easy to test multiple players on one device or allow multiple people to play from the same computer!

