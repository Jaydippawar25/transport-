import sys
content = open('src/pages/StockOut.jsx', encoding='utf-8').read()

import_statement = "import { \n  Truck, \n  Plus, \n  Search, \n  Printer, \n  Download,\n  CheckCircle2,"
content = content.replace("import { \n  Truck, \n  Plus, \n  Search, \n  Printer, \n  CheckCircle2,", import_statement)

if "import html2pdf" not in content:
    content = content.replace("import { dataService }", "import html2pdf from 'html2pdf.js';\nimport { dataService }")

old_button_section = """        <div className="absolute top-4 right-4 flex items-center gap-3 print:hidden">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print
          </button>"""

new_button_section = """        <div className="absolute top-4 right-4 flex items-center gap-3 print:hidden">
          <button 
            onClick={() => {
              const element = document.getElementById('printable-loading-memo');
              const opt = {
                margin:       0.2,
                filename:     `Memo_${memo.memoNo}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
              };
              html2pdf().set(opt).from(element).save();
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Save PDF
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print
          </button>"""

content = content.replace(old_button_section, new_button_section)

# Add ID to printable area
content = content.replace('<div className="overflow-x-auto printable-area bg-white">', '<div id="printable-loading-memo" className="overflow-x-auto printable-area bg-white p-4">')

open('src/pages/StockOut.jsx', 'w', encoding='utf-8').write(content)
