import React from 'react';

// SVG Barcode representation matching transport bills
export function BarcodeSVG({ value }) {
  const code = (value || 'SNG14756').toUpperCase();
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
    <svg viewBox={`0 0 ${totalWidth} 22`} className="h-5 w-full max-w-[130px] mx-auto">
      <rect x="0" y="0" width={totalWidth} height="22" fill="transparent" />
      {bars.map((bar, idx) => bar.filled && (
        <rect key={idx} x={bar.pos + 5} y="0" width={bar.width} height="22" fill="#000" />
      ))}
    </svg>
  );
}

// Single LR Bill Slip Copy Component matching physical LR bill slip
export default function LRBillSlip({ lr, copyTitle, formattedDate, paperColor = 'yellow' }) {
  if (!lr) return null;

  // Normalize LR data fields from either StockIn or StockOut Memo format
  const lrNo = lr.lrNo || 'SNG/14756';
  const toStation = lr.toStation || lr.station || 'SANGLI';
  const consignorName = lr.consignorName || lr.consignor || '-';
  const consignorGSTIN = lr.consignorGSTIN || 'N/A';
  const consignorAddress = lr.consignorAddress || 'BHIWANDI / MUMBAI';
  const consigneeName = lr.consigneeName || lr.consignee || '-';
  const consigneeGSTIN = lr.consigneeGSTIN || 'N/A';
  const consigneeAddress = lr.consigneeAddress || toStation;
  const packages = lr.packages || 1;
  const description = lr.description || 'GOODS';
  const weight = lr.weight || '';
  const invoiceNo = lr.invoiceNo !== undefined && lr.invoiceNo !== '' ? lr.invoiceNo : '-';
  const goodsValue = lr.goodsValue !== undefined && lr.goodsValue !== '' ? lr.goodsValue : '';
  const ewayBillNo = lr.ewayBillNo !== undefined && lr.ewayBillNo !== '' ? lr.ewayBillNo : '';

  // Amount & Payment Type Normalization
  const toPayAmt = Number(lr.toPay || (lr.paymentType === 'ToPay' ? lr.charges?.total : 0) || 0);
  const paidAmt = Number(lr.paid || (lr.paymentType === 'Paid' ? lr.charges?.total : 0) || 0);
  const tbbAmt = Number(lr.tbb || (lr.paymentType === 'T.B.B' ? lr.charges?.total : 0) || 0);
  const totalAmt = lr.charges?.total !== undefined ? Number(lr.charges.total) : (toPayAmt + paidAmt + tbbAmt);

  const paymentType = (lr.paymentType || (toPayAmt > 0 ? 'ToPay' : paidAmt > 0 ? 'Paid' : tbbAmt > 0 ? 'T.B.B' : 'ToPay')).toUpperCase();

  const freight = lr.charges?.freight !== undefined ? Number(lr.charges.freight) : totalAmt;
  const hamali = Number(lr.charges?.hamali || 0);
  const other = Number(lr.charges?.other || 0);
  const stCharges = Number(lr.charges?.stCharges || 0);

  // Format date display
  const dateDisplay = formattedDate || (lr.date ? new Date(lr.date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'));

  const formatAmount = (num) => {
    if (num && Number(num) > 0) return `${Number(num)}/-`;
    return '-';
  };

  const isYellow = paperColor === 'yellow';
  const paperBg = isYellow ? 'bg-[#fef9c3]' : 'bg-white';
  const headerBg = isYellow ? 'bg-[#fef08a]/70' : 'bg-slate-100/60';
  const subHeaderBg = isYellow ? 'bg-[#fef9c3]' : 'bg-slate-50';
  const totalRowBg = isYellow ? 'bg-[#fef08a]' : 'bg-slate-100';
  const bookingBoxBg = isYellow ? 'bg-[#fff099]' : 'bg-slate-50/50';
  const badgeBg = isYellow ? 'bg-yellow-400 text-black border border-black font-black' : 'bg-slate-50 text-black border border-black font-bold';

  return (
    <div 
      className={`border-2 border-black relative flex flex-col ${paperBg} text-black text-[9px] sm:text-[10px] leading-tight select-none my-1 print:my-0 printable-slip`}
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      
      {/* TOP JURISDICTION & COPY TITLE HEADER */}
      <div className="flex justify-between items-center px-2 py-0.5 border-b border-black text-[8px] sm:text-[9px]">
        <span className="italic font-bold">Subject to Ichalkaranji Jurisdiction</span>
        <span className={`tracking-wider uppercase px-1.5 py-0 rounded text-[7.5px] sm:text-[8px] ${badgeBg}`}>
          {copyTitle || 'CONSIGNOR COPY'}
        </span>
      </div>

      {/* COMPANY HEADER SECTION */}
      <div className="border-b-2 border-black p-1 text-center flex flex-col items-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wider text-black leading-tight">
          ROYAL ROADLINES
        </h1>
        <p className="text-[7px] sm:text-[8px] font-medium leading-tight max-w-3xl mt-0.5">
          MASJID BUNDER : C/O, G. Shantilal Transport B.I.T Bldg. No.3, Bhandari Street, Near masjid Bunder Station(W), Near Bhandari Police Chowki, Mumbai-400 003 Mob.8087209449.
          <br className="hidden sm:inline" /> SAKINAKA : Gala No.7, Sarita Estate, Opp. St. Judes School, Hearoma Hotel & Lalji Transport, Sakinaka. Mob.9021521272
        </p>
        <div className="text-[7px] sm:text-[7.5px] font-bold mt-0.5 text-slate-800 leading-tight">
          SANGLI 9850194732 | KARAD 9890277299 | ICHALKARANJI 9503037898 | ISLAMPUR 9307843480 | MADHAVNAGAR 9890487014 | SATARA 9371775909 | KOLHAPUR 9371118461
        </div>
        <div className="text-[7.5px] sm:text-[8px] font-bold mt-0.5">
          GSTIN : 27MOJPS8633C1ZC
        </div>
      </div>

      {/* CONSIGNOR / CONSIGNEE & LR DETAILS SECTION */}
      <div className="grid grid-cols-12 border-b-2 border-black divide-x-2 divide-black text-[9px] sm:text-[10px]">
        
        {/* Consignor & Consignee Box (Left 8 Cols) */}
        <div className="col-span-8 flex flex-col justify-between">
          
          {/* Consignor */}
          <div className="p-1 sm:p-1.5 flex flex-col justify-center">
            <div className="leading-snug">
              <span className="font-bold">Consignor : </span>
              <span className="font-bold uppercase text-[9.5px] sm:text-[10.5px]">{consignorName}</span>
            </div>
            <div className="text-[8px] sm:text-[9px] leading-snug text-slate-900 mt-0.5">
              <span className="font-bold">Address : </span>
              <span>{consignorAddress}</span>
              {consignorGSTIN && consignorGSTIN !== 'N/A' && (
                <span className="ml-2 font-bold">. GSTIN : {consignorGSTIN}</span>
              )}
            </div>
          </div>

          {/* Dividing Border */}
          <div className="border-t border-black"></div>

          {/* Consignee */}
          <div className="p-1 sm:p-1.5 flex flex-col justify-center">
            <div className="leading-snug">
              <span className="font-bold">Consignee : </span>
              <span className="font-bold uppercase text-[9.5px] sm:text-[10.5px]">{consigneeName}</span>
            </div>
            <div className="text-[8px] sm:text-[9px] leading-snug text-slate-900 mt-0.5">
              <span className="font-bold">Address : </span>
              <span>{consigneeAddress}</span>
              {consigneeGSTIN && consigneeGSTIN !== 'N/A' && (
                <span className="ml-2 font-bold">. GSTIN : {consigneeGSTIN}</span>
              )}
            </div>
          </div>

        </div>

        {/* LR Booking Details Box (Right 4 Cols) */}
        <div className={`col-span-4 p-1 sm:p-1.5 flex flex-col justify-center space-y-1 ${bookingBoxBg}`}>
          <div>
            <span className="font-bold">LR NO: </span>
            <span className="font-bold text-[10.5px] sm:text-[12px] uppercase">{lrNo}</span>
          </div>
          <div>
            <span className="font-bold">Date: </span>
            <span className="text-[8.5px] sm:text-[9.5px]">{dateDisplay}</span>
          </div>
          <div className="pt-0.5 border-t border-black/30">
            <span className="font-bold">To: </span>
            <span className="font-bold uppercase text-[10.5px] sm:text-[12px]">{toStation}</span>
          </div>
        </div>

      </div>

      {/* MAIN GOODS & CHARGES TABLE */}
      <table className="w-full border-collapse border-b-2 border-black text-[9px] sm:text-[10px]">
        <thead>
          <tr className={`border-b border-black font-bold divide-x-2 divide-black ${headerBg} text-center`}>
            <th className="py-1 px-1 w-[8%] text-center">PKGS</th>
            <th className="py-1 px-1 w-[38%] text-center">Description</th>
            <th className="py-1 px-1 w-[12%] text-center">Weight</th>
            <th className="py-1 px-1 w-[22%] text-center">Charges</th>
            <th className="py-1 px-1 w-[20%] text-center uppercase tracking-wider">{paymentType}</th>
          </tr>
          <tr className={`border-b border-black font-bold divide-x-2 divide-black ${subHeaderBg} text-center text-[8.5px] sm:text-[9px]`}>
            <th className="p-0 border-r-2 border-black"></th>
            <th className="p-0 border-r-2 border-black"></th>
            <th className="p-0 border-r-2 border-black"></th>
            <th className="py-0.5 px-1 border-r-2 border-black text-center font-bold">Charges</th>
            <th className="py-0.5 px-1 text-center font-bold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/30">
          
          {/* Freight Row */}
          <tr className="divide-x-2 divide-black">
            <td rowSpan={4} className="py-1 px-1 font-bold text-center align-top text-[10px] sm:text-[11px]">
              {packages}
            </td>
            <td rowSpan={4} className="py-1 px-2 font-bold uppercase align-top text-[10px] sm:text-[11px]">
              {description}
            </td>
            <td rowSpan={4} className="py-1 px-1 font-bold text-center align-top text-[10px] sm:text-[11px]">
              {weight || '-'}
            </td>
            <td className="py-1 px-2 font-bold text-left">Freight</td>
            <td className="py-1 px-2 text-right font-bold text-[9.5px] sm:text-[10.5px]">{formatAmount(freight)}</td>
          </tr>

          {/* Hamali Row */}
          <tr className="divide-x-2 divide-black">
            <td className="py-1 px-2 font-bold text-left">Hamali</td>
            <td className="py-1 px-2 text-right font-bold text-[9.5px] sm:text-[10.5px]">{formatAmount(hamali)}</td>
          </tr>

          {/* Other Row */}
          <tr className="divide-x-2 divide-black">
            <td className="py-1 px-2 font-bold text-left">Other</td>
            <td className="py-1 px-2 text-right font-bold text-[9.5px] sm:text-[10.5px]">{formatAmount(other)}</td>
          </tr>

          {/* St.Charges Row */}
          <tr className="divide-x-2 divide-black">
            <td className="py-1 px-2 font-bold text-left">St.Charges</td>
            <td className="py-1 px-2 text-right font-bold text-[9.5px] sm:text-[10.5px]">{formatAmount(stCharges)}</td>
          </tr>

          {/* Total Row & Note Section */}
          <tr className="divide-x-2 divide-black border-t-2 border-black">
            <td colSpan={3} className={`p-1.5 align-middle ${paperBg}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5 text-[8px] sm:text-[8.5px] leading-tight">
                  <div className="font-bold underline">Note :</div>
                  <div>
                    <span className="font-bold">Inv. No. : </span><span>{invoiceNo || '-'}</span>
                    <span className="mx-2 font-bold">|</span>
                    <span className="font-bold">Good Value : </span><span>{goodsValue ? `${Number(goodsValue).toLocaleString('en-IN')} Rs.` : '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold">Eway Bill No. : </span><span>{ewayBillNo || '-'}</span>
                  </div>
                </div>
                <div className="text-center shrink-0 pr-1">
                  <BarcodeSVG value={lrNo} />
                  <div className="text-[7px] font-mono tracking-widest font-bold text-slate-800">*{lrNo}*</div>
                </div>
              </div>
            </td>
            <td className={`py-1 px-2 font-black uppercase text-left ${totalRowBg} text-[10px] sm:text-[11px]`}>
              Total
            </td>
            <td className={`py-1 px-2 text-right font-black ${totalRowBg} text-[10.5px] sm:text-[12px]`}>
              {formatAmount(totalAmt)}
            </td>
          </tr>

          {/* GST Liability Footer Row */}
          <tr className={`border-t border-black ${subHeaderBg}`}>
            <td colSpan={3} className="border-r-2 border-black"></td>
            <td colSpan={2} className="py-0.5 px-2 text-center font-bold text-[8px] sm:text-[8.5px] uppercase">
              GST Liability - Consignee
            </td>
          </tr>

        </tbody>
      </table>

      {/* TERMS & SIGNATURE FOOTER SECTION */}
      <div className={`p-1 sm:p-1.5 space-y-1 text-[7.5px] sm:text-[8px] leading-tight ${paperBg}`}>
        <p className="text-justify text-slate-800">
          <span className="font-bold">T&C* : 1)</span> All consignment are carried entirely at owner's risk. Consignment should take out their own insurance 
          <span className="font-bold"> 2)</span> The company is not responsible for the content of packages and delivered in the same apparent conditions in which they are tendered by or dispatched by the consignor. 
          <span className="font-bold"> 3)</span> The company is not responsible for loss or damage delay to goods by breakage, leakage, evaporation, theft, road and whether condition, strikes, lock-out, fire, civil com or political disturbance. 
          <span className="font-bold"> 4)</span> Dangerous & inflammable goods will not be carried and consignor must correctly describe and declare the goods before loading.
        </p>

        <div className="flex justify-between items-end pt-2 text-[8px] sm:text-[8.5px]">
          <div className="text-left font-bold min-w-[120px]">
            Receivers Sign. & Stamp
          </div>
          <div className="text-center font-black text-[11px] sm:text-[13px] uppercase tracking-wider">
            OWNER'S RISK
          </div>
          <div className="text-right font-bold min-w-[140px] flex flex-col items-end">
            <div>Booking Incharge</div>
            <div className="text-[6.5px] font-normal text-slate-600 italic">this is computer generated LR, no signature required</div>
          </div>
        </div>
      </div>

    </div>
  );
}

