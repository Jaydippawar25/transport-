import React, { useState } from 'react';
import { Search, Menu, QrCode, ArrowRight, Package, Truck, Clock } from 'lucide-react';
import { dataService } from '../services/dataService';

export default function Header({ onToggleSidebar, onSelectSearchResult }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);

      const [lrs, memos] = await Promise.all([
        dataService.getStockIn(),
        dataService.getStockOut()
      ]);

      const termLower = val.trim().toLowerCase();

      const matchedLrs = lrs.filter(l => 
        l.lrNo?.toLowerCase().includes(termLower) ||
        l.consignorName?.toLowerCase().includes(termLower) ||
        l.consigneeName?.toLowerCase().includes(termLower) ||
        l.toStation?.toLowerCase().includes(termLower)
      ).map(l => ({ type: 'LR', ...l }));

      const matchedMemos = memos.filter(m => 
        m.memoNo?.toLowerCase().includes(termLower) ||
        m.lorryNo?.toLowerCase().includes(termLower) ||
        m.driverName?.toLowerCase().includes(termLower)
      ).map(m => ({ type: 'Memo', ...m }));

      setSearchResults([...matchedLrs, ...matchedMemos].slice(0, 6));
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (item) => {
    setShowDropdown(false);
    setSearchTerm('');
    if (onSelectSearchResult) {
      onSelectSearchResult(item);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Left section: Mobile menu button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-sm font-extrabold text-[#2a4393] uppercase tracking-wide">ATHAHAR ROADWAYS</h2>
          <p className="text-[11px] text-slate-500 font-medium">NEXT TO PARVATI CRANE, VAKHAR BHAG, SANGLI-416416 | MOB: 9370000000 / 9850000000</p>
        </div>
      </div>

      {/* Prominent LR / Barcode Search Box */}
      <div className="relative flex-1 max-w-xl">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-blue-700 flex items-center pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
            placeholder="Scan Barcode or Search LR No (e.g. SNG/12043), Driver, Station..."
            className="w-full pl-10 pr-24 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm font-mono text-slate-800 rounded-xl border border-slate-200 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 transition-all outline-hidden shadow-inner"
          />

          <div className="absolute right-2 flex items-center gap-1">
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-400 shadow-2xs">
              <QrCode className="w-3 h-3 text-slate-500" /> LR / Barcode
            </span>
          </div>
        </div>

        {/* Quick Search Dropdown */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Matches ({searchResults.length})</span>
              <button onClick={() => setShowDropdown(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">Close</button>
            </div>

            {isSearching ? (
              <div className="p-4 text-center text-xs text-slate-400">Searching records...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching LR or Loading Memo found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="p-3 hover:bg-blue-50/60 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        item.type === 'LR' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.type === 'LR' ? <Package className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {item.type === 'LR' ? item.lrNo : item.memoNo}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                            item.type === 'LR' 
                              ? (item.status === 'dispatched' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.type === 'LR' ? item.status : `${item.entries?.length || 0} LRs`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                          {item.type === 'LR' 
                            ? `${item.consignorName} ➔ ${item.consigneeName} (${item.toStation})`
                            : `Lorry: ${item.lorryNo} | Driver: ${item.driverName}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800">
                        {item.type === 'LR' ? `${item.packages} pkgs` : `${item.totalPackages} total pkgs`}
                      </p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end group-hover:text-blue-700">
                        View details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right status */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <Clock className="w-3.5 h-3.5 text-blue-700" />
          <span className="font-medium text-slate-700">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </header>
  );
}
