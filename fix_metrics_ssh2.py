import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    script = """
const { Student } = require('./models');
const { recomputeStudentMetrics } = require('./services/metricsService');
(async () => {
  const students = await Student.findAll();
  for (const s of students) {
    await recomputeStudentMetrics(s.id, s.schoolId);
  }
  console.log('Done computing metrics for ' + students.length + ' students');
  process.exit(0);
})();
"""
    stdin, stdout, stderr = client.exec_command(f"cat << 'INNER_EOF' > /var/www/shikshalaya-server/fix_metrics.js\n{script}\nINNER_EOF\ncd /var/www/shikshalaya-server && node fix_metrics.js")
    print("Out:", stdout.read().decode())
    print("Err:", stderr.read().decode())
    client.close()
except Exception as e:
    print(e)
