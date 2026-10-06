import React, { useState, useEffect } from 'react';
import { Users, Truck, Search, FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportExcelFile } from '../utils/exportUtils';
import { dataService } from '../services/dataService';
import MemoPrintModal from '../components/MemoPrintModal';

export default function TransportAgent() {
  const [agents, setAgents] = useState([]);
  const [stockOutList, setStockOutList] = useState([]);
  const [allStockIn, setAllStockIn] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date Filters
  const [dateFilter, setDateFilter] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [selectedMemo, setSelectedMemo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [masters, outData, inData] = await Promise.all([
        dataService.getMasters(),
        dataService.getStockOut(),
        dataService.getStockIn()
      ]);
      setAgents(masters.transportAgents || []);
      setStockOutList(outData);
      setAllStockIn(inData);
      
      if (masters.transportAgents && masters.transportAgents.length > 0) {
        setSelectedAgent(masters.transportAgents[0].name);
      }
    } catch (err) {
      console.error("Error loading agent data:", err);
    } finally {
      setLoading(false);
    }
  };

  const normalize = str => (str || '').trim().toLowerCase();
  const agentMemos = stockOutList.filter(memo => normalize(memo.transportAgent) === normalize(selectedAgent));
  
  const filteredMemos = agentMemos.filter(memo => {
    // Search Term Filter
    const term = searchTerm.toLowerCase();
    const passSearch = !term || (
      (memo.memoNo || '').toLowerCase().includes(term) ||
      (memo.lorryNo || '').toLowerCase().includes(term) ||
      (memo.driverName || '').toLowerCase().includes(term)
    );

    if (!passSearch) return false;

    // Date Filter
    if (dateFilter !== 'ALL') {
      const d = new Date(memo.date || memo.createdAt);
      if (isNaN(d.getTime())) return false;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      if (dateFilter === 'CUSTOM') {
        if (customStartDate && d < new Date(customStartDate)) return false;
        if (customEndDate && d > new Date(customEndDate + 'T23:59:59')) return false;
      } else if (dateFilter === 'TODAY') {
        if (d.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'THIS_MONTH') {
        if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return false;
      } else if (dateFilter === 'LAST_MONTH') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = currentMonth === 0 ? currentYear - 1 : currentYear;
        if (d.getMonth() !== lastMonth || d.getFullYear() !== year) return false;
      } else if (dateFilter === 'THIS_FY') {
        const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
        const fyStart = new Date(fyStartYear, 3, 1);
        const fyEnd = new Date(fyStartYear + 1, 2, 31, 23, 59, 59);
        if (d < fyStart || d > fyEnd) return false;
      } else if (dateFilter === 'LAST_FY') {
        const fyStartYear = currentMonth >= 3 ? currentYear - 1 : currentYear - 2;
        const fyStart = new Date(fyStartYear, 3, 1);
        const fyEnd = new Date(fyStartYear + 1, 2, 31, 23, 59, 59);
        if (d < fyStart || d > fyEnd) return false;
      }
    }

    return true;
  });

  const totalMemos = filteredMemos.length;
  const totalPackages = filteredMemos.reduce((sum, m) => sum + (Number(m.totalPackages) || 0), 0);
  
  const sumToPay = filteredMemos.reduce((sum, m) => sum + (Number(m.totalToPay) || 0), 0);
  const sumPaid = filteredMemos.reduce((sum, m) => sum + (Number(m.totalPaid) || 0), 0);
  const sumTbb = filteredMemos.reduce((sum, m) => sum + (Number(m.totalTbb) || 0), 0);
  const totalGrandTotal = sumToPay + sumPaid + sumTbb; // Use calculated sum to bypass any bad historical data

  const handleExportExcel = () => {
    const exportData = filteredMemos.map(memo => ({
      'Date': new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN'),
      'Memo No.': memo.memoNo,
      'Vehicle No.': memo.lorryNo,
      'Driver Name': memo.driverName,
      'Total LRs': memo.entries?.length || 0,
      'Total PKG': memo.totalPackages || 0,
      'To Pay': Number(memo.totalToPay || 0),
      'Paid': Number(memo.totalPaid || 0),
      'T.B.B': Number(memo.totalTbb || 0),
      'Total Amount': ((Number(memo.totalToPay) || 0) + (Number(memo.totalPaid) || 0) + (Number(memo.totalTbb) || 0))
    }));

    exportData.push({
      'Date': 'GRAND TOTAL',
      'Memo No.': '',
      'Vehicle No.': '',
      'Driver Name': '',
      'Total LRs': filteredMemos.reduce((sum, m) => sum + (m.entries?.length || 0), 0),
      'Total PKG': totalPackages,
      'To Pay': sumToPay,
      'Paid': sumPaid,
      'T.B.B': sumTbb,
      'Total Amount': totalGrandTotal
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Agent Ledger");
    
    const fileName = `Agent_Ledger_${(selectedAgent || 'Unknown').replace(/\s+/g, '_')}.xlsx`;
    exportExcelFile(workbook, fileName);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Transport Agent Ledger
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            View all stock out memos dispatched by transport agent
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Excel
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium animate-pulse">Loading records...</div>
      ) : (
        <>
          {/* Controls */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                Select Transport Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {agents.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
                {agents.length === 0 && <option value="">No Agents Available</option>}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                Date Range
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full sm:w-auto p-2.5 bg-slate-50 rounded-lg border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today</option>
                  <option value="THIS_MONTH">This Month</option>
                  <option value="LAST_MONTH">Last Month</option>
                  <option value="THIS_FY">This Fin Year</option>
                  <option value="LAST_FY">Last Fin Year</option>
                  <option value="CUSTOM">Custom Range</option>
                </select>
                {dateFilter === 'CUSTOM' && (
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-300">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="text-sm font-bold text-slate-700 outline-none bg-transparent"
                    />
                    <span className="text-xs text-slate-400 font-bold">to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="text-sm font-bold text-slate-700 outline-none bg-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                Search Memos
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 stroke-[2.5]" />
                <input
                  type="text"
                  placeholder="Memo No, Vehicle, Driver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 focus:bg-white rounded-xl border-2 border-slate-300 focus:border-blue-600 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/15 outline-none transition-all placeholder:text-slate-400 placeholder:font-semibold shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between bg-slate-50 gap-4">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-5 h-5 text-slate-500" />
                MEMOS FOR {selectedAgent ? selectedAgent.toUpperCase() : 'AGENT'}
              </h2>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-600">
                <span>MEMOS: {totalMemos}</span>
                <span>PKG: {totalPackages}</span>
                <span className="text-amber-700">TO PAY: ₹{sumToPay.toLocaleString('en-IN')}</span>
                <span className="text-emerald-700">PAID: ₹{sumPaid.toLocaleString('en-IN')}</span>
                <span className="text-blue-700">T.B.B: ₹{sumTbb.toLocaleString('en-IN')}</span>
                <span className="text-indigo-700 font-black text-sm bg-indigo-50 px-2 py-1 rounded">TOTAL AMT: ₹{totalGrandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="hidden lg:block w-full">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-50 text-blue-800 uppercase text-[10px] tracking-wider">
                    <th className="p-3 font-bold border-r border-slate-200">DATE</th>
                    <th className="p-3 font-bold border-r border-slate-200">MEMO NO.</th>
                    <th className="p-3 font-bold border-r border-slate-200">VEHICLE NO.</th>
                    <th className="p-3 font-bold border-r border-slate-200">DRIVER NAME</th>
                    <th className="p-3 font-bold text-center border-r border-slate-200">TOTAL LRS</th>
                    <th className="p-3 font-bold text-center border-r border-slate-200">TOTAL PKG</th>
                    <th className="p-3 font-bold text-right border-r border-slate-200">TO PAY (₹)</th>
                    <th className="p-3 font-bold text-right border-r border-slate-200">PAID (₹)</th>
                    <th className="p-3 font-bold text-right border-r border-slate-200">T.B.B (₹)</th>
                    <th className="p-3 font-bold text-right border-r border-slate-200">TOTAL (₹)</th>
                    <th className="p-3 font-bold text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMemos.length > 0 ? (
                    filteredMemos.map(memo => (
                      <tr key={memo.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-slate-600 font-medium border-r border-slate-100">
                          {new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-3 border-r border-slate-100">
                          <span className="text-blue-600 font-bold font-mono bg-blue-50 px-2 py-1 rounded">
                            {memo.memoNo}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-700 border-r border-slate-100">{memo.lorryNo}</td>
                        <td className="p-3 font-semibold text-slate-800 border-r border-slate-100">{memo.driverName}</td>
                        <td className="p-3 text-center font-bold text-slate-700 border-r border-slate-100">
                          {memo.entries?.length || 0}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700 border-r border-slate-100">
                          {memo.totalPackages || 0}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-amber-700 border-r border-slate-100">
                          {Number(memo.totalToPay || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700 border-r border-slate-100">
                          {Number(memo.totalPaid || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-blue-700 border-r border-slate-100">
                          {Number(memo.totalTbb || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right font-black font-mono text-indigo-700 bg-indigo-50/50 border-r border-slate-100">
                          ₹{((Number(memo.totalToPay) || 0) + (Number(memo.totalPaid) || 0) + (Number(memo.totalTbb) || 0)).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedMemo(memo)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="View/Print Memo"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-500 font-medium">
                        No memos found for this agent in this date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS VIEW */}
            <div className="lg:hidden flex flex-col divide-y divide-slate-100">
              {filteredMemos.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No memos found for this agent in this date range.
                </div>
              ) : (
                filteredMemos.map((memo, idx) => {
                  const memoTotal = (Number(memo.totalToPay) || 0) + (Number(memo.totalPaid) || 0) + (Number(memo.totalTbb) || 0);
                  
                  return (
                    <div key={memo.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-blue-700 text-sm bg-blue-50 px-2 py-0.5 rounded self-start">{memo.memoNo}</span>
                          <span className="text-xs text-slate-500 font-medium mt-1">
                            {new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedMemo(memo)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs flex flex-col gap-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Vehicle:</span>
                          <span className="font-bold text-slate-900">{memo.lorryNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Driver:</span>
                          <span className="font-bold text-slate-900">{memo.driverName}</span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-slate-200/60 mt-0.5">
                          <span className="text-slate-500">Total LRs / Pkgs:</span>
                          <span className="font-bold text-slate-900">{memo.entries?.length || 0} / {memo.totalPackages || 0}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div className="bg-amber-50 p-2 rounded flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-amber-700/70 uppercase">To Pay</span>
                          <span className="font-mono font-bold text-amber-700 text-xs">₹{Number(memo.totalToPay || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-emerald-700/70 uppercase">Paid</span>
                          <span className="font-mono font-bold text-emerald-700 text-xs">₹{Number(memo.totalPaid || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="bg-blue-50 p-2 rounded flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-blue-700/70 uppercase">T.B.B</span>
                          <span className="font-mono font-bold text-blue-700 text-xs">₹{Number(memo.totalTbb || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1">
                        <span className="text-xs font-bold text-slate-600 uppercase">Grand Total</span>
                        <span className="font-mono font-black text-indigo-700 text-sm">
                          ₹{memoTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {selectedMemo && (
        <MemoPrintModal 
          memo={selectedMemo} 
          stockIn={allStockIn} 
          onClose={() => setSelectedMemo(null)} 
        />
      )}
    </div>
  );
}
