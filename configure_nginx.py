import paramiko
import sys

nginx_conf = """server {
    listen 80;
    server_name 168.144.121.95;

    root /var/www/shikshalaya-frontend;
    index index.html;

    location /api-docs {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /phpmyadmin {
        root /usr/share/;
        index index.php index.html index.htm;
        location ~ ^/phpmyadmin/(.+\.php)$ {
            try_files $uri =404;
            root /usr/share/;
            fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include /etc/nginx/fastcgi_params;
        }
        location ~* ^/phpmyadmin/(.+\.(jpg|jpeg|gif|css|png|js|ico|html|xml|txt))$ {
            root /usr/share/;
        }
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
"""

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    
    # Write new config
    stdin, stdout, stderr = client.exec_command("cat > /etc/nginx/sites-available/shikshalaya")
    stdin.write(nginx_conf)
    stdin.close()
    print("Write config stdout:", stdout.read().decode())
    print("Write config stderr:", stderr.read().decode())
    
    # Restart nginx
    stdin, stdout, stderr = client.exec_command("systemctl restart nginx")
    print("Restart nginx stderr:", stderr.read().decode())
    
    # Add root user to MySQL to access everything in phpmyadmin
    # Wait, the user already has shikshalaya user. 
    client.close()
except Exception as e:
    print(e)
