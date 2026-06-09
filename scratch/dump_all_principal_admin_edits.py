import os
import json

path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"
out_dir = "/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/all_pa_edits"
os.makedirs(out_dir, exist_ok=True)

with open(path, "r") as f:
    for line in f:
        obj = json.loads(line)
        step = obj.get("step_index")
        
        tool_calls = obj.get("tool_calls", [])
        for i, tc in enumerate(tool_calls):
            name = tc.get("name") or tc.get("method") or ""
            args = tc.get("args") or tc.get("arguments") or {}
            target = args.get("TargetFile") or args.get("AbsolutePath") or ""
            if "PrincipalAdmin.jsx" in target:
                print(f"Step {step}: {name} modifying {target}")
                out_path = os.path.join(out_dir, f"step_{step}_tc_{i}_{name}.json")
                with open(out_path, "w") as out_f:
                    json.dump(tc, out_f, indent=2)
