import React from 'react';

// SVG Barcode representation matching transport bills
export function BarcodeSVG({ value }) {
  const code = (value || 'SNG12043').toUpperCase();
  const bars = [];
  let pos = 0;
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const w1 = (charCode % 3) + 1;
    const w2 = ((charCode * 7) % 3) + 1;
    const w3 = ((charCode * 13) % 2) + 1;
    bars.push({ pos, width: w1, filled: true });
    pos += w1 + 1;
    bars.push({ pos, width: w2, filled: false });
    pos += w2;
    bars.push({ pos, width: w3, filled: true });
    pos += w3 + 1.5;
  }
  const totalWidth = pos + 10;

  return (
    <svg viewBox={`0 0 ${totalWidth} 32`} className="h-7 w-full max-w-[180px] mx-auto">
      <rect x="0" y="0" width={totalWidth} height="32" fill="transparent" />
      {bars.map((bar, idx) => bar.filled && (
        <rect key={idx} x={bar.pos + 5} y="0" width={bar.width} height="32" fill="#000" />
      ))}
    </svg>
  );
}

// Single LR Bill Slip Copy Component matching physical LR bill slip photo media_1788851626853.png
export default function LRBillSlip({ lr, copyTitle, formattedDate }) {
  if (!lr) return null;

  // Normalize LR data fields from either StockIn or StockOut Memo format
  const lrNo = lr.lrNo || 'SNG/12043';
  const toStation = lr.toStation || lr.station || 'SANGLI';
  const consignorName = lr.consignorName || lr.consignor || 'N/A';
  const consignorGSTIN = lr.consignorGSTIN || 'N/A';
  const consignorAddress = lr.consignorAddress || 'BHIWANDI / MUMBAI';
  const consigneeName = lr.consigneeName || lr.consignee || 'N/A';
  const consigneeGSTIN = lr.consigneeGSTIN || 'N/A';
  const consigneeAddress = lr.consigneeAddress || toStation;
  const packages = lr.packages || 1;
  const description = lr.description || 'PLASTIC GOOD';
  const weight = lr.weight || '';
  const invoiceNo = lr.invoiceNo || '592';
  const goodsValue = lr.goodsValue || 11663;
  const ewayBillNo = lr.ewayBillNo || 'N/A';
  const deliveryPerson = lr.deliveryPerson || 'Local Driver';

  // Amount & Payment Type Normalization
  const toPayAmt = Number(lr.toPay || (lr.paymentType === 'ToPay' ? lr.charges?.total : 0) || 0);
  const paidAmt = Number(lr.paid || (lr.paymentType === 'Paid' ? lr.charges?.total : 0) || 0);
  const tbbAmt = Number(lr.tbb || (lr.paymentType === 'T.B.B' ? lr.charges?.total : 0) || 0);
  const totalAmt = lr.charges?.total || (toPayAmt + paidAmt + tbbAmt) || 300;

  const paymentType = lr.paymentType || (toPayAmt > 0 ? 'ToPay' : paidAmt > 0 ? 'Paid' : tbbAmt > 0 ? 'T.B.B' : 'ToPay');

  const freight = lr.charges?.freight || totalAmt;
  const hamali = Number(lr.charges?.hamali || 0);
  const other = Number(lr.charges?.other || 0);
  const stCharges = Number(lr.charges?.stCharges || 0);
  const extraCharges = hamali + other + stCharges;

  // Format date display
  const dateDisplay = formattedDate || (lr.date ? new Date(lr.date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'));

  return (
    <div className="border-2 border-black relative flex flex-col bg-[#fef9c3] text-black text-[10px] leading-tight select-none my-1 printable-slip">
      
      {/* Side Vertical Text Margins */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-bold tracking-widest text-slate-800 whitespace-nowrap hidden sm:block print:hidden select-none">
        OWNER'S RISK
      </div>
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 rotate-90 text-[8px] font-bold tracking-widest text-slate-800 whitespace-nowrap hidden sm:block print:hidden select-none">
        OWNER'S RISK
      </div>

      {/* COPY TYPE TOP HEADER BADGE */}
      <div className="bg-black text-white px-3 py-1 flex justify-between items-center text-[9px] font-bold tracking-wider uppercase border-b border-black">
        <span>ROYAL ROADLINES — LR BILTY SLIP</span>
        <span className="bg-yellow-400 text-black px-2 py-0.5 rounded text-[9.5px] font-black tracking-normal">
          {copyTitle || 'LR COPY'}
        </span>
      </div>

      {/* JURISDICTION HEADER */}
      <div className="text-center text-[7.5px] font-bold uppercase border-b border-black py-0.5 tracking-widest bg-white/50">
        SUBJECT TO ICHALKARANJI JURISDICTION
      </div>

      {/* TOP HEADER SECTION */}
      <div className="grid grid-cols-3 border-b-2 border-black divide-x-2 divide-black">
        
        {/* Company Title & Address (Cols 1 & 2) */}
        <div className="col-span-2 p-1.5 space-y-0.5 flex flex-col justify-center text-center">
          <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase tracking-wider text-black leading-none drop-shadow-sm" style={{ textShadow: '0.5px 0.5px 0px #ea580c, -0.5px -0.5px 0px #0284c7' }}>
            ROYAL ROADLINES
          </h1>
          <p className="text-[7.5px] sm:text-[8px] font-bold text-slate-900 leading-tight">
            MASJID BUNDER : C/O, G. Shantilal Transport B.I.T Bldg. No.3, Bhandari Street, Near masjid Bunder Station(W),Near Bhandari Police Chowki, Mumbai-400 003 Mob.8087209449. SAKINAKA : Gala No.7, Sarita Estate, Opp. St. Judes School,Hearoma Hotel & Lalji Transport, Sakinaka. Mob.9021521272
          </p>
        </div>

        {/* Booking Info Box (Col 3) */}
        <div className="p-2 bg-[#fff099] flex flex-col justify-between font-mono text-[10px] space-y-0.5">
          <div className="text-[9px] font-bold border-b border-black/30 pb-0.5 text-center">
            MOB : 9850194732 / 9370229449
          </div>
          <div className="text-[9px] font-bold border-b border-black/30 pb-0.5 text-center pt-0.5">
            GSTIN : 27MOJPS8633C1ZC
          </div>
          <div className="pt-0.5">
            <span className="font-bold">LR NO: </span> 
            <span className="font-black text-xs uppercase">{lrNo}</span>
          </div>
          <div>
            <span className="font-bold">Date: </span>
            <span className="text-[9px]">{dateDisplay}</span>
          </div>
          <div className="border-t border-black/30 pt-0.5">
            <span className="font-bold">To: </span>
            <span className="font-black uppercase text-xs">{toStation}</span>
          </div>
        </div>

      </div>

      {/* CONSIGNOR & CONSIGNEE DETAILS ROW */}
      <div className="border-b-2 border-black p-2 space-y-0.5 text-[10px] bg-[#fef9c3]">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold">Consignor : </span>
            <span className="font-black uppercase text-xs">{consignorName}</span>
          </div>
          <div className="text-[9px]">
            <span className="font-bold">GSTIN : </span>
            <span className="font-mono font-bold">{consignorGSTIN}</span>
          </div>
        </div>
        <div className="text-[9px] text-slate-800">
          <span className="font-bold">Address : </span>
          <span>{consignorAddress}</span>
        </div>

        <div className="pt-1 border-t border-black/30 flex justify-between items-center">
          <div>
            <span className="font-bold">Consignee : </span>
            <span className="font-black uppercase text-xs">{consigneeName}</span>

          </div>
          <div className="text-[9px]">
            <span className="font-bold">GSTIN : </span>
            <span className="font-mono font-bold">{consigneeGSTIN}</span>
          </div>
        </div>
        <div className="text-[9px] text-slate-800">
          <span className="font-bold">Address : </span>
          <span>{consigneeAddress}</span>
        </div>
      </div>

      {/* MAIN GOODS & CHARGES GRID (SPLIT SECTION) */}
      <div className="flex-1 grid grid-cols-3 border-b-2 border-black divide-x-2 divide-black">
        
        {/* Goods Table (Cols 1 & 2) */}
        <div className="col-span-2 flex flex-col justify-between bg-[#fef9c3]">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-black bg-[#fff099] font-bold text-black text-[9px]">
                <th className="p-1 border-r border-black w-14 text-center">PKGS</th>
                <th className="p-1 border-r border-black">Description</th>
                <th className="p-1 w-20 text-right">Weight</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1 border-r border-black font-mono font-bold text-center align-top text-xs">
                  {packages}
                </td>
                <td className="p-1 border-r border-black font-bold uppercase align-top text-xs">
                  {description}
                </td>
                <td className="p-1 font-mono font-bold text-right align-top text-xs">
                  {weight}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Invoice / Note Bottom Row inside Goods Box */}
          <div className="p-1 border-t border-black text-[9px] font-mono leading-tight bg-[#fff099]/60 flex justify-between items-center flex-wrap gap-1">
            <div>
              <span className="font-bold">Inv No: </span>
              <span className="font-bold">{invoiceNo}</span>
            </div>
            <div>
              <span className="font-bold">Good Value: </span>
              <span className="font-bold">{Number(goodsValue).toLocaleString('en-IN')} Rs.</span>
            </div>
            <div>
              <span className="font-bold">Eway Bill: </span>
              <span className="font-bold">{ewayBillNo}</span>
            </div>
          </div>
        </div>

        {/* Charges Tally Box (Col 3) */}
        <div className="flex flex-col justify-between bg-[#fef9c3]">
          
          {/* ToPay / Paid Banner */}
          <div className="py-1.5 px-1 bg-[#fff099] text-center font-black text-sm uppercase border-b border-black tracking-wider">
            {paymentType}
          </div>

          {/* Charges Table */}
          <table className="w-full text-[11px] font-mono border-collapse h-full">
            <thead>
              <tr className="border-b border-black text-[10px] font-bold">
                <th className="py-1.5 px-1 border-r border-black text-left">Charges</th>
                <th className="py-1.5 px-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/30">
              <tr>
                <td className="py-2 px-1 border-r border-black font-semibold text-[11px]">Freight</td>
                <td className="py-2 px-1 text-right font-bold text-[12px]">
                  ₹{freight}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-1 border-r border-black font-semibold text-[11px]">Hamali/St/Other</td>
                <td className="py-2 px-1 text-right font-bold text-[12px]">
                  {extraCharges > 0 ? `₹${extraCharges}` : '-'}
                </td>
              </tr>
              <tr className="border-t-2 border-black bg-[#fff099]">
                <td className="py-2 px-1 border-r border-black font-black uppercase text-[12px]">Total</td>
                <td className="py-2 px-1 text-right font-black text-sm">
                  ₹{totalAmt}
                </td>
              </tr>
            </tbody>
          </table>

          {/* GST Liability Footer */}
          <div className="py-1 px-1 border-t border-black text-center font-bold text-[9px] uppercase bg-[#fff099]/80">
            GST Liability - Consignee
          </div>

        </div>

      </div>

      {/* BARCODE & TERMS / SIGNATURE FOOTER SECTION */}
      <div className="p-1.5 bg-[#fef9c3] space-y-1 text-[8.5px]">
        
        <div className="flex justify-between items-center gap-2">
          {/* Barcode Display */}
          <div className="text-center w-36 shrink-0">
            <BarcodeSVG value={lrNo} />
            <div className="font-mono text-[8px] tracking-widest text-slate-700 font-bold">
              *{lrNo}*
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="text-slate-800 leading-tight text-[8px] flex-1">
            <p>
              <span className="font-bold">1)</span> Consignment carried at owner's risk. 
              <span className="font-bold"> 2)</span> Co. not liable for leakage, breakage, theft, weather or riots.
            </p>
          </div>

          {/* Signatures & Stamp Row */}
          <div className="flex gap-3 text-[8.5px] shrink-0">
            <div className="border-t border-black pt-0.5 text-center font-bold min-w-[65px]">
              Receiver Sign
            </div>
            <div className="border-t border-black pt-0.5 text-center font-bold min-w-[65px]">
              Booking Incharge
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
