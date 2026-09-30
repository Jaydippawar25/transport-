import sys

filepath = 'src/pages/Dashboard.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The button logic
seed_btn = """          <button 
            onClick={handleSeedData}
            disabled={isSeeding}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl border border-indigo-400/30 transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {isSeeding ? 'Seeding...' : 'Seed Sample Data'}
          </button>"""

if seed_btn in content:
    content = content.replace(seed_btn, "")
    print("Seed button removed.")
else:
    print("Could not find exact seed button text.")

# Remove empty text hint
text_hint = "No recent activity found. Seed sample data to test."
text_hint_new = "No recent activity found."
content = content.replace(text_hint, text_hint_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
