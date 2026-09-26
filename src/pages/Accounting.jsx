import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Calculator, IndianRupee, MapPin, Truck } from 'lucide-react';

export default function Accounting() {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('memo'); // 'memo' or 'station'
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [stations, setStations] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const outData = await dataService.getStockOut();
      setMemos(outData || []);
      
      const uniqueStations = [...new Set((outData || []).map(m => m.toStation))].filter(Boolean);
      setStations(uniqueStations.sort());
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMemos = memos.filter(m => {
    if (selectedStation !== 'ALL' && m.toStation !== selectedStation) return false;
    
    if (dateFilter !== 'ALL') {
      const d = new Date(m.date || m.createdAt);
      if (isNaN(d.getTime())) return false;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      if (dateFilter === 'CUSTOM') {
        if (!customStartDate && !customEndDate) return true;
        const targetTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        let startMatch = true;
        let endMatch = true;
        if (customStartDate) {
          startMatch = targetTime >= new Date(customStartDate).getTime();
        }
        if (customEndDate) {
          endMatch = targetTime <= new Date(customEndDate).getTime();
        }
        if (!startMatch || !endMatch) return false;
      } else if (dateFilter === 'THIS_MONTH') {
        if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return false;
      } else if (dateFilter === 'LAST_MONTH') {
        const lastMonth = new Date(currentYear, currentMonth - 1, 1);
        if (d.getMonth() !== lastMonth.getMonth() || d.getFullYear() !== lastMonth.getFullYear()) return false;
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

  let reportData = [];
  if (viewType === 'memo') {
    reportData = filteredMemos.map(m => {
      const income = Number(m.grandTotal || 0);
      const expense = Number(m.freight || 0) + Number(m.loadingCharges || 0) + Number(m.otherCharges || 0);
      const commission = Math.round(income * 0.17);
      const profit = income - expense - commission;
      return {
        id: m.id || m.memoNo,
        label: m.memoNo,
        subLabel: m.toStation,
        date: new Date(m.date || m.createdAt).toLocaleDateString('en-IN'),
        toPay: Number(m.totalToPay || 0),
        tbb: Number(m.totalTbb || 0),
        paid: Number(m.totalPaid || 0),
        totalIncome: income,
        freight: Number(m.freight || 0),
        loading: Number(m.loadingCharges || 0),
        other: Number(m.otherCharges || 0),
        totalExpense: expense,
        commission: commission,
        profit: profit
      };
    });
  } else {
    const stationMap = {};
    filteredMemos.forEach(m => {
      const st = m.toStation || 'UNKNOWN';
      if (!stationMap[st]) {
        stationMap[st] = {
          id: st,
          label: st,
          subLabel: '',
          date: '-',
          memoCount: 0,
          toPay: 0, tbb: 0, paid: 0,
          totalIncome: 0, freight: 0, loading: 0, other: 0, totalExpense: 0,
          commission: 0, profit: 0
        };
      }
      const income = Number(m.grandTotal || 0);
      const expense = Number(m.freight || 0) + Number(m.loadingCharges || 0) + Number(m.otherCharges || 0);
      const commission = Math.round(income * 0.17);
      const profit = income - expense - commission;

      stationMap[st].memoCount += 1;
      stationMap[st].toPay += Number(m.totalToPay || 0);
      stationMap[st].tbb += Number(m.totalTbb || 0);
      stationMap[st].paid += Number(m.totalPaid || 0);
      stationMap[st].totalIncome += income;
      stationMap[st].freight += Number(m.freight || 0);
      stationMap[st].loading += Number(m.loadingCharges || 0);
      stationMap[st].other += Number(m.otherCharges || 0);
      stationMap[st].totalExpense += expense;
      stationMap[st].commission += commission;
      stationMap[st].profit += profit;
    });
    reportData = Object.values(stationMap).sort((a,b) => a.label.localeCompare(b.label));
  }

  const gtToPay = reportData.reduce((sum, r) => sum + r.toPay, 0);
  const gtTbb = reportData.reduce((sum, r) => sum + r.tbb, 0);
  const gtPaid = reportData.reduce((sum, r) => sum + r.paid, 0);
  const gtIncome = reportData.reduce((sum, r) => sum + r.totalIncome, 0);
  const gtExpense = reportData.reduce((sum, r) => sum + r.totalExpense, 0);
  const gtCommission = reportData.reduce((sum, r) => sum + r.commission, 0);
  const gtProfit = reportData.reduce((sum, r) => sum + r.profit, 0);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading Accounting Data...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Calculator className="w-8 h-8 text-indigo-600" />
            Accounting & Profit/Loss Report
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Track booking (To Pay + Paid + T.B.B), expenses, and commission/profit
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border-2 border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
          >
            <option value="ALL">All Time</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="THIS_FY">This Financial Year (Apr-Mar)</option>
            <option value="LAST_FY">Last Financial Year</option>
            <option value="CUSTOM">Custom Date</option>
          </select>

          {dateFilter === 'CUSTOM' && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border-2 border-slate-200 shadow-sm">
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

          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="border-2 border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
          >
            <option value="ALL">All Stations</option>
            {stations.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setViewType('memo')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                viewType === 'memo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Truck className="w-4 h-4" /> Memo Wise
            </button>
            <button
              onClick={() => setViewType('station')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                viewType === 'station' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MapPin className="w-4 h-4" /> Station Wise
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Booking (Total Amount)</h3>
          <div className="text-3xl font-black text-emerald-600 flex items-center">
            <IndianRupee className="w-6 h-6 mr-1 opacity-50" />
            {gtIncome.toLocaleString('en-IN')}
          </div>
          <p className="text-xs font-medium text-slate-500 mt-2">
            To Pay: {gtToPay.toLocaleString('en-IN')} | Paid: {gtPaid.toLocaleString('en-IN')} | T.B.B: {gtTbb.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Expenses (Freight + Charges)</h3>
          <div className="text-3xl font-black text-rose-600 flex items-center">
            <IndianRupee className="w-6 h-6 mr-1 opacity-50" />
            {gtExpense.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Commission (17%)</h3>
          <div className="text-3xl font-black text-orange-600 flex items-center">
            <IndianRupee className="w-6 h-6 mr-1 opacity-50" />
            {gtCommission.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Calculator className="w-24 h-24" />
          </div>
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 relative z-10">Total Profit / Loss</h3>
          <div className="text-4xl font-black text-white flex items-center relative z-10">
            <IndianRupee className="w-8 h-8 mr-1 opacity-70" />
            {gtProfit.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-900 text-slate-200 font-bold text-[10px] uppercase tracking-wider">
                <th className="p-3 border-r border-slate-800">{viewType === 'memo' ? 'Memo No.' : 'Station'}</th>
                {viewType === 'memo' && <th className="p-3 border-r border-slate-800">Date</th>}
                {viewType === 'station' && <th className="p-3 border-r border-slate-800 text-center">Memo Count</th>}
                <th className="p-3 border-r border-slate-800 text-right bg-emerald-900/30 text-emerald-300">To Pay</th>
                <th className="p-3 border-r border-slate-800 text-right bg-emerald-900/30 text-emerald-300">Paid</th>
                <th className="p-3 border-r border-slate-800 text-right bg-emerald-900/30 text-emerald-300">T.B.B</th>
                <th className="p-3 border-r border-slate-800 text-right bg-emerald-900/50 text-emerald-300 font-black">TOTAL BOOKING</th>
                <th className="p-3 border-r border-slate-800 text-right bg-rose-900/30 text-rose-300">Freight</th>
                <th className="p-3 border-r border-slate-800 text-right bg-rose-900/30 text-rose-300">Loading/Other</th>
                <th className="p-3 border-r border-slate-800 text-right bg-rose-900/50 text-rose-300 font-black">TOTAL EXPENSE</th>
                <th className="p-3 border-r border-slate-800 text-right text-orange-300 font-black">COMMISSION</th>
                <th className="p-3 text-right text-indigo-300 font-black">PROFIT / LOSS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-500 font-medium">No records found.</td>
                </tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 border-r border-slate-100 font-bold text-slate-900">
                      {row.label}
                      {viewType === 'memo' && <div className="text-[10px] text-slate-400 mt-0.5">{row.subLabel}</div>}
                    </td>
                    {viewType === 'memo' && <td className="p-3 border-r border-slate-100 text-slate-500">{row.date}</td>}
                    {viewType === 'station' && <td className="p-3 border-r border-slate-100 text-center font-bold text-slate-600">{row.memoCount}</td>}
                    <td className="p-3 border-r border-slate-100 text-right font-mono text-emerald-700">{row.toPay.toLocaleString('en-IN')}</td>
                    <td className="p-3 border-r border-slate-100 text-right font-mono text-emerald-700">{row.paid.toLocaleString('en-IN')}</td>
                    <td className="p-3 border-r border-slate-100 text-right font-mono text-emerald-700">{row.tbb.toLocaleString('en-IN')}</td>
                    <td className="p-3 border-r border-slate-100 text-right font-mono font-black text-emerald-600 bg-emerald-50/50">{row.totalIncome.toLocaleString('en-IN')}</td>
                    
                    <td className="p-3 border-r border-slate-100 text-right font-mono text-rose-700">{row.freight.toLocaleString('en-IN')}</td>
                    <td className="p-3 border-r border-slate-100 text-right font-mono text-rose-700">{(row.loading + row.other).toLocaleString('en-IN')}</td>
                    <td className="p-3 border-r border-slate-100 text-right font-mono font-black text-rose-600 bg-rose-50/50">{row.totalExpense.toLocaleString('en-IN')}</td>
                    
                    <td className="p-3 border-r border-slate-100 text-right font-mono font-black text-orange-600 bg-orange-50/50">{row.commission.toLocaleString('en-IN')}</td>
                    <td className={`p-3 text-right font-mono font-black ${row.profit >= 0 ? 'text-indigo-600 bg-indigo-50/50' : 'text-rose-600 bg-rose-50'}`}>
                      {row.profit >= 0 ? '+' : ''}{row.profit.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {reportData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-[11px] border-t-2 border-slate-800">
                  <td colSpan={viewType === 'memo' ? 2 : 2} className="p-3 text-right uppercase tracking-wider text-slate-300">
                    GRAND TOTALS:
                  </td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-emerald-300">{gtToPay.toLocaleString('en-IN')}</td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-emerald-300">{gtPaid.toLocaleString('en-IN')}</td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-emerald-300">{gtTbb.toLocaleString('en-IN')}</td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono font-black text-emerald-400">{gtIncome.toLocaleString('en-IN')}</td>
                  
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-rose-300">
                    {reportData.reduce((sum, r) => sum + r.freight, 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono text-rose-300">
                    {reportData.reduce((sum, r) => sum + r.loading + r.other, 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 border-r border-slate-800 text-right font-mono font-black text-rose-400">{gtExpense.toLocaleString('en-IN')}</td>
                  
                  <td className="p-3 border-r border-slate-800 text-right font-mono font-black text-orange-400">{gtCommission.toLocaleString('en-IN')}</td>
                  <td className={`p-3 text-right font-mono font-black ${gtProfit >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
                    {gtProfit >= 0 ? '+' : ''}{gtProfit.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
