import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
stdin, stdout, stderr = client.exec_command("mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e \"SELECT * FROM users;\"")
print(stdout.read().decode())
client.close()
