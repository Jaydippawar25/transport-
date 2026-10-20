import re

filepath = 'src/pages/StockOut.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the emerald-900 header
content = content.replace('bg-emerald-900 text-slate-800 font-bold text-[10px] sm:text-xs', 'bg-emerald-50 text-emerald-800 font-bold text-[10px] sm:text-xs')
# Fix the emerald-900 footer
content = content.replace('bg-emerald-900 font-bold text-slate-800 text-xs sm:text-sm border-t-2 border-emerald-900', 'bg-emerald-50 font-bold text-emerald-900 text-xs sm:text-sm border-t-2 border-emerald-200')

# Fix other dark fragments in that table
content = content.replace('bg-amber-950/60 text-amber-700', 'bg-amber-50 text-amber-700')
content = content.replace('bg-blue-950/60 text-blue-700', 'bg-blue-50 text-blue-700')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed remaining dark backgrounds in StockOut.jsx")
