import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect("168.144.121.95", username="root", password="InuruM@2612i", timeout=10)
    sql = """
    INSERT INTO assessment_types (schoolId, code, label, sublabel, color)
    VALUES 
    (NULL, 'chapter', 'Chapter Test', 'After finishing a chapter', 'blue'),
    (NULL, 'unit', 'Unit Test', 'Periodic evaluation', 'yellow'),
    (NULL, 'term', 'Term Exam', 'End of semester', 'red'),
    (NULL, 'class_test', 'Class Test', 'Quick check', 'green')
    ON DUPLICATE KEY UPDATE label=label;
    """
    stdin, stdout, stderr = client.exec_command(f"mysql -u shikshalaya -pSikshDb@2025 shikshalaya -e \"{sql}\"")
    print("Out:", stdout.read().decode())
    print("Err:", stderr.read().decode())
    client.close()
except Exception as e:
    print(e)
