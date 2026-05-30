import sys, os, paramiko, stat
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOST = '168.144.121.95'
USER = 'root'
PASS = 'InuruM@2612i'

LOCAL_DIST   = r'e:\AI\Sikshalaya Global\dist'
LOCAL_SERVER = r'e:\AI\Sikshalaya Global\server'

REMOTE_FRONT  = '/var/www/shikshalaya-frontend'
REMOTE_BACK   = '/var/www/shikshalaya-server'

def sftp_mkdir_p(sftp, remote_path):
    parts = remote_path.replace('\\', '/').split('/')
    path = ''
    for part in parts:
        if not part:
            path = '/'
            continue
        path = path.rstrip('/') + '/' + part
        try:
            sftp.stat(path)
        except FileNotFoundError:
            sftp.mkdir(path)

def upload_dir(sftp, local_dir, remote_dir):
    sftp_mkdir_p(sftp, remote_dir)
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = remote_dir.rstrip('/') + '/' + item
        if os.path.isdir(local_path):
            upload_dir(sftp, local_path, remote_path)
        else:
            sftp.put(local_path, remote_path)
            print(f'  uploaded: {remote_path}')

def upload_file(sftp, local_path, remote_path):
    sftp_mkdir_p(sftp, os.path.dirname(remote_path))
    sftp.put(local_path, remote_path)
    print(f'  uploaded: {remote_path}')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)
sftp = ssh.open_sftp()

print('=== Uploading frontend dist ===')
# Clear old frontend
stdin, stdout, stderr = ssh.exec_command(f'rm -rf {REMOTE_FRONT}/* 2>/dev/null; mkdir -p {REMOTE_FRONT}')
stdout.read()
upload_dir(sftp, LOCAL_DIST, REMOTE_FRONT)

print('\n=== Uploading backend files ===')
backend_files = [
    ('server/index.js',                              'index.js'),
    ('server/models/index.js',                       'models/index.js'),
    ('server/models/Class.js',                       'models/Class.js'),
    ('server/models/Chapter.js',                     'models/Chapter.js'),
    ('server/models/Assessment.js',                  'models/Assessment.js'),
    ('server/models/Mark.js',                        'models/Mark.js'),
    ('server/models/BehaviourLog.js',                'models/BehaviourLog.js'),
    ('server/models/BehaviourMetric.js',             'models/BehaviourMetric.js'),
    ('server/models/Notification.js',                'models/Notification.js'),
    ('server/models/ActivityLog.js',                 'models/ActivityLog.js'),
    ('server/models/Student.js',                     'models/Student.js'),
    ('server/models/OtpSession.js',                  'models/OtpSession.js'),
    ('server/models/User.js',                        'models/User.js'),
    ('server/models/School.js',                      'models/School.js'),
    ('server/models/Teacher.js',                     'models/Teacher.js'),
    ('server/models/Attendance.js',                  'models/Attendance.js'),
    ('server/models/Fee.js',                         'models/Fee.js'),
    ('server/routes/classes.js',                     'routes/classes.js'),
    ('server/routes/users.js',                       'routes/users.js'),
    ('server/routes/chapters.js',                    'routes/chapters.js'),
    ('server/routes/assessments.js',                 'routes/assessments.js'),
    ('server/routes/behaviour.js',                   'routes/behaviour.js'),
    ('server/routes/behaviourMetrics.js',            'routes/behaviourMetrics.js'),
    ('server/routes/students.js',                    'routes/students.js'),
    ('server/routes/notifications.js',               'routes/notifications.js'),
    ('server/controllers/assessmentController.js',   'controllers/assessmentController.js'),
    ('server/controllers/behaviourController.js',    'controllers/behaviourController.js'),
    ('server/controllers/studentController.js',      'controllers/studentController.js'),
    ('server/controllers/teacherController.js',      'controllers/teacherController.js'),
    ('server/controllers/authController.js',         'controllers/authController.js'),
    ('server/services/metricsService.js',            'services/metricsService.js'),
    ('server/services/emailService.js',              'services/emailService.js'),
    ('server/package.json',                          'package.json'),
    ('server/routes/auth.js',                        'routes/auth.js'),
    ('server/routes/attendance.js',                  'routes/attendance.js'),
    ('server/routes/fees.js',                        'routes/fees.js'),
    ('server/routes/dashboard.js',                   'routes/dashboard.js'),
]

base = r'e:\AI\Sikshalaya Global'
for rel_local, rel_remote in backend_files:
    local_path = os.path.join(base, rel_local)
    if os.path.exists(local_path):
        upload_file(sftp, local_path, f'{REMOTE_BACK}/{rel_remote}')
    else:
        print(f'  SKIP (not found): {rel_local}')

sftp.close()

print('\n=== Restarting backend (PM2) ===')
cmds = [
    f'cd {REMOTE_BACK} && npm install --production 2>&1 | tail -3',
    'pm2 restart shikshalaya-api 2>&1 || pm2 start /var/www/shikshalaya-server/index.js --name shikshalaya-api',
    'pm2 save',
    'sleep 3 && pm2 show shikshalaya-api | grep -E "status|restarts"',
]
for cmd in cmds:
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip(): print(out.strip())
    if err.strip(): print('ERR:', err.strip())

print('\n=== Verifying server health ===')
stdin, stdout, stderr = ssh.exec_command('curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/auth/login -X POST -H "Content-Type: application/json" -d \'{"email":"x","password":"x"}\'')
code = stdout.read().decode().strip()
print(f'API health check: HTTP {code}')

ssh.close()
print('\nDone!')
