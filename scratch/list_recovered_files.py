import os

scratch_dir = "/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch"
for name in sorted(os.listdir(scratch_dir)):
    if name.endswith(".txt"):
        path = os.path.join(scratch_dir, name)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        if "TestTypesView" in content:
            print(f"File: {name}, length: {len(content)}, lines: {len(content.splitlines())}")
            # print first 3 lines and last 3 lines
            lines = content.splitlines()
            if lines:
                print("  Start:", lines[:3])
                print("  End:", lines[-3:])
