import sys
content = open('src/pages/TransportAgent.jsx', encoding='utf-8').read()

# 1. Imports
if "import { Download" not in content:
    content = content.replace("import { Users, Search, Truck, FileText } from 'lucide-react';", "import { Users, Search, Truck, FileText, Download } from 'lucide-react';")

# 2. State
state_block = """  const [stockOutList, setStockOutList] = useState([]);
  const [allStockIn, setAllStockIn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemo, setSelectedMemo] = useState(null);"""

new_state_block = """  const [stockOutList, setStockOutList] = useState([]);
  const [allStockIn, setAllStockIn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMemo, setSelectedMemo] = useState(null);"""

content = content.replace(state_block, new_state_block)

# 3. Filtering
filter_block = """  const filteredMemos = agentMemos.filter(memo => {
    const term = searchTerm.toLowerCase();
    return (
      (memo.memoNo || '').toLowerCase().includes(term) ||
      (memo.lorryNo || '').toLowerCase().includes(term) ||
      (memo.driverName || '').toLowerCase().includes(term)
    );
  });"""

new_filter_block = """  const filteredMemos = agentMemos.filter(memo => {
    const term = searchTerm.toLowerCase();
    const matchSearch = (
      (memo.memoNo || '').toLowerCase().includes(term) ||
      (memo.lorryNo || '').toLowerCase().includes(term) ||
      (memo.driverName || '').toLowerCase().includes(term)
    );
    if (!matchSearch) return false;

    if (startDate || endDate) {
      const memoDate = new Date(memo.date || memo.createdAt);
      memoDate.setHours(0,0,0,0);
      
      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0,0,0,0);
        if (memoDate < sDate) return false;
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23,59,59,999);
        if (memoDate > eDate) return false;
      }
    }
    return true;
  });"""
content = content.replace(filter_block, new_filter_block)

# 4. Export CSV
totals_block = """  const totalPackages = filteredMemos.reduce((sum, m) => sum + (Number(m.totalPackages) || 0), 0);
  const totalGrandTotal = filteredMemos.reduce((sum, m) => sum + (Number(m.grandTotal) || 0), 0);"""

new_totals_block = """  const totalPackages = filteredMemos.reduce((sum, m) => sum + (Number(m.totalPackages) || 0), 0);
  const totalGrandTotal = filteredMemos.reduce((sum, m) => sum + (Number(m.grandTotal) || 0), 0);
  
  const totalToPay = filteredMemos.reduce((sum, m) => sum + (m.entries || []).reduce((s, e) => s + Number(e.toPay || 0), 0), 0);
  const totalPaid = filteredMemos.reduce((sum, m) => sum + (m.entries || []).reduce((s, e) => s + Number(e.paid || 0), 0), 0);
  const totalTbb = filteredMemos.reduce((sum, m) => sum + (m.entries || []).reduce((s, e) => s + Number(e.tbb || 0), 0), 0);

  const exportToExcel = () => {
    const headers = ["DATE", "MEMO NO.", "VEHICLE NO.", "DRIVER NAME", "TOTAL LRS", "TOTAL PKG", "TO PAY", "PAID", "T.B.B", "TOTAL AMOUNT"];
    
    const rows = filteredMemos.map(memo => {
      const dateStr = new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN');
      const lrs = memo.entries?.length || 0;
      const pkgs = memo.totalPackages || 0;
      const toPay = (memo.entries || []).reduce((s, e) => s + Number(e.toPay || 0), 0);
      const paid = (memo.entries || []).reduce((s, e) => s + Number(e.paid || 0), 0);
      const tbb = (memo.entries || []).reduce((s, e) => s + Number(e.tbb || 0), 0);
      const total = memo.grandTotal || 0;
      return `"${dateStr}","${memo.memoNo}","${memo.lorryNo}","${memo.driverName}","${lrs}","${pkgs}","${toPay}","${paid}","${tbb}","${total}"`;
    });
    
    const csvContent = [headers.join(","), ...rows].join("\\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Transport_Agent_Ledger_${selectedAgent || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };"""
content = content.replace(totals_block, new_totals_block)


# 5. UI Controls Update
controls_block = """          {/* Controls */}
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
          </div>"""

new_controls_block = """          {/* Controls */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
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
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <button
                  onClick={exportToExcel}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" /> Export Excel
                </button>
              </div>
            </div>
          </div>"""
content = content.replace(controls_block, new_controls_block)

# 6. Table Header & Summary block
table_header_block = """              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                <span>TOTAL MEMOS: {totalMemos}</span>
                <span>TOTAL PKG: {totalPackages}</span>
                <span className="text-blue-700">TOTAL AMT: ?{totalGrandTotal.toLocaleString('en-IN')}</span>
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
                    <th className="p-4 font-bold text-right">AMOUNT (?)</th>
                    <th className="p-4 font-bold text-center">ACTION</th>
                  </tr>
                </thead>"""

new_table_header_block = """              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                <span>TOTAL MEMOS: {totalMemos}</span>
                <span>TOTAL PKG: {totalPackages}</span>
                <span className="text-orange-600">TOPAY: ?{totalToPay.toLocaleString('en-IN')}</span>
                <span className="text-emerald-600">PAID: ?{totalPaid.toLocaleString('en-IN')}</span>
                <span className="text-purple-600">TBB: ?{totalTbb.toLocaleString('en-IN')}</span>
                <span className="text-blue-700">TOTAL AMT: ?{totalGrandTotal.toLocaleString('en-IN')}</span>
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
                    <th className="p-4 font-bold text-center">LRS</th>
                    <th className="p-4 font-bold text-center">PKG</th>
                    <th className="p-4 font-bold text-right text-orange-400">TO PAY</th>
                    <th className="p-4 font-bold text-right text-emerald-400">PAID</th>
                    <th className="p-4 font-bold text-right text-purple-400">T.B.B</th>
                    <th className="p-4 font-bold text-right text-blue-400">TOTAL</th>
                    <th className="p-4 font-bold text-center">ACTION</th>
                  </tr>
                </thead>"""
# Use generic replace to avoid unicode issues with ? if any
import re
content = re.sub(r'<div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">.*?</thead>', new_table_header_block, content, flags=re.DOTALL)

# 7. Table Rows
row_tds = """                        <td className="p-4 text-center font-bold text-slate-700">
                          {memo.totalPackages || 0}
                        </td>
                        <td className="p-4 text-right font-black text-emerald-600 whitespace-nowrap">
                          ?{Number(memo.grandTotal || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-center">"""

new_row_tds = """                        <td className="p-4 text-center font-bold text-slate-700">
                          {memo.totalPackages || 0}
                        </td>
                        <td className="p-4 text-right font-bold text-orange-600 whitespace-nowrap">
                          ?{Number((memo.entries || []).reduce((s, e) => s + Number(e.toPay || 0), 0)).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                          ?{Number((memo.entries || []).reduce((s, e) => s + Number(e.paid || 0), 0)).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-right font-bold text-purple-600 whitespace-nowrap">
                          ?{Number((memo.entries || []).reduce((s, e) => s + Number(e.tbb || 0), 0)).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-right font-black text-blue-700 whitespace-nowrap">
                          ?{Number(memo.grandTotal || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-center">"""

content = content.replace(row_tds, new_row_tds)

# Fix colSpan in "No memos found" message
content = content.replace('colSpan={8}', 'colSpan={11}')

open('src/pages/TransportAgent.jsx', 'w', encoding='utf-8').write(content)

