import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# 1. Login as admin
resp = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@hackathon.com", "password": "Admin@123"})
if resp.status_code != 200:
    print("Login failed:", resp.text)
    exit(1)
token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Create Hackathon A
h1 = requests.post(f"{BASE_URL}/hackathons", json={
    "title": "Hackathon A",
    "description": "Test Description A",
    "registration_start_date": "2025-01-01T00:00:00Z",
    "registration_end_date": "2026-12-31T23:59:59Z",
    "submission_deadline": "2027-01-01T00:00:00Z",
    "max_teams": 10,
    "location": "Online",
    "mode": "ONLINE"
}, headers=headers).json()

print("Hackathon A:", h1)

# 3. Create Hackathon B
h2 = requests.post(f"{BASE_URL}/hackathons", json={
    "title": "Hackathon B",
    "description": "Test Description B",
    "registration_start_date": "2025-01-01T00:00:00Z",
    "registration_end_date": "2026-12-31T23:59:59Z",
    "submission_deadline": "2027-01-01T00:00:00Z",
    "max_teams": 10,
    "location": "Online",
    "mode": "ONLINE"
}, headers=headers).json()

print("Hackathon B:", h2)

# 4. Create Problem Statement for A
ps1 = requests.post(f"{BASE_URL}/problem-statements", json={
    "hackathon_id": h1["id"],
    "problem_code": "PSA-01",
    "title": "Problem A1",
    "description": "Description A1",
    "difficulty": "EASY",
    "category": "Web"
}, headers=headers).json()
print("Problem A:", ps1)
requests.patch(f"{BASE_URL}/problem-statements/{ps1['id']}/publish", headers=headers)

# 5. Create Problem Statement for B
ps2 = requests.post(f"{BASE_URL}/problem-statements", json={
    "hackathon_id": h2["id"],
    "problem_code": "PSB-01",
    "title": "Problem B1",
    "description": "Description B1",
    "difficulty": "EASY",
    "category": "Web"
}, headers=headers).json()
print("Problem B:", ps2)
requests.patch(f"{BASE_URL}/problem-statements/{ps2['id']}/publish", headers=headers)

# 6. Fetch for A
resp_a = requests.get(f"{BASE_URL}/hackathons/{h1['slug']}/problem-statements", headers=headers)
print("Fetch A:", resp_a.json())

# 7. Fetch for B
resp_b = requests.get(f"{BASE_URL}/hackathons/{h2['slug']}/problem-statements", headers=headers)
print("Fetch B:", resp_b.json())
