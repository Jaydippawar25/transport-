import sys
import re

filepath = 'src/pages/TransportAgent.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("?{totalToPay", "?{totalToPay")
content = content.replace("?{totalPaid", "?{totalPaid")
content = content.replace("?{totalTbb", "?{totalTbb")
content = content.replace("?{totalGrandTotal", "?{totalGrandTotal")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
