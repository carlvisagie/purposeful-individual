#!/usr/bin/env python3
"""
Remove duplicate table definitions from schema-postgresql.ts
Keeps only the FIRST occurrence of each export const
"""

import re
from pathlib import Path

schema_file = Path("drizzle/schema-postgresql.ts")
content = schema_file.read_text()

# Find all export const table definitions with their full content
# Pattern: export const tableName = pgTable("...", { ... });
pattern = r'(export const \w+ = pgTable\([^;]+\);)'

seen_names = set()
lines_to_keep = []
current_line = []
in_table_def = False
table_name = None

for line in content.split('\n'):
    # Check if this line starts a new table definition
    match = re.match(r'export const (\w+) = pgTable\(', line)
    
    if match:
        table_name = match.group(1)
        in_table_def = True
        current_line = [line]
        
        # Check if it's a single-line definition
        if line.rstrip().endswith(');'):
            in_table_def = False
            if table_name not in seen_names:
                seen_names.add(table_name)
                lines_to_keep.extend(current_line)
            else:
                print(f"Removing duplicate: {table_name}")
            current_line = []
            table_name = None
    elif in_table_def:
        current_line.append(line)
        # Check if this line ends the table definition
        if line.rstrip().endswith(');'):
            in_table_def = False
            if table_name not in seen_names:
                seen_names.add(table_name)
                lines_to_keep.extend(current_line)
            else:
                print(f"Removing duplicate: {table_name}")
            current_line = []
            table_name = None
    else:
        # Regular line (not part of table definition)
        lines_to_keep.append(line)

# Write back
output = '\n'.join(lines_to_keep)
schema_file.write_text(output)

print(f"\n✅ Deduplication complete!")
print(f"Kept {len(seen_names)} unique tables")
