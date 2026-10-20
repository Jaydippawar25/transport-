import sys

filepath = 'src/pages/StockOut.jsx'
content = open(filepath, encoding='utf-8').read()

print_button_code = """          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print
          </button>"""

content = content.replace(print_button_code, "")

open(filepath, 'w', encoding='utf-8').write(content)
