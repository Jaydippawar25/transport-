import os
import glob
import re

def transform_class_string(class_str):
    c = class_str
    c = c.replace('bg-slate-900', 'bg-slate-50')
    c = c.replace('text-slate-200', 'text-slate-600')
    c = c.replace('text-white', 'text-slate-800')
    c = c.replace('border-slate-800', 'border-slate-200')
    c = c.replace('border-emerald-800', 'border-emerald-200')
    c = c.replace('border-amber-800', 'border-amber-200')
    c = c.replace('border-blue-800', 'border-blue-200')
    c = c.replace('bg-emerald-950/60', 'bg-emerald-50')
    c = c.replace('bg-emerald-900/30', 'bg-emerald-50')
    c = c.replace('bg-emerald-900/50', 'bg-emerald-100')
    c = c.replace('bg-amber-900/30', 'bg-amber-50')
    c = c.replace('bg-blue-900/30', 'bg-blue-50')
    c = c.replace('bg-indigo-900/30', 'bg-indigo-50')
    c = c.replace('bg-yellow-900/30', 'bg-yellow-50')
    
    # Text colors
    c = c.replace('text-slate-300', 'text-slate-700')
    c = c.replace('text-yellow-300', 'text-slate-800')
    c = c.replace('text-yellow-400', 'text-indigo-700')
    c = c.replace('text-amber-300', 'text-amber-700')
    c = c.replace('text-emerald-300', 'text-emerald-700')
    c = c.replace('text-blue-300', 'text-blue-700')
    c = c.replace('text-indigo-300', 'text-indigo-700')
    return c

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace standard table header/footer rows
    # Look for `<tr className="...bg-slate-900..."` and replace classes inside it.
    
    def replacer(match):
        return 'className="' + transform_class_string(match.group(1)) + '"'

    # Actually, let's just globally replace border-slate-800 in the whole file to border-slate-200 
    # since it's only used for these dark tables.
    new_content = content
    new_content = new_content.replace('border-slate-800', 'border-slate-200')
    
    # Replace specific row headers
    new_content = new_content.replace('bg-slate-900 text-slate-200', 'bg-slate-50 text-slate-500')
    new_content = new_content.replace('bg-slate-900 text-white', 'bg-slate-50 text-slate-800 border-t-2 border-slate-200')
    
    # Let's use regex for all classNames in thead and tfoot
    def thead_replacer(m):
        return transform_class_string(m.group(0))

    new_content = re.sub(r'(?s)(<thead.*?</thead\s*>)', thead_replacer, new_content)
    new_content = re.sub(r'(?s)(<tfoot.*?</tfoot\s*>)', thead_replacer, new_content)
    
    # We also have the "MEMO BUILDER" sub-table in StockOut.jsx, let's process that too.
    # It might just be simpler to apply transform_class_string on the whole file where it makes sense,
    # but that might break other dark UI components if they exist.
    # What dark components exist? TransportAgent has a dark sidebar? No, Sidebar is a separate component.
    # Accounting has a dark summary card. Let's not break the card.
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for filepath in glob.glob('src/pages/*.jsx'):
    process_file(filepath)

