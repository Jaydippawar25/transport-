import sys

filepath = 'src/pages/StockIn.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLr(item);
                            }}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="View LR"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
"""
if target in content:
    content = content.replace(target, '')
    print("Removed View LR button successfully!")
else:
    print("Could not find the target block.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
