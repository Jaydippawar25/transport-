import React, { useState } from 'react';
import { X, Printer, Truck, FileText, FileStack } from 'lucide-react';
import LRBillSlip from './LRBillSlip';

export default function MemoPrintModal({ memo, onClose }) {
  const [viewMode, setViewMode] = useState('memo'); // 'memo' or 'lrs'
  const [printCopiesPerLr, setPrintCopiesPerLr] = useState(1); // 1 or 3 copies per LR

  if (!memo) return null;

  const handlePrint = () => {
    window.print();
  };

  const entries = memo.entries || [];
  
  const calcTotalWeight = entries.reduce((acc, curr) => acc + Number(curr.weight || 0), 0);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden my-auto border border-slate-300">
        
        {/* Modal Controls Bar (Hidden in Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md no-print z-20">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-sm sm:text-base">Stock Out Print</span>
              <span className="bg-indigo-500/20 text-indigo-300 font-mono text-xs px-2.5 py-0.5 rounded font-bold border border-indigo-500/30">
                {memo.memoNo}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('memo')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  viewMode === 'memo' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Loading Memo
              </button>
              <button
                type="button"
                onClick={() => setViewMode('lrs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  viewMode === 'lrs' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileStack className="w-3.5 h-3.5" /> LR Slips
              </button>
            </div>

            {viewMode === 'lrs' && (
              <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs ml-2">
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
            )}

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
          </div>
        </div>

        {/* PRINTABLE BODY CONTENT */}
        <div className={`p-4 sm:p-6 overflow-y-auto flex-1 printable-area font-sans text-black ${viewMode === 'lrs' ? 'bg-[#fef9c3]' : 'bg-white'}`}>
          
          {viewMode === 'memo' ? (
            /* LOADING MEMO / CHALLAN VIEW */
            <div className="w-full max-w-[210mm] mx-auto print:w-auto print:max-w-none print:m-0 print:p-0">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                <div className="w-1/3">
                  <div className="text-[10px] uppercase font-bold text-slate-700">SUBJECT TO ICHALKARANJI JURISDICTION</div>
                </div>
                <div className="w-1/3 text-center">
                  <h1 className="text-3xl font-black tracking-wider uppercase text-black" style={{ textShadow: '1px 1px 0px #ea580c, -1px -1px 0px #0284c7' }}>
                    ROYAL ROADLINES
                  </h1>
                </div>
                <div className="w-1/3 text-[9px] text-right leading-tight">
                  <div className="font-bold text-[11px] mb-0.5">GSTIN : 27MOJPS8633C1ZC</div>
                  <div>MASJID BUNDER : C/O, G. Shantilal Transport B.I.T Bldg. No.3, Bhandari Street, Near masjid Bunder Station(W),Near Bhandari Police Chowki, Mumbai-400 003 Mob.8087209449. SAKINAKA : Gala No.7, Sarita Estate, Opp. St. Judes School,Hearoma Hotel & Lalji Transport, Sakinaka. Mob.9021521272</div>
                </div>
              </div>

              {/* Sub Header */}
              <div className="flex justify-between text-xs font-bold mb-2">
                <div className="space-y-1">
                  <div>Memo No.: {memo.memoNo}</div>
                  <div>Driver Name: {memo.driverName}</div>
                </div>
                <div className="space-y-1 text-center">
                  <div>Owner Name: _________________</div>
                </div>
                <div className="space-y-1 text-right">
                  <div>Date: {new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN')}</div>
                  <div>Lorry No.: {memo.lorryNo}</div>
                </div>
              </div>

              {/* Table */}
              <table className="w-full border-collapse border-2 border-black text-[10px] sm:text-xs">
                <thead>
                  <tr className="border-b-2 border-black font-bold bg-slate-100/50">
                    <th className="border-r border-black py-1 px-1 text-center w-8">S/R</th>
                    <th className="border-r border-black py-1 px-1">LR No</th>
                    <th className="border-r border-black py-1 px-1 text-center w-10">PKG</th>
                    <th className="border-r border-black py-1 px-1 text-center w-12">Wt.Kg</th>
                    <th className="border-r border-black py-1 px-1 text-left">Consignor</th>
                    <th className="border-r border-black py-1 px-1 text-left">Consignee</th>
                    <th className="border-r border-black py-1 px-1 text-left">Station</th>
                    <th className="border-r border-black py-1 px-1 text-right w-16">ToPay</th>
                    <th className="border-r border-black py-1 px-1 text-right w-16">PAID</th>
                    <th className="border-r border-black py-1 px-1 text-right w-16">TBB</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border-r border-black py-1 px-1 text-center">{idx + 1}</td>
                      <td className="border-r border-black py-1 px-1 font-bold">{e.lrNo}</td>
                      <td className="border-r border-black py-1 px-1 text-center font-bold">{e.packages}</td>
                      <td className="border-r border-black py-1 px-1 text-center font-bold">{e.weight || '-'}</td>
                      <td className="border-r border-black py-1 px-1 uppercase truncate max-w-[120px]" title={e.consignor}>{e.consignor}</td>
                      <td className="border-r border-black py-1 px-1 uppercase truncate max-w-[120px]" title={e.consignee}>{e.consignee}</td>
                      <td className="border-r border-black py-1 px-1 uppercase">{e.station || e.toStation}</td>
                      <td className="border-r border-black py-1 px-1 text-right font-bold">{e.toPay > 0 ? e.toPay : ''}</td>
                      <td className="border-r border-black py-1 px-1 text-right font-bold">{e.paid > 0 ? e.paid : ''}</td>
                      <td className="border-r border-black py-1 px-1 text-right font-bold">{e.tbb > 0 ? e.tbb : ''}</td>
                    </tr>
                  ))}
                  {/* Empty rows to fill space? Not strictly necessary. */}
                </tbody>
                <tfoot>
                  <tr className="font-bold border-t-2 border-black bg-slate-100">
                    <td colSpan={2} className="border-r border-black py-1.5 px-2 text-right">Total</td>
                    <td className="border-r border-black py-1.5 px-1 text-center">{memo.totalPackages}</td>
                    <td className="border-r border-black py-1.5 px-1 text-center">{calcTotalWeight > 0 ? calcTotalWeight : ''}</td>
                    <td colSpan={3} className="border-r border-black py-1.5 px-1"></td>
                    <td className="border-r border-black py-1.5 px-1 text-right text-[11px]">{memo.totalToPay > 0 ? memo.totalToPay.toLocaleString('en-IN') : ''}</td>
                    <td className="border-r border-black py-1.5 px-1 text-right text-[11px]">{memo.totalPaid > 0 ? memo.totalPaid.toLocaleString('en-IN') : ''}</td>
                    <td className="border-r border-black py-1.5 px-1 text-right text-[11px]">{memo.totalTbb > 0 ? memo.totalTbb.toLocaleString('en-IN') : ''}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Footer Section */}
              <div className="flex justify-between items-end mt-6">
                <div className="w-1/3 flex flex-col space-y-4 font-bold text-sm ml-4 italic text-slate-800">
                  <div className="flex items-end">
                    <span className="w-20">Freight (-)</span>
                    <span className="border-b border-black w-32 ml-2"></span>
                  </div>
                  <div className="flex items-end">
                    <span className="w-20">Loading (-)</span>
                    <span className="border-b border-black w-32 ml-2"></span>
                  </div>
                  <div className="flex items-end">
                    <span className="w-20">Others</span>
                    <span className="border-b border-black w-32 ml-2"></span>
                  </div>
                  <div className="flex items-end mt-4">
                    <span className="w-20 text-lg">Net Bal.</span>
                    <span className="border-b-2 border-black w-32 ml-2"></span>
                  </div>
                </div>
                <div className="w-1/3 text-right flex flex-col items-end">
                  <div className="font-bold border-t border-black pt-1 w-48 text-center mt-20">
                    For Royal Roadlines
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* LR SLIPS VIEW */
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
                    { id: 3, title: 'DRIVER / BOOKING COPY' }
                  ] : [
                    { id: 1, title: `STOCK OUT LR COPY (${entry.lrNo})` }
                  ];

                  return (
                    <div key={index} className="bg-[#fef9c3] p-4 rounded-xl border-2 border-slate-900 shadow-sm space-y-4">
                      <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold no-print">
                        <span>LR #{entry.lrNo} - {entry.consignor} - {entry.consignee}</span>
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
                              weight: entry.weight,
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
          )}
        </div>
      </div>
    </div>
  );
}
