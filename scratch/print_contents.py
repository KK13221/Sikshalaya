import os

scratch_dir = "/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch"
targets = [
    "recovered_step_1285.txt",
    "recovered_step_1291.txt",
    "recovered_step_1449.txt",
    "recovered_step_1453.txt",
    "recovered_step_1457.txt",
    "recovered_step_1461.txt",
    "step_1465_write_to_file_CodeContent.txt",
    "step_1475_write_to_file_CodeContent.txt"
]

for name in targets:
    path = os.path.join(scratch_dir, name)
    if os.path.isfile(path):
        print(f"\n==================== {name} ====================")
        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        print("".join(lines[:15]))
        if len(lines) > 15:
            print(f"... and {len(lines) - 15} more lines ...")
