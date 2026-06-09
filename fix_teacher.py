import requests

# 1. Login as principal
resp = requests.post('http://localhost:5000/api/auth/login', json={
    "email": "principal1@gmail.com",
    "password": "password"
})
data = resp.json()
print("Login:", data)

token = data.get('token')
headers = {'Authorization': f'Bearer {token}'}

# 2. Update Teacher 31
resp2 = requests.put('http://localhost:5000/api/teachers/31', headers=headers, json={
    "password": "Sipl@1234"
})
print("Update:", resp2.json())
