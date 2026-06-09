with open("/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/step_32_VIEW_FILE_content.txt", "r") as f:
    lines = f.readlines()

print("Total lines:", len(lines))
# Print the last 40 lines of step_32
for line in lines[-40:]:
    print(line.rstrip())
