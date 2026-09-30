import sys

filepath = 'src/pages/Reports.jsx'
content = open(filepath, encoding='utf-8').read()

old_code = """                      <td className="p-3 border-r border-slate-100 text-right font-mono font-bold text-blue-800">
                        {item.paymentType === 'T.B.B' ? `\u20b9${item.charges?.total || 0}` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <button"""

new_code = """                      <td className="p-3 border-r border-slate-100 text-right font-mono font-bold text-blue-800">
                        {item.paymentType === 'T.B.B' ? `\u20b9${item.charges?.total || 0}` : '-'}
                      </td>
                      <td className="p-3 text-center border-r border-slate-100">
                        <span className={`px-2 py-0.5 rounded border font-bold text-[10px] uppercase inline-flex items-center gap-1 ${
                          item.status === 'in-godown' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.status === 'in-godown' ? (
                            <><Clock className="w-3 h-3 text-amber-500" /> IN GODOWN</>
                          ) : (
                            'DISPATCHED'
                          )}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button"""

if old_code not in content:
    # Try replacing rupee with question marks if it's garbled in the source
    old_code_fallback = """                      <td className="p-3 border-r border-slate-100 text-right font-mono font-bold text-blue-800">
                        {item.paymentType === 'T.B.B' ? `?${item.charges?.total || 0}` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <button"""
    if old_code_fallback in content:
        content = content.replace(old_code_fallback, new_code)
    else:
        # Just use regex or split to insert it
        parts = content.split("item.paymentType === 'T.B.B' ? ")
        print("Debugging split len:", len(parts))
        import re
        content = re.sub(
            r"(<td className=\"p-3 border-r border-slate-100 text-right font-mono font-bold text-blue-800\">\s*\{item\.paymentType === 'T\.B\.B' \? `[^`]+` : '-'\}\s*</td>\s*)<td className=\"p-3 text-center\">\s*<button",
            r"\1" + """<td className=\"p-3 text-center border-r border-slate-100\">
                        <span className={`px-2 py-0.5 rounded border font-bold text-[10px] uppercase inline-flex items-center gap-1 ${
                          item.status === 'in-godown' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.status === 'in-godown' ? (
                            <><Clock className=\"w-3 h-3 text-amber-500\" /> IN GODOWN</>
                          ) : (
                            'DISPATCHED'
                          )}
                        </span>
                      </td>
                      <td className=\"p-3 text-center\">
                        <button""",
            content
        )
else:
    content = content.replace(old_code, new_code)

open(filepath, 'w', encoding='utf-8').write(content)
print("Done patching Reports.jsx")
