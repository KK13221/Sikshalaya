import json
import re

path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"

# We want to collect all lines matching "<line_number>: <content>" from any step in the transcript
line_db = {} # line_number -> content

with open(path, "r") as f:
    for line_raw in f:
        obj = json.loads(line_raw)
        content = obj.get("content", "")
        # Find lines like: 1980: ...
        matches = re.findall(r"^(\d+):\s*(.*)$", content, re.MULTILINE)
        for num_str, text in matches:
            num = int(num_str)
            # We only keep the latest version of the line if multiple steps viewed it
            line_db[num] = text

# Let's print out the lines from 1950 to 2150 in order of line number
print("Reconstructed lines from line_db:")
for num in sorted(line_db.keys()):
    if 1950 <= num <= 2160:
        print(f"{num}: {line_db[num]}")
