import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOST = '168.144.121.95'
USER = 'root'
PASS = 'InuruM@2612i'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

_, stdout, _ = ssh.exec_command('curl -sL -o /dev/null -w "%{http_code}" http://localhost/api-docs/')
print('api-docs/ status:', stdout.read().decode())

_, stdout, _ = ssh.exec_command('curl -sL http://localhost/api-docs/ 2>&1 | head -5')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
