import os, json

dir_path = "/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/extracted_edits"
for name in sorted(os.listdir(dir_path)):
    path = os.path.join(dir_path, name)
    with open(path, "r") as f:
        obj = json.load(f)
    print(name, "-> name:", obj.get("name"), "method:", obj.get("method"))
