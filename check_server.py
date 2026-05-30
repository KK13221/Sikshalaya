import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOST = '168.144.121.95'
USER = 'root'
PASS = 'InuruM@2612i'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

cmds = [
    'cat /etc/nginx/sites-enabled/* 2>/dev/null || cat /etc/nginx/conf.d/*.conf 2>/dev/null',
    'curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api-docs 2>&1',
    'curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/auth/me 2>&1',
]
for cmd in cmds:
    print(f'\n--- {cmd[:50]} ---')
    _, stdout, _ = ssh.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
