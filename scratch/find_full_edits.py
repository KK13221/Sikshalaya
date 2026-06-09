import os
import json

path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"
out_dir = "/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/found_edit_details"
os.makedirs(out_dir, exist_ok=True)

with open(path, "r") as f:
    for line in f:
        obj = json.loads(line)
        step = obj.get("step_index")
        
        # Look at both tool_calls and the content field
        tool_calls = obj.get("tool_calls", [])
        for i, tc in enumerate(tool_calls):
            # Check name or method
            name = tc.get("name") or tc.get("method") or ""
            args = tc.get("args") or tc.get("arguments") or {}
            
            # Convert args to string to check if TestTypesView is inside
            args_str = json.dumps(args)
            if "TestTypesView" in args_str:
                out_path = os.path.join(out_dir, f"step_{step}_tc_{i}_{name}.json")
                with open(out_path, "w") as out_f:
                    json.dump(tc, out_f, indent=2)
                print(f"Saved step {step} {name} to {out_path} (args size: {len(args_str)})")
                
                # Extract ReplacementContent if present
                rep_content = args.get("ReplacementContent")
                if rep_content:
                    with open(os.path.join(out_dir, f"step_{step}_tc_{i}_{name}_ReplacementContent.txt"), "w") as out_txt:
                        out_txt.write(rep_content)
                
                # Extract CodeContent if present
                code_content = args.get("CodeContent")
                if code_content:
                    with open(os.path.join(out_dir, f"step_{step}_tc_{i}_{name}_CodeContent.txt"), "w") as out_txt:
                        out_txt.write(code_content)

                # Extract ReplacementChunks if present
                chunks = args.get("ReplacementChunks")
                if chunks:
                    if isinstance(chunks, str):
                        try:
                            chunks = json.loads(chunks)
                        except:
                            pass
                    if isinstance(chunks, list):
                        for chunk_idx, chunk in enumerate(chunks):
                            if isinstance(chunk, dict):
                                chunk_rep = chunk.get("ReplacementContent")
                                if chunk_rep:
                                    with open(os.path.join(out_dir, f"step_{step}_tc_{i}_{name}_chunk_{chunk_idx}.txt"), "w") as out_txt:
                                        out_txt.write(chunk_rep)

