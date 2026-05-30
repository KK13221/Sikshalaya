import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('168.144.121.95', username='root', password='InuruM@2612i', timeout=15)
sftp = client.open_sftp()

sql = """SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE `marks`;
TRUNCATE TABLE `assessments`;
TRUNCATE TABLE `behaviour_logs`;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `activity_logs`;
TRUNCATE TABLE `chapters`;
TRUNCATE TABLE `attendance`;
TRUNCATE TABLE `fees`;
TRUNCATE TABLE `students`;
TRUNCATE TABLE `classes`;
TRUNCATE TABLE `teachers`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `schools`;
SET FOREIGN_KEY_CHECKS=1;
"""

with sftp.open('/tmp/clear_shikshalaya.sql', 'w') as f:
    f.write(sql)
sftp.close()

stdin, stdout, stderr = client.exec_command(
    'mysql -u shikshalaya -pSikshDb@2025 shikshalaya < /tmp/clear_shikshalaya.sql'
)
out = stdout.read().decode('utf-8', errors='replace').strip()
err = stderr.read().decode('utf-8', errors='replace').strip()
err_lines = [l for l in err.splitlines() if 'Warning' not in l and 'password' not in l.lower()]

if out:
    print('OUT:', out)
if err_lines:
    print('ERR:', '\n'.join(err_lines))
else:
    print('All tables cleared successfully.')

# Verify all are empty
stdin2, stdout2, _ = client.exec_command(
    "mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e \"SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA='shikshalaya' ORDER BY TABLE_NAME;\""
)
print('\nRow counts after clear:')
print(stdout2.read().decode('utf-8', errors='replace'))

client.exec_command('rm /tmp/clear_shikshalaya.sql')
client.close()
