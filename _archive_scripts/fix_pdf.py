import sys
import re

# 1. Fix StockOut.jsx
content = open('src/pages/StockOut.jsx', encoding='utf-8').read()
content = content.replace("import html2pdf from 'html2pdf.js';", "import html2canvas from 'html2canvas';\nimport { jsPDF } from 'jspdf';")

old_pdf_func = """            onClick={() => {
              const element = document.getElementById('printable-loading-memo');
              const opt = {
                margin:       0.2,
                filename:     `Memo_${memo.memoNo}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
              };
              html2pdf().set(opt).from(element).save();
            }}"""

new_pdf_func = """            onClick={async () => {
              try {
                const element = document.getElementById('printable-loading-memo');
                const canvas = await html2canvas(element, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Memo_${memo.memoNo}.pdf`);
              } catch(err) {
                alert("Error saving PDF: " + err.message);
              }
            }}"""

content = content.replace(old_pdf_func, new_pdf_func)
open('src/pages/StockOut.jsx', 'w', encoding='utf-8').write(content)

# 2. Fix MemoPrintModal.jsx
content2 = open('src/components/MemoPrintModal.jsx', encoding='utf-8').read()
content2 = content2.replace("import html2pdf from 'html2pdf.js';", "import html2canvas from 'html2canvas';\nimport { jsPDF } from 'jspdf';")

old_pdf_func2 = """  const handleDownloadPdf = () => {
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

new_pdf_func2 = """  const handleDownloadPdf = async () => {
    try {
      const element = document.getElementById('printable-memo-content');
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Memo_${memo.memoNo}.pdf`);
    } catch(err) {
      alert("Error saving PDF: " + err.message);
    }
  };"""

content2 = content2.replace(old_pdf_func2, new_pdf_func2)
open('src/components/MemoPrintModal.jsx', 'w', encoding='utf-8').write(content2)

# 3. Fix LRPrintModal.jsx
content3 = open('src/components/LRPrintModal.jsx', encoding='utf-8').read()
content3 = content3.replace("import html2pdf from 'html2pdf.js';", "import html2canvas from 'html2canvas';\nimport { jsPDF } from 'jspdf';")

old_pdf_func3 = """  const handleDownloadPdf = () => {
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

new_pdf_func3 = """  const handleDownloadPdf = async () => {
    try {
      const element = document.getElementById('printable-lr-content');
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`LR_${lr.lrNo}.pdf`);
    } catch(err) {
      alert("Error saving PDF: " + err.message);
    }
  };"""

content3 = content3.replace(old_pdf_func3, new_pdf_func3)
open('src/components/LRPrintModal.jsx', 'w', encoding='utf-8').write(content3)
