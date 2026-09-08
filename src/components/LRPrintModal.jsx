import React, { useState } from 'react';
import { X, Printer } from 'lucide-react';
import LRBillSlip from './LRBillSlip';

export default function LRPrintModal({ lr, onClose }) {
  const [printCopies, setPrintCopies] = useState(3); // 3 copies on 1 page by default

  if (!lr) return null;

  const handlePrint = () => {
    window.print();
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

  const formattedDate = formatDateString(lr.date || lr.createdAt);

  const copiesList = [
    { id: 1, title: 'CONSIGNOR COPY' },
    { id: 2, title: 'CONSIGNEE COPY' },
    { id: 3, title: 'DRIVER / GODOWN COPY' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto border border-slate-300">
        
        {/* Top Control Bar (Sticky Header, Hidden in Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md no-print z-20">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm sm:text-base">Stock In LR Bill Preview</span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
              lr.status === 'dispatched' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {lr.status || 'in-godown'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Copies Selector Toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPrintCopies(3)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  printCopies === 3 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                3 Copies (1 Page)
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
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>
            
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE PHYSICAL LR BILL SLIPS CONTAINER - SCROLLABLE AREA */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 printable-area bg-[#fef9c3] text-black font-sans">
          
          <div className="mx-1 sm:mx-4 space-y-2">
            {printCopies === 3 ? (
              copiesList.map((copyItem, index) => (
                <React.Fragment key={copyItem.id}>
                  <LRBillSlip
                    lr={lr}
                    copyTitle={copyItem.title}
                    formattedDate={formattedDate}
                  />
                  {index < copiesList.length - 1 && (
                    <div className="my-1 flex items-center justify-center gap-2 text-slate-500 text-[9px] font-mono no-print">
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
              />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
