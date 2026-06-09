import json

path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"

with open(path, "r") as f:
    for line in f:
        obj = json.loads(line)
        step = obj.get("step_index")
        
        # Look for function TestTypesView
        obj_str = json.dumps(obj)
        if "function TestTypesView" in obj_str:
            print(f"=== Step {step} ===")
            # Let's search tool_calls
            tool_calls = obj.get("tool_calls", [])
            for tc in tool_calls:
                args = tc.get("args") or tc.get("arguments") or {}
                for k, v in args.items():
                    if "function TestTypesView" in str(v):
                        print(f"  Found in tool arg: {k}, type={type(v)}")
                        if isinstance(v, str):
                            print(f"  String starts with: {v[:200]}")
                            # Save to file
                            with open(f"/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/step_{step}_arg_{k}.txt", "w") as out:
                                out.write(v)
            content = obj.get("content", "")
            if "function TestTypesView" in content:
                print(f"  Found in content field, len={len(content)}")
                print(f"  Content starts with: {content[:200]}")
                with open(f"/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/step_{step}_content_field.txt", "w") as out:
                    out.write(content)
