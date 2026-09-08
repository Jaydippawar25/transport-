import { 
  db, 
  isFirebaseConfigured 
} from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { 
  INITIAL_STOCK_IN, 
  INITIAL_STOCK_OUT, 
  INITIAL_STATIONS,
  INITIAL_MASTERS
} from './seedData';

// Local storage key constants for fallback/demo mode
const STORAGE_KEYS = {
  STOCK_IN: 'transtrack_stock_in',
  STOCK_OUT: 'transtrack_stock_out',
  STATIONS: 'transtrack_stations',
  MASTERS: 'transtrack_masters',
  SEEDED: 'transtrack_is_seeded'
};

// Helpers for localStorage fallback
const getLocal = (key, defaultVal) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error("Local storage error:", e);
    return defaultVal;
  }
};

const setLocal = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Local storage save error:", e);
  }
};

// Initialize LocalStorage if empty
const initLocalStorageIfNeeded = () => {
  if (!localStorage.getItem(STORAGE_KEYS.SEEDED)) {
    setLocal(STORAGE_KEYS.STOCK_IN, INITIAL_STOCK_IN);
    setLocal(STORAGE_KEYS.STOCK_OUT, INITIAL_STOCK_OUT);
    setLocal(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    setLocal(STORAGE_KEYS.MASTERS, INITIAL_MASTERS);
    setLocal(STORAGE_KEYS.SEEDED, true);
  }
};

// Core Data Service API
export const dataService = {
  // -------------------------------------------------------------
  // STOCK IN (Lorry Receipts - LR)
  // -------------------------------------------------------------
  async getStockIn() {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'stockIn'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          };
        });
      } catch (err) {
        console.warn("Firestore fetch error, reading local fallback:", err);
      }
    }
    initLocalStorageIfNeeded();
    return getLocal(STORAGE_KEYS.STOCK_IN, INITIAL_STOCK_IN);
  },

  async addStockIn(lrData) {
    const formattedData = {
      ...lrData,
      packages: Number(lrData.packages || 0),
      goodsValue: Number(lrData.goodsValue || 0),
      charges: {
        freight: Number(lrData.charges?.freight || 0),
        hamali: Number(lrData.charges?.hamali || 0),
        other: Number(lrData.charges?.other || 0),
        stCharges: Number(lrData.charges?.stCharges || 0),
        total: Number(lrData.charges?.total || 0)
      },
      status: 'in-godown',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'stockIn'), {
          ...formattedData,
          createdAt: serverTimestamp()
        });

        return { id: docRef.id, ...formattedData };
      } catch (err) {
        console.error("Firestore add stockIn error:", err);
      }
    }

    // Local Storage Fallback
    initLocalStorageIfNeeded();
    const current = getLocal(STORAGE_KEYS.STOCK_IN, INITIAL_STOCK_IN);
    const newEntry = { id: `lr-${Date.now()}`, ...formattedData };
    const updated = [newEntry, ...current];
    setLocal(STORAGE_KEYS.STOCK_IN, updated);

    return newEntry;
  },

  // -------------------------------------------------------------
  // STOCK OUT (Loading Memos)
  // -------------------------------------------------------------
  async getStockOut() {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'stockOut'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          };
        });
      } catch (err) {
        console.warn("Firestore fetch stockOut error:", err);
      }
    }
    initLocalStorageIfNeeded();
    return getLocal(STORAGE_KEYS.STOCK_OUT, INITIAL_STOCK_OUT);
  },

  async addStockOut(memoData) {
    const formattedData = {
      ...memoData,
      totalPackages: Number(memoData.totalPackages || 0),
      totalToPay: Number(memoData.totalToPay || 0),
      totalPaid: Number(memoData.totalPaid || 0),
      createdAt: new Date().toISOString()
    };

    const linkedLrNos = memoData.entries.map(e => e.lrNo);

    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        const memoDocRef = doc(collection(db, 'stockOut'));
        batch.set(memoDocRef, {
          ...formattedData,
          createdAt: serverTimestamp()
        });

        // Find stockIn docs with matching lrNo and update status to 'dispatched'
        for (const lrNo of linkedLrNos) {
          const q = query(collection(db, 'stockIn'), where('lrNo', '==', lrNo));
          const snap = await getDocs(q);
          snap.forEach(document => {
            batch.update(document.ref, {
              status: 'dispatched',
              memoNo: formattedData.memoNo
            });
          });
        }

        await batch.commit();
        return { id: memoDocRef.id, ...formattedData };
      } catch (err) {
        console.error("Firestore add stockOut batch error:", err);
      }
    }

    // Local Storage Fallback
    initLocalStorageIfNeeded();
    const currentMemos = getLocal(STORAGE_KEYS.STOCK_OUT, INITIAL_STOCK_OUT);
    const newMemo = { id: `memo-${Date.now()}`, ...formattedData };
    setLocal(STORAGE_KEYS.STOCK_OUT, [newMemo, ...currentMemos]);

    // Update stockIn status locally
    const currentStockIn = getLocal(STORAGE_KEYS.STOCK_IN, INITIAL_STOCK_IN);
    const updatedStockIn = currentStockIn.map(item => {
      if (linkedLrNos.includes(item.lrNo)) {
        return { ...item, status: 'dispatched', memoNo: formattedData.memoNo };
      }
      return item;
    });
    setLocal(STORAGE_KEYS.STOCK_IN, updatedStockIn);

    return newMemo;
  },

  // -------------------------------------------------------------
  // STATIONS
  // -------------------------------------------------------------
  async getStations() {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'stations'));
        if (!snap.empty) {
          return snap.docs.map(d => d.data().name);
        }
      } catch (err) {
        console.warn("Firestore fetch stations error:", err);
      }
    }
    initLocalStorageIfNeeded();
    return getLocal(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
  },

  // -------------------------------------------------------------
  // MASTERS (Drop Box Records)
  // -------------------------------------------------------------
  async getMasters() {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'masters'));
        if (!snap.empty) {
          const mainDoc = snap.docs.find(d => d.id === 'main') || snap.docs[0];
          return mainDoc.data();
        }
      } catch (err) {
        console.warn("Firestore fetch masters error:", err);
      }
    }
    initLocalStorageIfNeeded();
    return getLocal(STORAGE_KEYS.MASTERS, INITIAL_MASTERS);
  },

  async addMaster(category, record) {
    initLocalStorageIfNeeded();
    const currentMasters = getLocal(STORAGE_KEYS.MASTERS, INITIAL_MASTERS);
    const categoryList = currentMasters[category] || [];
    const newRecord = { id: `m-${category.substring(0, 3)}-${Date.now()}`, ...record };
    const updatedCategoryList = [newRecord, ...categoryList];
    const updatedMasters = {
      ...currentMasters,
      [category]: updatedCategoryList
    };
    setLocal(STORAGE_KEYS.MASTERS, updatedMasters);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'masters', 'main'), updatedMasters);
      } catch (err) {
        console.error("Firestore save masters error:", err);
      }
    }

    return newRecord;
  },

  async deleteMaster(category, id) {
    initLocalStorageIfNeeded();
    const currentMasters = getLocal(STORAGE_KEYS.MASTERS, INITIAL_MASTERS);
    const categoryList = currentMasters[category] || [];
    const updatedCategoryList = categoryList.filter(item => item.id !== id);
    const updatedMasters = {
      ...currentMasters,
      [category]: updatedCategoryList
    };
    setLocal(STORAGE_KEYS.MASTERS, updatedMasters);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'masters', 'main'), updatedMasters);
      } catch (err) {
        console.error("Firestore delete master error:", err);
      }
    }

    return true;
  },

  // -------------------------------------------------------------
  // SEED / RESET DATA
  // -------------------------------------------------------------
  async seedDatabase() {
    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        
        // Seed Stock In
        for (const item of INITIAL_STOCK_IN) {
          const ref = doc(collection(db, 'stockIn'), item.id);
          batch.set(ref, {
            ...item,
            createdAt: new Date(item.createdAt)
          });
        }

        // Seed Stock Out
        for (const item of INITIAL_STOCK_OUT) {
          const ref = doc(collection(db, 'stockOut'), item.id);
          batch.set(ref, {
            ...item,
            createdAt: new Date(item.createdAt)
          });
        }

        // Seed Stations
        for (const s of INITIAL_STATIONS) {
          const ref = doc(collection(db, 'stations'), s.replace(/\s+/g, '-').toLowerCase());
          batch.set(ref, { name: s });
        }

        // Seed Masters
        const masterRef = doc(collection(db, 'masters'), 'main');
        batch.set(masterRef, INITIAL_MASTERS);

        await batch.commit();
        console.log("🌱 Firestore database seeded successfully!");
        return true;
      } catch (err) {
        console.error("Firestore seed failed:", err);
      }
    }

    // Local Storage reset
    setLocal(STORAGE_KEYS.STOCK_IN, INITIAL_STOCK_IN);
    setLocal(STORAGE_KEYS.STOCK_OUT, INITIAL_STOCK_OUT);
    setLocal(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    setLocal(STORAGE_KEYS.MASTERS, INITIAL_MASTERS);
    setLocal(STORAGE_KEYS.SEEDED, true);
    return true;
  }
};
