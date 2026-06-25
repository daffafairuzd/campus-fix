import requests
import time

base_url = "http://103.247.8.224/api"
headers = {"Accept": "application/json"}

start_time = time.time()
res = requests.post(f"{base_url}/auth/login", json={"email": "ragil@telkomuniversity.ac.id", "password": "password"}, headers=headers)
end_time = time.time()

print(f"Status: {res.status_code}")
print(f"Response Time: {end_time - start_time:.4f} seconds")
