import sys
content = open('src/components/MemoPrintModal.jsx', encoding='utf-8').read()

import_statement = "import { X, Printer, Truck, Download } from 'lucide-react';\nimport html2pdf from 'html2pdf.js';"
content = content.replace("import { X, Printer, Truck } from 'lucide-react';", import_statement)

download_func = """  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('printable-memo-content');
    const opt = {
      margin:       0.2,
      filename:     `Memo_${memo.memoNo}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };"""
content = content.replace("  const handlePrint = () => {\n    window.print();\n  };", download_func)

buttons = """          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer ml-2"
            >
              <Download className="w-4 h-4" /> Save PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>"""
content = content.replace("""          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer ml-2"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>""", buttons)

content = content.replace('<div className="w-full max-w-[210mm] mx-auto print:w-auto print:max-w-none print:m-0 print:p-0">', '<div id="printable-memo-content" className="w-full max-w-[210mm] mx-auto print:w-auto print:max-w-none print:m-0 print:p-0 bg-white p-4">')

open('src/components/MemoPrintModal.jsx', 'w', encoding='utf-8').write(content)
