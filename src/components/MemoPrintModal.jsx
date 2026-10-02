import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Truck, Download } from 'lucide-react';
import domtoimage from 'dom-to-image-more';
import { jsPDF } from 'jspdf';

export default function MemoPrintModal({ memo, stockIn = [], onClose }) {
  if (!memo) return null;

  const PAGE_SIZE = 30;
  const entries = memo.entries || [];
  const pages = [];
  
  if (entries.length === 0) {
    pages.push([]);
  } else {
    for (let i = 0; i < entries.length; i += PAGE_SIZE) {
      pages.push(entries.slice(i, i + PAGE_SIZE));
    }
  }

  // Calculate total weight (fallback to stockIn if old memo lacks weight)
  const calcTotalWeight = entries.reduce((acc, curr) => {
    const origLr = stockIn.find(lr => lr.id === curr.lrId || lr.lrNo === curr.lrNo);
    return acc + Number(origLr?.weight || curr.weight || 0);
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      // Changed to portrait as max-w is 210mm (A4 portrait width)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const scale = 2;
      
      for (let i = 0; i < pages.length; i++) {
        const element = document.getElementById(`print-page-${i}`);
        if (!element) continue;
        
        const imgData = await domtoimage.toJpeg(element, {
          quality: 1.0,
          bgcolor: '#ffffff',
          width: element.clientWidth * scale,
          height: element.clientHeight * scale,
          style: {
            transform: 'scale(' + scale + ')',
            transformOrigin: 'top left'
          }
        });
        
        if (i > 0) pdf.addPage();
        
        const canvas = { width: element.clientWidth * scale, height: element.clientHeight * scale };
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`Memo_${memo.memoNo}.pdf`);
    } catch(err) {
      alert("Error saving PDF: " + err.message);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden print:static print:block print:bg-transparent print:p-0 print:inset-auto print:overflow-visible">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden my-auto border border-slate-300 print:block print:max-h-none print:shadow-none print:border-none print:overflow-visible">
        
        {/* Modal Controls Bar (Hidden in Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md print:hidden z-20">
          
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
          </div>
        </div>

        {/* PRINTABLE BODY CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 printable-area font-sans text-black bg-white print:block print:overflow-visible print:h-auto print:p-0">
          <div id="printable-memo-content" className="w-full max-w-[210mm] mx-auto print:block print:w-full print:max-w-none print:m-0 print:p-0 bg-white">
            
            {pages.map((pageEntries, pageIndex) => {
              const isLastPage = pageIndex === pages.length - 1;
              return (
                <div 
                  key={pageIndex} 
                  id={`print-page-${pageIndex}`}
                  className={`p-4 bg-white print:p-0 ${!isLastPage ? 'print:break-after-page mb-8 print:mb-0' : ''}`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                    <div className="w-1/4">
                      <div className="text-[10px] uppercase font-bold text-slate-700 pr-2">SUBJECT TO ICHALKARANJI JURISDICTION</div>
                    </div>
                    <div className="w-2/4 text-center">
                      <h1 className="text-3xl font-serif font-black tracking-wider uppercase text-black whitespace-nowrap" style={{ textShadow: '1.5px 1.5px 0px #ea580c, -1.5px -1.5px 0px #0284c7' }}>
                        ROYAL ROADLINES
                      </h1>
                    </div>
                    <div className="w-1/4 text-[8.5px] text-right leading-tight pl-2">
                      <div className="font-bold text-[11px] mb-0.5">GSTIN : 27MOJPS8633C1ZC</div>
                      <div>MASJID BUNDER : C/O, G. Shantilal Transport B.I.T Bldg. No.3, Bhandari Street, Near masjid Bunder Station(W),Near Bhandari Police Chowki, Mumbai-400 003 Mob.8087209449. SAKINAKA : Gala No.7, Sarita Estate, Opp. St. Judes School,Hearoma Hotel & Lalji Transport, Sakinaka. Mob.9021521272</div>
                    </div>
                  </div>
                  
                  {/* Sub Header */}
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <div className="space-y-1">
                      <div>Memo No.: {memo.memoNo}</div>
                      <div>Driver Name: {memo.driverName}</div>
                      {memo.transportAgent && <div>Transport Agent: {memo.transportAgent}</div>}
                    </div>
                    <div className="space-y-1 text-center">
                      <div>Owner Name: {memo.ownerName || '_______________'}</div>
                      <div>To Station: {memo.toStation || '_______________'}</div>
                      {memo.transportAgentMobile && <div>Agent Mob.: {memo.transportAgentMobile}</div>}
                    </div>
                    <div className="space-y-1 text-right">
                      <div>Date: {(new Date(memo.date || memo.createdAt)).toLocaleDateString('en-IN')}</div>
                      <div>Lorry No.: {memo.lorryNo}</div>
                      {(memo.transportAgent || memo.transportAgentMobile) && <div className="text-transparent hidden sm:block">.</div>}
                    </div>
                  </div>

                  {/* Table */}
                  <table className="w-full border-collapse border-2 border-black text-[10px] sm:text-xs">
                    <thead>
                      <tr className="border-b-2 border-black font-bold bg-slate-100/50">
                        <th rowSpan={2} className="border-r border-black py-1 px-1 text-center w-8">SR.NO.</th>
                        <th rowSpan={2} className="border-r border-black py-1 px-1">L.R.NO.</th>
                        <th rowSpan={2} className="border-r border-black py-1 px-1 text-center w-10">PKG</th>
                        <th rowSpan={2} className="border-r border-black py-1 px-1 text-left">CONSIGNOR</th>
                        <th rowSpan={2} className="border-r border-black py-1 px-1 text-left">CONSIGNEE</th>
                        <th rowSpan={2} className="border-r border-black py-1 px-1 text-left">STATION</th>
                        <th rowSpan={2} className="border-r border-black py-1 px-1 text-center w-12">WEIGHT</th>
                        <th colSpan={3} className="border-b border-black py-1 px-1 text-center">AMOUNT</th>
                      </tr>
                      <tr className="border-b-2 border-black font-bold bg-slate-100/50">
                        <th className="border-r border-black py-1 px-1 text-right w-16">TOPAY</th>
                        <th className="border-r border-black py-1 px-1 text-right w-16">PAID</th>
                        <th className="py-1 px-1 text-right w-16">T.B.B</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageEntries.map((e, idx) => {
                        const origLr = stockIn.find(lr => lr.id === e.lrId || lr.lrNo === e.lrNo);
                        const displayWeight = origLr?.weight || e.weight || '-';
                        const globalIdx = (pageIndex * PAGE_SIZE) + idx + 1;
                        
                        return (
                        <tr key={idx} className="border-b border-black">
                          <td className="border-r border-black py-1 px-1 text-center">{globalIdx}</td>
                          <td className="border-r border-black py-1 px-1 font-bold">{e.lrNo}</td>
                          <td className="border-r border-black py-1 px-1 text-center font-bold">{e.packages}</td>
                          <td className="border-r border-black py-1 px-1 uppercase truncate max-w-[120px]" title={e.consignor}>{e.consignor}</td>
                          <td className="border-r border-black py-1 px-1 uppercase truncate max-w-[120px]" title={e.consignee}>{e.consignee}</td>
                          <td className="border-r border-black py-1 px-1 uppercase">{e.station || e.toStation}</td>
                          <td className="border-r border-black py-1 px-1 text-center font-bold">{displayWeight}</td>
                          <td className="border-r border-black py-1 px-1 text-right font-bold">{e.toPay > 0 ? e.toPay : ''}</td>
                          <td className="border-r border-black py-1 px-1 text-right font-bold">{e.paid > 0 ? e.paid : ''}</td>
                          <td className="py-1 px-1 text-right font-bold">{e.tbb > 0 ? e.tbb : ''}</td>
                        </tr>
                        );
                      })}
                    </tbody>
                    {isLastPage && (
                      <tfoot>
                        <tr className="font-bold border-t-2 border-black bg-slate-100">
                          <td colSpan={2} className="border-r border-black py-1.5 px-2 text-right">TOTAL</td>
                          <td className="border-r border-black py-1.5 px-1 text-center">{memo.totalPackages}</td>
                          <td colSpan={3} className="border-r border-black py-1.5 px-1"></td>
                          <td className="border-r border-black py-1.5 px-1 text-center">{calcTotalWeight > 0 ? calcTotalWeight : ''}</td>
                          <td className="border-r border-black py-1.5 px-1 text-right text-[11px]">{memo.totalToPay > 0 ? memo.totalToPay.toLocaleString('en-IN') : ''}</td>
                          <td className="border-r border-black py-1.5 px-1 text-right text-[11px]">{memo.totalPaid > 0 ? memo.totalPaid.toLocaleString('en-IN') : ''}</td>
                          <td className="py-1.5 px-1 text-right text-[11px]">{memo.totalTbb > 0 ? memo.totalTbb.toLocaleString('en-IN') : ''}</td>
                        </tr>
                        <tr className="font-bold border-t-2 border-black bg-slate-100">
                          <td colSpan={7} className="border-r border-black py-1.5 px-2 text-right">TOTAL L.R. AMOUNT</td>
                          <td colSpan={3} className="py-1.5 px-1 text-center">
                            { (Number(memo.totalToPay || 0) + Number(memo.totalPaid || 0) + Number(memo.totalTbb || 0)) > 0 
                                ? (Number(memo.totalToPay || 0) + Number(memo.totalPaid || 0) + Number(memo.totalTbb || 0)).toLocaleString('en-IN') 
                                : '' }
                          </td>
                        </tr>
                        <tr className="font-bold border-t-2 border-black bg-slate-100">
                          <td colSpan={7} className="border-r border-black py-1.5 px-2 text-right">FREIGHT</td>
                          <td colSpan={3} className="py-1.5 px-1 text-center">{memo.freight ? Number(memo.freight).toLocaleString('en-IN') : ''}</td>
                        </tr>
                        <tr className="font-bold bg-slate-100">
                          <td colSpan={7} className="border-r border-black py-1.5 px-2 text-right">LOADING CHARGES</td>
                          <td colSpan={3} className="py-1.5 px-1 text-center">{memo.loadingCharges ? Number(memo.loadingCharges).toLocaleString('en-IN') : ''}</td>
                        </tr>
                        <tr className="font-bold bg-slate-100">
                          <td colSpan={7} className="border-r border-black py-1.5 px-2 text-right">OTHER CHARGES</td>
                          <td colSpan={3} className="py-1.5 px-1 text-center">{memo.otherCharges ? Number(memo.otherCharges).toLocaleString('en-IN') : ''}</td>
                        </tr>
                        <tr className="font-bold border-t-2 border-black bg-slate-100">
                          <td colSpan={7} className="border-r border-black py-1.5 px-2 text-right">G. TOTAL</td>
                          <td colSpan={3} className="py-1.5 px-1 text-center">
                            { (Number(memo.freight || 0) + Number(memo.loadingCharges || 0) + Number(memo.otherCharges || 0)) > 0 
                              ? (Number(memo.freight || 0) + Number(memo.loadingCharges || 0) + Number(memo.otherCharges || 0)).toLocaleString('en-IN') 
                              : '' }
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>

                  {/* Footer Section - only on last page to avoid spacing issues */}
                  {isLastPage && (
                    <div className="flex justify-between items-end mt-20 mb-4">
                      <div className="w-1/3 text-left font-bold">
                        DRIVER SIGN
                      </div>
                      <div className="w-1/3 text-center flex flex-col items-center">
                        <div className="font-bold">
                          FOR ROYAL ROADLINES
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  , document.body);
}
