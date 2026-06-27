import requests

BASE_URL = "http://localhost:8000/api/v1"

# 1. Login as student
resp = requests.post(f"{BASE_URL}/auth/login", json={"email": "student@hackathon.com", "password": "Student@123"})
if resp.status_code != 200:
    print("Student login failed:", resp.text)
    exit(1)
token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Fetch for A
resp_a = requests.get(f"{BASE_URL}/hackathons/hackathon-a/problem-statements", headers=headers)
print("Fetch A as student:", resp_a.json())

# 3. Fetch for B
resp_b = requests.get(f"{BASE_URL}/hackathons/hackathon-b/problem-statements", headers=headers)
print("Fetch B as student:", resp_b.json())
