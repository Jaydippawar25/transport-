import sys
import re

filepath = 'src/pages/TransportAgent.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix row level grandTotal display
content = re.sub(
    r"Number\(memo\.grandTotal\s*\|\|\s*0\)",
    r"((Number(memo.totalToPay) || 0) + (Number(memo.totalPaid) || 0) + (Number(memo.totalTbb) || 0))",
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated TransportAgent.jsx with regex")
