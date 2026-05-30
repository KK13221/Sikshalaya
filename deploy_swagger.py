import paramiko
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOST = '168.144.121.95'
USER = 'root'
PASS = 'InuruM@2612i'
REMOTE_DIR = '/var/www/shikshalaya-server'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

sftp = ssh.open_sftp()
local_base = r'e:\AI\Sikshalaya Global\server'
for fname in ['index.js', 'swagger.json']:
    local_path = os.path.join(local_base, fname)
    remote_path = f'{REMOTE_DIR}/{fname}'
    sftp.put(local_path, remote_path)
    print(f'Uploaded {fname}')
sftp.close()

cmds = [
    f'cd {REMOTE_DIR} && npm install swagger-ui-express --save 2>&1',
    'pm2 restart shikshalaya-api 2>&1',
    'sleep 2 && pm2 show shikshalaya-api 2>&1 | grep -E "status|restarts"',
]
for cmd in cmds:
    _, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    print(out or err or '(no output)')

ssh.close()
print('Done')
