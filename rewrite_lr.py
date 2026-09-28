import sys
content = open('src/components/LRPrintModal.jsx', encoding='utf-8').read()

import_statement = "import { X, Printer, Download } from 'lucide-react';\nimport html2pdf from 'html2pdf.js';"
content = content.replace("import { X, Printer } from 'lucide-react';", import_statement)

download_func = """  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('printable-lr-content');
    const opt = {
      margin:       0.1,
      filename:     `LR_${lr.lrNo}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };"""
content = content.replace("  const handlePrint = () => {\n    window.print();\n  };", download_func)

buttons = """            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Save PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>"""
content = content.replace("""            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>""", buttons)

content = content.replace('className={`p-3 sm:p-6 print:p-0 overflow-y-auto flex-1 printable-area bg-[#fef9c3] text-black font-sans ${printCopies === 3 ? \'print-3-copies\' : \'\'}`}', 'id="printable-lr-content" className={`p-3 sm:p-6 print:p-0 overflow-y-auto flex-1 printable-area bg-[#fef9c3] text-black font-sans ${printCopies === 3 ? \'print-3-copies\' : \'\'}`}')

open('src/components/LRPrintModal.jsx', 'w', encoding='utf-8').write(content)
