import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    stdin, stdout, stderr = client.exec_command("grep -i -C 5 \"performance\" /root/.pm2/logs/shikshalaya-api-error.log | tail -n 100")
    print(stdout.read().decode())
    client.close()
except Exception as e:
    print(e)

