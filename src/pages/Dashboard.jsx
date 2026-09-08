import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Printer,
  Calendar,
  Layers,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { dataService } from '../services/dataService';
import LRPrintModal from '../components/LRPrintModal';
import MemoPrintModal from '../components/MemoPrintModal';
import Loader from '../components/Loader';

export default function Dashboard() {
  const [stockInList, setStockInList] = useState([]);
  const [stockOutList, setStockOutList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLr, setSelectedLr] = useState(null);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

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

  const handleSeedData = async () => {
    setIsSeeding(true);
    await dataService.seedDatabase();
    await loadData();
    setIsSeeding(false);
  };

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

  // Compute 7-day Stock In vs Stock Out chart data
  const generate7DayData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      
      // Filter items matching day
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

  // Combined Recent Activity List (last 10 LRs and Memos)
  const recentActivities = [
    ...stockInList.map(l => ({ ...l, activityType: 'Stock In' })),
    ...stockOutList.map(m => ({ ...m, activityType: 'Stock Out' }))
  ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
  .slice(0, 10);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 text-xs font-semibold uppercase tracking-wider">
              Godown Summary
            </span>
            <span className="text-xs text-indigo-100 font-medium">SANGLI TERMINAL — ATHAHAR ROADWAYS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">ATHAHAR ROADWAYS Dashboard</h1>
          <p className="text-xs text-indigo-100 mt-1 max-w-xl font-medium">
            Real-time tracking of incoming Lorry Receipts (LR) and outgoing Loading Truck Memos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl border border-indigo-400/30 transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {isSeeding ? 'Seeding...' : 'Seed Sample Data'}
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Stock In */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Stock In</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <PackagePlus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">{todayStockInCount}</span>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {todayStockInPackages} pkgs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" /> Received at Godown
            </p>
          </div>
        </div>

        {/* Today's Stock Out */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Stock Out</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">{todayStockOutCount}</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {todayStockOutPackages} pkgs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500" /> Dispatched via Lorry
            </p>
          </div>
        </div>

        {/* Pending in Godown */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sitting in Godown</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">{pendingGodownCount}</span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                {pendingGodownPackages} pkgs pending
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Awaiting Truck Memo
            </p>
          </div>
        </div>

        {/* Today's Total ToPay Freight */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's To-Pay Freight</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">₹{todayFreightToPay.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" /> Receivable on delivery
            </p>
          </div>
        </div>

      </div>

      {/* Middle Grid: 7-Day Chart & Godown Status Tally */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Bar Chart: Last 7 Days Stock In vs Stock Out */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Stock In vs Stock Out (Last 7 Days)</h3>
              <p className="text-xs text-slate-500">Comparison of total packages received vs dispatched</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-indigo-600">
                <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block"></span> Stock In
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span> Stock Out
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="Stock In Pkgs" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="Stock Out Pkgs" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Godown Goods Quick Status */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Godown Stock Breakdown</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md uppercase">
                Godown Status
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Current state of goods in storage</p>

            <div className="space-y-3">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">In Godown (Pending)</p>
                    <p className="text-[11px] text-slate-500">Goods awaiting truck loading memo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm text-slate-900">{pendingGodownCount} LRs</p>
                  <p className="text-[11px] font-semibold text-amber-700">{pendingGodownPackages} pkgs</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Dispatched (Stock Out)</p>
                    <p className="text-[11px] text-slate-500">Loaded on outgoing trucks</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm text-slate-900">
                    {stockInList.length - pendingGodownCount} LRs
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-700">
                    {stockInList.reduce((sum, item) => item.status === 'dispatched' ? sum + Number(item.packages || 0) : sum, 0)} pkgs
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Total Receipts Created:</span>
            <span className="font-mono font-bold text-slate-900">{stockInList.length} LRs</span>
          </div>
        </div>

      </div>

      {/* Recent Activity List (Last 10 LRs and Memos) */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recent Activity Feed</h3>
            <p className="text-xs text-slate-500">Latest Lorry Receipts and Truck Loading Memos</p>
          </div>
          <span className="text-xs font-medium text-slate-500">Showing last 10 entries</span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No recent activity found. Seed sample data to test.</div>
          ) : (
            recentActivities.map((act) => (
              <div 
                key={`${act.activityType}-${act.id}`}
                className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    act.activityType === 'Stock In' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {act.activityType === 'Stock In' ? <PackagePlus className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {act.activityType === 'Stock In' ? act.lrNo : act.memoNo}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        act.activityType === 'Stock In'
                          ? (act.status === 'dispatched' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {act.activityType === 'Stock In' ? (act.status === 'dispatched' ? 'Dispatched' : 'In Godown') : 'Memo Dispatch'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-600 mt-0.5">
                      {act.activityType === 'Stock In' 
                        ? `${act.consignorName} ➔ ${act.consigneeName} (${act.toStation})`
                        : `Lorry: ${act.lorryNo} | Driver: ${act.driverName} (${act.entries?.length || 0} LRs loaded)`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {act.activityType === 'Stock In' ? `${act.packages} pkgs` : `${act.totalPackages} total pkgs`}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(act.date || act.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>

                  <button
                    onClick={() => act.activityType === 'Stock In' ? setSelectedLr(act) : setSelectedMemo(act)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Print Modals */}
      {selectedLr && <LRPrintModal lr={selectedLr} onClose={() => setSelectedLr(null)} />}
      {selectedMemo && <MemoPrintModal memo={selectedMemo} onClose={() => setSelectedMemo(null)} />}

    </div>
  );
}
