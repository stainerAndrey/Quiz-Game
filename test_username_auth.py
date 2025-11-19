"""
Test script for username-based authentication
Run this after starting the backend server to verify the changes work correctly
"""

import requests
import json

API_BASE = "http://localhost:8000"

def test_username_auth():
    print("🧪 Testing Username-Based Authentication\n")

    # Test 1: Join with username "Alice"
    print("Test 1: Joining as 'Alice'...")
    response = requests.post(f"{API_BASE}/join", json={"name": "Alice"})
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Response: {data}")
        assert "username" in data, "Response should contain 'username'"
        assert data["username"] == "Alice", "Username should be 'Alice'"
    else:
        print(f"❌ Failed with status {response.status_code}: {response.text}")
        return False

    # Test 2: Try to join with same username (should fail)
    print("\nTest 2: Trying to join as 'Alice' again (should fail)...")
    response = requests.post(f"{API_BASE}/join", json={"name": "Alice"})
    if response.status_code == 409:
        print(f"✅ Correctly rejected duplicate username: {response.json()['detail']}")
    else:
        print(f"❌ Should have returned 409 Conflict, got {response.status_code}")
        return False

    # Test 3: Join with different username "Bob"
    print("\nTest 3: Joining as 'Bob'...")
    response = requests.post(f"{API_BASE}/join", json={"name": "Bob"})
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Response: {data}")
        assert data["username"] == "Bob", "Username should be 'Bob'"
    else:
        print(f"❌ Failed with status {response.status_code}: {response.text}")
        return False

    # Test 4: Check participant exists
    print("\nTest 4: Checking if participant 'Alice' exists...")
    response = requests.get(f"{API_BASE}/participant/Alice")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Participant found: {data}")
        assert data["name"] == "Alice", "Participant name should be 'Alice'"
    else:
        print(f"❌ Failed with status {response.status_code}: {response.text}")
        return False

    # Test 5: Check non-existent participant
    print("\nTest 5: Checking non-existent participant 'Charlie'...")
    response = requests.get(f"{API_BASE}/participant/Charlie")
    if response.status_code == 404:
        print(f"✅ Correctly returned 404 for non-existent participant")
    else:
        print(f"❌ Should have returned 404, got {response.status_code}")
        return False

    # Test 6: Case sensitivity
    print("\nTest 6: Testing case sensitivity - joining as 'alice' (lowercase)...")
    response = requests.post(f"{API_BASE}/join", json={"name": "alice"})
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! 'alice' is different from 'Alice': {data}")
    else:
        print(f"❌ Failed with status {response.status_code}: {response.text}")
        return False

    print("\n" + "="*60)
    print("🎉 All tests passed!")
    print("="*60)
    print("\n📝 Summary:")
    print("- Multiple usernames can join simultaneously")
    print("- Duplicate usernames are correctly rejected")
    print("- Usernames are case-sensitive")
    print("- Participant lookup works correctly")
    return True

if __name__ == "__main__":
    try:
        test_username_auth()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to backend server at", API_BASE)
        print("   Please make sure the backend is running first!")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

