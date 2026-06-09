import json

path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"

with open(path, "r") as f:
    for line in f:
        obj = json.loads(line)
        step = obj.get("step_index")
        
        # Check if the word TestTypesView is in tool_calls or content
        text_representation = json.dumps(obj)
        if "TestTypesView" in text_representation:
            print(f"Step {step}: type={obj.get('type')}, status={obj.get('status')}")
            # print some info about the tool calls
            tool_calls = obj.get("tool_calls", [])
            for tc in tool_calls:
                method = tc.get("method")
                args = tc.get("args", {})
                print(f"  Tool: {method}")
                # Print keys of args
                print(f"    Args keys: {list(args.keys())}")
                if "CodeContent" in args:
                    print(f"    CodeContent len: {len(args['CodeContent'])}")
                if "ReplacementContent" in args:
                    print(f"    ReplacementContent len: {len(args['ReplacementContent'])}")
                if "TargetContent" in args:
                    print(f"    TargetContent len: {len(args['TargetContent'])}")
