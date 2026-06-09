import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    sql = "UPDATE assessments SET classNum = 1 WHERE classNum = 7;"
    stdin, stdout, stderr = client.exec_command(f"mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e \"{sql}\"")
    print("Out:", stdout.read().decode())
    print("Err:", stderr.read().decode())
    client.close()
except Exception as e:
    print(e)
