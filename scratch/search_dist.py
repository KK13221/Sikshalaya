import re

path = "/Users/shubhamjain/Documents/Kamlesh/Sikshalaya/dist/assets/index-DcHdPZqS.js"

with open(path, "r", encoding="utf-8") as f:
    js = f.read()

# Let's search for some strings we know were in the test types code
# e.g. "Test Types", "mock_exam", "showInReport"
queries = ["mock_exam", "Test Types", "showInReport", "Sublabel (Optional context)"]
for q in queries:
    pos = js.find(q)
    print(f"Query '{q}' found at position: {pos}")
    if pos != -1:
        # print some context around it
        print("Context:")
        print(js[max(0, pos-200):pos+800])
        print("-" * 50)
