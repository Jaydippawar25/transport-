import sys
import re

filepath = 'src/pages/TransportAgent.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix totalGrandTotal
old_grand = "const totalGrandTotal = filteredMemos.reduce((sum, m) => sum + (Number(m.grandTotal) || 0), 0);"
new_grand = "const totalGrandTotal = sumToPay + sumPaid + sumTbb; // Use calculated sum to bypass any bad historical data"
content = content.replace(old_grand, new_grand)

# Fix row level grandTotal display
old_row = "???{Number(memo.grandTotal || 0).toLocaleString('en-IN')}"
new_row = "???{((Number(memo.totalToPay) || 0) + (Number(memo.totalPaid) || 0) + (Number(memo.totalTbb) || 0)).toLocaleString('en-IN')}"
content = content.replace(old_row, new_row)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated TransportAgent.jsx")
