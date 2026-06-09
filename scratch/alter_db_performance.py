import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    
    # Run simple ALTER query. If columns already exist, MySQL will return an error which we catch.
    queries = [
        "ALTER TABLE marks ADD COLUMN writtenMarks FLOAT NULL;",
        "ALTER TABLE marks ADD COLUMN oralMarks FLOAT NULL;"
    ]
    
    for sql in queries:
        stdin, stdout, stderr = client.exec_command(f"mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e \"{sql}\"")
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out: print("Out:", out)
        if err: print("Err (can be ignored if columns already exist):", err)
    
    client.close()
    print("Migration finished!")
except Exception as e:
    print(e)
