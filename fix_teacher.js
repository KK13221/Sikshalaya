const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const token = JSON.parse(data).token;
    console.log("Token:", token);
    
    const updateOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/teachers/31',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    const req2 = http.request(updateOptions, (res2) => {
      let data2 = '';
      res2.on('data', d => data2 += d);
      res2.on('end', () => console.log("Update:", data2));
    });
    req2.write(JSON.stringify({ password: 'Sipl@1234' }));
    req2.end();
  });
});
req.write(JSON.stringify({ email: 'principal1@gmail.com', password: 'password' }));
req.end();
