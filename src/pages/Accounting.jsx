import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Printer, 
  Save, 
  Calculator,
  IndianRupee,
  Truck
} from 'lucide-react';
import { dataService } from '../services/dataService';

export default function Accounting() {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local state for accounting inputs
  // commissions: { memoId: { stationName: commissionPercentage } }
  // expenses: { memoId: { loadingCharges: 0, vehicleFreight: 0 } }
  const [commissions, setCommissions] = useState({});
  const [expenses, setExpenses] = useState({});

  useEffect(() => {
    loadMemos();
  }, []);

  const loadMemos = async () => {
    setLoading(true);
    try {
      const outData = await dataService.getStockOut();
      setMemos(outData || []);
    } catch (err) {
      console.error("Error loading memos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommissionChange = (memoId, station, value) => {
    setCommissions(prev => ({
      ...prev,
      [memoId]: {
        ...(prev[memoId] || {}),
        [station]: parseFloat(value) || 0
      }
    }));
  };

  const handleExpenseChange = (memoId, field, value) => {
    setExpenses(prev => ({
      ...prev,
      [memoId]: {
        ...(prev[memoId] || {}),
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const filteredMemos = memos.filter(memo => 
    memo.memoNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memo.lorryNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Accounting Data...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold">
              <Calculator className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Accounting</h1>
          </div>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Accounting Details Memo Wise + Date Wise
          </p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Memo No or Vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3 py-2 bg-white text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-8">
        {filteredMemos.map(memo => {
          // Calculate station-wise totals
          const stationTotals = {};
          let totalWeight = 0;
          let totalMemoFreight = 0;

          (memo.entries || []).forEach(lr => {
            const station = lr.station || 'UNKNOWN';
            const weight = parseFloat(lr.weight) || 0;
            const tbb = parseFloat(lr.tbb) || 0; // Using T.B.B as freight, or maybe toPay? Let's use TBB as the primary freight.
            
            if (!stationTotals[station]) {
              stationTotals[station] = 0;
            }
            stationTotals[station] += tbb;
            totalWeight += weight;
            totalMemoFreight += tbb;
          });

          const stations = Object.keys(stationTotals);
          
          // Calculate Totals for this memo
          let totalCommissionAmt = 0;
          stations.forEach(st => {
            const pct = commissions[memo.id]?.[st] || 0;
            const amt = (stationTotals[st] * pct) / 100;
            totalCommissionAmt += amt;
          });

          const loadingCharges = expenses[memo.id]?.loadingCharges || 0;
          const vehicleFreight = expenses[memo.id]?.vehicleFreight || 0;
          
          const netBalance = totalMemoFreight - totalCommissionAmt - loadingCharges - vehicleFreight;

          return (
            <div key={memo.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800">
                      <th colSpan={7} className="p-3 text-center text-sm font-black text-slate-100 tracking-widest uppercase whitespace-nowrap">
                        ACCOUNTING DETAILS MEMO WISE + DATE WISE
                      </th>
                    </tr>
                    <tr className="bg-slate-50 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b-2 border-slate-200">
                      <th className="p-3 border-r border-slate-200 w-32">DATE</th>
                      <th className="p-3 border-r border-slate-200 w-36">VEHICAL NO.</th>
                      <th className="p-3 border-r border-slate-200 w-36">MEMO NO.</th>
                      <th className="p-3 border-r border-slate-200 w-32 text-right">WEIGHT</th>
                      <th className="p-3 border-r border-slate-200">STATION</th>
                      <th className="p-3 border-r border-slate-200 text-right w-36">FREIGHT (₹)</th>
                      <th className="p-3 text-center w-36">COMMISSION (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stations.map((station, index) => {
                      const freight = stationTotals[station];
                      const commPct = commissions[memo.id]?.[station] || '';
                      
                      return (
                        <tr key={station} className="hover:bg-slate-50/50">
                          {index === 0 && (
                            <>
                              <td rowSpan={stations.length} className="p-3 border-r border-slate-200 align-top font-medium">
                                {new Date(memo.date).toLocaleDateString('en-IN')}
                              </td>
                              <td rowSpan={stations.length} className="p-3 border-r border-slate-200 align-top font-bold text-slate-900">
                                {memo.lorryNo}
                              </td>
                              <td rowSpan={stations.length} className="p-3 border-r border-slate-200 align-top font-bold text-indigo-700">
                                {memo.memoNo}
                              </td>
                              <td rowSpan={stations.length} className="p-3 border-r border-slate-200 align-top text-right font-mono font-bold">
                                {totalWeight} kg
                              </td>
                            </>
                          )}
                          <td className="p-3 border-r border-slate-200 font-bold text-slate-700">
                            {station}
                          </td>
                          <td className="p-3 border-r border-slate-200 text-right font-mono text-emerald-700 font-bold">
                            {freight.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={commPct}
                              onChange={(e) => handleCommissionChange(memo.id, station, e.target.value)}
                              className="w-20 p-1.5 text-center bg-slate-50 border border-slate-300 rounded font-mono text-xs focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                            />
                          </td>
                        </tr>
                      );
                    })}
                    
                    {/* Subtotal Row */}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-200">
                      <td colSpan={4} className="p-3 border-r border-slate-200"></td>
                      <td className="p-3 border-r border-slate-200 text-right">TOTAL</td>
                      <td className="p-3 border-r border-slate-200 text-right font-mono text-emerald-700">
                        {totalMemoFreight.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600">
                        -
                      </td>
                    </tr>
                    
                    {/* Final Calculations */}
                    <tr className="border-t-[4px] border-double border-slate-300">
                      <td colSpan={4} rowSpan={5} className="p-3 border-r border-slate-200 bg-slate-50/50">
                        {/* Empty space for alignment */}
                      </td>
                      <td className="p-3 border-r border-slate-200 font-bold text-slate-700 text-right whitespace-nowrap">TOTAL FREIGHT</td>
                      <td colSpan={2} className="p-3 text-right font-mono font-bold text-emerald-700 text-sm">
                        {totalMemoFreight.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate-200 font-bold text-slate-700 text-right whitespace-nowrap">COMMISSION(-)</td>
                      <td colSpan={2} className="p-3 text-right font-mono font-bold text-rose-600">
                        {totalCommissionAmt > 0 ? '-' : ''}{Math.round(totalCommissionAmt).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate-200 font-bold text-slate-700 text-right whitespace-nowrap">LOADING CHARGES(-)</td>
                      <td colSpan={2} className="p-2 text-right">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={loadingCharges || ''}
                          onChange={(e) => handleExpenseChange(memo.id, 'loadingCharges', e.target.value)}
                          className="w-32 p-1.5 text-right bg-white border border-slate-300 rounded font-mono text-xs text-rose-600 focus:ring-2 focus:ring-indigo-400"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate-200 font-bold text-slate-700 text-right whitespace-nowrap">VEHICAL FREIGHT(-)</td>
                      <td colSpan={2} className="p-2 text-right">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={vehicleFreight || ''}
                          onChange={(e) => handleExpenseChange(memo.id, 'vehicleFreight', e.target.value)}
                          className="w-32 p-1.5 text-right bg-white border border-slate-300 rounded font-mono text-xs text-rose-600 focus:ring-2 focus:ring-indigo-400"
                        />
                      </td>
                    </tr>
                    <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                      <td className="p-3 border-r border-indigo-200 font-black text-indigo-900 text-right uppercase whitespace-nowrap">NET BALANCE</td>
                      <td colSpan={2} className="p-3 text-right font-mono font-black text-indigo-700 text-base">
                        ₹{Math.round(netBalance).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        
        {filteredMemos.length === 0 && (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
            No memos found for accounting.
          </div>
        )}
      </div>
    </div>
  );
}
