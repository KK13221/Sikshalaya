import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOST = '168.144.121.95'
USER = 'root'
PASS = 'InuruM@2612i'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)
sftp = ssh.open_sftp()

sftp.put(
    r'e:\AI\Sikshalaya Global\server\controllers\schoolController.js',
    '/var/www/shikshalaya-server/controllers/schoolController.js'
)
print('Uploaded schoolController.js')
sftp.close()

stdin, stdout, stderr = ssh.exec_command('pm2 restart shikshalaya-api && sleep 2 && pm2 show shikshalaya-api | grep status')
print(stdout.read().decode('utf-8', errors='replace'))
ssh.close()
print('Done')
