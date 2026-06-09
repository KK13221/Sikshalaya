import json

path = "/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/found_edit_details/step_117_tc_0_multi_replace_file_content.json"
with open(path, "r") as f:
    obj = json.load(f)

args = obj.get("args") or obj.get("arguments") or {}
chunks_str = args.get("ReplacementChunks")
if isinstance(chunks_str, str):
    chunks = json.loads(chunks_str, strict=False)
else:
    chunks = chunks_str

print("Number of chunks in step 117:", len(chunks))
for idx, chunk in enumerate(chunks):
    print(f"\n--- Chunk {idx} (Lines {chunk.get('StartLine')} - {chunk.get('EndLine')}) ---")
    print("TargetContent:")
    print(chunk.get("TargetContent"))
    print("\nReplacementContent:")
    print(chunk.get("ReplacementContent"))
