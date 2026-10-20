import sys

filepath = 'src/pages/StockIn.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Trash2 to imports
import_old = "Printer } from 'lucide-react';"
import_new = "Printer, Trash2 } from 'lucide-react';"
if "Trash2" not in content:
    content = content.replace(import_old, import_new)

# 2. Add handleDelete logic
delete_logic = """
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this Lorry Receipt (LR) entry?")) {
      try {
        await dataService.deleteStockIn(id);
        await loadData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete record.");
      }
    }
  };

  const handleEdit = (item) => {
"""
content = content.replace("  const handleEdit = (item) => {", delete_logic)

# 3. Add Trash icon button
button_old = """                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLr(item);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Print LR"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>"""

button_new = """                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLr(item);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Print LR"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete LR"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>"""
content = content.replace(button_old, button_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated StockIn.jsx")
