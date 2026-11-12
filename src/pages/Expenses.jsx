import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt,
  Plus,
  Search,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Fuel,
  Wrench,
  ShieldCheck,
  Banknote,
  MapPin,
  Users,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Printer,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Calendar,
  IndianRupee,
  Clock,
  Sparkles
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { exportExcelFile, exportCSVFile } from '../utils/exportUtils';
import * as XLSX from 'xlsx';

// Category Definitions with Icons and Color Accents matching the reference design
const EXPENSE_CATEGORIES = [
  { 
    id: 'DIESEL_FUEL', 
    label: 'DIESEL / FUEL', 
    subLabel: 'Fuel & Diesel', 
    icon: Fuel, 
    color: 'amber', 
    borderColor: 'border-l-amber-500',
    iconColor: 'text-amber-500',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  { 
    id: 'MAINTENANCE', 
    label: 'MAINTENANCE', 
    subLabel: 'Repairs & Garage', 
    icon: Wrench, 
    color: 'rose', 
    borderColor: 'border-l-rose-500',
    iconColor: 'text-rose-500',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  { 
    id: 'RTO_INSURANCE', 
    label: 'RTO & INSURANCE', 
    subLabel: 'Tax, Permit & Policy', 
    icon: ShieldCheck, 
    color: 'purple', 
    borderColor: 'border-l-purple-500',
    iconColor: 'text-purple-500',
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  { 
    id: 'SALARY', 
    label: 'SALARY', 
    subLabel: 'Staff & Driver Wages', 
    icon: Banknote, 
    color: 'blue', 
    borderColor: 'border-l-blue-600',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  { 
    id: 'LOCAL_CHARGES', 
    label: 'LOCAL CHARGES', 
    subLabel: 'Local Hamali & Cartage', 
    icon: MapPin, 
    color: 'cyan', 
    borderColor: 'border-l-cyan-500',
    iconColor: 'text-cyan-500',
    badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200'
  },
  { 
    id: 'DRIVER_HELPER', 
    label: 'DRIVER/HELPER', 
    subLabel: 'Bhatta & Advances', 
    icon: Users, 
    color: 'sky', 
    borderColor: 'border-l-sky-500',
    iconColor: 'text-sky-500',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200'
  },
  { 
    id: 'LOADING', 
    label: 'LOADING', 
    subLabel: 'Loading Hamali', 
    icon: ArrowUp, 
    color: 'emerald', 
    borderColor: 'border-l-emerald-500',
    iconColor: 'text-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  { 
    id: 'UNLOADING', 
    label: 'UNLOADING', 
    subLabel: 'Unloading Hamali', 
    icon: ArrowDown, 
    color: 'teal', 
    borderColor: 'border-l-teal-500',
    iconColor: 'text-teal-500',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200'
  },
  { 
    id: 'OTHER_EXPENSES', 
    label: 'OTHER EXPENSES', 
    subLabel: 'Misc & Godown', 
    icon: MoreHorizontal, 
    color: 'slate', 
    borderColor: 'border-l-slate-400',
    iconColor: 'text-slate-400',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300'
  }
];

const PAYMENT_MODES = [
  'Cash',
  'Bank Transfer',
  'UPI / GPay',
  'Cheque',
  'Petrol Card',
  'Other'
];

// Helper to convert number to Indian currency words
function numberToWords(num) {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + ' Rupees Only';
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [paymentModeFilter, setPaymentModeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL', 'TODAY', 'THIS_WEEK', 'THIS_MONTH', 'CUSTOM'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Print Voucher Modal State
  const [printVoucher, setPrintVoucher] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    voucherNo: '',
    date: new Date().toISOString().split('T')[0],
    category: 'DIESEL_FUEL',
    vehicleNo: '',
    paidTo: '',
    mode: 'Cash',
    amount: '',
    refNo: '',
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [expenseList, masters] = await Promise.all([
        dataService.getExpenses ? dataService.getExpenses() : [],
        dataService.getMasters()
      ]);
      setExpenses(expenseList || []);
      setVehicles((masters && masters.vehicles) || []);
    } catch (err) {
      console.error("Error loading expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Generate next sequential voucher number
  const generateVoucherNo = () => {
    const year = new Date().getFullYear();
    const count = (expenses || []).length + 1;
    return `VCH-${year}-${String(count).padStart(4, '0')}`;
  };

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormData({
      voucherNo: generateVoucherNo(),
      date: new Date().toISOString().split('T')[0],
      category: 'DIESEL_FUEL',
      vehicleNo: '',
      paidTo: '',
      mode: 'Cash',
      amount: '',
      refNo: '',
      notes: ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exp) => {
    setEditingExpense(exp);
    setFormData({
      voucherNo: exp.voucherNo || '',
      date: exp.date ? exp.date.split('T')[0] : new Date().toISOString().split('T')[0],
      category: exp.category || 'DIESEL_FUEL',
      vehicleNo: exp.vehicleNo || '',
      paidTo: exp.paidTo || '',
      mode: exp.mode || 'Cash',
      amount: exp.amount || '',
      refNo: exp.refNo || '',
      notes: exp.notes || ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e, shouldPrint = false) => {
    if (e) e.preventDefault();
    if (!formData.voucherNo.trim()) {
      setErrorMsg('Voucher Number is required.');
      return;
    }
    if (!formData.paidTo.trim()) {
      setErrorMsg('Payee / Paid To name is required.');
      return;
    }
    const numAmount = Number(formData.amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₹0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        voucherNo: formData.voucherNo.trim().toUpperCase(),
        date: formData.date,
        category: formData.category,
        vehicleNo: formData.vehicleNo.trim().toUpperCase(),
        paidTo: formData.paidTo.trim(),
        mode: formData.mode,
        amount: numAmount,
        refNo: formData.refNo.trim(),
        notes: formData.notes.trim()
      };

      let savedRecord;
      if (editingExpense) {
        savedRecord = await dataService.updateExpense(editingExpense.id, payload);
        setToastMsg(`Voucher ${payload.voucherNo} updated successfully!`);
      } else {
        savedRecord = await dataService.addExpense(payload);
        setToastMsg(`Voucher ${payload.voucherNo} created successfully!`);
      }

      await loadData();
      setIsModalOpen(false);
      setTimeout(() => setToastMsg(''), 3000);

      if (shouldPrint && savedRecord) {
        setPrintVoucher(savedRecord);
      }
    } catch (err) {
      console.error("Save expense error:", err);
      setErrorMsg('Failed to save voucher: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, voucherNo) => {
    if (!window.confirm(`Are you sure you want to delete Expense Voucher "${voucherNo}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await dataService.deleteExpense(id);
      await loadData();
      setToastMsg(`Voucher ${voucherNo} deleted.`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete voucher.");
    }
  };

  // Date Filtering Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(item => {
      // Category filter
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;

      // Vehicle filter
      if (vehicleFilter !== 'ALL' && (item.vehicleNo || '').toUpperCase() !== vehicleFilter.toUpperCase()) return false;

      // Payment Mode filter
      if (paymentModeFilter !== 'ALL' && item.mode !== paymentModeFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches = 
          (item.voucherNo && item.voucherNo.toLowerCase().includes(q)) ||
          (item.paidTo && item.paidTo.toLowerCase().includes(q)) ||
          (item.vehicleNo && item.vehicleNo.toLowerCase().includes(q)) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          (item.refNo && item.refNo.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Date filter
      if (dateFilter !== 'ALL') {
        const itemDate = new Date(item.date || item.createdAt);
        if (isNaN(itemDate.getTime())) return false;
        const now = new Date();

        if (dateFilter === 'TODAY') {
          if (
            itemDate.getDate() !== now.getDate() ||
            itemDate.getMonth() !== now.getMonth() ||
            itemDate.getFullYear() !== now.getFullYear()
          ) return false;
        } else if (dateFilter === 'THIS_WEEK') {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (itemDate < oneWeekAgo) return false;
        } else if (dateFilter === 'THIS_MONTH') {
          if (
            itemDate.getMonth() !== now.getMonth() ||
            itemDate.getFullYear() !== now.getFullYear()
          ) return false;
        } else if (dateFilter === 'CUSTOM') {
          if (customStartDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            if (itemDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (itemDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [expenses, categoryFilter, vehicleFilter, paymentModeFilter, searchTerm, dateFilter, customStartDate, customEndDate]);

  // Aggregate Category Totals for Metric Cards
  const totalsByCategory = useMemo(() => {
    const acc = {
      TOTAL: 0,
      COUNT: 0,
      DIESEL_FUEL: 0,
      MAINTENANCE: 0,
      RTO_INSURANCE: 0,
      SALARY: 0,
      LOCAL_CHARGES: 0,
      DRIVER_HELPER: 0,
      LOADING: 0,
      UNLOADING: 0,
      OTHER_EXPENSES: 0
    };

    filteredExpenses.forEach(item => {
      const amt = Number(item.amount || 0);
      acc.TOTAL += amt;
      acc.COUNT += 1;
      if (acc[item.category] !== undefined) {
        acc[item.category] += amt;
      } else {
        acc.OTHER_EXPENSES += amt;
      }
    });

    return acc;
  }, [filteredExpenses]);

  // Unique Vehicle options
  const vehicleOptions = useMemo(() => {
    const set = new Set();
    vehicles.forEach(v => {
      if (v.vehicleNo) set.add(v.vehicleNo.toUpperCase());
    });
    expenses.forEach(e => {
      if (e.vehicleNo) set.add(e.vehicleNo.toUpperCase());
    });
    return Array.from(set).sort();
  }, [vehicles, expenses]);

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredExpenses.length === 0) {
      alert("No expense records to export.");
      return;
    }

    const exportRows = filteredExpenses.map((exp, idx) => {
      const catObj = EXPENSE_CATEGORIES.find(c => c.id === exp.category);
      return {
        'Sr. No': idx + 1,
        'Date': new Date(exp.date || exp.createdAt).toLocaleDateString('en-IN'),
        'Voucher No': exp.voucherNo,
        'Category': catObj ? catObj.label : exp.category,
        'Vehicle No': exp.vehicleNo || 'N/A',
        'Paid To / Payee': exp.paidTo,
        'Payment Mode': exp.mode,
        'Amount (₹)': Number(exp.amount || 0),
        'Reference No': exp.refNo || '',
        'Notes': exp.notes || ''
      };
    });

    // Add Grand Total row
    exportRows.push({
      'Sr. No': 'TOTAL',
      'Date': '',
      'Voucher No': `${totalsByCategory.COUNT} Vouchers`,
      'Category': '',
      'Vehicle No': '',
      'Paid To / Payee': '',
      'Payment Mode': '',
      'Amount (₹)': totalsByCategory.TOTAL,
      'Reference No': '',
      'Notes': ''
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Operating Expenses");
    const fileName = `RoyalRoadlines_OperatingExpenses_${new Date().toISOString().slice(0, 10)}.xlsx`;
    exportExcelFile(workbook, fileName, exportRows);
  };

  // Export to PDF / Print Report
  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans">
      
      {/* 1. TOP HEADER BANNER matching user reference image */}
      <div className="bg-gradient-to-r from-[#071330] via-[#0d2252] to-[#071330] rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xl text-white relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-slate-700/60 no-print">
        {/* Ambient subtle glow background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Title & Description */}
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0e2a63] border border-sky-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-sky-950/40">
            <Receipt className="w-6 h-6 text-sky-400 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Operating Expense Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-3xl mt-1.5 leading-relaxed">
              Record and track Diesel/Fuel, Vehicle Maintenance, RTO & Insurance, Salary, Local Charges, Driver Advances, Loading/Unloading, and Other operational expenses.
            </p>
          </div>
        </div>

        {/* Action Buttons: Excel, PDF, + Add Expense */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            title="Download Excel Report"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            title="Print or Export PDF"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* 2. THE 10 SUMMARY METRIC CARDS matching user reference image */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 no-print">
        
        {/* Card 1: TOTAL EXPENSES (Dark Navy) */}
        <div className="bg-[#091b3e] text-white rounded-2xl p-4 shadow-sm border border-slate-700/80 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">TOTAL EXPENSES</span>
            <span className="text-cyan-400 font-bold text-sm">$</span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ₹{totalsByCategory.TOTAL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              {totalsByCategory.COUNT} Vouchers
            </div>
          </div>
        </div>

        {/* Cards 2 to 10: Specific Expense Categories */}
        {EXPENSE_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const amount = totalsByCategory[cat.id] || 0;
          return (
            <div 
              key={cat.id}
              className={`bg-white rounded-2xl p-4 border border-slate-200 border-l-4 ${cat.borderColor} shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wide truncate">
                  {cat.label}
                </span>
                <Icon className={`w-4 h-4 ${cat.iconColor} shrink-0 stroke-[2.2]`} />
              </div>
              <div className="mt-3">
                <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1 truncate">
                  {cat.subLabel}
                </div>
              </div>
            </div>
          );
        })}

      </div>

      {/* 3. SEARCH & FILTER CONTROLS BAR matching reference image */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 space-y-4 no-print">
        {/* Row 1: Search + Category + Vehicle + Mode Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Voucher, Payee, Vehicle, Notes..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            >
              <option value="ALL">All Expense Categories</option>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label} ({c.subLabel})</option>
              ))}
            </select>
          </div>

          {/* Vehicle Dropdown */}
          <div>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            >
              <option value="ALL">All Vehicles</option>
              {vehicleOptions.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Payment Mode Dropdown */}
          <div>
            <select
              value={paymentModeFilter}
              onChange={(e) => setPaymentModeFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            >
              <option value="ALL">All Payment Modes</option>
              {PAYMENT_MODES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Date Filters matching reference image */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600 tracking-wider uppercase mr-1">
            DATE:
          </span>

          <button
            onClick={() => setDateFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dateFilter === 'ALL'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Dates
          </button>

          <button
            onClick={() => setDateFilter('TODAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dateFilter === 'TODAY'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => setDateFilter('THIS_WEEK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dateFilter === 'THIS_WEEK'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            This Week
          </button>

          <button
            onClick={() => setDateFilter('THIS_MONTH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dateFilter === 'THIS_MONTH'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            This Month
          </button>

          <button
            onClick={() => setDateFilter('CUSTOM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dateFilter === 'CUSTOM'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Custom Range
          </button>

          {dateFilter === 'CUSTOM' && (
            <div className="flex items-center gap-2 ml-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 animate-in fade-in">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-transparent outline-none"
              />
              <span className="text-xs text-slate-400 font-bold">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-transparent outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. EXPENSES LEDGER TABLE matching reference columns */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-900 border-t-transparent"></div>
            <p className="mt-3 text-sm text-slate-500 font-semibold">Loading operating expenses ledger...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Receipt className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Operating Expenses Recorded</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || categoryFilter !== 'ALL' || vehicleFilter !== 'ALL' || dateFilter !== 'ALL'
                ? "No expense records match your selected filter criteria. Try resetting the filters."
                : "No vouchers have been added yet. Click '+ Add Expense' above to log fuel, maintenance, or staff payouts."}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:brightness-105 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">DATE</th>
                  <th className="py-3.5 px-4">VOUCHER</th>
                  <th className="py-3.5 px-4">CATEGORY</th>
                  <th className="py-3.5 px-4">VEHICLE NO</th>
                  <th className="py-3.5 px-4">PAID TO / PAYEE</th>
                  <th className="py-3.5 px-4">MODE</th>
                  <th className="py-3.5 px-4 text-right">AMOUNT (₹)</th>
                  <th className="py-3.5 px-4">NOTES / REF</th>
                  <th className="py-3.5 px-4 text-center no-print">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filteredExpenses.map((exp) => {
                  const catObj = EXPENSE_CATEGORIES.find(c => c.id === exp.category);
                  const Icon = catObj ? catObj.icon : Receipt;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* DATE */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-semibold">
                        {new Date(exp.date || exp.createdAt).toLocaleDateString('en-IN')}
                      </td>

                      {/* VOUCHER */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-md border border-blue-200/60 text-xs">
                          {exp.voucherNo || '—'}
                        </span>
                      </td>

                      {/* CATEGORY */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold ${catObj ? catObj.badgeBg : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{catObj ? catObj.label : exp.category}</span>
                        </span>
                      </td>

                      {/* VEHICLE NO */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {exp.vehicleNo ? (
                          <div className="flex items-center gap-1 text-slate-800 font-mono font-bold">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            <span>{exp.vehicleNo}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* PAID TO / PAYEE */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[200px] truncate" title={exp.paidTo}>
                        {exp.paidTo}
                      </td>

                      {/* MODE */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {exp.mode}
                        </span>
                      </td>

                      {/* AMOUNT (₹) */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm whitespace-nowrap">
                        ₹{Number(exp.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* NOTES / REF */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={`${exp.refNo ? `[Ref: ${exp.refNo}] ` : ''}${exp.notes || ''}`}>
                        {exp.refNo && <span className="font-semibold text-slate-700 font-mono mr-1">[{exp.refNo}]</span>}
                        {exp.notes || <span className="text-slate-400 italic">No notes</span>}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap no-print">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setPrintVoucher(exp)}
                            title="Print Expense Voucher"
                            className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(exp)}
                            title="Edit Voucher"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id, exp.voucherNo)}
                            title="Delete Voucher"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Table Footer with Grand Total */}
              <tfoot>
                <tr className="bg-[#0c1c42] text-white font-bold text-xs border-t-2 border-amber-400">
                  <td colSpan={6} className="py-3 px-4 text-right uppercase tracking-wider font-black">
                    GRAND TOTAL ({totalsByCategory.COUNT} Vouchers):
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-amber-300 text-sm whitespace-nowrap">
                    ₹{totalsByCategory.TOTAL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="py-3 px-4 no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* 5. ADD / EDIT EXPENSE VOUCHER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="bg-[#071330] px-6 py-4 text-white flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base sm:text-lg">
                  {editingExpense ? 'Edit Operating Expense Voucher' : 'Add Operating Expense Voucher'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Grid 1: Date & Voucher No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Voucher Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Voucher Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.voucherNo}
                    onChange={(e) => setFormData({ ...formData, voucherNo: e.target.value.toUpperCase() })}
                    placeholder="e.g. VCH-2026-0001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-blue-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expense Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXPENSE_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 text-blue-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${cat.iconColor} shrink-0`} />
                        <div className="truncate">
                          <div className="text-[11px] truncate uppercase">{cat.label}</div>
                          <div className="text-[9.5px] text-slate-500 truncate">{cat.subLabel}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid 2: Vehicle No & Paid To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehicle Number (If Applicable)
                  </label>
                  <input
                    type="text"
                    list="expense-vehicles-list"
                    value={formData.vehicleNo}
                    onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value.toUpperCase() })}
                    placeholder="Select or enter vehicle (e.g. MH 12 AB 1234)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                  <datalist id="expense-vehicles-list">
                    {vehicleOptions.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Paid To / Payee Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.paidTo}
                    onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                    placeholder="e.g. Bharat Petroleum, Driver Ramesh, Union"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Grid 3: Amount, Mode, Ref No */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    {PAYMENT_MODES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ref / Bill / Chq No
                  </label>
                  <input
                    type="text"
                    value={formData.refNo}
                    onChange={(e) => setFormData({ ...formData, refNo: e.target.value })}
                    placeholder="e.g. Bill #9241"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Notes / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Purpose of Expense
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. 60L Diesel filled at NH4 pump, Oil filter replacement, Delivery cartage"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>Save & Print</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-lg shadow-orange-500/25 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingExpense ? 'Update Voucher' : 'Save Voucher'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. PRINTABLE EXPENSE PAYMENT VOUCHER MODAL */}
      {printVoucher && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:bg-transparent print:p-0">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 font-sans relative my-auto print:shadow-none print:border-none print:p-0">
            {/* Modal Controls (hidden on print) */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 no-print">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Print Preview — Expense Payment Voucher
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>
                <button
                  onClick={() => setPrintVoucher(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE SLIP CONTENT */}
            <div className="border-2 border-black p-5 space-y-4 text-black">
              {/* Slip Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Royal Roadlines" className="h-12 w-auto object-contain" />
                  <div>
                    <h2 className="text-xl font-black tracking-wider uppercase">ROYAL ROADLINES</h2>
                    <p className="text-[10px] font-bold text-amber-700 tracking-widest uppercase">
                      RELIABLE • SAFE • ON TIME
                    </p>
                    <p className="text-[9px] text-slate-600 leading-tight mt-0.5">
                      MASJID BUNDER : B.I.T Bldg. No.3, Bhandari Street, Mumbai-400 003 | MOB: 8087209449
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-black text-white font-black text-xs uppercase tracking-wider">
                    PAYMENT VOUCHER
                  </div>
                  <div className="text-xs font-mono font-bold mt-1">
                    NO: <span className="text-sm">{printVoucher.voucherNo}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    DATE: {new Date(printVoucher.date || printVoucher.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Voucher Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-300 p-2.5 rounded">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Paid To / Payee:</span>
                  <span className="font-bold text-sm text-black block mt-0.5">{printVoucher.paidTo}</span>
                </div>
                <div className="border border-slate-300 p-2.5 rounded">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Expense Category:</span>
                  <span className="font-bold text-sm text-black block mt-0.5">
                    {EXPENSE_CATEGORIES.find(c => c.id === printVoucher.category)?.label || printVoucher.category}
                  </span>
                </div>
                <div className="border border-slate-300 p-2.5 rounded">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Vehicle Number:</span>
                  <span className="font-bold font-mono text-sm text-black block mt-0.5">
                    {printVoucher.vehicleNo || 'N/A (General)'}
                  </span>
                </div>
                <div className="border border-slate-300 p-2.5 rounded">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Payment Mode & Ref:</span>
                  <span className="font-bold text-sm text-black block mt-0.5">
                    {printVoucher.mode} {printVoucher.refNo ? `(Ref: ${printVoucher.refNo})` : ''}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="border border-slate-300 p-3 rounded text-xs min-h-[60px]">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Description / Purpose:</span>
                <p className="mt-1 text-slate-800 font-medium">
                  {printVoucher.notes || 'Operating logistics and transport management expense.'}
                </p>
              </div>

              {/* Amount Box */}
              <div className="bg-slate-100 border-2 border-black p-3 rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">Amount in Words:</span>
                  <span className="font-bold text-xs capitalize text-black">
                    {numberToWords(Math.round(Number(printVoucher.amount || 0)))}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">Amount Paid:</span>
                  <span className="font-mono font-black text-xl text-black">
                    ₹{Number(printVoucher.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs">
                <div>
                  <div className="border-t border-black pt-1 font-bold">Prepared By</div>
                  <div className="text-[10px] text-slate-500">Accountant</div>
                </div>
                <div>
                  <div className="border-t border-black pt-1 font-bold">Receiver's Signature</div>
                  <div className="text-[10px] text-slate-500">Payee / Driver</div>
                </div>
                <div>
                  <div className="border-t border-black pt-1 font-bold">Authorized Signatory</div>
                  <div className="text-[10px] text-slate-500">Royal Roadlines</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#091b3e] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-sky-400/40 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
