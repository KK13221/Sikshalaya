import os, json

dir_path = "/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/found_edit_details"
for name in sorted(os.listdir(dir_path)):
    if name.endswith(".json"):
        path = os.path.join(dir_path, name)
        with open(path, "r") as f:
            obj = json.load(f)
        args = obj.get("args") or obj.get("arguments") or {}
        target = args.get("TargetFile") or args.get("AbsolutePath") or args.get("SearchPath")
        print(f"{name} -> Target: {target}")
