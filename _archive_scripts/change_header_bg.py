import os
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Change the table header background from slate-50 to something more distinct
    # Let's use blue-50 for a nice soft colorful tint, or slate-100.
    new_content = content.replace('bg-slate-50 text-slate-500', 'bg-blue-50 text-blue-800')
    
    # Also update the footers so they match? 
    # Footers are 'bg-slate-50 text-slate-800'
    new_content = new_content.replace('bg-slate-50 text-slate-800', 'bg-blue-50 text-blue-900')

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for filepath in glob.glob('src/pages/*.jsx'):
    process_file(filepath)
