import sys
import re

filepath = 'src/pages/Accounting.jsx'
content = open(filepath, encoding='utf-8').read()

# 1. Update imports
import_statement = "import { Calculator, IndianRupee, MapPin, Truck, FileSpreadsheet } from 'lucide-react';\nimport * as XLSX from 'xlsx';"
content = content.replace("import { Calculator, IndianRupee, MapPin, Truck } from 'lucide-react';", import_statement)

# 2. Find where gtProfit is defined, and insert the handleExportExcel function after it
gtProfit_line = "  const gtProfit = reportData.reduce((sum, r) => sum + r.profit, 0);"
if gtProfit_line not in content:
    print("Could not find gtProfit line")
    sys.exit(1)

export_func = """
  const handleExportExcel = () => {
    const exportData = reportData.map(row => ({
      [viewType === 'memo' ? 'Memo No.' : 'Station']: row.label,
      ...(viewType === 'memo' ? { 'Station': row.subLabel, 'Date': row.date } : { 'Memo Count': row.memoCount }),
      'To Pay': row.toPay,
      'Paid': row.paid,
      'T.B.B': row.tbb,
      'Total Booking': row.totalIncome,
      'Freight': row.freight,
      'Loading/Other': row.loading + row.other,
      'Total Expense': row.totalExpense,
      'Commission': row.commission,
      'Profit/Loss': row.profit
    }));

    exportData.push({
      [viewType === 'memo' ? 'Memo No.' : 'Station']: 'GRAND TOTAL',
      ...(viewType === 'memo' ? { 'Station': '', 'Date': '' } : { 'Memo Count': '' }),
      'To Pay': gtToPay,
      'Paid': gtPaid,
      'T.B.B': gtTbb,
      'Total Booking': gtIncome,
      'Freight': reportData.reduce((sum, r) => sum + (r.freight || 0), 0),
      'Loading/Other': reportData.reduce((sum, r) => sum + ((r.loading || 0) + (r.other || 0)), 0),
      'Total Expense': gtExpense,
      'Commission': gtCommission,
      'Profit/Loss': gtProfit
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accounting Report");
    
    const fileName = viewType === 'memo' ? 'Accounting_Memo_Wise.xlsx' : 'Accounting_Station_Wise.xlsx';
    XLSX.writeFile(workbook, fileName);
  };
"""

content = content.replace(gtProfit_line, gtProfit_line + "\n" + export_func)

# 3. Insert the button in the JSX
button_jsx = """            </button>
          </div>
          
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ml-auto sm:ml-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>"""

content = content.replace("""            </button>
          </div>
        </div>
      </div>""", button_jsx)

open(filepath, 'w', encoding='utf-8').write(content)
print("Done modifying Accounting.jsx")
