import requests

base_url = "http://103.247.8.224/api"
headers = {"Accept": "application/json"}

def login(email, password):
    res = requests.post(f"{base_url}/auth/login", json={"email": email, "password": password}, headers=headers)
    return res.json()

def check_me(token):
    res = requests.get(f"{base_url}/auth/me", headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})
    return res.status_code

print("Login 1...")
r1 = login('ragil@telkomuniversity.ac.id', 'admin123')
token1 = r1.get('token')
print("Check 1:", check_me(token1))

print("Login 2...")
r2 = login('ragil@telkomuniversity.ac.id', 'admin123')
token2 = r2.get('token')

print("Check 1 again:", check_me(token1))
print("Check 2:", check_me(token2))
