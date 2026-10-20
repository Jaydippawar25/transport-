import re

with open("src/services/dataService.js", "r") as f:
    content = f.read()

# Let's see if we can find the updateStockOut method
pattern = r'(totalPaid:\s*Number\(memoData\.totalPaid\s*\|\|\s*0\),)'
replacement = r'\1\n      totalTbb: Number(memoData.totalTbb || 0),\n      grandTotal: Number(memoData.grandTotal || 0),\n      freight: Number(memoData.freight || 0),\n      loadingCharges: Number(memoData.loadingCharges || 0),\n      otherCharges: Number(memoData.otherCharges || 0),'

new_content = re.sub(pattern, replacement, content)

with open("src/services/dataService.js", "w") as f:
    f.write(new_content)
print("Patched dataService.js")
