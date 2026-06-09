import urllib.request
import urllib.parse
import json

data = json.dumps({"email": "kamlesh.teacher@gmail.com", "password": "password"}).encode('utf-8')
req = urllib.request.Request('http://168.144.121.95/api/auth/login', data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        cookie = response.getheader('Set-Cookie')
        print("Login status:", response.status)
        
        req2 = urllib.request.Request('http://168.144.121.95/api/assessments/types', headers={'Cookie': cookie})
        with urllib.request.urlopen(req2) as res2:
            print("Types:", json.loads(res2.read().decode()))
except Exception as e:
    print(e)
