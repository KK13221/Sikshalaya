import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    sql_statements = []
    for i in range(2, 65):
        sql_statements.append(f"DROP INDEX code_{i} ON schools;")
    sql = " ".join(sql_statements)
    stdin, stdout, stderr = client.exec_command(f"mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e '{sql}'")
    print("Drop errors:", stderr.read().decode())
    
    stdin, stdout, stderr = client.exec_command("pm2 restart shikshalaya-api")
    print("Restarting:", stdout.read().decode())
    client.close()
except Exception as e:
    print(e)
