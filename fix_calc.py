import sys

filepath = 'src/pages/StockOut.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """  const totalPackages = memoEntries.reduce((sum, e) => sum + e.packages, 0);
  const totalToPay = memoEntries.reduce((sum, e) => sum + e.toPay, 0);
  const totalPaid = memoEntries.reduce((sum, e) => sum + e.paid, 0);
  const totalTbb = memoEntries.reduce((sum, e) => sum + (e.tbb || 0), 0);
  const grandTotal = totalToPay + totalPaid + totalTbb;"""

new_logic = """  const totalPackages = memoEntries.reduce((sum, e) => sum + Number(e.packages || 0), 0);
  const totalToPay = memoEntries.reduce((sum, e) => sum + Number(e.toPay || 0), 0);
  const totalPaid = memoEntries.reduce((sum, e) => sum + Number(e.paid || 0), 0);
  const totalTbb = memoEntries.reduce((sum, e) => sum + Number(e.tbb || 0), 0);
  const grandTotal = totalToPay + totalPaid + totalTbb;"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    print("Replaced logic in StockOut.jsx")
else:
    print("Could not find exact block in StockOut.jsx")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
