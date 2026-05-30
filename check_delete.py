import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOST = '168.144.121.95'
USER = 'root'
PASS = 'InuruM@2612i'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

# Check PM2 logs for errors
stdin, stdout, stderr = ssh.exec_command('pm2 logs shikshalaya-api --lines 50 --nostream 2>&1')
out = stdout.read().decode('utf-8', errors='replace')
print(out)

ssh.close()
