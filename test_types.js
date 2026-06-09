async function run() {
  const login = await fetch('http://168.144.121.95/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: "kamlesh.teacher@gmail.com", password: "password" }) // Or Sipl@1234
  });
  const cookie = login.headers.get('set-cookie');
  console.log("Login status:", login.status);
  
  const res = await fetch('http://168.144.121.95/api/assessments/types', {
    headers: { 'cookie': cookie }
  });
  const data = await res.json();
  console.log("Types:", data);
}
run();
