import json

steps_to_extract = [651, 1276, 566]
path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"

with open(path, "r") as f:
    for line in f:
        obj = json.loads(line)
        step = obj.get("step_index")
        if step in steps_to_extract:
            print(f"=== STEP {step} ===")
            content = obj.get("content", "")
            print("Content length:", len(content))
            out_name = f"scratch/reconstructed_step_{step}.txt"
            with open(out_name, "w") as out_f:
                out_f.write(content)
            print("Saved to", out_name)
