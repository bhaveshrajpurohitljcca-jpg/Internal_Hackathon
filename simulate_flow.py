import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# 1. Login as Admin
resp = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@hackathon.com", "password": "Admin@123"})
if resp.status_code != 200:
    print("Admin login failed:", resp.text)
    exit(1)
admin_token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {admin_token}"}

# 2. Emulate Student loading Hackathons
resp = requests.get(f"{BASE_URL}/hackathons?page_size=100", headers=headers)
hackathons = resp.json()["items"]
print(f"Loaded {len(hackathons)} hackathons")

# Find Hackathon B
hackathon_b = None
for h in hackathons:
    if "Hackathon B" in h["title"]:
        hackathon_b = h
        break

if not hackathon_b:
    print("Hackathon B not found!")
    exit(1)

print(f"Hackathon B slug: {hackathon_b['slug']}")

# 3. Emulate Registration Modal fetching Problem Statements
resp = requests.get(f"{BASE_URL}/hackathons/{hackathon_b['slug']}/problem-statements", headers=headers)
print("Problem Statements for Hackathon B:", json.dumps(resp.json(), indent=2))
