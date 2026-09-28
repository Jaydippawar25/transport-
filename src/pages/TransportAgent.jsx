import React, { useState, useEffect } from 'react';
import { Users, Truck, Search, FileText } from 'lucide-react';
import { dataService } from '../services/dataService';
import MemoPrintModal from '../components/MemoPrintModal';

export default function TransportAgent() {
  const [agents, setAgents] = useState([]);
  const [stockOutList, setStockOutList] = useState([]);
  const [allStockIn, setAllStockIn] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const agentMemos = stockOutList.filter(memo => memo.transportAgent === selectedAgent);
  
  const filteredMemos = agentMemos.filter(memo => {
    const term = searchTerm.toLowerCase();
    return (
      (memo.memoNo || '').toLowerCase().includes(term) ||
      (memo.lorryNo || '').toLowerCase().includes(term) ||
      (memo.driverName || '').toLowerCase().includes(term)
    );
  });

  const totalMemos = filteredMemos.length;
  const totalPackages = filteredMemos.reduce((sum, m) => sum + (Number(m.totalPackages) || 0), 0);
  const totalGrandTotal = filteredMemos.reduce((sum, m) => sum + (Number(m.grandTotal) || 0), 0);

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
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium animate-pulse">Loading records...</div>
      ) : (
        <>
          {/* Controls */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                Select Transport Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full sm:w-64 p-2.5 bg-slate-50 rounded-lg border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {agents.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
                {agents.length === 0 && <option value="">No Agents Available</option>}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                Search Memos
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Memo No, Vehicle, Driver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 gap-2">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-5 h-5 text-slate-500" />
                MEMOS FOR {selectedAgent ? selectedAgent.toUpperCase() : 'AGENT'}
              </h2>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                <span>TOTAL MEMOS: {totalMemos}</span>
                <span>TOTAL PKG: {totalPackages}</span>
                <span className="text-blue-700">TOTAL AMT: ₹{totalGrandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-900 text-slate-200 uppercase text-[10px] tracking-wider">
                    <th className="p-4 font-bold">DATE</th>
                    <th className="p-4 font-bold">MEMO NO.</th>
                    <th className="p-4 font-bold">VEHICLE NO.</th>
                    <th className="p-4 font-bold">DRIVER NAME</th>
                    <th className="p-4 font-bold text-center">TOTAL LRS</th>
                    <th className="p-4 font-bold text-center">TOTAL PKG</th>
                    <th className="p-4 font-bold text-right">AMOUNT (₹)</th>
                    <th className="p-4 font-bold text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMemos.length > 0 ? (
                    filteredMemos.map(memo => (
                      <tr key={memo.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-600 font-medium whitespace-nowrap">
                          {new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="text-blue-600 font-bold font-mono bg-blue-50 px-2 py-1 rounded">
                            {memo.memoNo}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-700 whitespace-nowrap">{memo.lorryNo}</td>
                        <td className="p-4 font-semibold text-slate-800">{memo.driverName}</td>
                        <td className="p-4 text-center font-bold text-slate-700">
                          {memo.entries?.length || 0}
                        </td>
                        <td className="p-4 text-center font-bold text-slate-700">
                          {memo.totalPackages || 0}
                        </td>
                        <td className="p-4 text-right font-black text-emerald-600 whitespace-nowrap">
                          ₹{Number(memo.grandTotal || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedMemo(memo)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View/Print Memo"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                        No memos found for this agent.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
