import sys
import re

filepath = 'src/pages/StockOut.jsx'
content = open(filepath, encoding='utf-8').read()

old_logic = """  const getMemoPrefix = (station) => {
    if (!station) return 'LM';
    return station.substring(0, 3).toUpperCase();
  };

  const generateMemoNo = (station, allMemos) => {
    const prefix = getMemoPrefix(station);
    const maxMemo = allMemos.reduce((max, memo) => {
      if (!memo.memoNo) return max;
      if (memo.memoNo.startsWith(`${prefix}-`)) {
        const match = memo.memoNo.match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num >= 10000) return max; // Ignore legacy/random series
          return num > max ? num : max;
        }
      }
      return max;
    }, 0);
    return `${prefix}-${String(maxMemo + 1).padStart(5, '0')}`;
  };"""

new_logic = """  const generateMemoNo = (station, allMemos) => {
    if (!station) return '';
    const prefix = station.substring(0, 3).toUpperCase();
    const maxMemo = allMemos.reduce((max, memo) => {
      if (!memo.memoNo) return max;
      if (memo.memoNo.startsWith(`${prefix}-`)) {
        const match = memo.memoNo.match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          // Only match if it's a 5-digit number (or similar) to avoid legacy weird formats
          // but if we want to strictly increment from previous max:
          return num > max ? num : max;
        }
      }
      return max;
    }, 0);
    return `${prefix}-${String(maxMemo + 1).padStart(5, '0')}`;
  };"""

content = content.replace(old_logic, new_logic)

open(filepath, 'w', encoding='utf-8').write(content)
print("Replaced logic in StockOut.jsx")
