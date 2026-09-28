import sys

filepath = 'src/pages/TransportAgent.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("TOPAY: ?{totalToPay", "TOPAY: ?{totalToPay")
content = content.replace("PAID: ?{totalPaid", "PAID: ?{totalPaid")
content = content.replace("TBB: ?{totalTbb", "TBB: ?{totalTbb")
content = content.replace("TOTAL AMT: ?{totalGrandTotal", "TOTAL AMT: ?{totalGrandTotal")
content = content.replace("AMOUNT (,1)", "AMOUNT (?)")
content = content.replace("TOTAL AMT: ,1{totalGrandTotal", "TOTAL AMT: ?{totalGrandTotal")
content = content.replace(",1{Number", "?{Number")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
