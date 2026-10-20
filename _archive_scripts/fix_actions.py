import sys
import re

def update_file(filepath, object_type, data_service_method):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Trash2 to imports if not there
    if 'Trash2' not in content:
        # Find the lucide-react import and add Trash2
        # Usually looks like: import { ..., Printer, ... } from 'lucide-react';
        # We can just do a regex replace on `} from 'lucide-react';`
        content = re.sub(r"\}\s*from\s*'lucide-react';", ", Trash2 } from 'lucide-react';", content)

    # 2. Add handleDelete logic before handleEdit or handleSubmit
    delete_fn_name = f"handleDelete{object_type}"
    if delete_fn_name not in content:
        delete_logic = f"""
  const {delete_fn_name} = async (id, e) => {{
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {{
      try {{
        await dataService.{data_service_method}(id);
        await loadData();
      }} catch (err) {{
        console.error(err);
        alert("Failed to delete record.");
      }}
    }}
  }};

"""
        # Inject it right before handleEdit or handleEditMemo or handleToStationChange
        if 'const handleEdit' in content:
            content = content.replace("  const handleEdit", delete_logic + "  const handleEdit")
        elif 'const handleToStationChange' in content:
            content = content.replace("  const handleToStationChange", delete_logic + "  const handleToStationChange")

    # 3. Add Trash icon button in the table actions
    if filepath.endswith('StockOut.jsx'):
        # For StockOut:
        old_button = """                        <button
                          onClick={() => setSelectedMemo(memo)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title={`Print Memo #${memo.memoNo}`}
                        >
                          <Printer className="w-4 h-4" />
                        </button>"""
        
        new_button = f"""                        <button
                          onClick={{() => setSelectedMemo(memo)}}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title={{`Print Memo #${{memo.memoNo}}`}}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={{(e) => {delete_fn_name}(memo.id, e)}}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Memo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>"""
        if old_button in content:
            content = content.replace(old_button, new_button)
            
    elif filepath.endswith('StockIn.jsx'):
        # For StockIn:
        old_button = """                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLr(item);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Print LR"
                          >
                            <Printer className="w-4 h-4" />
                          </button>"""
        
        new_button = f"""                          <button
                            onClick={{(e) => {{
                              e.stopPropagation();
                              setSelectedLr(item);
                            }}}}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Print LR"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={{(e) => {delete_fn_name}(item.id, e)}}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete LR"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>"""
        if old_button in content:
            content = content.replace(old_button, new_button)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")

update_file('src/pages/StockOut.jsx', 'Memo', 'deleteStockOut')
update_file('src/pages/StockIn.jsx', 'Lr', 'deleteStockIn')
