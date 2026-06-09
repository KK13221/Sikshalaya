import paramiko
import sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    stdin, stdout, stderr = client.exec_command("php -v && dpkg -l | grep phpmyadmin")
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    client.close()
except Exception as e:
    print(e)
