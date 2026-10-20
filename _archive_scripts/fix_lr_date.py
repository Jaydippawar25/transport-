import sys

filepath = 'src/components/LRPrintModal.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_date = "const formattedDate = formatDateString(lr.date || lr.createdAt);"
new_date = "const formattedDate = formatDateString(new Date()); // Always show current live time"

if old_date in content:
    content = content.replace(old_date, new_date)
    print("LRPrintModal date updated successfully.")
else:
    print("Could not find the target string in LRPrintModal.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

