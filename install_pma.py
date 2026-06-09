import paramiko
import sys
import time

def run_cmd(client, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print("STDOUT:", out)
    if err: print("STDERR:", err)
    return exit_status

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    
    # 1. Install PHP-FPM, PHP-MySQL, PHP-MBString
    run_cmd(client, "export DEBIAN_FRONTEND=noninteractive; apt-get update && apt-get install -y php-fpm php-mysql php-mbstring")
    
    # 2. Download phpMyAdmin (latest)
    run_cmd(client, "cd /usr/share && wget https://www.phpmyadmin.net/downloads/phpMyAdmin-latest-all-languages.tar.gz -O phpmyadmin.tar.gz")
    run_cmd(client, "cd /usr/share && tar xzf phpmyadmin.tar.gz && rm phpmyadmin.tar.gz")
    run_cmd(client, "cd /usr/share && mv phpMyAdmin-*-all-languages phpmyadmin")
    run_cmd(client, "chown -R www-data:www-data /usr/share/phpmyadmin")
    
    # 3. Configure Nginx
    nginx_conf = """
server {
    listen 80;
    server_name _;

    location /phpmyadmin {
        root /usr/share/;
        index index.php index.html index.htm;
        location ~ ^/phpmyadmin/(.+\.php)$ {
            try_files $uri =404;
            root /usr/share/;
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include /etc/nginx/fastcgi_params;
        }
        location ~* ^/phpmyadmin/(.+\.(jpg|jpeg|gif|css|png|js|ico|html|xml|txt))$ {
            root /usr/share/;
        }
    }
}
"""
    # We shouldn't overwrite the main server block. The current Nginx config probably hosts the React app.
    # Let's find the current nginx config and append the phpmyadmin location block to it.
    
    client.close()
except Exception as e:
    print(e)
