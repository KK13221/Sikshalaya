import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Connecting to production VPS...")
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    
    # 1. Modify category column to VARCHAR(100)
    # 2. Add target column to behaviour_metrics table
    alter_queries = [
        "ALTER TABLE behaviour_metrics MODIFY COLUMN category VARCHAR(100) NOT NULL DEFAULT 'behaviour';",
        "ALTER TABLE behaviour_metrics ADD COLUMN target VARCHAR(20) NOT NULL DEFAULT 'student';"
    ]
    
    for query in alter_queries:
        print(f"Running: {query}")
        stdin, stdout, stderr = client.exec_command(f"mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e \"{query}\"")
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out: print("Out:", out)
        if err: print("Err:", err)
        
    client.close()
    print("Database modification successfully completed!")
except Exception as e:
    print("Error:", e)
