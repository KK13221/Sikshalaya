import paramiko
import json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    stdin, stdout, stderr = client.exec_command("pm2 jlist")
    data = stdout.read().decode()
    parsed = json.loads(data)
    for p in parsed:
        print(p.get("name"), p.get("pm2_env", {}).get("pm_cwd"))
    client.close()
except Exception as e:
    print(e)
