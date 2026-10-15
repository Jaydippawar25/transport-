import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Download } from 'lucide-react';
import domtoimage from 'dom-to-image-more';
import { jsPDF } from 'jspdf';
import { exportPdfFile } from '../utils/exportUtils';
import LRBillSlip from './LRBillSlip';

export default function LRPrintModal({ lr, onClose }) {
  const [printCopies, setPrintCopies] = useState(3); // 3 copies on 1 page by default
  const [paperColor, setPaperColor] = useState('yellow'); // 'yellow' | 'white' (default: yellow like physical bilty)

  if (!lr) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      const element = document.getElementById('printable-lr-content');
      const scale = 2;
      const imgData = await domtoimage.toJpeg(element, {
        quality: 1.0,
        bgcolor: paperColor === 'yellow' ? '#fef9c3' : '#ffffff',
        width: element.clientWidth * scale,
        height: element.clientHeight * scale,
        style: {
          transform: 'scale(' + scale + ')',
          transformOrigin: 'top left'
        }
      });
      const canvas = { width: element.clientWidth * scale, height: element.clientHeight * scale };
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      await exportPdfFile(pdf, `LR_${lr.lrNo}.pdf`);
    } catch(err) {
      alert("Error saving PDF: " + err.message);
    }
  };

  // Format Date & Time like physical bill (e.g., 05-09-2026 04:18:24pm)
  const formatDateString = (dateInput) => {
    try {
      const d = dateInput ? new Date(dateInput) : new Date();
      const datePart = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
      const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toLowerCase();
      return `${datePart} ${timePart}`;
    } catch (e) {
      return dateInput || '';
    }
  };

  const formattedDate = formatDateString(new Date()); // Always show current live time

  const copiesList = [
    { id: 1, title: 'CONSIGNOR COPY' },
    { id: 2, title: 'CONSIGNEE COPY' },
    { id: 3, title: 'DRIVER / BOOKING COPY' }
  ];

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 overflow-hidden print:static print:block print:inset-auto print:bg-transparent print:overflow-visible">
      <div className="bg-white rounded-2xl print:rounded-none shadow-2xl print:shadow-none w-full max-w-4xl max-h-[92vh] print:max-h-none flex flex-col overflow-hidden my-auto print:my-0 border border-slate-300 print:border-none print:block print:overflow-visible">
        
        {/* Top Control Bar (Sticky Header, Hidden in Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md no-print z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-bold text-sm sm:text-base">Stock In LR Bill Preview</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
              lr.status === 'dispatched' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300 border border-slate-600'
            }`}>
              {lr.status || 'in-godown'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Paper Color Selector Toggle */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPaperColor('yellow')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  paperColor === 'yellow' ? 'bg-yellow-400 text-slate-900 shadow-sm font-black' : 'text-slate-400 hover:text-white'
                }`}
                title="Classic Yellow Bilty Paper"
              >
                <span>🟡</span> Yellow
              </button>
              <button
                type="button"
                onClick={() => setPaperColor('white')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  paperColor === 'white' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-400 hover:text-white'
                }`}
                title="Plain White Paper"
              >
                <span>⚪</span> White
              </button>
            </div>

            {/* Copies Selector Toggle */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPrintCopies(3)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  printCopies === 3 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                3 Copies
              </button>
              <button
                type="button"
                onClick={() => setPrintCopies(1)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  printCopies === 1 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                1 Copy
              </button>
            </div>

            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Save PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>
            
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE PHYSICAL LR BILL SLIPS CONTAINER - SCROLLABLE AREA */}
        <div id="printable-lr-content" className={`p-3 sm:p-6 print:p-0 overflow-y-auto flex-1 printable-area ${paperColor === 'yellow' ? 'bg-slate-200/90' : 'bg-slate-100'} print:bg-white text-black font-serif print:block print:overflow-visible print:h-auto ${printCopies === 3 ? 'print-3-copies' : ''}`}>
          
          <div className="mx-1 sm:mx-4 space-y-3 print:space-y-0 print:mx-0">
            {printCopies === 3 ? (
              copiesList.map((copyItem, index) => (
                <React.Fragment key={copyItem.id}>
                  <LRBillSlip
                    lr={lr}
                    copyTitle={copyItem.title}
                    formattedDate={formattedDate}
                    paperColor={paperColor}
                  />
                  {index < copiesList.length - 1 && (
                    <div className="my-1 print:my-0 flex items-center justify-center gap-2 text-slate-500 text-[9px] font-mono print:hidden">
                      <span className="border-b border-dashed border-slate-500 flex-1"></span>
                      <span className="font-bold">✂ TEAR / CUT HERE ({copyItem.title})</span>
                      <span className="border-b border-dashed border-slate-500 flex-1"></span>
                    </div>
                  )}
                </React.Fragment>
              ))
            ) : (
              <LRBillSlip
                lr={lr}
                copyTitle="ORIGINAL LR COPY"
                formattedDate={formattedDate}
                paperColor={paperColor}
              />
            )}
          </div>

        </div>

      </div>
    </div>
  , document.body);
}
