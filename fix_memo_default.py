import sys

filepath = 'src/pages/StockOut.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_func = """  const generateMemoNo = (station, allMemos) => {
    if (!station) return '';
    const prefix = station.substring(0, 3).toUpperCase();"""

new_func = """  const getStationPrefix = (stationName) => {
    if (!stationName) return 'SNG';
    const name = stationName.toUpperCase();
    if (name === 'SANGLI') return 'SNG';
    if (name === 'MUMBAI') return 'MUM';
    if (name === 'PUNE') return 'PUN';
    return name.replace(/[^A-Z]/g, '').substring(0, 3);
  };

  const generateMemoNo = (station, allMemos) => {
    const prefix = getStationPrefix(station);"""

if old_func in content:
    content = content.replace(old_func, new_func)
    print("Updated generateMemoNo default in StockOut.jsx")
else:
    print("Could not find generateMemoNo block")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
