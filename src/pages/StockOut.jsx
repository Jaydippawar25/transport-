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
  FileSpreadsheet,
  Edit,
  Eye
} from 'lucide-react';
import { dataService } from '../services/dataService';
import LRPrintModal from '../components/LRPrintModal';
import MemoPrintModal from '../components/MemoPrintModal';


const LoadingMemoView = ({ memo, onClose }) => {
  const entries = memo.entries || [];
  const totalPackages = entries.reduce((sum, e) => sum + Number(e.packages || 0), 0);
  const totalToPay = entries.reduce((sum, e) => sum + Number(e.toPay || 0), 0);
  const totalPaid = entries.reduce((sum, e) => sum + Number(e.paid || 0), 0);
  const totalTbb = entries.reduce((sum, e) => sum + Number(e.tbb || 0), 0);
  const totalAmount = totalToPay + totalPaid + totalTbb;
  const formattedDate = new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN');

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:bg-transparent print:backdrop-blur-none print:z-auto print:p-0">
      <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-slate-200 font-serif text-black relative w-full max-w-5xl my-auto print:p-0 print:border-none print:shadow-none">
        <div className="absolute top-4 right-4 flex items-center gap-3 print:hidden">
        {onClose && (
          <button 
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
          >
            Close
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
      <div className="min-w-[800px] max-w-[1000px] mx-auto border-2 border-black p-1 print:min-w-0 print:w-full print:border-none">
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
              <div className="p-1.5 uppercase text-center flex items-center justify-center">VEHICAL NO.</div>
              <div className="p-1.5 text-center flex items-center justify-center font-mono">{memo.lorryNo}</div>
            </div>
            <div className="grid grid-cols-2 divide-x-2 divide-black">
              <div className="p-1.5 uppercase text-center flex items-center justify-center">OWNER NAME</div>
              <div className="p-1.5 text-center flex items-center justify-center font-mono">{memo.ownerName || '-'}</div>
            </div>
          </div>

          <div className="flex flex-col divide-y-2 divide-black">
            <div className="grid grid-cols-2 divide-x-2 divide-black">
              <div className="p-1.5 uppercase text-center flex items-center justify-center">DRIVER NAME</div>
              <div className="p-1.5 text-center flex items-center justify-center">{memo.driverName}</div>
            </div>
            <div className="grid grid-cols-2 divide-x-2 divide-black">
              <div className="p-1.5 uppercase text-center flex items-center justify-center">FROM :</div>
              <div className="p-1.5 text-center flex items-center justify-center">{memo.fromStation || 'SANGLI'}</div>
            </div>
            <div className="grid grid-cols-2 divide-x-2 divide-black">
              <div className="p-1.5 uppercase text-center flex items-center justify-center">TO :</div>
              <div className="p-1.5 text-center flex items-center justify-center">{memo.toStation || 'AS PER LRs'}</div>
            </div>
            <div className="grid grid-cols-2 divide-x-2 divide-black">
              <div className="p-1.5 uppercase text-center flex items-center justify-center">TIME</div>
              <div className="p-1.5 text-center flex items-center justify-center">
                {new Date(memo.date || memo.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
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
          <tfoot className="border-t-2 border-black font-bold divide-x-2 divide-black bg-slate-50">
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
            <div className="absolute inset-0 flex items-center justify-center uppercase text-slate-300 pointer-events-none">ADVANCE</div>
          </div>
          
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
};

const getMemoPrefix = (station) => {
  const s = (station || '').toUpperCase();
  if (s === 'SANGLI') return 'SNG-';
  if (s === 'PUNE') return 'PUN-';
  return s ? (s.substring(0, 3).toUpperCase() + '-') : 'LM-';
};

export default function StockOut() {
  const [stockOutList, setStockOutList] = useState([]);
  const [allStockIn, setAllStockIn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [selectedLr, setSelectedLr] = useState(null);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [originalLinkedLrNos, setOriginalLinkedLrNos] = useState([]);
  const [viewMemoData, setViewMemoData] = useState(null);

  // Search & Filter for stock out table
  const [searchTerm, setSearchTerm] = useState('');
  const [lrSearchTerm, setLrSearchTerm] = useState('');

  // Form state (Matching spreadsheet header fields)
  const [formData, setFormData] = useState({
    memoNo: `${getMemoPrefix('')}${Math.floor(10000 + Math.random() * 90000)}`,
    date: new Date().toISOString().split('T')[0],
    lorryNo: '',
    ownerName: '',
    driverName: '',
    fromStation: 'SANGLI',
    toStation: '',
    freight: '',
    loadingCharges: '',
    otherCharges: ''
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
      
      // LRs sitting in godown + previously dispatched LRs for edit mode
      setAllStockIn(inData);
    } catch (err) {
      console.error("Error loading stock out data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleChange = (val) => {
    const normalize = (str) => (str || '').replace(/\s+/g, '').toLowerCase();
    const matched = (masters.vehicles || []).find(v => normalize(v.vehicleNo) === normalize(val));
    setFormData(prev => ({
      ...prev,
      lorryNo: val,
      ownerName: matched && matched.ownerName ? matched.ownerName : prev.ownerName
    }));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Toggle selection of pending LR & initialize custom amounts + delivery person
  const toggleLrSelection = (lr) => {
    const isSelected = selectedLrIds.includes(lr.id) || selectedLrIds.includes(lr.lrNo);
    if (isSelected) {
      setSelectedLrIds(selectedLrIds.filter(item => item !== lr.id && item !== lr.lrNo));
    } else {
      setSelectedLrIds([...selectedLrIds, lr.id]);
      if (!customLrData[lr.lrNo]) {
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

  // Select or Deselect all currently filtered LRs
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredPendingLrs.map(lr => lr.id);
    if (filteredIds.length === 0) return;
    
    const allSelected = filteredIds.every(id => selectedLrIds.includes(id));
    
    if (allSelected) {
      // Unselect all filtered
      setSelectedLrIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered (that aren't already selected)
      const newSelections = filteredIds.filter(id => !selectedLrIds.includes(id));
      setSelectedLrIds(prev => [...prev, ...newSelections]);
      
      const newCustomData = { ...customLrData };
      newSelections.forEach(id => {
        const lr = pendingLrs.find(l => l.id === id);
        if (lr && !newCustomData[lr.lrNo]) {
          newCustomData[lr.lrNo] = {
            deliveryPerson: lr.consigneeName ? `${lr.consigneeName.split(' ')[0]} Staff` : 'Local Driver',
            toPay: lr.paymentType === 'ToPay' ? Number(lr.charges?.total || 0) : 0,
            paid: lr.paymentType === 'Paid' ? Number(lr.charges?.total || 0) : 0,
            tbb: lr.paymentType === 'T.B.B' ? Number(lr.charges?.total || 0) : 0
          };
        }
      });
      setCustomLrData(newCustomData);
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

  // Determine available LRs for dispatch: 'in-godown' plus any currently linked to the memo being edited
  const pendingLrs = allStockIn.filter(lr => {
    if (lr.status === 'in-godown') return true;
    if (editingMemoId && originalLinkedLrNos.includes(lr.lrNo)) return true;
    return false;
  });

  // Filter pending LRs by search term
  const filteredPendingLrs = pendingLrs.filter(lr => {
    const term = lrSearchTerm.toLowerCase();
    return (
      !term ||
      lr.lrNo?.toLowerCase().includes(term) ||
      lr.memoNo?.toLowerCase().includes(term) ||
      lr.consignorName?.toLowerCase().includes(term) ||
      lr.consigneeName?.toLowerCase().includes(term) ||
      lr.toStation?.toLowerCase().includes(term)
    );
  });

  // Compile selected LRs into memo entries & compute running totals
  const selectedLrObjects = pendingLrs.filter(l => selectedLrIds.includes(l.id) || selectedLrIds.includes(l.lrNo));

  const memoEntries = selectedLrObjects.map((lr, index) => {
    const custom = customLrData[lr.id] || customLrData[lr.lrNo] || {
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

  const handleEditMemo = (memo) => {
    setEditingMemoId(memo.id);
    setFormData({
      memoNo: memo.memoNo || '',
      date: memo.date || new Date().toISOString().split('T')[0],
      lorryNo: memo.lorryNo || '',
      ownerName: memo.ownerName || '',
      driverName: memo.driverName || '',
      fromStation: memo.fromStation || 'SANGLI',
      toStation: memo.toStation || '',
      freight: memo.freight || '',
      loadingCharges: memo.loadingCharges || '',
      otherCharges: memo.otherCharges || ''
    });
    const lrIds = (memo.entries || []).map(e => {
      const match = allStockIn.find(l => l.lrNo === e.lrNo);
      return match ? match.id : (e.id || e.lrNo);
    });
    setSelectedLrIds(lrIds);
    setOriginalLinkedLrNos(memo.entries.map(e => e.lrNo));
    
    // Build customLrData from memo entries
    const customData = {};
    (memo.entries || []).forEach(e => {
      customData[e.id || e.lrNo] = {
        deliveryPerson: e.deliveryPerson || '',
        paid: e.paid || 0,
        toPay: e.toPay || 0
      };
    });
    setCustomLrData(customData);
    setShowForm(true);
  };

  const handleToStationChange = (station) => {
    if (!editingMemoId) {
      // Keep existing numeric part if it exists, or generate a new one
      const currentParts = formData.memoNo.split('-');
      const currentNum = currentParts.length > 1 ? currentParts[1] : Math.floor(10000 + Math.random() * 90000);
      const prefix = getMemoPrefix(station);
      setFormData({ ...formData, toStation: station, memoNo: `${prefix}${currentNum}` });
    } else {
      setFormData({ ...formData, toStation: station });
    }
  };

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
        ownerName: formData.ownerName,
        driverName: formData.driverName,
        fromStation: formData.fromStation,
        toStation: formData.toStation,
        freight: formData.freight,
        loadingCharges: formData.loadingCharges,
        otherCharges: formData.otherCharges,
        entries: memoEntries,
        totalPackages,
        totalToPay,
        totalPaid,
        totalTbb,
        grandTotal
      };

      let savedMemo;
      if (editingMemoId) {
        savedMemo = await dataService.updateStockOut(editingMemoId, memoPayload, originalLinkedLrNos);
      } else {
        savedMemo = await dataService.addStockOut(memoPayload);
      }

      // Reset form
      setFormData({
        memoNo: `${getMemoPrefix('')}${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toISOString().split('T')[0],
        lorryNo: '',
        ownerName: '',
        driverName: '',
        fromStation: 'SANGLI',
        toStation: '',
        freight: '',
        loadingCharges: '',
        otherCharges: ''
      });
      setSelectedLrIds([]);
      setCustomLrData({});
      setEditingMemoId(null);
      setOriginalLinkedLrNos([]);
      setShowForm(false);

      await loadData();
      if (savedMemo) setSelectedMemo(savedMemo);
    } catch (err) {
      console.error("Save Stock Out error:", err);
      alert("Error saving Stock Out Memo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter stock out MEMOS
  const filteredMemos = stockOutList.filter(memo => {
    const term = searchTerm.toLowerCase();
    const lrs = memo.entries || [];
    const hasLrMatch = lrs.some(lr => 
      lr.lrNo?.toLowerCase().includes(term) ||
      lr.consignor?.toLowerCase().includes(term) ||
      lr.consignee?.toLowerCase().includes(term) ||
      lr.station?.toLowerCase().includes(term)
    );

    return (
      memo.memoNo?.toLowerCase().includes(term) ||
      memo.lorryNo?.toLowerCase().includes(term) ||
      memo.driverName?.toLowerCase().includes(term) ||
      hasLrMatch
    );
  });

  // Summary Totals for Stock Out Register Table
  const regTotalPkgs = filteredMemos.reduce((sum, m) => sum + Number(m.totalPackages || 0), 0);
  const regTotalToPay = filteredMemos.reduce((sum, m) => sum + Number(m.totalToPay || 0), 0);
  const regTotalPaid = filteredMemos.reduce((sum, m) => sum + Number(m.totalPaid || 0), 0);
  const regTotalTbb = filteredMemos.reduce((sum, m) => sum + Number(m.totalTbb || 0), 0);
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
          
          <div className="border-b border-slate-200 pb-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Stock Out Dispatch Builder Form
              </h2>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md whitespace-nowrap">
                {pendingLrs.length} LRs sitting in godown
              </span>
            </div>
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
              <label className="text-[11px] font-bold text-slate-700">OWNER NAME</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="e.g. Rahul Patil"
                className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">FROM (Origin Station) *</label>
              <select
                required
                value={formData.fromStation}
                onChange={(e) => setFormData({ ...formData, fromStation: e.target.value })}
                className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-bold uppercase"
              >
                <option value="">Select Station</option>
                {(masters.stations || []).map(st => (
                  <option key={st.id} value={st.name}>{st.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">TO (Destination Station)</label>
              <select
                value={formData.toStation}
                onChange={(e) => handleToStationChange(e.target.value)}
                className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-bold uppercase"
              >
                <option value="">Select Station</option>
                {(masters.stations || []).map(st => (
                  <option key={st.id} value={st.name}>{st.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">FREIGHT</label>
              <input
                type="number"
                value={formData.freight}
                onChange={(e) => setFormData({ ...formData, freight: e.target.value })}
                placeholder="e.g. 5000"
                className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700">LOADING CHARGES</label>
              <input
                type="number"
                value={formData.loadingCharges}
                onChange={(e) => setFormData({ ...formData, loadingCharges: e.target.value })}
                placeholder="e.g. 500"
                className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700">OTHER CHARGES</label>
              <input
                type="number"
                value={formData.otherCharges}
                onChange={(e) => setFormData({ ...formData, otherCharges: e.target.value })}
                placeholder="e.g. 200"
                className="w-full mt-1 p-2 bg-white rounded-lg border border-slate-300 text-xs font-bold"
              />
            </div>
          </div>

          {/* SELECT PENDING GODOWN LRs TO LOAD */}
          <div className="space-y-3">
            
            <div className="flex items-center gap-3 w-full pb-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={lrSearchTerm}
                  onChange={(e) => setLrSearchTerm(e.target.value)}
                  placeholder="Search incoming Memo No, or LR No to select..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 focus:bg-white text-base rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 transition-all shadow-inner"
                />
              </div>
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="whitespace-nowrap px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-xl border-2 border-indigo-200 transition-colors shadow-sm"
              >
                Select All Filtered
              </button>
            </div>

            <div className="flex items-center justify-between pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-600" /> Select Pending LRs in Godown to Dispatch
              </h3>
            </div>

            {filteredPendingLrs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                No pending LRs sitting in godown. Receive Stock In entries first.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                {filteredPendingLrs.map((lr) => {
                  const isSelected = selectedLrIds.includes(lr.id) || selectedLrIds.includes(lr.lrNo);
                  return (
                    <div
                      key={lr.id}
                      onClick={() => toggleLrSelection(lr)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1 w-full overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-indigo-900">{lr.lrNo}</span>
                          <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                            {lr.toStation}
                          </span>
                          {lr.memoNo && (
                            <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100" title="Incoming Memo No">
                              {lr.memoNo}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">
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
                      <th className="px-1.5 py-3 border-r border-emerald-800 text-center w-[4%]">SR.</th>
                      <th className="px-2 py-3 border-r border-emerald-800 w-[12%]">L.R.NO.</th>
                      <th className="px-1 py-3 border-r border-emerald-800 text-center w-[5%]">PKG</th>
                      <th className="px-2 py-3 border-r border-emerald-800 w-[18%] truncate">CONSIGNOR</th>
                      <th className="px-2 py-3 border-r border-emerald-800 w-[18%] truncate">CONSIGNEE</th>
                      <th className="px-1 py-3 border-r border-emerald-800 text-center w-[6%]">WEIGHT</th>
                      <th className="px-1 py-3 border-r border-emerald-800 text-center w-[10%]">STATION</th>
                      <th className="px-1 py-3 border-r border-emerald-800 text-center bg-amber-950/60 text-amber-300 w-[9%]">TO PAY</th>
                      <th className="px-1 py-3 border-r border-emerald-800 text-center bg-emerald-950/60 text-emerald-300 w-[9%]">PAID</th>
                      <th className="px-1 py-3 text-center bg-blue-950/60 text-blue-300 w-[9%]">T.B.B</th>
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
                          <td className="px-1 py-3.5 border-r border-slate-200 text-center font-mono font-bold">{origLr?.weight || e.weight || '-'}</td>
                          <td className="px-1 py-3.5 border-r border-slate-200 text-center font-bold uppercase text-xs truncate">{e.station}</td>
                          
                          {/* Editable ToPay */}
                          <td className="px-1 py-2 border-r border-slate-200 text-center bg-amber-50/30">
                            <input
                              type="number"
                              min="0"
                              value={e.toPay}
                              onChange={(evt) => handleLrDataChange(e.lrNo, 'toPay', evt.target.value)}
                              className="w-full text-center px-1 py-1.5 bg-white border border-amber-300 rounded-lg font-mono font-bold text-amber-900 text-xs focus:outline-none"
                            />
                          </td>

                          {/* Editable Paid */}
                          <td className="px-1 py-2 border-r border-slate-200 text-center bg-emerald-50/30">
                            <input
                              type="number"
                              min="0"
                              value={e.paid}
                              onChange={(evt) => handleLrDataChange(e.lrNo, 'paid', evt.target.value)}
                              className="w-full text-center px-1 py-1.5 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-emerald-900 text-xs focus:outline-none"
                            />
                          </td>

                          {/* Editable T.B.B */}
                          <td className="px-1 py-2 text-center bg-blue-50/30">
                            <input
                              type="number"
                              min="0"
                              value={e.tbb}
                              onChange={(evt) => handleLrDataChange(e.lrNo, 'tbb', evt.target.value)}
                              className="w-full text-center px-1 py-1.5 bg-white border border-blue-300 rounded-lg font-mono font-bold text-blue-900 text-xs focus:outline-none"
                            />
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
                      <td colSpan={3} className="px-2 py-3 text-right uppercase tracking-wider font-black text-slate-300">
                        AMOUNTS TOTAL:
                      </td>
                      <td className="px-1 py-3 text-center font-mono font-black text-xs text-amber-300 truncate">
                        ₹{totalToPay.toLocaleString('en-IN')}
                      </td>
                      <td className="px-1 py-3 text-center font-mono font-black text-xs text-emerald-300 truncate">
                        ₹{totalPaid.toLocaleString('en-IN')}
                      </td>
                      <td className="px-1 py-3 text-center font-mono font-black text-xs text-blue-300 truncate">
                        ₹{totalTbb.toLocaleString('en-IN')}
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
              {isSubmitting ? 'Saving...' : editingMemoId ? 'Update Memo' : 'Save & Print'}
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

      {!showForm && (<>
      {/* SEARCH BAR FOR STOCK OUT REGISTER */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Memo No, Vehicle, Driver, or LR No..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-600">Total PKG: <strong className="text-slate-900">{regTotalPkgs}</strong></span>
          <span className="text-emerald-700">Total Out Amount: <strong>₹{regGrandTotal.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>

            {/* STOCK OUT CONTENT AREA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Stock Out Register ({filteredMemos.length} Records)
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
                <th className="p-3 border-r border-slate-800">Date</th>
                <th className="p-3 border-r border-slate-800">VEHICLE NO.</th>
                <th className="p-3 border-r border-slate-800">DRIVER NAME</th>
                <th className="p-3 border-r border-slate-800 text-center">TOTAL LRs</th>
                <th className="p-3 border-r border-slate-800 text-center w-16">TOTAL PKG</th>
                <th className="p-3 border-r border-slate-800 text-right w-28">TOTAL AMOUNT (₹)</th>
                <th className="p-3 text-center w-24">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMemos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-slate-400">
                    No Stock Out Memo records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredMemos.map((memo, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/90 transition-colors">
                    <td className="p-3 border-r border-slate-100 text-center font-mono font-semibold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="p-3 border-r border-slate-100">
                      <p className="text-xs font-semibold text-slate-800">
                        {new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </td>
                    <td className="p-3 border-r border-slate-100 font-semibold text-slate-900 font-mono">
                      {memo.lorryNo}
                    </td>
                    <td className="p-3 border-r border-slate-100 font-semibold text-slate-900">
                      {memo.driverName}
                    </td>
                    <td className="p-3 border-r border-slate-100 text-center font-mono font-bold text-slate-900">
                      {(memo.entries || []).length}
                    </td>
                    <td className="p-3 border-r border-slate-100 text-center font-mono font-bold text-slate-900">
                      {memo.totalPackages}
                    </td>
                    <td className="p-3 border-r border-slate-100 text-right">
                      <span className="font-mono font-bold text-emerald-700 text-xs inline-block">
                        ₹{(memo.grandTotal || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewMemoData(memo)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                          title={`View Memo #${memo.memoNo}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditMemo(memo)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                          title={`Edit Memo #${memo.memoNo}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedMemo(memo)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title={`Print Memo #${memo.memoNo}`}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* SPREADSHEET TOTALS FOOTER ROW */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-800">
                <td colSpan={4} className="p-3 text-right uppercase tracking-wider font-black text-slate-300">
                  TOTALS:
                </td>
                <td className="p-3 border-r border-slate-800 text-center font-mono font-black text-xs text-yellow-300">
                  {filteredMemos.reduce((sum, m) => sum + (m.entries || []).length, 0)} LRs
                </td>
                <td className="p-3 border-r border-slate-800 text-center font-mono font-black text-xs text-yellow-300">
                  {regTotalPkgs} Pkgs
                </td>
                <td className="p-3 border-r border-slate-800 text-right font-mono font-black text-emerald-300">
                  ₹{regGrandTotal.toLocaleString('en-IN')}
                </td>
                <td className="p-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      </>
      )}



      {/* Print Modal */}
      {viewMemoData && <LoadingMemoView memo={viewMemoData} onClose={() => setViewMemoData(null)} />}
      {selectedLr && <LRPrintModal lr={selectedLr} onClose={() => setSelectedLr(null)} />}
      {selectedMemo && <MemoPrintModal memo={selectedMemo} onClose={() => setSelectedMemo(null)} />}

    </div>
  );
}
