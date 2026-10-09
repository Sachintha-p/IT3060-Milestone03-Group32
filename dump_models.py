import os
import re

base_path = r"backend\smart-campus-backend\src\main\java\com\library\smart_campus_backend"

for root, dirs, files in os.walk(base_path):
    if "model" in root.split(os.sep):
        for f in files:
            if f.endswith(".java"):
                print(f"--- {f} ---")
                with open(os.path.join(root, f), "r") as fp:
                    content = fp.read()
                    table_match = re.search(r'@Table\(name\s*=\s*"([^"]+)"', content)
                    if table_match:
                        print(f"Table: {table_match.group(1)}")
                    else:
                        print("Table: Not found (Enum?)")
                    
                    fields = re.findall(r'(private\s+[\w<>]+\s+\w+;)', content)
                    for field in fields:
                        print("  " + field)
