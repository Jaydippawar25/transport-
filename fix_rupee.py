import sys

filepath = 'src/pages/TransportAgent.jsx'
content = open(filepath, encoding='utf-8').read()

content = content.replace("?{totalToPay", "?{totalToPay")
content = content.replace("?{totalPaid", "?{totalPaid")
content = content.replace("?{totalTbb", "?{totalTbb")
content = content.replace("?{totalGrandTotal", "?{totalGrandTotal")

open(filepath, 'w', encoding='utf-8').write(content)
