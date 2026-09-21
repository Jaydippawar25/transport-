import sys

with open('src/pages/StockOut.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = '''  const formattedDate = new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN');

  return (
    <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-slate-200 font-serif text-black relative print:p-0 print:border-none print:shadow-none">
      <button 
        onClick={() => window.print()}
        className="absolute top-4 right-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 print:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
        Print Loading Memo
      </button>
      <div className="overflow-x-auto">
      <div className="min-w-[800px] max-w-[1000px] mx-auto border-2 border-black p-1 print:min-w-0 print:w-full print:border-none">'''

target = '''  const formattedDate = new Date(memo.date || memo.createdAt).toLocaleDateString('en-IN');

  return (
    <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto font-serif text-black">
      <div className="min-w-[800px] max-w-[1000px] mx-auto border-2 border-black p-1">'''

if target in content:
    content = content.replace(target, replacement)
    
    end_target = '''      </div>
    </div>
  );'''
    end_replacement = '''      </div>
      </div>
    </div>
  );'''
    content = content.replace(end_target, end_replacement)
    
    with open('src/pages/StockOut.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
