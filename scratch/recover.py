import os, json

def find_file(start_dir, name):
    for root, dirs, files in os.walk(start_dir):
        if name in files:
            return os.path.join(root, name)
    return None

path = find_file("/Users/shubhamjain/.gemini/antigravity/brain/f7a0b14d-8a6e-4317-9440-6e98c0661b0f", "transcript.jsonl")
print("Found transcript.jsonl:", path)

if path:
    with open(path, "r") as f:
        for line in f:
            if "TestTypesView" in line:
                # Find tool_calls or content
                try:
                    obj = json.loads(line)
                    # print some info
                    print("Step:", obj.get("step_index"), "Type:", obj.get("type"))
                    if "tool_calls" in obj:
                        for tc in obj["tool_calls"]:
                            if "TestTypesView" in str(tc):
                                print("Found in tool call arguments!")
                                # print the arguments key containing the code
                                args = tc.get("arguments", {})
                                for k, v in args.items():
                                    if "TestTypesView" in str(v):
                                        print(f"Arg {k}:")
                                        print(str(v)[:2000] + "...")
                except Exception as e:
                    pass
