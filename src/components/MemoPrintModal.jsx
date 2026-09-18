import React from 'react';
import { X, Printer, FileSpreadsheet } from 'lucide-react';

export default function MemoPrintModal({ memo, onClose }) {
  if (!memo) return null;

  const handlePrint = () => {
    window.print();
  };

  const entries = memo.entries || [];
  
  // Calculate totals
  const totalPackages = entries.reduce((sum, e) => sum + Number(e.packages || 0), 0);
  const totalToPay = entries.reduce((sum, e) => sum + Number(e.toPay || 0), 0);
  const totalPaid = entries.reduce((sum, e) => sum + Number(e.paid || 0), 0);
  const totalTbb = entries.reduce((sum, e) => sum + Number(e.tbb || 0), 0);
  const totalAmount = totalToPay + totalPaid + totalTbb;
  
  const formattedDate = new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN');

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden my-auto border border-slate-300">
        
        {/* Modal Controls Bar (Hidden in Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md no-print z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm sm:text-base">Print Loading Memo</span>
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2.5 py-0.5 rounded font-bold border border-emerald-500/30">
                {memo.memoNo}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Memo
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
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-white font-serif text-black printable-area print:p-0">
          <div className="max-w-[1000px] mx-auto border-2 border-black print:border-2 print:border-black p-1">
            
            {/* Header section */}
            <div className="text-center border-b-2 border-black pb-2 mb-2">
              <h1 className="text-4xl font-extrabold uppercase tracking-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
                ROYAL ROADLINES
              </h1>
              <p className="text-[11px] font-medium leading-tight mt-1 px-4">
                MASJID BUNDER : C/O, G. Shantilal Transport B.I.T Bldg. No.3, Bhandari Street, Near masjid Bunder Station(W),Near Bhandari Police Chowki, Mumbai-400 003 Mob.8087209449. SAKINAKA : Gala No.7, Sarita Estate, Opp. St. Judes School,Hearoma Hotel & Lalji Transport, Sakinaka. Mob.9021521272
              </p>
            </div>

            {/* Top Info Grid */}
            <div className="grid grid-cols-2 border-b-2 border-black text-xs font-bold divide-x-2 divide-black">
              <div className="flex flex-col divide-y-2 divide-black">
                <div className="grid grid-cols-2 divide-x-2 divide-black">
                  <div className="p-1.5 uppercase text-center flex items-center justify-center">DATE</div>
                  <div className="p-1.5 text-center flex items-center justify-center font-mono">{formattedDate}</div>
                </div>
                <div className="grid grid-cols-2 divide-x-2 divide-black">
                  <div className="p-1.5 uppercase text-center flex items-center justify-center">MEMO NO.</div>
                  <div className="p-1.5 text-center flex items-center justify-center font-mono">{memo.memoNo}</div>
                </div>
                <div className="grid grid-cols-2 divide-x-2 divide-black">
                  <div className="p-1.5 uppercase text-center flex items-center justify-center">FROM :</div>
                  <div className="p-1.5 text-center flex items-center justify-center">{memo.fromStation || 'SANGLI'}</div>
                </div>
              </div>

              <div className="flex flex-col divide-y-2 divide-black">
                <div className="grid grid-cols-2 divide-x-2 divide-black">
                  <div className="p-1.5 uppercase text-center flex items-center justify-center">VEHICAL NO.</div>
                  <div className="p-1.5 text-center flex items-center justify-center font-mono">{memo.lorryNo}</div>
                </div>
                <div className="grid grid-cols-2 divide-x-2 divide-black">
                  <div className="p-1.5 uppercase text-center flex items-center justify-center">DRIVER NAME</div>
                  <div className="p-1.5 text-center flex items-center justify-center">{memo.driverName}</div>
                </div>
                <div className="grid grid-cols-2 divide-x-2 divide-black">
                  <div className="p-1.5 uppercase text-center flex items-center justify-center">TO :</div>
                  <div className="p-1.5 text-center flex items-center justify-center">AS PER LRs</div>
                </div>
              </div>
            </div>

            {/* Entries Table */}
            <table className="w-full text-xs text-center border-collapse border-b-2 border-black">
              <thead>
                <tr className="border-b-2 border-black divide-x-2 divide-black font-bold uppercase">
                  <th className="p-1.5 w-[5%]" rowSpan="2">SR.NO.</th>
                  <th className="p-1.5 w-[12%]" rowSpan="2">L.R.NO.</th>
                  <th className="p-1.5 w-[6%]" rowSpan="2">PKG</th>
                  <th className="p-1.5 w-[20%]" rowSpan="2">CONSIGNOR</th>
                  <th className="p-1.5 w-[20%]" rowSpan="2">CONSIGNEE</th>
                  <th className="p-1.5 w-[12%]" rowSpan="2">STATION</th>
                  <th className="p-1 border-b-2 border-black w-[25%]" colSpan="3">AMOUNT</th>
                </tr>
                <tr className="border-b-2 border-black divide-x-2 divide-black font-bold uppercase">
                  <th className="p-1 w-[33%] border-l-2 border-black">TOPAY</th>
                  <th className="p-1 w-[33%]">PAID</th>
                  <th className="p-1 w-[33%]">T.B.B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/30 font-medium">
                {entries.length === 0 ? (
                  <tr><td colSpan="9" className="p-4 text-slate-500">No LRs in this memo.</td></tr>
                ) : (
                  entries.map((entry, idx) => (
                    <tr key={idx} className="divide-x-2 divide-black">
                      <td className="p-1">{entry.srNo || (idx + 1)}</td>
                      <td className="p-1 font-mono font-bold">{entry.lrNo}</td>
                      <td className="p-1 font-bold">{entry.packages}</td>
                      <td className="p-1 text-left px-2 truncate max-w-[120px]" title={entry.consignor}>{entry.consignor}</td>
                      <td className="p-1 text-left px-2 truncate max-w-[120px]" title={entry.consignee}>{entry.consignee}</td>
                      <td className="p-1 uppercase text-[10px] font-bold">{entry.station}</td>
                      <td className="p-1">{entry.toPay > 0 ? entry.toPay : '-'}</td>
                      <td className="p-1">{entry.paid > 0 ? entry.paid : '-'}</td>
                      <td className="p-1">{entry.tbb > 0 ? entry.tbb : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Entries Totals Row */}
              <tfoot className="border-t-2 border-black font-bold divide-x-2 divide-black bg-slate-50 print:bg-white">
                <tr>
                  <td colSpan="6" className="p-1 text-right pr-4">LR AMOUNTS TOTAL</td>
                  <td className="p-1">{totalToPay > 0 ? totalToPay : 0}</td>
                  <td className="p-1">{totalPaid > 0 ? totalPaid : 0}</td>
                  <td className="p-1">{totalTbb > 0 ? totalTbb : 0}</td>
                </tr>
              </tfoot>
            </table>

            {/* Bottom Footer Section */}
            <div className="grid grid-cols-4 divide-x-2 divide-black text-xs font-bold border-b-2 border-black h-24">
              <div className="flex flex-col text-center border-r-2 border-black col-span-1">
                <div className="p-1 border-b-2 border-black">NO. OF .PKG</div>
                <div className="p-1 flex-1 flex items-center justify-center font-bold text-lg">
                  {totalPackages}
                </div>
              </div>
              <div className="flex flex-col text-center border-r-2 border-black col-span-1">
                <div className="p-1 border-b-2 border-black">VEHICAL FREIGHT</div>
                <div className="p-1 flex-1 flex items-center justify-center"></div>
              </div>
              <div className="flex flex-col text-center border-r-2 border-black col-span-1 relative">
                <div className="absolute inset-0 flex items-center justify-center uppercase text-slate-300 pointer-events-none print:text-black/10">ADVANCE</div>
              </div>
              
              {/* Financial Summary */}
              <div className="flex flex-col divide-y divide-black col-span-1">
                <div className="grid grid-cols-2 divide-x divide-black flex-1">
                  <div className="p-1 flex items-center justify-center text-[10px]">TOTAL FREIGHT</div>
                  <div className="p-1 flex items-center justify-center"></div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-black flex-1">
                  <div className="p-1 flex items-center justify-center text-[10px]">LOADING CHARGES</div>
                  <div className="p-1 flex items-center justify-center"></div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-black flex-1 border-t-2 border-black">
                  <div className="p-1 flex items-center justify-center text-[10px]">G. TOTAL</div>
                  <div className="p-1 flex items-center justify-center text-sm">{totalAmount}</div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 text-xs font-bold h-16">
              <div className="flex items-end justify-center pb-2 border-r-2 border-black">
                DRIVER SIGN
              </div>
              <div className="flex items-end justify-center pb-2">
                FOR ROYAL ROADLINES
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
