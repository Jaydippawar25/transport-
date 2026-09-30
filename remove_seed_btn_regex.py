import sys
import re

filepath = 'src/pages/Dashboard.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Try to remove the button using regex
pattern = r"<button[^>]*onClick=\{handleSeedData\}[^>]*>[\s\S]*?</button>"
content_new = re.sub(pattern, "", content)

if content_new != content:
    print("Seed button removed via regex.")
else:
    print("Still could not find it.")

# Also remove handleSeedData function to keep code clean
func_pattern = r"const handleSeedData = async \(\) => \{[\s\S]*?setIsSeeding\(false\);\s*\};"
content_new = re.sub(func_pattern, "", content_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content_new)
