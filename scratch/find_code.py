import os

scratch_dir = "/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch"
for name in sorted(os.listdir(scratch_dir)):
    path = os.path.join(scratch_dir, name)
    if os.path.isfile(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            if "TestTypesView" in content:
                print(f"File: {name}, length: {len(content)}")
        except Exception as e:
            pass
