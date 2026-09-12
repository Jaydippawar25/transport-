import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  PackagePlus, 
  Truck, 
  Boxes, 
  Search, 
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { dataService } from '../services/dataService';

export default function Reports() {
  const [stockInList, setStockInList] = useState([]);
  const [stockOutList, setStockOutList] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Report Section Tab ('STOCK_IN' | 'STOCK_OUT' | 'PENDING_STOCK')
  const [activeSection, setActiveSection] = useState('STOCK_IN');

  // Date Range Filter ('ALL' | 'TODAY' | 'WEEK' | 'MONTH')
  const [dateRange, setDateRange] = useState('ALL');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [inData, outData, stationData] = await Promise.all([
        dataService.getStockIn(),
        dataService.getStockOut(),
        dataService.getStations()
      ]);
      setStockInList(inData);
      setStockOutList(outData);
      setStations(stationData);
    } catch (err) {
      console.error("Error loading reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter items by Date Range
  const filterByDate = (dateStr) => {
    if (dateRange === 'ALL' || !dateStr) return true;
    const itemDate = new Date(dateStr);
    const now = new Date();

    if (dateRange === 'TODAY') {
      return itemDate.toDateString() === now.toDateString();
    }
    if (dateRange === 'WEEK') {
      const diff = (now - itemDate) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }
    if (dateRange === 'MONTH') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Filter Stock In List
  const filteredStockIn = stockInList.filter(l => {
    const passDate = filterByDate(l.date || l.createdAt);
    const term = searchTerm.toLowerCase();
    const passSearch = !term || (
      l.lrNo?.toLowerCase().includes(term) ||
      l.consignorName?.toLowerCase().includes(term) ||
      l.consigneeName?.toLowerCase().includes(term) ||
      l.toStation?.toLowerCase().includes(term)
    );
    return passDate && passSearch;
  });

  // Filter Stock Out List
  const filteredStockOut = stockOutList.filter(memo => {
    const passDate = filterByDate(memo.date || memo.createdAt);
    const term = searchTerm.toLowerCase();
    const passSearch = !term || (
      memo.memoNo?.toLowerCase().includes(term) ||
      memo.lorryNo?.toLowerCase().includes(term) ||
      memo.driverName?.toLowerCase().includes(term) ||
      memo.fromStation?.toLowerCase().includes(term) ||
      (memo.entries || []).some(e => 
        e.lrNo?.toLowerCase().includes(term) || 
        e.consignor?.toLowerCase().includes(term) || 
        e.consignee?.toLowerCase().includes(term)
      )
    );
    return passDate && passSearch;
  });

  // Filter Pending Stock (Godown sitting items)
  const pendingStockList = stockInList.filter(l => l.status === 'in-godown').filter(l => {
    const passDate = filterByDate(l.date || l.createdAt);
    const term = searchTerm.toLowerCase();
    const passSearch = !term || (
      l.lrNo?.toLowerCase().includes(term) ||
      l.consignorName?.toLowerCase().includes(term) ||
      l.consigneeName?.toLowerCase().includes(term) ||
      l.toStation?.toLowerCase().includes(term)
    );
    return passDate && passSearch;
  });

  // Totals Calculations for Stock In
  const inTotalPkgs = filteredStockIn.reduce((sum, i) => sum + Number(i.packages || 0), 0);
  const inTotalToPay = filteredStockIn.reduce((sum, i) => sum + (i.paymentType === 'ToPay' ? Number(i.charges?.total || 0) : 0), 0);
  const inTotalPaid = filteredStockIn.reduce((sum, i) => sum + (i.paymentType === 'Paid' ? Number(i.charges?.total || 0) : 0), 0);
  const inTotalTbb = filteredStockIn.reduce((sum, i) => sum + (i.paymentType === 'T.B.B' ? Number(i.charges?.total || 0) : 0), 0);
  const inGrandTotal = inTotalToPay + inTotalPaid + inTotalTbb;

  // Totals Calculations for Stock Out
  const outTotalPkgs = filteredStockOut.reduce((sum, i) => sum + Number(i.totalPackages || 0), 0);
  const outTotalToPay = filteredStockOut.reduce((sum, i) => sum + Number(i.totalToPay || 0), 0);
  const outTotalPaid = filteredStockOut.reduce((sum, i) => sum + Number(i.totalPaid || 0), 0);
  const outTotalTbb = filteredStockOut.reduce((sum, i) => sum + Number(i.totalTbb || 0), 0);
  const outGrandTotal = outTotalToPay + outTotalPaid + outTotalTbb;

  // Totals Calculations for Pending Stock
  const pendingTotalPkgs = pendingStockList.reduce((sum, i) => sum + Number(i.packages || 0), 0);
  const pendingTotalToPay = pendingStockList.reduce((sum, i) => sum + (i.paymentType === 'ToPay' ? Number(i.charges?.total || 0) : 0), 0);
  const pendingTotalPaid = pendingStockList.reduce((sum, i) => sum + (i.paymentType === 'Paid' ? Number(i.charges?.total || 0) : 0), 0);
  const pendingTotalTbb = pendingStockList.reduce((sum, i) => sum + (i.paymentType === 'T.B.B' ? Number(i.charges?.total || 0) : 0), 0);
  const pendingGrandTotal = pendingTotalToPay + pendingTotalPaid + pendingTotalTbb;

  const handlePrint = () => {
    window.print();
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    if (activeSection === 'STOCK_IN') {
      const headers = ['LR No', 'Date', 'Consignor', 'Consignee', 'Station', 'Packages', 'Freight', 'Payment Type', 'Status'];
      const rows = filteredStockIn.map(l => [
        l.lrNo,
        new Date(l.date || l.createdAt).toLocaleDateString('en-IN'),
        `"${l.consignorName}"`,
        `"${l.consigneeName}"`,
        l.toStation,
        l.packages,
        l.charges?.total || 0,
        l.paymentType,
        l.status
      ]);
      const csvStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      downloadCSV(csvStr, `TransTrack_StockIn_Report.csv`);
    } else if (activeSection === 'STOCK_OUT') {
      const headers = ['Memo No', 'Date', 'Lorry No', 'Driver Name', 'Loaded LRs', 'Total Packages', 'ToPay Total', 'Paid Total', 'TBB Total', 'Grand Total'];
      const rows = filteredStockOut.map(m => [
        m.memoNo,
        new Date(m.date || m.createdAt).toLocaleDateString('en-IN'),
        m.lorryNo,
        `"${m.driverName}"`,
        (m.entries || []).length,
        m.totalPackages,
        m.totalToPay || 0,
        m.totalPaid || 0,
        m.totalTbb || 0,
        (m.totalToPay || 0) + (m.totalPaid || 0) + (m.totalTbb || 0)
      ]);
      const csvStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      downloadCSV(csvStr, `TransTrack_StockOut_Report.csv`);
    } else {
      const headers = ['LR No', 'Date', 'Consignor', 'Consignee', 'Destination Station', 'Packages', 'Pending Amount', 'Payment Basis'];
      const rows = pendingStockList.map(l => [
        l.lrNo,
        new Date(l.date || l.createdAt).toLocaleDateString('en-IN'),
        `"${l.consignorName}"`,
        `"${l.consigneeName}"`,
        l.toStation,
        l.packages,
        l.charges?.total || 0,
        l.paymentType
      ]);
      const csvStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      downloadCSV(csvStr, `TransTrack_PendingStock_Report.csv`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Transport Analytics & Reports</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Section-wise breakdown for Stock In, Stock Out, and Pending Godown Stock.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print Section Report
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* CLEAN MODERN REPORT SELECTOR BANNER */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4 no-print">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* SECTION TABS (STOCK IN / STOCK OUT / PENDING STOCK) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 font-black text-xs uppercase tracking-widest text-indigo-700">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>REPORTS</span>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveSection('STOCK_IN')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'STOCK_IN'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-semibold'
                }`}
              >
                <PackagePlus className="w-3.5 h-3.5" /> STOCK IN ({stockInList.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('STOCK_OUT')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'STOCK_OUT'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-semibold'
                }`}
              >
                <Truck className="w-3.5 h-3.5" /> STOCK OUT ({stockOutList.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('PENDING_STOCK')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'PENDING_STOCK'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-semibold'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" /> PENDING STOCK ({pendingStockList.length})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* DATE RANGE SELECTOR */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              {['ALL', 'TODAY', 'WEEK', 'MONTH'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDateRange(mode)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    dateRange === mode 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  {mode === 'ALL' ? 'All Time' : mode === 'TODAY' ? 'Today' : mode === 'WEEK' ? 'Last 7 Days' : 'This Month'}
                </button>
              ))}
            </div>

            {/* SEARCH BAR */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search LR, Consignor, Memo..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-slate-900 placeholder-slate-400 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

        </div>

      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeSection === 'STOCK_IN' && (
          <>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Stock In LRs</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{filteredStockIn.length}</p>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">{inTotalPkgs} Packages Received</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">ToPay Freight Amount</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">₹{inTotalToPay.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-0.5">Receivable on delivery</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Paid Freight Amount</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">₹{inTotalPaid.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-0.5">Prepaid by consignor</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Stock In Grand Total</span>
              <p className="text-2xl font-bold text-indigo-900 font-mono mt-1">₹{inGrandTotal.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-0.5">Gross Stock In Value</p>
            </div>
          </>
        )}

        {activeSection === 'STOCK_OUT' && (
          <>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Stock Out Memos</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{filteredStockOut.length}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">{outTotalPkgs} Packages Dispatched</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Dispatched ToPay Amount</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">₹{outTotalToPay.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-0.5">ToPay on Lorry Manifest</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Dispatched Paid Amount</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">₹{outTotalPaid.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-0.5">Paid on Lorry Manifest</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Stock Out Grand Total</span>
              <p className="text-2xl font-bold text-indigo-900 font-mono mt-1">₹{outGrandTotal.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-0.5">Gross Stock Out Value</p>
            </div>
          </>
        )}

        {activeSection === 'PENDING_STOCK' && (
          <>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending LRs in Godown</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{pendingStockList.length}</p>
              <p className="text-xs text-amber-700 font-semibold mt-0.5">{pendingTotalPkgs} Packages Sitting</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending ToPay Amount</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">₹{pendingTotalToPay.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-0.5">Awaiting dispatch collection</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pending Paid Amount</span>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">₹{pendingTotalPaid.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-0.5">Prepaid in godown</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Pending Stock Value</span>
              <p className="text-2xl font-bold text-indigo-900 font-mono mt-1">₹{pendingGrandTotal.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Freight in Godown</p>
            </div>
          </>
        )}
      </div>

      {/* SECTION REGISTER DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden printable-area">
        
        {/* Table Title Banner */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-2">
            {activeSection === 'STOCK_IN' && <PackagePlus className="w-4 h-4 text-indigo-600" />}
            {activeSection === 'STOCK_OUT' && <Truck className="w-4 h-4 text-indigo-600" />}
            {activeSection === 'PENDING_STOCK' && <Boxes className="w-4 h-4 text-indigo-600" />}
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {activeSection === 'STOCK_IN' && `Stock In Register (${filteredStockIn.length} LRs)`}
              {activeSection === 'STOCK_OUT' && `Stock Out Register (${filteredStockOut.length} Dispatch Memos)`}
              {activeSection === 'PENDING_STOCK' && `Pending Stock Register (${pendingStockList.length} LRs Sitting in Godown)`}
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          
          {/* 1. STOCK IN REGISTER TABLE */}
          {activeSection === 'STOCK_IN' && (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3 border-r border-slate-800 text-center w-12">SR.</th>
                  <th className="p-3 border-r border-slate-800">L.R. NO. & DATE</th>
                  <th className="p-3 border-r border-slate-800 text-center w-16">PKG</th>
                  <th className="p-3 border-r border-slate-800">CONSIGNOR</th>
                  <th className="p-3 border-r border-slate-800">CONSIGNEE</th>
                  <th className="p-3 border-r border-slate-800 text-center">STATION</th>
                  <th className="p-3 border-r border-slate-800 text-right w-24">TO PAY (₹)</th>
                  <th className="p-3 border-r border-slate-800 text-right w-24">PAID (₹)</th>
                  <th className="p-3 border-r border-slate-800 text-right w-24">T.B.B (₹)</th>
                  <th className="p-3 text-center w-24">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStockIn.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No Stock In records match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredStockIn.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 border-r border-slate-100 text-center font-mono font-semibold text-slate-500">{idx + 1}</td>
                      <td className="p-3 border-r border-slate-100">
                        <p className="font-mono font-bold text-indigo-900 text-xs">{item.lrNo}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{new Date(item.date || item.createdAt).toLocaleDateString('en-IN')}</p>
                      </td>
                      <td className="p-3 border-r border-slate-100 text-center font-mono font-bold text-slate-900">{item.packages}</td>
                      <td className="p-3 border-r border-slate-100 font-semibold text-slate-900">
                        {item.consignorName}
                      </td>
                      <td className="p-3 border-r border-slate-100 font-semibold text-slate-900">{item.consigneeName}</td>
                      <td className="p-3 border-r border-slate-100 text-center">
                        <span className="font-bold text-slate-800 uppercase px-2 py-0.5 bg-slate-100 rounded text-[10px]">
                          {item.toStation}
                        </span>
                      </td>
                      <td className="p-3 border-r border-slate-100 text-right font-mono font-bold text-amber-800">
                        {item.paymentType === 'ToPay' ? `₹${item.charges?.total || 0}` : '-'}
                      </td>
                      <td className="p-3 border-r border-slate-100 text-right font-mono font-bold text-emerald-800">
                        {item.paymentType === 'Paid' ? `₹${item.charges?.total || 0}` : '-'}
                      </td>
                      <td className="p-3 border-r border-slate-100 text-right font-mono font-bold text-blue-800">
                        {item.paymentType === 'T.B.B' ? `₹${item.charges?.total || 0}` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === 'dispatched' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.status || 'in-godown'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-800">
                  <td colSpan={2} className="p-3 text-right uppercase font-black text-slate-300">TOTAL:</td>
                  <td className="p-3 border-r border-slate-800 text-center font-mono font-black text-yellow-300">{inTotalPkgs}</td>
                  <td colSpan={3} className="p-3 border-r border-slate-800 text-right uppercase font-black text-slate-300">AMOUNTS:</td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-amber-300">₹{inTotalToPay.toLocaleString('en-IN')}</td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-emerald-300">₹{inTotalPaid.toLocaleString('en-IN')}</td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-blue-300">₹{inTotalTbb.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-center font-mono font-black text-yellow-400">₹{inGrandTotal.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* 2. STOCK OUT REGISTER TABLE */}
          {activeSection === 'STOCK_OUT' && (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3 border-r border-slate-800 text-center w-12">SR.</th>
                  <th className="p-3 border-r border-slate-800">MEMO NO. & DATE</th>
                  <th className="p-3 border-r border-slate-800">VEHICLE NO</th>
                  <th className="p-3 border-r border-slate-800">DRIVER NAME</th>
                  <th className="p-3 border-r border-slate-800 text-center w-24">LOADED LRs</th>
                  <th className="p-3 border-r border-slate-800 text-center w-20">TOTAL PKG</th>
                  <th className="p-3 border-r border-slate-800 text-right w-28">TOPAY (₹)</th>
                  <th className="p-3 border-r border-slate-800 text-right w-28">PAID (₹)</th>
                  <th className="p-3 border-r border-slate-800 text-right w-28">T.B.B (₹)</th>
                  <th className="p-3 text-right w-32">TOTAL OUT (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStockOut.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No Stock Out memo records match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredStockOut.map((memo, idx) => {
                    const memoGrand = (memo.totalToPay || 0) + (memo.totalPaid || 0) + (memo.totalTbb || 0);
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 border-r border-slate-100 text-center font-mono font-semibold text-slate-500">{idx + 1}</td>
                        <td className="p-3 border-r border-slate-100">
                          <p className="font-mono font-bold text-indigo-900 text-xs">{memo.memoNo}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN')}</p>
                        </td>
                        <td className="p-3 border-r border-slate-100 font-mono font-bold text-slate-900 uppercase">{memo.lorryNo}</td>
                        <td className="p-3 border-r border-slate-100 font-semibold text-slate-800">{memo.driverName}</td>
                        <td className="p-3 border-r border-slate-100 text-center font-mono font-bold text-indigo-700">
                          {(memo.entries || []).length} LRs
                        </td>
                        <td className="p-3 border-r border-slate-100 text-center font-mono font-bold text-slate-900">{memo.totalPackages}</td>
                        <td className="p-3 border-r border-slate-100 text-right font-mono text-amber-800 font-semibold">₹{(memo.totalToPay || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 border-r border-slate-100 text-right font-mono text-emerald-800 font-semibold">₹{(memo.totalPaid || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 border-r border-slate-100 text-right font-mono text-blue-800 font-semibold">₹{(memo.totalTbb || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-mono text-slate-900 font-bold">₹{memoGrand.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-800">
                  <td colSpan={2} className="p-3 text-right uppercase font-black text-slate-300">TOTAL:</td>
                  <td colSpan={3} className="p-3 border-r border-slate-800 text-right uppercase font-black text-slate-300">SUMMARY:</td>
                  <td className="p-3 border-r border-slate-800 text-center font-mono font-black text-yellow-300">{outTotalPkgs} Pkgs</td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-amber-300">₹{outTotalToPay.toLocaleString('en-IN')}</td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-emerald-300">₹{outTotalPaid.toLocaleString('en-IN')}</td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-blue-300">₹{outTotalTbb.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right font-mono font-black text-yellow-400">₹{outGrandTotal.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* 3. PENDING STOCK REGISTER TABLE */}
          {activeSection === 'PENDING_STOCK' && (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3 border-r border-slate-800 text-center w-12">SR.</th>
                  <th className="p-3 border-r border-slate-800">L.R. NO. & DATE</th>
                  <th className="p-3 border-r border-slate-800 text-center w-16">PKG</th>
                  <th className="p-3 border-r border-slate-800">CONSIGNOR</th>
                  <th className="p-3 border-r border-slate-800">CONSIGNEE</th>
                  <th className="p-3 border-r border-slate-800 text-center">DESTINATION STATION</th>
                  <th className="p-3 border-r border-slate-800 text-right w-24">TO PAY (₹)</th>
                  <th className="p-3 border-r border-slate-800 text-right w-24">PAID (₹)</th>
                  <th className="p-3 border-r border-slate-800 text-right w-24">T.B.B (₹)</th>
                  <th className="p-3 text-center w-28">GODOWN STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingStockList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No pending stock sitting in godown matches the selected filters.
                    </td>
                  </tr>
                ) : (
                  pendingStockList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 border-r border-slate-100 text-center font-mono font-semibold text-slate-500">{idx + 1}</td>
                      <td className="p-3 border-r border-slate-100">
                        <p className="font-mono font-bold text-indigo-900 text-xs">{item.lrNo}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{new Date(item.date || item.createdAt).toLocaleDateString('en-IN')}</p>
                      </td>
                      <td className="p-3 border-r border-slate-100 text-center font-mono font-bold text-slate-900">{item.packages}</td>
                      <td className="p-3 border-r border-slate-100 font-semibold text-slate-900">{item.consignorName}</td>
                      <td className="p-3 border-r border-slate-100 font-semibold text-slate-900">{item.consigneeName}</td>
                      <td className="p-3 border-r border-slate-100 text-center">
                        <span className="font-bold text-slate-800 uppercase px-2 py-0.5 bg-slate-100 rounded text-[10px]">
                          {item.toStation}
                        </span>
                      </td>
                      <td className="p-3 border-r border-slate-100 text-right font-mono font-bold text-amber-800">
                        {item.paymentType === 'ToPay' ? `₹${item.charges?.total || 0}` : '-'}
                      </td>
                      <td className="p-3 border-r border-slate-100 text-right font-mono font-bold text-emerald-800">
                        {item.paymentType === 'Paid' ? `₹${item.charges?.total || 0}` : '-'}
                      </td>
                      <td className="p-3 border-r border-slate-100 text-right font-mono font-bold text-blue-800">
                        {item.paymentType === 'T.B.B' ? `₹${item.charges?.total || 0}` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10.5px] uppercase inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" /> IN GODOWN
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-800">
                  <td colSpan={2} className="p-3 text-right uppercase font-black text-slate-300">TOTAL:</td>
                  <td className="p-3 border-r border-slate-800 text-center font-mono font-black text-yellow-300">{pendingTotalPkgs}</td>
                  <td colSpan={3} className="p-3 border-r border-slate-800 text-right uppercase font-black text-slate-300">AMOUNTS:</td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-amber-300">₹{pendingTotalToPay.toLocaleString('en-IN')}</td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-emerald-300">₹{pendingTotalPaid.toLocaleString('en-IN')}</td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-blue-300">₹{pendingTotalTbb.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-center font-mono font-black text-yellow-400">₹{pendingGrandTotal.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          )}

        </div>
      </div>

    </div>
  );
}
