with open("/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/step_704_VIEW_FILE_content.txt", "r") as f:
    lines = f.readlines()

print("Total lines:", len(lines))
for line in lines[:20]:
    print(line.rstrip())
print("...")
for line in lines[-20:]:
    print(line.rstrip())
