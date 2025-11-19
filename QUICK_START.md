# 🚀 QUICK START - Multiple Participants

## TL;DR - Just Want to Test It?

### 3 Steps to Test Multiple Participants

```powershell
# Step 1: Start the app
.\start.ps1

# Step 2: Open browser tabs
# Tab 1 → http://localhost:5173 → Enter "Alice" → Join
# Tab 2 → http://localhost:5173 → Enter "Bob" → Join  
# Tab 3 → http://localhost:5173 → Enter "Charlie" → Join

# Step 3: Done! All three can participate independently! ✅
```

That's it! Each tab is now a different participant.

---

## What You Can Do Now

### ✅ Open Multiple Tabs
```
Same browser, many tabs = many participants
```

### ✅ Each Tab Has Own Username
```
Tab 1: "Alice"
Tab 2: "Bob"
Tab 3: "Charlie"
```

### ✅ All Participate Independently
```
Alice answers: Option A
Bob answers: Option B
Charlie answers: Option A
```

---

## Common Questions

**Q: Can I use the same username twice?**
A: No, each username can only be used once. Try "Alice2" if "Alice" is taken.

**Q: What happens if I refresh?**
A: You'll need to re-enter your username (it's not saved in cookies).

**Q: Can different devices use same username?**
A: Not simultaneously. Only one "Alice" can be active at a time.

**Q: Is it case-sensitive?**
A: Yes! "Alice" and "alice" are different usernames.

---

## Testing Checklist

- [ ] Start.ps1 runs successfully
- [ ] Open tab, join as "Test1" ✅
- [ ] Open new tab, join as "Test2" ✅
- [ ] Try joining as "Test1" again ❌ (should fail)
- [ ] Both tabs can answer independently ✅

---

## Need More Help?

📖 **Read**:
- `MULTIPLE_PARTICIPANTS_GUIDE.md` - Full user guide
- `VISUAL_GUIDE.md` - Visual diagrams and examples
- `USERNAME_AUTH_CHANGES.md` - Technical details

🧪 **Test**:
```powershell
python test_username_auth.py
```

---

## That's All! 

Just run `.\start.ps1` and open multiple tabs with different usernames. Enjoy! 🎉

