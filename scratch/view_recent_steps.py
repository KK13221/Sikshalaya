import json

path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"

with open(path, "r") as f:
    for line in f:
        obj = json.loads(line)
        step = obj.get("step_index")
        if step in [1500, 1504, 1512, 1514]:
            content = obj.get("content", "")
            print(f"=== Step {step} ===")
            print("Length:", len(content))
            # print first 5 lines and last 5 lines
            lines = content.splitlines()
            if lines:
                print("First 3:", lines[:3])
                print("Last 3:", lines[-3:])
                # Let's save the whole file
                with open(f"/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/step_{step}_content.txt", "w") as out:
                    out.write(content)
                print(f"Saved step {step} content")
