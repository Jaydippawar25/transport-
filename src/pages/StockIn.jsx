import React, { useState, useEffect } from 'react';
import { 
  PackagePlus, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  FileText, 
  Building, 
  Calendar,
  Sparkles,
  ArrowRight,
  Truck,
  User,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { dataService } from '../services/dataService';
import LRPrintModal from '../components/LRPrintModal';

export default function StockIn() {
  const [stockInList, setStockInList] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLr, setSelectedLr] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form State matching spreadsheet input fields
  const [formData, setFormData] = useState({
    lrNo: `SNG/${Math.floor(12000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    transporterName: '',
    memoNo: '',
    vehicleNo: '',
    driverName: '',
    ownerName: '',
    fromStation: 'MUMBAI',
    consignorName: '',
    consignorAddress: '',
    consignorGSTIN: '',
    consigneeName: '',
    consigneeAddress: '',
    consigneeGSTIN: '',
    toStation: 'SANGLI',
    packages: 1,
    weight: '',
    description: '',
    goodsValue: '',
    invoiceNo: '',
    ewayBillNo: '',
    freight: 0,
    hamali: 0,
    other: 0,
    stCharges: 0,
    paymentType: 'ToPay' // 'ToPay' | 'Paid' | 'T.B.B'
  });

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
      const [inData, stationData, masterData] = await Promise.all([
        dataService.getStockIn(),
        dataService.getStations(),
        dataService.getMasters()
      ]);
      setStockInList(inData);
      setStations(stationData);
      if (masterData) setMasters(masterData);
    } catch (err) {
      console.error("Error loading stock in data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConsignorChange = (val) => {
    const matched = (masters.consignors || []).find(c => c.name.toLowerCase() === val.toLowerCase());
    setFormData(prev => ({
      ...prev,
      consignorName: val,
      consignorAddress: matched ? (matched.address || prev.consignorAddress) : prev.consignorAddress,
      consignorGSTIN: matched ? (matched.gstin || prev.consignorGSTIN) : prev.consignorGSTIN
    }));
  };

  const handleConsigneeChange = (val) => {
    const matched = (masters.consignees || []).find(c => c.name.toLowerCase() === val.toLowerCase());
    setFormData(prev => ({
      ...prev,
      consigneeName: val,
      consigneeAddress: matched ? (matched.address || prev.consigneeAddress) : prev.consigneeAddress,
      consigneeGSTIN: matched ? (matched.gstin || prev.consigneeGSTIN) : prev.consigneeGSTIN
    }));
  };

  const handleVehicleChange = (val) => {
    const matched = (masters.vehicles || []).find(v => v.vehicleNo.toLowerCase() === val.toLowerCase());
    setFormData(prev => ({
      ...prev,
      vehicleNo: val,
      ownerName: matched ? (matched.ownerName || prev.ownerName) : prev.ownerName
    }));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Auto Total Charges
  const totalCharges = Number(formData.freight || 0) + 
                       Number(formData.hamali || 0) + 
                       Number(formData.other || 0) + 
                       Number(formData.stCharges || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lrNo || !formData.consignorName || !formData.consigneeName) {
      alert('Please fill in LR No, Consignor Name, and Consignee Name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const lrPayload = {
        lrNo: formData.lrNo,
        date: formData.date,
        transporterName: formData.transporterName,
        memoNo: formData.memoNo,
        vehicleNo: formData.vehicleNo,
        driverName: formData.driverName,
        ownerName: formData.ownerName,
        fromStation: formData.fromStation,
        consignorName: formData.consignorName,
        consignorAddress: formData.consignorAddress,
        consignorGSTIN: formData.consignorGSTIN,
        consigneeName: formData.consigneeName,
        consigneeAddress: formData.consigneeAddress,
        consigneeGSTIN: formData.consigneeGSTIN,
        toStation: formData.toStation,
        packages: Number(formData.packages || 1),
        weight: formData.weight,
        description: formData.description,
        goodsValue: Number(formData.goodsValue || 0),
        invoiceNo: formData.invoiceNo,
        ewayBillNo: formData.ewayBillNo,
        charges: {
          freight: Number(formData.freight || 0),
          hamali: Number(formData.hamali || 0),
          other: Number(formData.other || 0),
          stCharges: Number(formData.stCharges || 0),
          total: totalCharges
        },
        paymentType: formData.paymentType
      };

      const newLr = await dataService.addStockIn(lrPayload);
      alert(`Stock In Entry ${formData.lrNo} saved successfully!`);
      
      // Reset form
      setFormData({
        lrNo: `SNG/${Math.floor(12000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        transporterName: '',
        memoNo: '',
        vehicleNo: '',
        driverName: '',
        ownerName: '',
        fromStation: 'MUMBAI',
        consignorName: '',
        consignorAddress: '',
        consignorGSTIN: '',
        consigneeName: '',
        consigneeAddress: '',
        consigneeGSTIN: '',
        toStation: 'SANGLI',
        packages: 1,
        weight: '',
        description: '',
        goodsValue: '',
        invoiceNo: '',
        ewayBillNo: '',
        freight: 0,
        hamali: 0,
        other: 0,
        stCharges: 0,
        paymentType: 'ToPay'
      });

      setShowForm(false);
      await loadData();
      
      // Show print modal for newly created LR
      setSelectedLr(newLr);
    } catch (err) {
      console.error("Save Stock In error:", err);
      alert("Error saving Stock In Entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Stock In List
  const filteredStockIn = stockInList.filter(item => {
    const matchesSearch = 
      item.lrNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.consignorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.consigneeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.memoNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vehicleNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.transporterName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStation = stationFilter === 'ALL' || item.toStation === stationFilter || item.fromStation === stationFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStation && matchesStatus;
  });

  // Calculate Table Summary Totals
  const totalPkgs = filteredStockIn.reduce((sum, item) => sum + Number(item.packages || 0), 0);
  
  const totalToPay = filteredStockIn.reduce((sum, item) => {
    return sum + (item.paymentType === 'ToPay' ? Number(item.charges?.total || 0) : 0);
  }, 0);

  const totalPaid = filteredStockIn.reduce((sum, item) => {
    return sum + (item.paymentType === 'Paid' ? Number(item.charges?.total || 0) : 0);
  }, 0);

  const totalTBB = filteredStockIn.reduce((sum, item) => {
    return sum + (item.paymentType === 'T.B.B' ? Number(item.charges?.total || 0) : 0);
  }, 0);

  const grandTotal = totalToPay + totalPaid + totalTBB;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold">
              <PackagePlus className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Stock In (Lorry Receipt Entry)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enter incoming lorry receipts with transporter memo details, consignor/consignee data, and payment breakdown.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          {showForm ? 'Close Entry Form' : '+ New Stock In Entry'}
        </button>
      </div>

      {/* NEW STOCK IN FORM (Accordion / Toggleable) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-6 animate-in slide-in-from-top-4 duration-200">
          
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> Stock In Register Form
            </h2>
            <span className="text-xs text-slate-400 font-mono">Status: in-godown</span>
          </div>

          {/* SECTION 1: HEADER INWARD SLIP FIELDS */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-indigo-600" /> Transporter & Vehicle Header Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <label className="text-[11px] font-bold text-slate-700">TRANSPORTER NAME</label>
                <input
                  type="text"
                  list="transporters-datalist"
                  value={formData.transporterName}
                  onChange={(e) => setFormData({ ...formData, transporterName: e.target.value })}
                  placeholder="Select or type transporter..."
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">MEMO NO (Enter Manually)</label>
                <input
                  type="text"
                  value={formData.memoNo}
                  onChange={(e) => setFormData({ ...formData, memoNo: e.target.value })}
                  placeholder="e.g. MEMO-4012"
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">VEHICAL NO.</label>
                <input
                  type="text"
                  list="vehicles-datalist"
                  value={formData.vehicleNo}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  placeholder="Select or type vehicle..."
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold uppercase text-indigo-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">DRIVER NAME</label>
                <input
                  type="text"
                  list="drivers-datalist"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  placeholder="Select or type driver..."
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">OWNER NAME</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="e.g. Self / Fleet Owner"
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">FROM (Origin Station) *</label>
                <select
                  value={formData.fromStation}
                  onChange={(e) => setFormData({ ...formData, fromStation: e.target.value })}
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-bold uppercase"
                >
                  {stations.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">STATION (Destination) *</label>
                <select
                  value={formData.toStation}
                  onChange={(e) => setFormData({ ...formData, toStation: e.target.value })}
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-bold uppercase"
                >
                  {stations.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: LR PARTICULAR & CONSIGNOR / CONSIGNEE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            
            {/* Consignor (Sender) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Consignor Details (Sender)</h3>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Drop Box Auto-Fill Active</span>
              </div>
              
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Consignor Name *</label>
                <input
                  type="text"
                  required
                  list="consignors-datalist"
                  value={formData.consignorName}
                  onChange={(e) => handleConsignorChange(e.target.value)}
                  placeholder="Select from Drop Box or type..."
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Address</label>
                <input
                  type="text"
                  value={formData.consignorAddress}
                  onChange={(e) => setFormData({ ...formData, consignorAddress: e.target.value })}
                  placeholder="Sender factory / office address..."
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">GSTIN No</label>
                <input
                  type="text"
                  value={formData.consignorGSTIN || ''}
                  onChange={(e) => setFormData({ ...formData, consignorGSTIN: e.target.value })}
                  placeholder="e.g. 27AAACG1234F1Z5"
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-mono uppercase"
                />
              </div>
            </div>

            {/* Consignee (Receiver) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Consignee Details (Receiver)</h3>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Drop Box Auto-Fill Active</span>
              </div>
              
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Consignee Name *</label>
                <input
                  type="text"
                  required
                  list="consignees-datalist"
                  value={formData.consigneeName}
                  onChange={(e) => handleConsigneeChange(e.target.value)}
                  placeholder="Select from Drop Box or type..."
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Address</label>
                <input
                  type="text"
                  value={formData.consigneeAddress}
                  onChange={(e) => setFormData({ ...formData, consigneeAddress: e.target.value })}
                  placeholder="Destination delivery address..."
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">GSTIN No</label>
                <input
                  type="text"
                  value={formData.consigneeGSTIN || ''}
                  onChange={(e) => setFormData({ ...formData, consigneeGSTIN: e.target.value })}
                  placeholder="e.g. 27BBBPS5678K1Z9"
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-mono uppercase"
                />
              </div>
            </div>

          </div>

          {/* SECTION 3: LR NUMBER & GOODS PARTICULAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700">L.R. NO. *</label>
              <input
                type="text"
                required
                value={formData.lrNo}
                onChange={(e) => setFormData({ ...formData, lrNo: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 rounded-lg border border-slate-300 text-xs font-mono font-bold text-indigo-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">PKG (Packages) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.packages}
                onChange={(e) => setFormData({ ...formData, packages: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 rounded-lg border border-slate-300 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Weight</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g. 450 Kg"
                className="w-full mt-1 p-2 bg-slate-50 rounded-lg border border-slate-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Description of Goods</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Plastic Moulded Goods"
                className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* SECTION 4: CHARGES BREAKDOWN & PAYMENT TYPE */}
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
              Amount Charges & Payment Type Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Freight (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.freight}
                  onChange={(e) => setFormData({ ...formData, freight: e.target.value })}
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">Hamali / Labor (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.hamali}
                  onChange={(e) => setFormData({ ...formData, hamali: e.target.value })}
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">Other Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.other}
                  onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">Stat. Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stCharges}
                  onChange={(e) => setFormData({ ...formData, stCharges: e.target.value })}
                  className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-indigo-900">Total Freight (₹)</label>
                <div className="w-full mt-1 p-2 bg-indigo-900 text-white rounded-lg text-sm font-mono font-bold">
                  ₹{totalCharges.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* PAYMENT BASIS SELECTOR (TOPAY / PAID / T.B.B) */}
            <div className="pt-2 border-t border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-800">Payment Amount Type:</span>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="radio"
                    name="paymentType"
                    value="ToPay"
                    checked={formData.paymentType === 'ToPay'}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                    className="text-indigo-600"
                  />
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded font-bold">TO PAY</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="radio"
                    name="paymentType"
                    value="Paid"
                    checked={formData.paymentType === 'Paid'}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                    className="text-indigo-600"
                  />
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded font-bold">PAID</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="radio"
                    name="paymentType"
                    value="T.B.B"
                    checked={formData.paymentType === 'T.B.B'}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                    className="text-indigo-600"
                  />
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded font-bold">T.B.B (To Be Billed)</span>
                </label>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : 'Save Stock In Entry'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* MASTERS DATALISTS FOR AUTOFILL */}
          <datalist id="consignors-datalist">
            {(masters.consignors || []).map(c => (
              <option key={c.id} value={c.name}>{c.address ? `${c.name} (${c.address})` : c.name}</option>
            ))}
          </datalist>

          <datalist id="consignees-datalist">
            {(masters.consignees || []).map(c => (
              <option key={c.id} value={c.name}>{c.address ? `${c.name} (${c.address})` : c.name}</option>
            ))}
          </datalist>

          <datalist id="vehicles-datalist">
            {(masters.vehicles || []).map(v => (
              <option key={v.id} value={v.vehicleNo}>{v.ownerName ? `${v.vehicleNo} - ${v.ownerName}` : v.vehicleNo}</option>
            ))}
          </datalist>

          <datalist id="transporters-datalist">
            {(masters.transporters || []).map(t => (
              <option key={t.id} value={t.name}>{t.mobile ? `${t.name} (${t.mobile})` : t.name}</option>
            ))}
          </datalist>

          <datalist id="drivers-datalist">
            {(masters.drivers || []).map(d => (
              <option key={d.id} value={d.name}>{d.mobile ? `${d.name} (${d.mobile})` : d.name}</option>
            ))}
          </datalist>
        </form>
      )}

      {/* FILTER & SEARCH BAR FOR TABLE */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search LR No, Consignor, Consignee, Vehicle..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Station:</span>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
            >
              <option value="ALL">All Stations</option>
              {stations.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
            >
              <option value="ALL">All Status</option>
              <option value="in-godown">In Godown (Pending)</option>
              <option value="dispatched">Dispatched (Out)</option>
            </select>
          </div>
        </div>
      </div>

      {/* STOCK IN INVENTORY SPREADSHEET TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> Stock In Register ({filteredStockIn.length} Records)
          </h2>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-600">Total PKG: <strong className="text-slate-900">{totalPkgs}</strong></span>
            <span className="text-emerald-700">Total Amount: <strong>₹{grandTotal.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 font-bold text-[11px] uppercase tracking-wider">
                <th className="p-3 border-r border-slate-800 text-center w-12">SR.</th>
                <th className="p-3 border-r border-slate-800">L.R. NO. & DATE</th>
                <th className="p-3 border-r border-slate-800">TRANSPORTER / MEMO</th>
                <th className="p-3 border-r border-slate-800">VEHICLE & DRIVER</th>
                <th className="p-3 border-r border-slate-800">CONSIGNOR</th>
                <th className="p-3 border-r border-slate-800">CONSIGNEE</th>
                <th className="p-3 border-r border-slate-800 text-center">STATION</th>
                <th className="p-3 border-r border-slate-800 text-center w-16">PKG</th>
                <th className="p-3 border-r border-slate-800 text-right w-28">TO PAY (₹)</th>
                <th className="p-3 border-r border-slate-800 text-right w-28">PAID (₹)</th>
                <th className="p-3 border-r border-slate-800 text-right w-28">T.B.B (₹)</th>
                <th className="p-3 text-center w-16">PRINT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStockIn.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-xs text-slate-400">
                    No Stock In Lorry Receipts match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStockIn.map((item, idx) => {
                  const amt = Number(item.charges?.total || item.freight || 0);
                  const toPayAmt = item.paymentType === 'ToPay' ? amt : 0;
                  const paidAmt = item.paymentType === 'Paid' ? amt : 0;
                  const tbbAmt = item.paymentType === 'T.B.B' ? amt : 0;

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/90 transition-colors">
                      <td className="p-3 border-r border-slate-100 text-center font-mono font-semibold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="p-3 border-r border-slate-100">
                        <p className="font-mono font-bold text-indigo-900 text-xs">{item.lrNo}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(item.date || item.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </td>
                      <td className="p-3 border-r border-slate-100">
                        <p className="font-semibold text-slate-900">
                          {item.transporterName || 'Self Transport'}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500">
                          {item.memoNo ? `Memo: ${item.memoNo}` : `From: ${item.fromStation || 'MUMBAI'}`}
                        </p>
                      </td>
                      <td className="p-3 border-r border-slate-100">
                        <p className="font-mono font-bold text-slate-900 text-[11px]">{item.vehicleNo || '-'}</p>
                        <p className="text-[10px] text-slate-500">{item.driverName || '-'}</p>
                      </td>
                      <td className="p-3 border-r border-slate-100 font-semibold text-slate-900">
                        {item.consignorName}
                      </td>
                      <td className="p-3 border-r border-slate-100 font-semibold text-slate-900">
                        {item.consigneeName}
                      </td>
                      <td className="p-3 border-r border-slate-100 text-center">
                        <span className="font-bold text-slate-800 uppercase px-2 py-0.5 bg-slate-100 rounded text-[10px]">
                          {item.toStation}
                        </span>
                      </td>
                      <td className="p-3 border-r border-slate-100 text-center font-mono font-bold text-slate-900">
                        {item.packages}
                      </td>
                      <td className="p-3 border-r border-slate-100 text-right">
                        {toPayAmt > 0 ? (
                          <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200/70 font-mono font-bold text-xs inline-block">
                            ₹{toPayAmt.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>
                      <td className="p-3 border-r border-slate-100 text-right">
                        {paidAmt > 0 ? (
                          <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-mono font-bold text-xs inline-block">
                            ₹{paidAmt.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>
                      <td className="p-3 border-r border-slate-100 text-right">
                        {tbbAmt > 0 ? (
                          <span className="px-2 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200/70 font-mono font-bold text-xs inline-block">
                            ₹{tbbAmt.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedLr(item)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Print / View LR"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            
            {/* SPREADSHEET TOTALS FOOTER ROW */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-800">
                <td colSpan={7} className="p-3 text-right uppercase tracking-wider font-black text-slate-300">
                  TOTAL:
                </td>
                <td className="p-3 border-r border-slate-800 text-center font-mono font-black text-xs text-yellow-300">
                  {totalPkgs} Pkgs
                </td>
                <td className="p-3 border-r border-slate-800 text-right font-mono font-bold text-amber-300">
                  ₹{totalToPay.toLocaleString('en-IN')}
                </td>
                <td className="p-3 border-r border-slate-800 text-right font-mono font-bold text-emerald-300">
                  ₹{totalPaid.toLocaleString('en-IN')}
                </td>
                <td className="p-3 border-r border-slate-800 text-right font-mono font-bold text-blue-300">
                  ₹{totalTBB.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-center font-mono font-black text-xs text-yellow-400">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Print Modal */}
      {selectedLr && <LRPrintModal lr={selectedLr} onClose={() => setSelectedLr(null)} />}

    </div>
  );
}
