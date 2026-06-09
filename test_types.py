import requests
session = requests.Session()
r = session.post('http://168.144.121.95/api/auth/login', json={"email": "kamlesh.teacher@gmail.com", "password": "password"})
print("Login:", r.json())
r2 = session.get('http://168.144.121.95/api/assessments/types')
print("Types:", r2.json())
