#!/usr/bin/env python3
"""Deploy server + admin panel to production VPS."""
import paramiko, os, sys, tarfile, io, time, subprocess, urllib.request

HOST       = "168.144.121.95"
USER       = "root"
PASS       = "InuruM@2612i"
BASE       = r"e:\AI\Sikshalaya Global"
SERVER_DIR = "/var/www/shikshalaya-server"
FRONT_DIR  = "/var/www/shikshalaya-frontend"

def ssh(client, cmd, echo=True):
    _, stdout, stderr = client.exec_command(cmd, timeout=120)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if echo and out.strip(): print(out.strip())
    if echo and err.strip(): print("[ERR]", err.strip())
    return out

def connect():
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(HOST, username=USER, password=PASS, timeout=15)
    return c

def upload_dir_as_tar(sftp, local_dir, remote_tar):
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        tar.add(local_dir, arcname=".")
    buf.seek(0)
    sftp.putfo(buf, remote_tar)

def main():
    print("=" * 52)
    print("  Sikshalaya Global -- Production Deploy")
    print("=" * 52)

    # ── STEP 1: Connect ──────────────────────────────────
    print("\n[1/6] Connecting to", HOST)
    client = connect()
    sftp   = client.open_sftp()
    print("      SSH connection established")

    # ── STEP 2: Deploy server/controllers ────────────────
    print("\n[2/6] Uploading backend changes...")
    for subdir in ["controllers", "models", "routes"]:
        local = os.path.join(BASE, "server", subdir)
        if not os.path.isdir(local):
            continue
        tmp = f"/tmp/deploy_{subdir}.tar.gz"
        upload_dir_as_tar(sftp, local, tmp)
        remote = f"{SERVER_DIR}/{subdir}"
        ssh(client, f"mkdir -p {remote} && tar -xzf {tmp} -C {remote} && rm {tmp}", echo=False)
        print(f"  {subdir}/ uploaded")

    # ── STEP 3: Sync new model files individually ─────────
    new_files = ["models/SchoolSettings.js", "models/Notice.js",
                 "controllers/noticeController.js", "controllers/settingsController.js",
                 "routes/notices.js", "routes/settings.js"]
    for rel in new_files:
        local = os.path.join(BASE, "server", rel.replace("/", os.sep))
        if not os.path.isfile(local):
            continue
        remote = f"{SERVER_DIR}/{rel}"
        ssh(client, f"mkdir -p $(dirname {remote})", echo=False)
        sftp.put(local, remote)
        print(f"  {rel} uploaded")

    # Also upload updated server/index.js and authController
    for rel in ["index.js", "controllers/authController.js",
                "controllers/dashboardController.js",
                "controllers/teacherController.js"]:
        local = os.path.join(BASE, "server", rel.replace("/", os.sep))
        if os.path.isfile(local):
            sftp.put(local, f"{SERVER_DIR}/{rel}")
            print(f"  {rel} uploaded")

    # ── STEP 4: Install any new npm deps on server ────────
    print("\n[3/6] Checking npm dependencies on server...")
    ssh(client, f"cd {SERVER_DIR} && npm install --production 2>&1 | tail -3")

    # ── STEP 5: Build admin panel locally ────────────────
    print("\n[4/6] Building admin panel locally...")
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=BASE, capture_output=True, text=True, timeout=120, shell=True
    )
    if result.returncode != 0:
        print("  BUILD FAILED!")
        print(result.stdout[-3000:])
        print(result.stderr[-3000:])
        client.close()
        sys.exit(1)
    print("  Build succeeded")

    # ── STEP 6: Upload dist to server ────────────────────
    print("\n[5/6] Uploading admin panel (dist/)...")
    dist_local = os.path.join(BASE, "dist")
    if os.path.isdir(dist_local):
        tmp = "/tmp/deploy_dist.tar.gz"
        upload_dir_as_tar(sftp, dist_local, tmp)
        ssh(client, f"rm -rf {FRONT_DIR} && mkdir -p {FRONT_DIR} && tar -xzf {tmp} -C {FRONT_DIR} && rm {tmp}", echo=False)
        print(f"  Admin panel deployed to {FRONT_DIR}/")
    else:
        print("  dist/ not found -- skipping frontend deploy")

    # ── STEP 7: Restart server via PM2 ───────────────────
    print("\n[6/6] Restarting server via PM2...")
    out = ssh(client, "pm2 list 2>/dev/null", echo=False)
    print(out.strip()[:400] if out.strip() else "  (no pm2 output)")
    ssh(client, "pm2 restart all 2>&1 | tail -8")

    time.sleep(3)

    print("\nVerifying server response...")
    try:
        r = urllib.request.urlopen(f"http://{HOST}/api/auth/me", timeout=10)
        print(f"  API alive (HTTP {r.status})")
    except Exception as e:
        print(f"  API check: {e}")

    sftp.close()
    client.close()

    print("\n" + "=" * 52)
    print("  Deploy COMPLETE")
    print(f"  Admin panel : http://{HOST}")
    print(f"  API         : http://{HOST}/api")
    print("=" * 52)

if __name__ == "__main__":
    main()
