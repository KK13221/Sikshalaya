import json

with open("/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/scratch/step_117_chunks_raw.json", "r") as f:
    chunks = json.load(f)

if isinstance(chunks, str):
    print("Chunks is a string of length:", len(chunks))
    try:
        chunks = json.loads(chunks, strict=False)
    except Exception as e:
        print("Parsing failed:", e)
        print("Raw string contents:")
        print(chunks)
        chunks = []

print("Total chunks:", len(chunks))
for i, chunk in enumerate(chunks):
    print(f"\n==================== Chunk {i} ====================")
    print("StartLine:", chunk.get("StartLine"))
    print("EndLine:", chunk.get("EndLine"))
    print("TargetContent:", repr(chunk.get("TargetContent")))
    print("ReplacementContent:")
    print(chunk.get("ReplacementContent"))
