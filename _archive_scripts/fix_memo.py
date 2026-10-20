import re

with open("src/pages/StockOut.jsx", "r") as f:
    content = f.read()

# Fix memoEntries mapping
pattern = r'toPay:\s*custom\.toPay,\s*paid:\s*custom\.paid,\s*tbb:\s*custom\.tbb'
replacement = r'toPay: custom.toPay || 0,\n      paid: custom.paid || 0,\n      tbb: custom.tbb || 0'
new_content = re.sub(pattern, replacement, content)

# Also fix the weight, consignor, consignee in case they are undefined
new_content = new_content.replace('consignor: lr.consignorName,', "consignor: lr.consignorName || '',")
new_content = new_content.replace('consignee: lr.consigneeName,', "consignee: lr.consigneeName || '',")
new_content = new_content.replace('weight: lr.weight || \'\',', "weight: lr.weight || '',")

with open("src/pages/StockOut.jsx", "w") as f:
    f.write(new_content)
print("Patched StockOut.jsx")
