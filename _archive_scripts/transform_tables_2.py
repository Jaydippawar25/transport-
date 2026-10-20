import os
import glob
import re

def transform_class_string(class_str):
    c = class_str
    c = c.replace('bg-rose-900/30', 'bg-rose-50')
    c = c.replace('bg-rose-900/50', 'bg-rose-100')
    c = c.replace('text-rose-300', 'text-rose-700')
    c = c.replace('text-rose-400', 'text-rose-700')
    c = c.replace('text-orange-300', 'text-orange-700')
    c = c.replace('text-orange-400', 'text-orange-700')
    c = c.replace('text-emerald-400', 'text-emerald-800')
    return c

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    def thead_replacer(m):
        return transform_class_string(m.group(0))

    new_content = re.sub(r'(?s)(<thead.*?</thead\s*>)', thead_replacer, content)
    new_content = re.sub(r'(?s)(<tfoot.*?</tfoot\s*>)', thead_replacer, new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for filepath in glob.glob('src/pages/*.jsx'):
    process_file(filepath)
