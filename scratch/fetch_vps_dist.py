import paramiko
import os

HOST       = "168.144.121.95"
USER       = "root"
PASS       = "InuruM@2612i"
REMOTE_DIR = "/var/www/shikshalaya-frontend/assets"
LOCAL_DIR  = "/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/vps_assets"

os.makedirs(LOCAL_DIR, exist_ok=True)

try:
    print("Connecting to VPS...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASS, timeout=15)
    sftp = client.open_sftp()
    
    print("Listing files in", REMOTE_DIR)
    files = sftp.listdir(REMOTE_DIR)
    print("Files:", files)
    
    for f in files:
        remote_path = REMOTE_DIR + "/" + f
        local_path = os.path.join(LOCAL_DIR, f)
        print("Downloading", remote_path, "to", local_path)
        sftp.get(remote_path, local_path)
        
    sftp.close()
    client.close()
    print("Done downloading!")
    
    # Let's search the downloaded files for mock_exam or showInReport
    for f in files:
        local_path = os.path.join(LOCAL_DIR, f)
        if os.path.isfile(local_path):
            with open(local_path, "r", encoding="utf-8", errors="ignore") as file_in:
                text = file_in.read()
            print(f"File {f}: size={len(text)}")
            for q in ["mock_exam", "Test Types", "showInReport", "Sublabel (Optional context)"]:
                pos = text.find(q)
                print(f"  Query '{q}': found={pos != -1}")
                if pos != -1:
                    print("  Snippet:", text[max(0, pos-100):pos+400])

except Exception as e:
    print("Error:", e)
