import os
import json

dir_path = "/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/all_pa_edits"

# Sort by step number
files = sorted(os.listdir(dir_path), key=lambda x: int(x.split("_")[1]))

for name in files:
    if "replace_file_content" in name:
        step = int(name.split("_")[1])
        # We only care about steps after 1200, which is when the search and revert stuff started
        # We print all instructions to find the original TestTypesView edit
        path = os.path.join(dir_path, name)
        with open(path, "r") as f:
            obj = json.load(f)
        args = obj.get("args") or obj.get("arguments") or {}
        instruction = args.get("Instruction")
        print(f"Step {step} Instruction: {instruction}")
