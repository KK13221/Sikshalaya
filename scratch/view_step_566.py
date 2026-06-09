with open("/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/step_566_VIEW_FILE_content.txt", "r") as f:
    lines = f.readlines()

print("Total lines:", len(lines))
for line in lines:
    print(line.rstrip())
