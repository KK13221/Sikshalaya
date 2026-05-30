import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('168.144.121.95', username='root', password='InuruM@2612i', timeout=15)
sftp = client.open_sftp()

tables = ['schools', 'users', 'teachers', 'students', 'classes',
          'fees', 'attendance', 'marks', 'assessments', 'chapters',
          'behaviour_logs', 'notifications', 'activity_logs']

lines = [f"SELECT '{t}' AS tbl, COUNT(*) AS cnt FROM `{t}`" for t in tables]
sql = "\nUNION ALL ".join(lines) + ";"

with sftp.open('/tmp/verify.sql', 'w') as f:
    f.write(sql)
sftp.close()

stdin, stdout, stderr = client.exec_command('mysql -u shikshalaya -pSikshDb@2025 shikshalaya < /tmp/verify.sql')
out = stdout.read().decode('utf-8', errors='replace')
err = [l for l in stderr.read().decode('utf-8', errors='replace').splitlines()
       if 'Warning' not in l and 'password' not in l.lower()]
print(out)
if err:
    print('Errors:', '\n'.join(err))

client.exec_command('rm /tmp/verify.sql')
client.close()
