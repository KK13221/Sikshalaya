import json
import os

path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"

out_dir = "/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/extracted_edits"
os.makedirs(out_dir, exist_ok=True)

with open(path, "r") as f:
    for line in f:
        obj = json.loads(line)
        step = obj.get("step_index")
        
        # Check for tool_calls in planner responses or actions
        tool_calls = obj.get("tool_calls", [])
        for i, tc in enumerate(tool_calls):
            method = tc.get("method")
            args = tc.get("args", {})
            
            # Check if PrincipalAdmin.jsx is in args
            target_file = args.get("TargetFile", "")
            absolute_path = args.get("AbsolutePath", "")
            
            if "PrincipalAdmin.jsx" in str(target_file) or "PrincipalAdmin.jsx" in str(absolute_path):
                # Save the full edit details to a file
                out_path = os.path.join(out_dir, f"step_{step}_tc_{i}_{method}.json")
                with open(out_path, "w") as out_f:
                    json.dump(tc, out_f, indent=2)
                print(f"Saved step {step} {method} to {out_path}")
