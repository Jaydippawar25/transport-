import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Check, 
  X, 
  Layers, 
  IndianRupee, 
  ArrowRight,
  Boxes,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { dataService } from '../services/dataService';
import LRPrintModal from '../components/LRPrintModal';
import MemoPrintModal from '../components/MemoPrintModal';

export default function StockOut() {
  const [stockOutList, setStockOutList] = useState([]);
  const [pendingLrs, setPendingLrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedLr, setSelectedLr] = useState(null);
  const [selectedMemo, setSelectedMemo] = useState(null);

  // Search & Filter for stock out table
  const [searchTerm, setSearchTerm] = useState('');
  const [lrSearchTerm, setLrSearchTerm] = useState('');

  // Form state (Matching spreadsheet header fields)
  const [formData, setFormData] = useState({
    memoNo: `LM-${Math.floor(8000 + Math.random() * 1000)}`,
    date: new Date().toISOString().split('T')[0],
    lorryNo: '',
    driverName: '',
    fromStation: 'SANGLI'
  });

  // Selected LR IDs & Editable Details (Delivery Person, Amounts)
  const [selectedLrIds, setSelectedLrIds] = useState([]);
  const [customLrData, setCustomLrData] = useState({});

  const [masters, setMasters] = useState({
    consignors: [],
    consignees: [],
    vehicles: [],
    stations: [],
    deliveryPersons: [],
    drivers: [],
    transporters: []
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [outData, inData, masterData] = await Promise.all([
        dataService.getStockOut(),
        dataService.getStockIn(),
        dataService.getMasters()
      ]);
      setStockOutList(outData);
      if (masterData) setMasters(masterData);
      
      // LRs sitting in godown available for stock out
      const inGodown = inData.filter(item => item.status === 'in-godown');
      setPendingLrs(inGodown);
    } catch (err) {
      console.error("Error loading stock out data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleChange = (val) => {
    const matched = (masters.vehicles || []).find(v => v.vehicleNo.toLowerCase() === val.toLowerCase());
    setFormData(prev => ({
      ...prev,
      lorryNo: val
    }));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Toggle selection of pending LR & initialize custom amounts + delivery person
  const toggleLrSelection = (id) => {
    if (selectedLrIds.includes(id)) {
      setSelectedLrIds(selectedLrIds.filter(item => item !== id));
    } else {
      setSelectedLrIds([...selectedLrIds, id]);
      const lr = pendingLrs.find(l => l.id === id);
      if (lr && !customLrData[lr.lrNo]) {
        setCustomLrData(prev => ({
          ...prev,
          [lr.lrNo]: {
            deliveryPerson: lr.consigneeName ? `${lr.consigneeName.split(' ')[0]} Staff` : 'Local Driver',
            toPay: lr.paymentType === 'ToPay' ? Number(lr.charges?.total || 0) : 0,
            paid: lr.paymentType === 'Paid' ? Number(lr.charges?.total || 0) : 0,
            tbb: lr.paymentType === 'T.B.B' ? Number(lr.charges?.total || 0) : 0
          }
        }));
      }
    }
  };

  // Helper to handle edits per LR in loading builder
  const handleLrDataChange = (lrNo, field, val) => {
    setCustomLrData(prev => ({
      ...prev,
      [lrNo]: {
        ...(prev[lrNo] || { deliveryPerson: 'Local Driver', toPay: 0, paid: 0, tbb: 0 }),
        [field]: field === 'deliveryPerson' ? val : Math.max(0, Number(val) || 0)
      }
    }));
  };

  // Quick helper to switch payment modes between TOPAY, PAID, T.B.B
  const quickSetPaymentMode = (lr, mode) => {
    if (!lr) return;
    const total = Number(lr.charges?.total || 0);
    setCustomLrData(prev => ({
      ...prev,
      [lr.lrNo]: {
        ...(prev[lr.lrNo] || { deliveryPerson: 'Local Driver' }),
        toPay: mode === 'ToPay' ? total : 0,
        paid: mode === 'Paid' ? total : 0,
        tbb: mode === 'T.B.B' ? total : 0
      }
    }));
  };

  // Filter pending LRs by search term
  const filteredPendingLrs = pendingLrs.filter(lr => {
    const term = lrSearchTerm.toLowerCase();
    return (
      !term ||
      lr.lrNo?.toLowerCase().includes(term) ||
      lr.consignorName?.toLowerCase().includes(term) ||
      lr.consigneeName?.toLowerCase().includes(term) ||
      lr.toStation?.toLowerCase().includes(term)
    );
  });

  // Compile selected LRs into memo entries & compute running totals
  const selectedLrObjects = pendingLrs.filter(l => selectedLrIds.includes(l.id));

  const memoEntries = selectedLrObjects.map((lr, index) => {
    const custom = customLrData[lr.lrNo] || {
      deliveryPerson: 'Local Driver',
      toPay: lr.paymentType === 'ToPay' ? Number(lr.charges?.total || 0) : 0,
      paid: lr.paymentType === 'Paid' ? Number(lr.charges?.total || 0) : 0,
      tbb: lr.paymentType === 'T.B.B' ? Number(lr.charges?.total || 0) : 0
    };
    return {
      srNo: index + 1,
      lrNo: lr.lrNo,
      consignor: lr.consignorName,
      consignee: lr.consigneeName,
      deliveryPerson: custom.deliveryPerson || 'Local Driver',
      station: lr.toStation,
      packages: Number(lr.packages || 0),
      toPay: custom.toPay,
      paid: custom.paid,
      tbb: custom.tbb
    };
  });

  const totalPackages = memoEntries.reduce((sum, e) => sum + e.packages, 0);
  const totalToPay = memoEntries.reduce((sum, e) => sum + e.toPay, 0);
  const totalPaid = memoEntries.reduce((sum, e) => sum + e.paid, 0);
  const totalTbb = memoEntries.reduce((sum, e) => sum + (e.tbb || 0), 0);
  const grandTotal = totalToPay + totalPaid + totalTbb;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.memoNo || !formData.lorryNo || !formData.driverName) {
      alert('Please fill in Memo No, Vehicle No, and Driver Name.');
      return;
    }

    if (memoEntries.length === 0) {
      alert('Please select at least 1 pending LR from godown stock to dispatch.');
      return;
    }

    setIsSubmitting(true);
    try {
      const memoPayload = {
        memoNo: formData.memoNo,
        date: formData.date,
        lorryNo: formData.lorryNo.toUpperCase(),
        driverName: formData.driverName,
        fromStation: formData.fromStation,
        entries: memoEntries,
        totalPackages,
        totalToPay,
        totalPaid,
        totalTbb,
        grandTotal
      };

      const newMemo = await dataService.addStockOut(memoPayload);
      alert(`Stock Out Memo ${formData.memoNo} created! Linked LRs marked as dispatched.`);

      // Reset form
      setFormData({
        memoNo: `LM-${Math.floor(8000 + Math.random() * 1000)}`,
        date: new Date().toISOString().split('T')[0],
        lorryNo: '',
        driverName: '',
        fromStation: 'SANGLI'
      });
      setSelectedLrIds([]);
      setCustomLrData({});
      setShowForm(false);

      await loadData();
      setSelectedMemo(newMemo);
    } catch (err) {
      console.error("Save Stock Out error:", err);
      alert("Error saving Stock Out Memo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Flatten all stock out line items for detailed spreadsheet display
  const allStockOutItems = stockOutList.flatMap(memo => {
    return (memo.entries || []).map(entry => ({
      ...entry,
      memoNo: memo.memoNo,
      date: memo.date || memo.createdAt,
      vehicleNo: memo.lorryNo,
      driverName: memo.driverName,
      fromStation: memo.fromStation || 'SANGLI',
      parentMemo: memo
    }));
  });

  // Filter stock out items
  const filteredStockOutItems = allStockOutItems.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.lrNo?.toLowerCase().includes(term) ||
      item.consignor?.toLowerCase().includes(term) ||
      item.consignee?.toLowerCase().includes(term) ||
      item.deliveryPerson?.toLowerCase().includes(term) ||
      item.memoNo?.toLowerCase().includes(term) ||
      item.vehicleNo?.toLowerCase().includes(term) ||
      item.station?.toLowerCase().includes(term)
    );
  });

  // Summary Totals for Stock Out Register Table
  const regTotalPkgs = filteredStockOutItems.reduce((sum, i) => sum + Number(i.packages || 0), 0);
  const regTotalToPay = filteredStockOutItems.reduce((sum, i) => sum + Number(i.toPay || 0), 0);
  const regTotalPaid = filteredStockOutItems.reduce((sum, i) => sum + Number(i.paid || 0), 0);
  const regTotalTbb = filteredStockOutItems.reduce((sum, i) => sum + Number(i.tbb || 0), 0);
  const regGrandTotal = regTotalToPay + regTotalPaid + regTotalTbb;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Stock Out (Loading Memo & Dispatch)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch godown stock by assigning delivery persons, vehicle numbers, and payment status.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          {showForm ? 'Close Dispatch Builder' : '+ New Stock Out Dispatch'}
        </button>
      </div>

      {/* NEW LOADING MEMO DISPATCH BUILDER */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-6 animate-in slide-in-from-top-4 duration-200">
          
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Stock Out Dispatch Builder Form
            </h2>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              {pendingLrs.length} LRs sitting in godown
            </span>
          </div>

          {/* STOCK OUT HEADER DETAILS (Matching Spreadsheet Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-700">DATE *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">MEMO NO. (Automatically)</label>
              <input
                type="text"
                readOnly
                value={formData.memoNo}
                className="w-full mt-1 p-2 bg-slate-100 rounded-lg border border-slate-300 text-xs font-mono font-bold text-emerald-900 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">VEHICAL NO. *</label>
              <input
                type="text"
                required
                list="stockout-vehicles-datalist"
                value={formData.lorryNo}
                onChange={(e) => handleVehicleChange(e.target.value)}
                placeholder="Select or type vehicle..."
                className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">DRIVER NAME *</label>
              <input
                type="text"
                required
                list="stockout-drivers-datalist"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="Select or type driver..."
                className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">FROM (Origin Station) *</label>
              <input
                type="text"
                required
                value={formData.fromStation}
                onChange={(e) => setFormData({ ...formData, fromStation: e.target.value })}
                placeholder="e.g. SANGLI"
                className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-bold uppercase"
              />
            </div>
          </div>

          {/* SELECT PENDING GODOWN LRs TO LOAD */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-600" /> Select Pending LRs in Godown to Dispatch
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={lrSearchTerm}
                  onChange={(e) => setLrSearchTerm(e.target.value)}
                  placeholder="Filter pending LRs..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-lg border border-slate-200"
                />
              </div>
            </div>

            {filteredPendingLrs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                No pending LRs sitting in godown. Receive Stock In entries first.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                {filteredPendingLrs.map((lr) => {
                  const isSelected = selectedLrIds.includes(lr.id);
                  return (
                    <div
                      key={lr.id}
                      onClick={() => toggleLrSelection(lr.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-indigo-900">{lr.lrNo}</span>
                          <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                            {lr.toStation}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate max-w-[180px]">
                          {lr.consignorName} ➔ {lr.consigneeName}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                          <span>{lr.packages} Pkgs</span>
                          <span>₹{lr.charges?.total || 0} ({lr.paymentType})</span>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MANIFEST LINE ITEMS WITH DELIVERY PERSON & AMOUNTS */}
          {memoEntries.length > 0 && (
            <div className="border border-emerald-200 rounded-xl overflow-hidden bg-emerald-50/30 space-y-2">
              <div className="p-3 bg-emerald-100/70 border-b border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>STOCK OUT MANIFEST PREVIEW ({memoEntries.length} LRs Selected)</span>
                <span className="font-mono">{totalPackages} Total Packages</span>
              </div>

              <div className="w-full">
                <table className="w-full text-xs sm:text-sm text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-emerald-900 text-white font-bold text-[10px] sm:text-xs">
                      <th className="px-1.5 py-3 border-r border-emerald-800 text-center w-[3.5%]">SR.</th>
                      <th className="px-2 py-3 border-r border-emerald-800 w-[10%]">L.R.NO.</th>
                      <th className="px-1 py-3 border-r border-emerald-800 text-center w-[4.5%]">PKG</th>
                      <th className="px-2 py-3 border-r border-emerald-800 w-[12%] truncate">CONSIGNOR</th>
                      <th className="px-2 py-3 border-r border-emerald-800 w-[12%] truncate">CONSIGNEE</th>
                      <th className="px-2 py-3 border-r border-emerald-800 bg-emerald-950/60 text-yellow-300 w-[14%]">DELIVERY PERSON</th>
                      <th className="px-1 py-3 border-r border-emerald-800 text-center w-[7.5%]">STATION</th>
                      <th className="px-1 py-3 border-r border-emerald-800 text-right bg-amber-950/60 text-amber-300 w-[7.5%]">TO PAY</th>
                      <th className="px-1 py-3 border-r border-emerald-800 text-right bg-emerald-950/60 text-emerald-300 w-[7.5%]">PAID</th>
                      <th className="px-1 py-3 border-r border-emerald-800 text-right bg-blue-950/60 text-blue-300 w-[7.5%]">T.B.B</th>
                      <th className="px-1 py-3 text-center w-[16.5%]">PAYMENT BASIS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-200/60 bg-white">
                    {memoEntries.map((e) => {
                      const origLr = selectedLrObjects.find(l => l.lrNo === e.lrNo);
                      return (
                        <tr key={e.lrNo} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-1 py-3.5 border-r border-slate-200 text-center font-mono font-semibold text-slate-500">{e.srNo}</td>
                          <td className="px-2 py-3.5 border-r border-slate-200 font-mono font-bold text-indigo-900 truncate">{e.lrNo}</td>
                          <td className="px-1 py-3.5 border-r border-slate-200 text-center font-mono font-bold">{e.packages}</td>
                          <td className="px-2 py-3.5 border-r border-slate-200 truncate" title={e.consignor}>{e.consignor}</td>
                          <td className="px-2 py-3.5 border-r border-slate-200 truncate" title={e.consignee}>{e.consignee}</td>
                          
                          {/* EDITABLE DELIVERY PERSON INPUT */}
                          <td className="px-1.5 py-2 border-r border-slate-200 bg-yellow-50/40">
                            <input
                              type="text"
                              list="stockout-delivery-datalist"
                              value={e.deliveryPerson}
                              onChange={(evt) => handleLrDataChange(e.lrNo, 'deliveryPerson', evt.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              placeholder="Delivery Person"
                            />
                          </td>

                          <td className="px-1 py-3.5 border-r border-slate-200 text-center font-bold uppercase text-xs truncate">{e.station}</td>
                          
                          {/* Editable ToPay */}
                          <td className="px-1 py-2 border-r border-slate-200 text-right bg-amber-50/30">
                            <input
                              type="number"
                              min="0"
                              value={e.toPay}
                              onChange={(evt) => handleLrDataChange(e.lrNo, 'toPay', evt.target.value)}
                              className="w-full text-right px-1 py-1.5 bg-white border border-amber-300 rounded-lg font-mono font-bold text-amber-900 text-xs focus:outline-none"
                            />
                          </td>

                          {/* Editable Paid */}
                          <td className="px-1 py-2 border-r border-slate-200 text-right bg-emerald-50/30">
                            <input
                              type="number"
                              min="0"
                              value={e.paid}
                              onChange={(evt) => handleLrDataChange(e.lrNo, 'paid', evt.target.value)}
                              className="w-full text-right px-1 py-1.5 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-emerald-900 text-xs focus:outline-none"
                            />
                          </td>

                          {/* Editable T.B.B */}
                          <td className="px-1 py-2 border-r border-slate-200 text-right bg-blue-50/30">
                            <input
                              type="number"
                              min="0"
                              value={e.tbb}
                              onChange={(evt) => handleLrDataChange(e.lrNo, 'tbb', evt.target.value)}
                              className="w-full text-right px-1 py-1.5 bg-white border border-blue-300 rounded-lg font-mono font-bold text-blue-900 text-xs focus:outline-none"
                            />
                          </td>

                          {/* Quick Payment Mode Selector Pill Buttons */}
                          <td className="px-1 py-2 text-center">
                            <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden shadow-2xs text-[9.5px] font-bold w-full">
                              <button
                                type="button"
                                onClick={() => quickSetPaymentMode(origLr, 'ToPay')}
                                className={`flex-1 py-1 text-center cursor-pointer transition-colors ${
                                  e.toPay > 0 ? 'bg-amber-600 text-white font-black' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                TO PAY
                              </button>
                              <button
                                type="button"
                                onClick={() => quickSetPaymentMode(origLr, 'Paid')}
                                className={`flex-1 py-1 text-center border-x border-slate-200 cursor-pointer transition-colors ${
                                  e.paid > 0 ? 'bg-emerald-600 text-white font-black' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                PAID
                              </button>
                              <button
                                type="button"
                                onClick={() => quickSetPaymentMode(origLr, 'T.B.B')}
                                className={`flex-1 py-1 text-center cursor-pointer transition-colors ${
                                  e.tbb > 0 ? 'bg-blue-600 text-white font-black' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                TBB
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-emerald-900 font-bold text-white text-xs sm:text-sm border-t-2 border-emerald-900">
                      <td colSpan={2} className="px-2 py-3 text-right uppercase tracking-wider font-black">
                        TOTAL:
                      </td>
                      <td className="px-1 py-3 text-center font-mono font-black text-xs sm:text-sm text-yellow-300">
                        {totalPackages}
                      </td>
                      <td colSpan={4} className="px-2 py-3 text-right uppercase tracking-wider font-black text-slate-300">
                        AMOUNTS TOTAL:
                      </td>
                      <td className="px-1 py-3 text-right font-mono font-black text-xs text-amber-300 truncate">
                        ₹{totalToPay.toLocaleString('en-IN')}
                      </td>
                      <td className="px-1 py-3 text-right font-mono font-black text-xs text-emerald-300 truncate">
                        ₹{totalPaid.toLocaleString('en-IN')}
                      </td>
                      <td className="px-1 py-3 text-right font-mono font-black text-xs text-blue-300 truncate">
                        ₹{totalTbb.toLocaleString('en-IN')}
                      </td>
                      <td className="px-1 py-3 text-center font-mono font-black text-xs text-yellow-400 bg-emerald-950 truncate">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Form Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || memoEntries.length === 0}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/30 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? 'Dispatching...' : 'Save & Dispatch Stock Out'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* MASTERS DATALISTS FOR STOCK OUT */}
          <datalist id="stockout-vehicles-datalist">
            {(masters.vehicles || []).map(v => (
              <option key={v.id} value={v.vehicleNo}>{v.ownerName ? `${v.vehicleNo} - ${v.ownerName}` : v.vehicleNo}</option>
            ))}
          </datalist>

          <datalist id="stockout-drivers-datalist">
            {(masters.drivers || []).map(d => (
              <option key={d.id} value={d.name}>{d.mobile ? `${d.name} (${d.mobile})` : d.name}</option>
            ))}
          </datalist>

          <datalist id="stockout-delivery-datalist">
            {(masters.deliveryPersons || []).map(dp => (
              <option key={dp.id} value={dp.name}>{dp.mobile ? `${dp.name} (${dp.mobile})` : dp.name}</option>
            ))}
          </datalist>
        </form>
      )}

      {/* SEARCH BAR FOR STOCK OUT REGISTER */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search LR No, Consignor, Consignee, Delivery Person..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-600">Total PKG: <strong className="text-slate-900">{regTotalPkgs}</strong></span>
          <span className="text-emerald-700">Total Out Amount: <strong>₹{regGrandTotal.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>

      {/* STOCK OUT SPREADSHEET REGISTER TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Stock Out Register ({filteredStockOutItems.length} Records)
          </h2>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-600">Total PKG: <strong className="text-slate-900">{regTotalPkgs}</strong></span>
            <span className="text-emerald-700">Total Out Amount: <strong>₹{regGrandTotal.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 font-bold text-[11px] uppercase tracking-wider">
                <th className="p-3 border-r border-slate-800 text-center w-12">SR.</th>
                <th className="p-3 border-r border-slate-800">L.R. NO. & DATE</th>
                <th className="p-3 border-r border-slate-800 text-center w-16">PKG</th>
                <th className="p-3 border-r border-slate-800">CONSIGNOR</th>
                <th className="p-3 border-r border-slate-800">CONSIGNEE</th>
                <th className="p-3 border-r border-slate-800">DELIVERY PERSON</th>
                <th className="p-3 border-r border-slate-800 text-center">STATION</th>
                <th className="p-3 border-r border-slate-800 text-right w-28">TO PAY (₹)</th>
                <th className="p-3 border-r border-slate-800 text-right w-28">PAID (₹)</th>
                <th className="p-3 border-r border-slate-800 text-right w-28">T.B.B (₹)</th>
                <th className="p-3 text-center w-16">PRINT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStockOutItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-xs text-slate-400">
                    No Stock Out records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStockOutItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/90 transition-colors">
                    <td className="p-3 border-r border-slate-100 text-center font-mono font-semibold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="p-3 border-r border-slate-100">
                      <p className="font-mono font-bold text-indigo-900 text-xs">{item.lrNo}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(item.date).toLocaleDateString('en-IN')}
                      </p>
                    </td>
                    <td className="p-3 border-r border-slate-100 text-center font-mono font-bold text-slate-900">
                      {item.packages}
                    </td>
                    <td className="p-3 border-r border-slate-100 font-semibold text-slate-900">
                      {item.consignor}
                    </td>
                    <td className="p-3 border-r border-slate-100 font-semibold text-slate-900">
                      {item.consignee}
                    </td>
                    <td className="p-3 border-r border-slate-100">
                      <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200/60 font-semibold text-[11px] inline-block">
                        {item.deliveryPerson || 'Local Driver'}
                      </span>
                    </td>
                    <td className="p-3 border-r border-slate-100 text-center">
                      <span className="font-bold text-slate-800 uppercase px-2 py-0.5 bg-slate-100 rounded text-[10px]">
                        {item.station}
                      </span>
                    </td>
                    <td className="p-3 border-r border-slate-100 text-right">
                      {item.toPay > 0 ? (
                        <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200/70 font-mono font-bold text-xs inline-block">
                          ₹{item.toPay.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>
                    <td className="p-3 border-r border-slate-100 text-right">
                      {item.paid > 0 ? (
                        <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-mono font-bold text-xs inline-block">
                          ₹{item.paid.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>
                    <td className="p-3 border-r border-slate-100 text-right">
                      {item.tbb > 0 ? (
                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200/70 font-mono font-bold text-xs inline-block">
                          ₹{item.tbb.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedLr(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        title={`Print Bill for LR #${item.lrNo}`}
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* SPREADSHEET TOTALS FOOTER ROW */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-800">
                <td colSpan={2} className="p-3 text-right uppercase tracking-wider font-black text-slate-300">
                  TOTAL:
                </td>
                <td className="p-3 border-r border-slate-800 text-center font-mono font-black text-xs text-yellow-300">
                  {regTotalPkgs} Pkgs
                </td>
                <td colSpan={4} className="p-3 border-r border-slate-800 text-right uppercase tracking-wider font-black text-slate-300">
                  AMOUNTS TOTAL:
                </td>
                <td className="p-3 border-r border-slate-800 text-right font-mono font-bold text-amber-300">
                  ₹{regTotalToPay.toLocaleString('en-IN')}
                </td>
                <td className="p-3 border-r border-slate-800 text-right font-mono font-bold text-emerald-300">
                  ₹{regTotalPaid.toLocaleString('en-IN')}
                </td>
                <td className="p-3 border-r border-slate-800 text-right font-mono font-bold text-blue-300">
                  ₹{regTotalTbb.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-center font-mono font-black text-xs text-yellow-400">
                  ₹{regGrandTotal.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Print Modal */}
      {selectedLr && <LRPrintModal lr={selectedLr} onClose={() => setSelectedLr(null)} />}
      {selectedMemo && <MemoPrintModal memo={selectedMemo} onClose={() => setSelectedMemo(null)} />}

    </div>
  );
}
