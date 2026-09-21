import React, { useState } from 'react';
import { X, Printer, Truck } from 'lucide-react';
import LRBillSlip from './LRBillSlip';

export default function MemoPrintModal({ memo, onClose }) {
  const [printCopiesPerLr, setPrintCopiesPerLr] = useState(1); // 1 or 3 copies per LR

  if (!memo) return null;

  const handlePrint = () => {
    window.print();
  };

  const entries = memo.entries || [];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden my-auto border border-slate-300">
        
        {/* Modal Controls Bar (Hidden in Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md no-print z-20">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-sm sm:text-base">Stock Out LR Bills Print</span>
              <span className="bg-indigo-500/20 text-indigo-300 font-mono text-xs px-2.5 py-0.5 rounded font-bold border border-indigo-500/30">
                {memo.memoNo}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Copies selector */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPrintCopiesPerLr(1)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  printCopiesPerLr === 1 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                1 Copy
              </button>
              <button
                type="button"
                onClick={() => setPrintCopiesPerLr(3)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  printCopiesPerLr === 3 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                3 Copies (1 Page)
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print LR Bills
            </button>
            
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE BODY CONTENT - PHYSICAL YELLOW LR BILL SLIPS FOR STOCK OUT */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 printable-area bg-[#fef9c3] font-sans text-black">
          <div className="space-y-6">
            {entries.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 text-xs">
                No LRs loaded in this dispatch memo.
              </div>
            ) : (
              entries.map((entry, index) => {
                const copiesList = printCopiesPerLr === 3 ? [
                  { id: 1, title: 'CONSIGNOR COPY' },
                  { id: 2, title: 'CONSIGNEE COPY' },
                  { id: 3, title: 'DRIVER / GODOWN COPY' }
                ] : [
                  { id: 1, title: `STOCK OUT LR COPY (${entry.lrNo})` }
                ];

                return (
                  <div key={index} className="bg-[#fef9c3] p-4 rounded-xl border-2 border-slate-900 shadow-sm space-y-4">
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold no-print">
                      <span>LR #{entry.lrNo} — {entry.consignor} ➔ {entry.consignee}</span>
                      <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[11px]">
                        Delivery: {entry.deliveryPerson || 'Local Driver'}
                      </span>
                    </div>

                    {copiesList.map((copyItem, cIdx) => (
                      <React.Fragment key={copyItem.id}>
                        <LRBillSlip
                          lr={{
                            lrNo: entry.lrNo,
                            date: memo.date || memo.createdAt,
                            toStation: entry.station,
                            consignorName: entry.consignor,
                            consigneeName: entry.consignee,
                            packages: entry.packages,
                            deliveryPerson: entry.deliveryPerson,
                            toPay: entry.toPay,
                            paid: entry.paid,
                            tbb: entry.tbb
                          }}
                          copyTitle={copyItem.title}
                          formattedDate={new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN')}
                        />
                        {cIdx < copiesList.length - 1 && (
                          <div className="my-1 flex items-center justify-center gap-2 text-slate-500 text-[9px] font-mono no-print">
                            <span className="border-b border-dashed border-slate-500 flex-1"></span>
                            <span className="font-bold">✂ TEAR / CUT HERE ({copyItem.title})</span>
                            <span className="border-b border-dashed border-slate-500 flex-1"></span>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
