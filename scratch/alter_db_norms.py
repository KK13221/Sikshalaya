import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOST = '168.144.121.95'
USER = 'root'
PASS = 'InuruM@2612i'

sql_commands = [
    # 1. Modify school_settings table
    "ALTER TABLE school_settings ADD COLUMN teacherNorms TEXT;",
    "ALTER TABLE school_settings ADD COLUMN teacherNormsVersion INT DEFAULT 1;",
    "ALTER TABLE school_settings ADD COLUMN teacherNormsUpdatedAt DATETIME;",
    
    # 2. Modify users table
    "ALTER TABLE users ADD COLUMN normsAcceptedVersion INT DEFAULT 0;",
    "ALTER TABLE users ADD COLUMN normsAcceptedAt DATETIME;",
    
    # 3. Create teacher_norm_acceptances table
    """
    CREATE TABLE IF NOT EXISTS teacher_norm_acceptances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacherId INT NOT NULL,
        schoolId INT NOT NULL,
        normsVersion INT NOT NULL,
        acceptedAt DATETIME NOT NULL,
        ipAddress VARCHAR(45) NULL,
        userAgent TEXT NULL,
        FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE
    );
    """
]

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

for cmd in sql_commands:
    print(f"\n--- Executing SQL ---")
    formatted_cmd = f'mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e "{cmd}"'
    _, stdout, stderr = ssh.exec_command(formatted_cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip(): print("Out:", out.strip())
    if err.strip(): print("Err:", err.strip())

ssh.close()
print("Migration done!")
