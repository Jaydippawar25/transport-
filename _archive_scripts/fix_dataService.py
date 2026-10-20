import sys

filepath = 'src/services/dataService.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add deleteDoc to imports
if 'deleteDoc' not in content:
    content = content.replace('updateDoc,', 'updateDoc,\n  deleteDoc,')

# Add deleteStockIn and deleteStockOut
methods = """
  async deleteStockIn(id) {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'stockIn', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error("Firestore delete stockIn error:", err);
        throw err;
      }
    }
    
    let current = getLocal(STORAGE_KEYS.STOCK_IN, INITIAL_STOCK_IN);
    if (Array.isArray(current)) {
      const updated = current.filter(item => item.id !== id);
      setLocal(STORAGE_KEYS.STOCK_IN, updated);
    }
    return true;
  },

  async deleteStockOut(id) {
    // Note: This deletes the Memo. To fully unlink LRs, one would update those LRs, 
    // but a simple delete is provided here for the basic UI action.
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'stockOut', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error("Firestore delete stockOut error:", err);
        throw err;
      }
    }
    
    let current = getLocal(STORAGE_KEYS.STOCK_OUT, INITIAL_STOCK_OUT);
    if (Array.isArray(current)) {
      const updated = current.filter(item => item.id !== id);
      setLocal(STORAGE_KEYS.STOCK_OUT, updated);
    }
    return true;
  },

  async clearDatabase() {"""

if 'async deleteStockIn' not in content:
    content = content.replace('async clearDatabase() {', methods)
    print("Added delete methods.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

