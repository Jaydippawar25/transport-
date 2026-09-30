import sys

filepath = 'src/pages/Login.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix default state
old_email = "const [email, setEmail] = useState('admin@123.com');"
new_email = "const [email, setEmail] = useState('');"
content = content.replace(old_email, new_email)

old_pass = "const [password, setPassword] = useState('Pass123');"
new_pass = "const [password, setPassword] = useState('');"
content = content.replace(old_pass, new_pass)

# Add Loader2 to imports
old_imports = """  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';"""
new_imports = """  AlertCircle,
  X,
  CheckCircle2,
  Loader2
} from 'lucide-react';"""
if old_imports in content:
    content = content.replace(old_imports, new_imports)
else:
    print("WARNING: Could not find lucide-react imports block exactly")

# Fix button
old_button_content = "{isSubmitting ? 'Authenticating...' : 'Login'}"
new_button_content = """{isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : 'Login'}"""
content = content.replace(old_button_content, new_button_content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Login.jsx")
