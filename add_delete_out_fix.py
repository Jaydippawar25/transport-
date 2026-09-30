import sys

filepath = 'src/pages/StockOut.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

button_old = """                          title={`Print Memo #${memo.memoNo}`}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>"""

button_new = """                          title={`Print Memo #${memo.memoNo}`}
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
