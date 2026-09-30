import sys

filepath = 'src/pages/Login.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
old_imports = """  Loader2
} from 'lucide-react';"""
new_imports = """  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';"""
content = content.replace(old_imports, new_imports)

# Add state
old_state = "const [password, setPassword] = useState('');"
new_state = "const [password, setPassword] = useState('');\n  const [showPassword, setShowPassword] = useState(false);"
content = content.replace(old_state, new_state)

# Replace password input field
old_password_field = """              <div className="relative border-b border-slate-300 focus-within:border-[#2a4393] transition-colors pb-1">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Lock className="w-4 h-4 shrink-0 text-slate-600" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="w-full bg-transparent text-slate-700 placeholder-slate-400 text-sm focus:outline-none py-1.5"
                  />
                </div>
              </div>"""

new_password_field = """              <div className="relative border-b border-slate-300 focus-within:border-[#2a4393] transition-colors pb-1">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Lock className="w-4 h-4 shrink-0 text-slate-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="w-full bg-transparent text-slate-700 placeholder-slate-400 text-sm focus:outline-none py-1.5 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>"""

content = content.replace(old_password_field, new_password_field)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added eye icon successfully!")
