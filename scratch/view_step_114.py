import json

path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"

with open(path, "r") as f:
    for line in f:
        obj = json.loads(line)
        if obj.get("step_index") == 114:
            print("Step 114 keys:", list(obj.keys()))
            content = obj.get("content", "")
            print("Content length:", len(content))
            print("--- Content ---")
            print(content)
            # Save it to a file
            with open("/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/step_114_content.txt", "w") as out:
                out.write(content)
            print("Saved to scratch/step_114_content.txt")
            break
