import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    
    # Get indexes
    stdin, stdout, stderr = client.exec_command("mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e 'SHOW INDEXES FROM schools;'")
    lines = stdout.read().decode().splitlines()[1:]
    
    drop_stmts = []
    for line in lines:
        parts = line.split('\t')
        if len(parts) > 2:
            key_name = parts[2]
            if key_name.startswith('code_'):
                drop_stmts.append(f"DROP INDEX {key_name} ON schools;")
    
    if drop_stmts:
        sql = " ".join(drop_stmts)
        print("Executing:", sql)
        stdin, stdout, stderr = client.exec_command(f"mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e '{sql}'")
        print("Output:", stdout.read().decode())
        print("Error:", stderr.read().decode())
    
    # Also disable alter temporarily in db.js if we can? Actually, we'll just drop them for now.
    client.exec_command("pm2 restart shikshalaya-api")
    client.close()
except Exception as e:
    print(e)
