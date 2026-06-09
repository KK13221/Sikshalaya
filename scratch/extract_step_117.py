import json

path = "/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f/.system_generated/logs/transcript.jsonl"

with open(path, "r") as f:
    for line in f:
        obj = json.loads(line)
        if obj.get("step_index") == 117:
            # Print the tool calls in step 117 in a clean formatted way
            print("Step 117 tool calls:")
            for tc in obj.get("tool_calls", []):
                print("Method:", tc.get("method"))
                args = tc.get("args", {})
                for k, v in args.items():
                    print(f"Arg {k}:")
                    # If it's a list or dict, print length or type
                    if isinstance(v, (list, dict)):
                        print(f"  Type: {type(v)}, Len: {len(v)}")
                    else:
                        print(f"  Value (truncated): {str(v)[:300]}...")
                        # Let's save the exact value of ReplacementChunks to a file without parsing issues
                        if k == "ReplacementChunks":
                            with open("/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/step_117_chunks_raw.json", "w") as out:
                                json.dump(v, out, indent=2)
                            print("  Saved raw ReplacementChunks to scratch/step_117_chunks_raw.json")
        elif obj.get("step_index") == 119:
            print("Step 119 tool calls:")
            for tc in obj.get("tool_calls", []):
                print("Method:", tc.get("method"))
                args = tc.get("args", {})
                for k, v in args.items():
                    print(f"Arg {k}:")
                    print(f"  Value: {v}")
