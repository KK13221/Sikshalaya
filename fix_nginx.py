import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOST = '168.144.121.95'
USER = 'root'
PASS = 'InuruM@2612i'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

nginx_conf = """server {
    listen 80;
    server_name 168.144.121.95;

    root /var/www/shikshalaya-frontend;
    index index.html;

    location /api-docs {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
"""

sftp = ssh.open_sftp()
# Find the nginx config file
_, out, _ = ssh.exec_command('ls /etc/nginx/sites-enabled/')
conf_files = out.read().decode().strip().split()
print('Config files:', conf_files)

conf_path = '/etc/nginx/sites-enabled/' + (conf_files[0] if conf_files else 'default')
with sftp.open(conf_path, 'w') as f:
    f.write(nginx_conf)
print(f'Wrote nginx config to {conf_path}')
sftp.close()

_, stdout, _ = ssh.exec_command('nginx -t 2>&1 && systemctl reload nginx 2>&1')
print(stdout.read().decode('utf-8', errors='replace'))

# Test
_, stdout, _ = ssh.exec_command('curl -s -o /dev/null -w "%{http_code}" http://localhost/api-docs')
print('api-docs status:', stdout.read().decode())

ssh.close()
