import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PackagePlus, 
  Truck, 
  Boxes, 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  Printer,
  Search,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { dataService } from '../services/dataService';
import LRPrintModal from '../components/LRPrintModal';
import MemoPrintModal from '../components/MemoPrintModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stockInList, setStockInList] = useState([]);
  const [stockOutList, setStockOutList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLr, setSelectedLr] = useState(null);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [inData, outData] = await Promise.all([
        dataService.getStockIn(),
        dataService.getStockOut()
      ]);
      setStockInList(inData);
      setStockOutList(outData);
    } catch (err) {
      console.error("Dashboard load data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper date matching (Today)
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  // Compute Dashboard Metrics
  const todayStockIn = stockInList.filter(item => isToday(item.date || item.createdAt));
  const todayStockInCount = todayStockIn.length;
  const todayStockInPackages = todayStockIn.reduce((sum, item) => sum + Number(item.packages || 0), 0);

  const todayStockOut = stockOutList.filter(item => isToday(item.date || item.createdAt));
  const todayStockOutCount = todayStockOut.length;
  const todayStockOutPackages = todayStockOut.reduce((sum, item) => sum + Number(item.totalPackages || 0), 0);

  const pendingGodownItems = stockInList.filter(item => item.status === 'in-godown');
  const pendingGodownCount = pendingGodownItems.length;
  const pendingGodownPackages = pendingGodownItems.reduce((sum, item) => sum + Number(item.packages || 0), 0);

  const todayFreightToPay = todayStockIn.reduce((sum, item) => {
    if (item.paymentType === 'ToPay') {
      return sum + Number(item.charges?.total || 0);
    }
    return sum;
  }, 0);

  const todayFreightPaid = todayStockIn.reduce((sum, item) => {
    if (item.paymentType === 'Paid') {
      return sum + Number(item.charges?.total || 0);
    }
    return sum;
  }, 0);

  const todayFreightTBB = todayStockIn.reduce((sum, item) => {
    if (item.paymentType === 'T.B.B') {
      return sum + Number(item.charges?.total || 0);
    }
    return sum;
  }, 0);

  // Compute 7-day Stock In vs Stock Out chart data
  const generate7DayData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      
      const inCount = stockInList.filter(item => {
        const itemDate = new Date(item.date || item.createdAt);
        return itemDate.toDateString() === d.toDateString();
      }).reduce((acc, curr) => acc + Number(curr.packages || 0), 0);

      const outCount = stockOutList.filter(item => {
        const itemDate = new Date(item.date || item.createdAt);
        return itemDate.toDateString() === d.toDateString();
      }).reduce((acc, curr) => acc + Number(curr.totalPackages || 0), 0);

      days.push({
        date: dateStr,
        'Stock In Pkgs': inCount,
        'Stock Out Pkgs': outCount
      });
    }
    return days;
  };

  const chartData = generate7DayData();

  // Combined Activity List (all LRs and Memos)
  const allActivities = [
    ...stockInList.map(l => ({ ...l, activityType: 'Stock In' })),
    ...stockOutList.map(m => ({ ...m, activityType: 'Stock Out' }))
  ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  const filteredActivities = allActivities.filter(act => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    if (act.activityType === 'Stock In') {
      return (
        (act.lrNo || '').toLowerCase().includes(term) ||
        (act.consignorName || '').toLowerCase().includes(term) ||
        (act.consigneeName || '').toLowerCase().includes(term) ||
        (act.toStation || '').toLowerCase().includes(term) ||
        (act.vehicleNo || '').toLowerCase().includes(term) ||
        (act.driverName || '').toLowerCase().includes(term)
      );
    } else {
      return (
        (act.memoNo || '').toLowerCase().includes(term) ||
        (act.lorryNo || '').toLowerCase().includes(term) ||
        (act.driverName || '').toLowerCase().includes(term) ||
        (act.transportAgent || '').toLowerCase().includes(term) ||
        (act.toStation || '').toLowerCase().includes(term) ||
        (act.entries || []).some(e =>
          (e.lrNo || '').toLowerCase().includes(term) ||
          (e.consignor || '').toLowerCase().includes(term) ||
          (e.consignee || '').toLowerCase().includes(term)
        )
      );
    }
  });

  const displayedActivities = searchTerm.trim() ? filteredActivities : filteredActivities.slice(0, 10);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner & Title - Royal Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#070d21] via-[#0f1c45] to-[#1b3280] text-white p-6 sm:p-8 shadow-xl border border-amber-400/20">
        
        {/* Subtle Decorative Golden Speedline Curves */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
            <path d="M 0 180 Q 200 60 400 20" stroke="#f59e0b" strokeWidth="8" />
            <path d="M 50 200 Q 250 80 400 40" stroke="#ffffff" strokeWidth="4" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img 
              src="/logo.png" 
              alt="Royal Roadlines" 
              className="h-14 sm:h-16 w-auto object-contain shrink-0" 
            />
            
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  MUMBAI CENTRAL TERMINAL
                </span>
                <span className="text-xs text-blue-200 font-semibold">
                  FLEET OPERATIONS HUB
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-white mt-1.5 uppercase">
                ROYAL ROADLINES Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl font-medium">
                Live freight tracking for incoming Lorry Receipts (LR) and outgoing Loading Truck Memos.
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/stock-in')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02] cursor-pointer"
            >
              <PackagePlus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Stock In (LR)</span>
            </button>

            <button
              onClick={() => navigate('/stock-out')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/25 hover:border-amber-400/40 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>+ Dispatch Memo</span>
            </button>
          </div>
        </div>

        {/* Bottom Tagline Ribbon */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between text-[11px] text-blue-200/90">
          <div className="flex items-center gap-2 font-bold tracking-widest text-amber-300 uppercase">
            <span>RELIABLE</span>
            <span>•</span>
            <span>SAFE</span>
            <span>•</span>
            <span>ON TIME</span>
          </div>
          <div className="text-slate-300 font-mono text-[10.5px]">
            MASJID BUNDER • SAKINAKA • SANGLI • KOLHAPUR • SATARA
          </div>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200/90 hover:border-slate-300 transition-colors">
        <div className="relative">
          <Search className="w-5 h-5 text-[#1b3280] absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          <input
            type="text"
            placeholder="Search LR No, Memo No, Consignor, Consignee, Vehicle No, Driver, Station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#1b3280] text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-900/15 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* 6 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Today's Stock In */}
        <div 
          onClick={() => navigate('/stock-in')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-lg hover:border-amber-400/80 hover:-translate-y-1 transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Stock In</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1b3280] border border-blue-100 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <PackagePlus className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{todayStockInCount}</span>
              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                {todayStockInPackages} pkgs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> Received at Godown
            </p>
          </div>
        </div>

        {/* Today's Stock Out */}
        <div 
          onClick={() => navigate('/stock-out')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-lg hover:border-amber-400/80 hover:-translate-y-1 transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Stock Out</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{todayStockOutCount}</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                {todayStockOutPackages} pkgs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#1b3280] stroke-[2.5]" /> Dispatched via Lorry
            </p>
          </div>
        </div>

        {/* Pending in Godown */}
        <div 
          onClick={() => navigate('/stock-in')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-lg hover:border-amber-400/80 hover:-translate-y-1 transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sitting in Godown</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Boxes className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{pendingGodownCount}</span>
              <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {pendingGodownPackages} pkgs pending
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" /> Awaiting Truck Memo
            </p>
          </div>
        </div>

        {/* Today's Total ToPay Freight */}
        <div 
          onClick={() => navigate('/stock-in')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-lg hover:border-amber-400/80 hover:-translate-y-1 transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's To-Pay Freight</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">₹{todayFreightToPay.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" /> Receivable on delivery
            </p>
          </div>
        </div>

        {/* Today's Total Paid Freight */}
        <div 
          onClick={() => navigate('/stock-in')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-lg hover:border-amber-400/80 hover:-translate-y-1 transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Paid Freight</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">₹{todayFreightPaid.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> Received at booking
            </p>
          </div>
        </div>

        {/* Today's Total T.B.B Freight */}
        <div 
          onClick={() => navigate('/stock-in')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-lg hover:border-amber-400/80 hover:-translate-y-1 transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's T.B.B Freight</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1b3280] border border-blue-100 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">₹{todayFreightTBB.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-[#1b3280] stroke-[2.5]" /> Billed to company account
            </p>
          </div>
        </div>

      </div>

      {/* Middle Grid: 7-Day Chart & Godown Status Tally */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Bar Chart: Last 7 Days Stock In vs Stock Out */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1b3280]" />
                Stock In vs Stock Out (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Comparison of total packages received vs dispatched</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#1b3280]">
                <span className="w-3 h-3 rounded-sm bg-[#1b3280] inline-block"></span> Stock In
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span> Stock Out
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0c1636', 
                    borderRadius: '12px', 
                    color: '#fff', 
                    fontSize: '12px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="Stock In Pkgs" fill="#1b3280" radius={[4, 4, 0, 0]} barSize={22} />
                <Bar dataKey="Stock Out Pkgs" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Godown Goods Quick Status */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Godown Inventory
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md uppercase">
                Live Status
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Current state of goods stored in terminal warehouse</p>

            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8.5 h-8.5 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Clock className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">In Godown (Pending)</p>
                    <p className="text-[11px] text-slate-500">Awaiting outgoing dispatch memo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm text-slate-900">{pendingGodownCount} LRs</p>
                  <p className="text-[11px] font-bold text-amber-700">{pendingGodownPackages} pkgs</p>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8.5 h-8.5 rounded-lg bg-[#1b3280] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Dispatched (Stock Out)</p>
                    <p className="text-[11px] text-slate-500">Loaded and in transit</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm text-slate-900">
                    {stockInList.length - pendingGodownCount} LRs
                  </p>
                  <p className="text-[11px] font-bold text-blue-800">
                    {stockInList.reduce((sum, item) => item.status === 'dispatched' ? sum + Number(item.packages || 0) : sum, 0)} pkgs
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between font-medium">
            <span>Total Registered LRs:</span>
            <span className="font-mono font-bold text-slate-900">{stockInList.length} LRs</span>
          </div>
        </div>

      </div>

      {/* Recent Activity List (Last 10 LRs and Memos or Search Results) */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {searchTerm.trim() ? `Search Results (${filteredActivities.length})` : 'Recent Activity Feed'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {searchTerm.trim() ? `Matching "${searchTerm}"` : 'Latest Lorry Receipts and Truck Loading Memos'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {searchTerm.trim() ? `Found ${filteredActivities.length} matching entries` : 'Showing last 10 entries'}
          </span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {displayedActivities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              {searchTerm.trim() ? `No records found matching "${searchTerm}"` : 'No recent activity found.'}
            </div>
          ) : (
            displayedActivities.map((act) => (
              <div 
                key={`${act.activityType}-${act.id}`}
                className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    act.activityType === 'Stock In' 
                      ? 'bg-blue-50 text-[#1b3280] border border-blue-200/80' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                  }`}>
                    {act.activityType === 'Stock In' ? <PackagePlus className="w-5 h-5 stroke-[2.2]" /> : <Truck className="w-5 h-5 stroke-[2.2]" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 shrink-0">
                        {act.activityType === 'Stock In' ? act.lrNo : act.memoNo}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md font-bold uppercase whitespace-nowrap shrink-0 ${
                        act.activityType === 'Stock In'
                          ? (act.status === 'dispatched' ? 'bg-blue-50 text-[#1b3280] border border-blue-200/60' : 'bg-amber-50 text-amber-800 border border-amber-200')
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {act.activityType === 'Stock In' ? (act.status === 'dispatched' ? 'Dispatched' : 'In Godown') : 'Memo Dispatch'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {act.activityType === 'Stock In' 
                        ? `${act.consignorName} → ${act.consigneeName} (${act.toStation})`
                        : `Lorry: ${act.lorryNo} | Driver: ${act.driverName} (${act.entries?.length || 0} LRs loaded)`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-right shrink-0">
                  <div className="flex flex-col items-end justify-center">
                    <p className="text-xs font-bold text-slate-900 whitespace-nowrap font-mono">
                      {act.activityType === 'Stock In' ? `${act.packages} pkgs` : `${act.totalPackages} total`}
                    </p>
                    <p className="text-[10.5px] text-slate-400 whitespace-nowrap font-medium">
                      {new Date(act.date || act.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>

                  <button
                    onClick={() => act.activityType === 'Stock In' ? setSelectedLr(act) : setSelectedMemo(act)}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-[#1b3280] hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5 hidden sm:block" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Print Modals */}
      {selectedLr && <LRPrintModal lr={selectedLr} onClose={() => setSelectedLr(null)} />}
      {selectedMemo && <MemoPrintModal memo={selectedMemo} stockIn={stockInList} onClose={() => setSelectedMemo(null)} />}

    </div>
  );
}
