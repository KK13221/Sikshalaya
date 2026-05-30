import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOST = '168.144.121.95'
USER = 'root'
PASS = 'InuruM@2612i'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

_, stdout, _ = ssh.exec_command('find / -name "package.json" -path "*/shikshalaya*" 2>/dev/null | head -10')
print(stdout.read().decode('utf-8', errors='replace'))
ssh.close()
