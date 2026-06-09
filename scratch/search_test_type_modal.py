import json

path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"

with open(path, "r") as f:
    for line in f:
        obj = json.loads(line)
        step = obj.get("step_index")
        type_ = obj.get("type")
        status = obj.get("status")
        
        # Convert the whole obj to string to check
        obj_str = json.dumps(obj)
        if "TestTypeModal" in obj_str:
            print(f"Step {step}: type={type_}, status={status}, length={len(obj_str)}")
            # If it's a replacement tool or similar, let's see details
            tool_calls = obj.get("tool_calls", [])
            for tc in tool_calls:
                print(f"  Tool: {tc.get('name') or tc.get('method')}")
