import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    
    # Check all indexes in the database
    sql = """
    SELECT table_name, index_name 
    FROM information_schema.statistics 
    WHERE table_schema = 'shikshalaya' 
    AND index_name REGEXP '.*_[0-9]+$';
    """
    
    stdin, stdout, stderr = client.exec_command(f"mysql -u shikshalaya -pSikshDb@2025 shikshalaya -N -e \"{sql}\"")
    output = stdout.read().decode().strip().split('\n')
    
    drop_statements = []
    for line in output:
        if not line: continue
        parts = line.split('\t')
        if len(parts) == 2:
            table_name, index_name = parts
            drop_statements.append(f"DROP INDEX {index_name} ON {table_name};")
            
    if drop_statements:
        drop_sql = " ".join(drop_statements)
        print("Dropping indexes...")
        client.exec_command(f"mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e '{drop_sql}'")
    else:
        print("No duplicate indexes found.")
        
    client.exec_command("pm2 restart shikshalaya-api")
    client.close()
except Exception as e:
    print(e)
