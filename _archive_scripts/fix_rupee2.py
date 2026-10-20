import sys
import re

filepath = 'src/pages/TransportAgent.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any non-alphanumeric character before {total...
content = re.sub(r'[^a-zA-Z0-9\s:"]\{totalToPay', '?{totalToPay', content)
content = re.sub(r'[^a-zA-Z0-9\s:"]\{totalPaid', '?{totalPaid', content)
content = re.sub(r'[^a-zA-Z0-9\s:"]\{totalTbb', '?{totalTbb', content)
content = re.sub(r'[^a-zA-Z0-9\s:"]\{totalGrandTotal', '?{totalGrandTotal', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
