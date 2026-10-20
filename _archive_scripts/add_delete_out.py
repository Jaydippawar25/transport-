import sys

filepath = 'src/pages/StockOut.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Trash2 to imports
import_old = "Eye\n} from 'lucide-react';"
import_new = "Eye,\n  Trash2\n} from 'lucide-react';"
if "Trash2" not in content:
    content = content.replace(import_old, import_new)

# 2. Add handleDeleteMemo logic
delete_logic = """
  const handleDeleteMemo = async (id, originalLinkedLrNos = []) => {
    if (window.confirm("Are you sure you want to delete this Memo? All attached LRs will be returned to Godown Stock.")) {
      try {
        await dataService.deleteStockOut(id, originalLinkedLrNos);
        await loadData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete memo.");
      }
    }
  };

  const handleEditMemo = (memo) => {
"""
content = content.replace("  const handleEditMemo = (memo) => {", delete_logic)

# 3. Add Trash icon button
button_old = """                          <button
                          onClick={() => setSelectedMemo(memo)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title={`Print Memo #${memo.memoNo}`}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>"""

button_new = """                          <button
                          onClick={() => setSelectedMemo(memo)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title={`Print Memo #${memo.memoNo}`}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMemo(memo.id, (memo.entries || []).map(e => e.lrNo))}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title={`Delete Memo #${memo.memoNo}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>"""
content = content.replace(button_old, button_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated StockOut.jsx")
