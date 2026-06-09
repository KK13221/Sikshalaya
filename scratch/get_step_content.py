import json

path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"
with open(path, "r") as f:
    for line in f:
        obj = json.loads(line)
        if obj.get("step_index") == 1276:
            print("Step 1276 keys:", list(obj.keys()))
            content = obj.get("content", "")
            print("Content length:", len(content))
            print("--- First 500 chars ---")
            print(content[:500])
            print("--- Last 1000 chars ---")
            print(content[-1000:])
            # Save untruncated content to file
            with open("/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/step_1276_full.txt", "w") as out:
                out.write(content)
