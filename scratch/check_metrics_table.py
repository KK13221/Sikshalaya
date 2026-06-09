import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    
    # Check table columns
    stdin, stdout, stderr = client.exec_command("mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e \"DESCRIBE behaviour_metrics;\"")
    print("Columns:")
    print(stdout.read().decode())
    
    # Check table data
    stdin, stdout, stderr = client.exec_command("mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e \"SELECT * FROM behaviour_metrics;\"")
    print("Data:")
    print(stdout.read().decode())
    
    client.close()
except Exception as e:
    print(e)
