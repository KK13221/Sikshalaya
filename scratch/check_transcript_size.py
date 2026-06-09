import os

path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"
print("File size:", os.path.getsize(path))

# Let's read the file and print the exact raw line for step 117
with open(path, "r") as f:
    for line in f:
        if '"step_index":117' in line or '"step_index": 117' in line:
            print("Step 117 raw line length:", len(line))
            # Print the line in chunks of 1000 characters to make sure we don't get truncated by terminal/tool output
            for i in range(0, len(line), 2000):
                print(line[i:i+2000])
            break
