import { 
  db, 
  isFirebaseConfigured 
} from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc, 
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
  EXPENSES: 'transtrack_expenses',
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

// In-memory cache store for 0ms tab navigation & minimal Firestore reads
const cache = {
  stockIn: null,
  stockInTime: 0,
  stockOut: null,
  stockOutTime: 0,
  stations: null,
  stationsTime: 0,
  masters: null,
  mastersTime: 0,
  expenses: null,
  expensesTime: 0
};

const CACHE_TTL_STOCK_MS = 60 * 1000; // 60s cache for stock records
const CACHE_TTL_STATIC_MS = 5 * 60 * 1000; // 5 min cache for masters/stations

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
  invalidateCache(type = 'all') {
    if (type === 'all' || type === 'expenses') {
      cache.expenses = null;
      cache.expensesTime = 0;
    }
    if (type === 'all' || type === 'stockIn') {
      cache.stockIn = null;
      cache.stockInTime = 0;
    }
    if (type === 'all' || type === 'stockOut') {
      cache.stockOut = null;
      cache.stockOutTime = 0;
    }
    if (type === 'all' || type === 'masters') {
      cache.masters = null;
      cache.mastersTime = 0;
      cache.stations = null;
      cache.stationsTime = 0;
    }
    if (type === 'all' || type === 'stations') {
      cache.stations = null;
      cache.stationsTime = 0;
    }
  },
  // -------------------------------------------------------------
  // STOCK IN (Lorry Receipts - LR)
  // -------------------------------------------------------------
  async getStockIn({ forceRefresh = false } = {}) {
    if (!forceRefresh && cache.stockIn && (Date.now() - cache.stockInTime < CACHE_TTL_STOCK_MS)) {
      return cache.stockIn;
    }
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'stockIn'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          };
        });
        cache.stockIn = list;
        cache.stockInTime = Date.now();
        return list;
      } catch (err) {
        console.warn("Firestore fetch error, reading local fallback:", err);
      }
    }
    initLocalStorageIfNeeded();
    const fallback = getLocal(STORAGE_KEYS.STOCK_IN, INITIAL_STOCK_IN);
    cache.stockIn = fallback;
    cache.stockInTime = Date.now();
    return fallback;
  },

  async addStockIn(lrData) {
    this.invalidateCache('stockIn');
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
    let current = getLocal(STORAGE_KEYS.STOCK_IN, INITIAL_STOCK_IN);
    if (!Array.isArray(current)) current = INITIAL_STOCK_IN;
    const newEntry = { id: `lr-${Date.now()}`, ...formattedData };
    const updated = [newEntry, ...current];
    setLocal(STORAGE_KEYS.STOCK_IN, updated);

    return newEntry;
  },

  async updateStockIn(id, lrData) {
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
      }
    };

    let oldLrNo = null;

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'stockIn', id);

        // Fetch existing stockIn record to find old lrNo if changed
        try {
          const snap = await getDocs(collection(db, 'stockIn'));
          const existingDoc = snap.docs.find(d => d.id === id);
          if (existingDoc) {
            oldLrNo = existingDoc.data()?.lrNo;
          }
        } catch (e) {
          console.warn("Could not fetch existing stockIn record:", e);
        }

        await updateDoc(docRef, formattedData);

        // Synchronize linked stockOut memos in Firestore
        try {
          const stockOutSnap = await getDocs(collection(db, 'stockOut'));
          if (!stockOutSnap.empty) {
            const batch = writeBatch(db);
            let hasChanges = false;

            stockOutSnap.forEach((memoDoc) => {
              const memoData = memoDoc.data();
              const entries = memoData.entries || [];
              let memoModified = false;

              const norm = (s) => (s || '').trim().toUpperCase();
              const oldNorm = oldLrNo ? norm(oldLrNo) : '';
              const newNorm = formattedData.lrNo ? norm(formattedData.lrNo) : '';

              const updatedEntries = entries.map(e => {
                const eNorm = norm(e.lrNo);
                const isMatch = e.lrId === id || e.id === id || (oldNorm && eNorm === oldNorm) || (newNorm && eNorm === newNorm);
                if (isMatch) {
                  memoModified = true;
                  hasChanges = true;
                  const totalCharge = Number(formattedData.charges?.total || 0);
                  const pType = formattedData.paymentType || formattedData.paymentStatus || e.paymentType;
                  return {
                    ...e,
                    lrId: id,
                    lrNo: formattedData.lrNo || e.lrNo,
                    consignor: formattedData.consignorName || e.consignor || '-',
                    consignee: formattedData.consigneeName || e.consignee || '-',
                    station: formattedData.toStation || e.station || '-',
                    packages: Number(formattedData.packages || 0),
                    weight: formattedData.weight || e.weight || '-',
                    toPay: pType === 'ToPay' ? totalCharge : 0,
                    paid: pType === 'Paid' ? totalCharge : 0,
                    tbb: pType === 'T.B.B' ? totalCharge : 0
                  };
                }
                return e;
              });

              if (memoModified) {
                const totalPackages = updatedEntries.reduce((sum, e) => sum + Number(e.packages || 0), 0);
                const totalToPay = updatedEntries.reduce((sum, e) => sum + Number(e.toPay || 0), 0);
                const totalPaid = updatedEntries.reduce((sum, e) => sum + Number(e.paid || 0), 0);
                const totalTbb = updatedEntries.reduce((sum, e) => sum + Number(e.tbb || 0), 0);
                const grandTotal = totalToPay + totalPaid + totalTbb;

                batch.update(memoDoc.ref, {
                  entries: updatedEntries,
                  totalPackages,
                  totalToPay,
                  totalPaid,
                  totalTbb,
                  grandTotal,
                  updatedAt: serverTimestamp()
                });
              }
            });

            if (hasChanges) {
              await batch.commit();
            }
          }
        } catch (mErr) {
          console.error("Error synchronizing linked stockOut memos in Firestore:", mErr);
        }

        return { id, ...formattedData };
      } catch (err) {
        console.error("Firestore update stockIn error:", err);
      }
    }

    // Local Storage Fallback
    let current = getLocal(STORAGE_KEYS.STOCK_IN, INITIAL_STOCK_IN);
    if (!Array.isArray(current)) current = INITIAL_STOCK_IN;
    const oldItem = current.find(item => item.id === id);
    oldLrNo = oldItem?.lrNo || oldLrNo;

    const updated = current.map(item => item.id === id ? { ...item, ...formattedData } : item);
    setLocal(STORAGE_KEYS.STOCK_IN, updated);

    // Synchronize linked stockOut memos locally
    let currentMemos = getLocal(STORAGE_KEYS.STOCK_OUT, INITIAL_STOCK_OUT);
    if (Array.isArray(currentMemos)) {
      let memosChanged = false;
      const norm = (s) => (s || '').trim().toUpperCase();
      const oldNorm = oldLrNo ? norm(oldLrNo) : '';
      const newNorm = formattedData.lrNo ? norm(formattedData.lrNo) : '';

      const updatedMemos = currentMemos.map(memo => {
        const entries = memo.entries || [];
        let memoModified = false;

        const updatedEntries = entries.map(e => {
          const eNorm = norm(e.lrNo);
          const isMatch = e.lrId === id || e.id === id || (oldNorm && eNorm === oldNorm) || (newNorm && eNorm === newNorm);
          if (isMatch) {
            memoModified = true;
            memosChanged = true;
            const totalCharge = Number(formattedData.charges?.total || 0);
            const pType = formattedData.paymentType || formattedData.paymentStatus || e.paymentType;
            return {
              ...e,
              lrId: id,
              lrNo: formattedData.lrNo || e.lrNo,
              consignor: formattedData.consignorName || e.consignor || '-',
              consignee: formattedData.consigneeName || e.consignee || '-',
              station: formattedData.toStation || e.station || '-',
              packages: Number(formattedData.packages || 0),
              weight: formattedData.weight || e.weight || '-',
              toPay: pType === 'ToPay' ? totalCharge : 0,
              paid: pType === 'Paid' ? totalCharge : 0,
              tbb: pType === 'T.B.B' ? totalCharge : 0
            };
          }
          return e;
        });

        if (memoModified) {
          const totalPackages = updatedEntries.reduce((sum, e) => sum + Number(e.packages || 0), 0);
          const totalToPay = updatedEntries.reduce((sum, e) => sum + Number(e.toPay || 0), 0);
          const totalPaid = updatedEntries.reduce((sum, e) => sum + Number(e.paid || 0), 0);
          const totalTbb = updatedEntries.reduce((sum, e) => sum + Number(e.tbb || 0), 0);
          const grandTotal = totalToPay + totalPaid + totalTbb;

          return {
            ...memo,
            entries: updatedEntries,
            totalPackages,
            totalToPay,
            totalPaid,
            totalTbb,
            grandTotal,
            updatedAt: new Date().toISOString()
          };
        }
        return memo;
      });

      if (memosChanged) {
        setLocal(STORAGE_KEYS.STOCK_OUT, updatedMemos);
      }
    }

    return { id, ...formattedData };
  },

  // -------------------------------------------------------------
  // STOCK OUT (Loading Memos)
  // -------------------------------------------------------------
  async getStockOut({ forceRefresh = false } = {}) {
    if (!forceRefresh && cache.stockOut && (Date.now() - cache.stockOutTime < CACHE_TTL_STOCK_MS)) {
      return cache.stockOut;
    }
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'stockOut'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          };
        });
        cache.stockOut = list;
        cache.stockOutTime = Date.now();
        return list;
      } catch (err) {
        console.warn("Firestore fetch stockOut error:", err);
      }
    }
    initLocalStorageIfNeeded();
    const fallback = getLocal(STORAGE_KEYS.STOCK_OUT, INITIAL_STOCK_OUT);
    cache.stockOut = fallback;
    cache.stockOutTime = Date.now();
    return fallback;
  },

  async addStockOut(memoData) {
    this.invalidateCache('all');
    const formattedData = {
      ...memoData,
      totalPackages: Number(memoData.totalPackages || 0),
      totalToPay: Number(memoData.totalToPay || 0),
      totalPaid: Number(memoData.totalPaid || 0),
      totalTbb: Number(memoData.totalTbb || 0),
      grandTotal: Number(memoData.grandTotal || 0),
      freight: Number(memoData.freight || 0),
      loadingCharges: Number(memoData.loadingCharges || 0),
      otherCharges: Number(memoData.otherCharges || 0),
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

        // Find stockIn docs with matching lrNo and update status to 'dispatched' in parallel
        if (linkedLrNos.length > 0) {
          const snaps = await Promise.all(
            linkedLrNos.map(lrNo => getDocs(query(collection(db, 'stockIn'), where('lrNo', '==', lrNo))))
          );
          snaps.forEach(snap => {
            snap.forEach(document => {
              batch.update(document.ref, {
                status: 'dispatched',
                memoNo: formattedData.memoNo
              });
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

  async updateStockOut(id, memoData, originalLinkedLrNos = []) {
    this.invalidateCache('all');
    const entries = memoData.entries || [];
    const calculatedTotalPkgs = entries.length > 0 ? entries.reduce((sum, e) => sum + Number(e.packages || 0), 0) : Number(memoData.totalPackages || 0);
    const calculatedToPay = entries.length > 0 ? entries.reduce((sum, e) => sum + Number(e.toPay || 0), 0) : Number(memoData.totalToPay || 0);
    const calculatedPaid = entries.length > 0 ? entries.reduce((sum, e) => sum + Number(e.paid || 0), 0) : Number(memoData.totalPaid || 0);
    const calculatedTbb = entries.length > 0 ? entries.reduce((sum, e) => sum + Number(e.tbb || 0), 0) : Number(memoData.totalTbb || 0);
    const calculatedGrandTotal = calculatedToPay + calculatedPaid + calculatedTbb;

    const formattedData = {
      ...memoData,
      totalPackages: calculatedTotalPkgs,
      totalToPay: calculatedToPay,
      totalPaid: calculatedPaid,
      totalTbb: calculatedTbb,
      grandTotal: calculatedGrandTotal,
      freight: Number(memoData.freight || 0),
      loadingCharges: Number(memoData.loadingCharges || 0),
      otherCharges: Number(memoData.otherCharges || 0),
      updatedAt: new Date().toISOString()
    };

    const newLinkedLrNos = entries.map(e => e.lrNo);

    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        const memoDocRef = doc(db, 'stockOut', id);
        batch.update(memoDocRef, formattedData);

        // Reset removed LRs back to godown in parallel
        const removedLrNos = originalLinkedLrNos.filter(lrNo => !newLinkedLrNos.includes(lrNo));
        if (removedLrNos.length > 0) {
          const removedSnaps = await Promise.all(
            removedLrNos.map(lrNo => getDocs(query(collection(db, 'stockIn'), where('lrNo', '==', lrNo))))
          );
          removedSnaps.forEach(snap => {
            snap.forEach(document => {
              batch.update(document.ref, { status: 'in-godown', memoNo: '' });
            });
          });
        }

        // Update all currently linked LRs with status 'dispatched' and updated memoNo in parallel
        if (newLinkedLrNos.length > 0) {
          const linkedSnaps = await Promise.all(
            newLinkedLrNos.map(lrNo => getDocs(query(collection(db, 'stockIn'), where('lrNo', '==', lrNo))))
          );
          linkedSnaps.forEach(snap => {
            snap.forEach(document => {
              batch.update(document.ref, { status: 'dispatched', memoNo: formattedData.memoNo });
            });
          });
        }

        await batch.commit();
        return { id, ...formattedData };
      } catch (err) {
        console.error("Firestore update stockOut batch error:", err);
      }
    }

    // Local Storage Fallback
    const currentMemos = getLocal(STORAGE_KEYS.STOCK_OUT, INITIAL_STOCK_OUT);
    const idx = currentMemos.findIndex(m => m.id === id);
    if (idx !== -1) {
      currentMemos[idx] = { ...currentMemos[idx], ...formattedData };
      setLocal(STORAGE_KEYS.STOCK_OUT, currentMemos);
    }

    // Update stockIn status locally
    const currentStockIn = getLocal(STORAGE_KEYS.STOCK_IN, INITIAL_STOCK_IN);
    const removedLrNos = originalLinkedLrNos.filter(lrNo => !newLinkedLrNos.includes(lrNo));
    
    const updatedStockIn = currentStockIn.map(item => {
      if (removedLrNos.includes(item.lrNo)) {
        return { ...item, status: 'in-godown', memoNo: '' };
      }
      if (newLinkedLrNos.includes(item.lrNo)) {
        return { ...item, status: 'dispatched', memoNo: formattedData.memoNo };
      }
      return item;
    });
    setLocal(STORAGE_KEYS.STOCK_IN, updatedStockIn);

    return { id, ...formattedData };
  },

  // -------------------------------------------------------------
  // STATIONS
  // -------------------------------------------------------------
  async getStations() {
    let legacyStations = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'stations'));
        if (!snap.empty) {
          legacyStations = snap.docs.map(d => d.data().name);
        }
      } catch (err) {
        console.warn("Firestore fetch stations error:", err);
      }
    }
    
    if (legacyStations.length === 0) {
      initLocalStorageIfNeeded();
      legacyStations = getLocal(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    }

    // Merge with new Drop Box stations
    const mastersData = await this.getMasters();
    const dropBoxStations = (mastersData?.stations || []).map(s => s.name);
    
    return [...new Set([...legacyStations, ...dropBoxStations])].filter(Boolean);
  },

  // -------------------------------------------------------------
  // MASTERS (Drop Box Records)
  // -------------------------------------------------------------
  async getMasters({ forceRefresh = false } = {}) {
    if (!forceRefresh && cache.masters && (Date.now() - cache.mastersTime < CACHE_TTL_STATIC_MS)) {
      return cache.masters;
    }
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'masters'));
        if (!snap.empty) {
          const mainDoc = snap.docs.find(d => d.id === 'main') || snap.docs[0];
          const data = mainDoc.data();
          cache.masters = data;
          cache.mastersTime = Date.now();
          return data;
        }
      } catch (err) {
        console.warn("Firestore fetch masters error:", err);
      }
    }
    initLocalStorageIfNeeded();
    const fallback = getLocal(STORAGE_KEYS.MASTERS, INITIAL_MASTERS);
    cache.masters = fallback;
    cache.mastersTime = Date.now();
    return fallback;
  },

  async addMaster(category, record) {
    this.invalidateCache('masters');
    let currentMasters = await this.getMasters();
    if (!currentMasters) {
      initLocalStorageIfNeeded();
      currentMasters = getLocal(STORAGE_KEYS.MASTERS, INITIAL_MASTERS);
    }
    const categoryList = currentMasters[category] || [];
    const newRecord = { id: `m-${category.substring(0, 3)}-${Date.now()}`, ...record };
    const updatedCategoryList = [newRecord, ...categoryList];
    const updatedMasters = {
      ...currentMasters,
      [category]: updatedCategoryList
    };
    
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'masters', 'main'), updatedMasters);
      } catch (err) {
        console.error("Firestore save masters error:", err);
      }
    }
    
    setLocal(STORAGE_KEYS.MASTERS, updatedMasters);
    return newRecord;
  },

  async updateMaster(category, id, record) {
    let currentMasters = await this.getMasters();
    if (!currentMasters) {
      initLocalStorageIfNeeded();
      currentMasters = getLocal(STORAGE_KEYS.MASTERS, INITIAL_MASTERS);
    }
    const categoryList = currentMasters[category] || [];
    const idx = categoryList.findIndex(item => item.id === id);
    if (idx !== -1) {
      categoryList[idx] = { ...categoryList[idx], ...record };
      const updatedMasters = {
        ...currentMasters,
        [category]: categoryList
      };

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'masters', 'main'), updatedMasters);
        } catch (err) {
          console.error("Firestore update master error:", err);
        }
      }
      
      setLocal(STORAGE_KEYS.MASTERS, updatedMasters);
      return categoryList[idx];
    }
    return null;
  },

  async deleteMaster(category, id) {
    this.invalidateCache('masters');
    let currentMasters = await this.getMasters();
    if (!currentMasters) {
      initLocalStorageIfNeeded();
      currentMasters = getLocal(STORAGE_KEYS.MASTERS, INITIAL_MASTERS);
    }
    const categoryList = currentMasters[category] || [];
    const updatedCategoryList = categoryList.filter(item => item.id !== id);
    const updatedMasters = {
      ...currentMasters,
      [category]: updatedCategoryList
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'masters', 'main'), updatedMasters);
      } catch (err) {
        console.error("Firestore delete master error:", err);
      }
    }

    setLocal(STORAGE_KEYS.MASTERS, updatedMasters);
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
  },

  
  async deleteStockIn(id) {
    this.invalidateCache('all');
    let targetLrNo = null;

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'stockIn', id);
        try {
          const snap = await getDocs(collection(db, 'stockIn'));
          const existingDoc = snap.docs.find(d => d.id === id);
          if (existingDoc) {
            targetLrNo = existingDoc.data()?.lrNo;
          }
        } catch (e) {
          console.warn("Could not fetch target stockIn record for delete:", e);
        }

        await deleteDoc(docRef);

        // Synchronize linked stockOut memos in Firestore
        try {
          const stockOutSnap = await getDocs(collection(db, 'stockOut'));
          if (!stockOutSnap.empty) {
            const batch = writeBatch(db);
            let hasChanges = false;

            stockOutSnap.forEach((memoDoc) => {
              const memoData = memoDoc.data();
              const entries = memoData.entries || [];
              const filteredEntries = entries.filter(e => !(e.lrId === id || e.id === id || (targetLrNo && e.lrNo === targetLrNo)));

              if (filteredEntries.length !== entries.length) {
                hasChanges = true;
                const totalPackages = filteredEntries.reduce((sum, e) => sum + Number(e.packages || 0), 0);
                const totalToPay = filteredEntries.reduce((sum, e) => sum + Number(e.toPay || 0), 0);
                const totalPaid = filteredEntries.reduce((sum, e) => sum + Number(e.paid || 0), 0);
                const totalTbb = filteredEntries.reduce((sum, e) => sum + Number(e.tbb || 0), 0);
                const grandTotal = totalToPay + totalPaid + totalTbb;

                batch.update(memoDoc.ref, {
                  entries: filteredEntries,
                  totalPackages,
                  totalToPay,
                  totalPaid,
                  totalTbb,
                  grandTotal,
                  updatedAt: serverTimestamp()
                });
              }
            });

            if (hasChanges) {
              await batch.commit();
            }
          }
        } catch (mErr) {
          console.error("Error removing deleted stockIn from stockOut memos in Firestore:", mErr);
        }

      } catch (err) {
        console.error("Firestore delete stockIn error:", err);
        throw err;
      }
    }
    
    let current = getLocal(STORAGE_KEYS.STOCK_IN, INITIAL_STOCK_IN);
    if (Array.isArray(current)) {
      const itemToDelete = current.find(item => item.id === id);
      targetLrNo = itemToDelete?.lrNo || targetLrNo;
      const updated = current.filter(item => item.id !== id);
      setLocal(STORAGE_KEYS.STOCK_IN, updated);
    }

    // Synchronize linked stockOut memos locally
    let currentMemos = getLocal(STORAGE_KEYS.STOCK_OUT, INITIAL_STOCK_OUT);
    if (Array.isArray(currentMemos)) {
      let memosChanged = false;
      const updatedMemos = currentMemos.map(memo => {
        const entries = memo.entries || [];
        const filteredEntries = entries.filter(e => !(e.lrId === id || e.id === id || (targetLrNo && e.lrNo === targetLrNo)));

        if (filteredEntries.length !== entries.length) {
          memosChanged = true;
          const totalPackages = filteredEntries.reduce((sum, e) => sum + Number(e.packages || 0), 0);
          const totalToPay = filteredEntries.reduce((sum, e) => sum + Number(e.toPay || 0), 0);
          const totalPaid = filteredEntries.reduce((sum, e) => sum + Number(e.paid || 0), 0);
          const totalTbb = filteredEntries.reduce((sum, e) => sum + Number(e.tbb || 0), 0);
          const grandTotal = totalToPay + totalPaid + totalTbb;

          return {
            ...memo,
            entries: filteredEntries,
            totalPackages,
            totalToPay,
            totalPaid,
            totalTbb,
            grandTotal,
            updatedAt: new Date().toISOString()
          };
        }
        return memo;
      });

      if (memosChanged) {
        setLocal(STORAGE_KEYS.STOCK_OUT, updatedMemos);
      }
    }

    return true;
  },

  async deleteStockOut(id) {
    this.invalidateCache('all');
    let linkedLrNos = [];

    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        const memoDocRef = doc(db, 'stockOut', id);

        try {
          const snap = await getDocs(collection(db, 'stockOut'));
          const memoDoc = snap.docs.find(d => d.id === id);
          if (memoDoc) {
            const memoData = memoDoc.data();
            linkedLrNos = (memoData.entries || []).map(e => e.lrNo).filter(Boolean);
          }
        } catch (e) {
          console.warn("Could not fetch target memo for delete:", e);
        }

        batch.delete(memoDocRef);

        // Reset linked LRs back to godown in parallel
        if (linkedLrNos.length > 0) {
          const snaps = await Promise.all(
            linkedLrNos.map(lrNo => getDocs(query(collection(db, 'stockIn'), where('lrNo', '==', lrNo))))
          );
          snaps.forEach(snap => {
            snap.forEach(document => {
              batch.update(document.ref, { status: 'in-godown', memoNo: '' });
            });
          });
        }

        await batch.commit();
      } catch (err) {
        console.error("Firestore delete stockOut error:", err);
        throw err;
      }
    }
    
    let current = getLocal(STORAGE_KEYS.STOCK_OUT, INITIAL_STOCK_OUT);
    if (Array.isArray(current)) {
      const memoToDelete = current.find(item => item.id === id);
      if (memoToDelete && memoToDelete.entries) {
        linkedLrNos = memoToDelete.entries.map(e => e.lrNo).filter(Boolean);
      }
      const updated = current.filter(item => item.id !== id);
      setLocal(STORAGE_KEYS.STOCK_OUT, updated);
    }

    // Reset linked LRs locally
    if (linkedLrNos.length > 0) {
      const currentStockIn = getLocal(STORAGE_KEYS.STOCK_IN, INITIAL_STOCK_IN);
      const updatedStockIn = currentStockIn.map(item => {
        if (linkedLrNos.includes(item.lrNo)) {
          return { ...item, status: 'in-godown', memoNo: '' };
        }
        return item;
      });
      setLocal(STORAGE_KEYS.STOCK_IN, updatedStockIn);
    }

    return true;
  },

  // -------------------------------------------------------------
  // OPERATING EXPENSES
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // AUTOMATIC SAVING OF MANUAL INPUTS TO MASTERS (DROP BOX)
  // -------------------------------------------------------------
  async autoSaveMasters({
    fromStation,
    toStation,
    consignorName,
    consignorAddress,
    consignorGSTIN,
    consigneeName,
    consigneeAddress,
    consigneeGSTIN,
    vehicleNo,
    ownerName,
    driverName,
    transportAgent,
    transportAgentMobile
  } = {}) {
    this.invalidateCache('masters');
    this.invalidateCache('stations');

    let currentMasters = await this.getMasters({ forceRefresh: true });
    if (!currentMasters) {
      initLocalStorageIfNeeded();
      currentMasters = getLocal(STORAGE_KEYS.MASTERS, INITIAL_MASTERS);
    }

    const norm = (s) => (s || '').trim().toUpperCase();
    let hasChanges = false;
    const addedItems = [];

    const updatedMasters = {
      consignors: [...(currentMasters.consignors || [])],
      consignees: [...(currentMasters.consignees || [])],
      vehicles: [...(currentMasters.vehicles || [])],
      stations: [...(currentMasters.stations || [])],
      deliveryPersons: [...(currentMasters.deliveryPersons || [])],
      drivers: [...(currentMasters.drivers || [])],
      transportAgents: [...(currentMasters.transportAgents || [])]
    };

    // 1. Stations (FROM & TO)
    const candidateStations = [fromStation, toStation].map(norm).filter(Boolean);
    const existingStationNames = new Set(
      updatedMasters.stations.map(s => norm(s.name))
    );
    const localStations = getLocal(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    localStations.forEach(s => existingStationNames.add(norm(s)));

    for (const st of candidateStations) {
      if (st && !existingStationNames.has(st)) {
        existingStationNames.add(st);
        const newStation = {
          id: `m-sta-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: st
        };
        updatedMasters.stations.unshift(newStation);
        hasChanges = true;
        addedItems.push(`Station: ${st}`);

        if (!localStations.some(s => norm(s) === st)) {
          localStations.unshift(st);
          setLocal(STORAGE_KEYS.STATIONS, localStations);
        }
      }
    }

    // 2. Consignor (Sender)
    if (consignorName && consignorName.trim()) {
      const cleanName = consignorName.trim();
      const existingIdx = updatedMasters.consignors.findIndex(c => norm(c.name) === norm(cleanName));
      if (existingIdx === -1) {
        const newConsignor = {
          id: `m-con-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: cleanName,
          address: (consignorAddress || '').trim(),
          gstin: (consignorGSTIN || '').trim().toUpperCase(),
          mobile: ''
        };
        updatedMasters.consignors.unshift(newConsignor);
        hasChanges = true;
        addedItems.push(`Consignor: ${cleanName}`);
      } else {
        const ex = updatedMasters.consignors[existingIdx];
        let modified = false;
        let newAddress = ex.address;
        let newGstin = ex.gstin;
        if (consignorAddress && consignorAddress.trim() && !ex.address) {
          newAddress = consignorAddress.trim();
          modified = true;
        }
        if (consignorGSTIN && consignorGSTIN.trim() && !ex.gstin) {
          newGstin = consignorGSTIN.trim().toUpperCase();
          modified = true;
        }
        if (modified) {
          updatedMasters.consignors[existingIdx] = {
            ...ex,
            address: newAddress,
            gstin: newGstin
          };
          hasChanges = true;
        }
      }
    }

    // 3. Consignee (Receiver)
    if (consigneeName && consigneeName.trim()) {
      const cleanName = consigneeName.trim();
      const existingIdx = updatedMasters.consignees.findIndex(c => norm(c.name) === norm(cleanName));
      if (existingIdx === -1) {
        const newConsignee = {
          id: `m-cee-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: cleanName,
          address: (consigneeAddress || '').trim(),
          gstin: (consigneeGSTIN || '').trim().toUpperCase(),
          mobile: ''
        };
        updatedMasters.consignees.unshift(newConsignee);
        hasChanges = true;
        addedItems.push(`Consignee: ${cleanName}`);
      } else {
        const ex = updatedMasters.consignees[existingIdx];
        let modified = false;
        let newAddress = ex.address;
        let newGstin = ex.gstin;
        if (consigneeAddress && consigneeAddress.trim() && !ex.address) {
          newAddress = consigneeAddress.trim();
          modified = true;
        }
        if (consigneeGSTIN && consigneeGSTIN.trim() && !ex.gstin) {
          newGstin = consigneeGSTIN.trim().toUpperCase();
          modified = true;
        }
        if (modified) {
          updatedMasters.consignees[existingIdx] = {
            ...ex,
            address: newAddress,
            gstin: newGstin
          };
          hasChanges = true;
        }
      }
    }

    // 4. Vehicle & Owner Name
    if (vehicleNo && vehicleNo.trim()) {
      const cleanVeh = norm(vehicleNo);
      const existingIdx = updatedMasters.vehicles.findIndex(v => norm(v.vehicleNo) === cleanVeh);
      if (existingIdx === -1) {
        const newVehicle = {
          id: `m-veh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          vehicleNo: cleanVeh,
          ownerName: (ownerName || '').trim(),
          address: '',
          mobile: ''
        };
        updatedMasters.vehicles.unshift(newVehicle);
        hasChanges = true;
        addedItems.push(`Vehicle: ${cleanVeh}`);
      } else if (ownerName && ownerName.trim() && !updatedMasters.vehicles[existingIdx].ownerName) {
        updatedMasters.vehicles[existingIdx] = {
          ...updatedMasters.vehicles[existingIdx],
          ownerName: ownerName.trim()
        };
        hasChanges = true;
      }
    }

    // 5. Driver Name
    if (driverName && driverName.trim()) {
      const cleanDriver = driverName.trim();
      const existingIdx = updatedMasters.drivers.findIndex(d => norm(d.name) === norm(cleanDriver));
      if (existingIdx === -1) {
        const newDriver = {
          id: `m-dri-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: cleanDriver,
          address: '',
          mobile: ''
        };
        updatedMasters.drivers.unshift(newDriver);
        hasChanges = true;
        addedItems.push(`Driver: ${cleanDriver}`);
      }
    }

    // 6. Transport Agent & Mobile
    if (transportAgent && transportAgent.trim()) {
      const cleanAgent = transportAgent.trim();
      const cleanMobile = (transportAgentMobile || '').trim();
      const existingIdx = updatedMasters.transportAgents.findIndex(a => norm(a.name) === norm(cleanAgent));
      if (existingIdx === -1) {
        const newAgent = {
          id: `m-agt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: cleanAgent,
          mobile: cleanMobile,
          address: '',
          gstin: ''
        };
        updatedMasters.transportAgents.unshift(newAgent);
        hasChanges = true;
        addedItems.push(`Transport Agent: ${cleanAgent}`);
      } else if (cleanMobile && !updatedMasters.transportAgents[existingIdx].mobile) {
        updatedMasters.transportAgents[existingIdx] = {
          ...updatedMasters.transportAgents[existingIdx],
          mobile: cleanMobile
        };
        hasChanges = true;
      }
    }

    // Commit changes
    if (hasChanges) {
      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'masters', 'main'), updatedMasters);
        } catch (err) {
          console.error("Firestore save auto-masters error:", err);
        }
      }
      setLocal(STORAGE_KEYS.MASTERS, updatedMasters);
      cache.masters = updatedMasters;
      cache.mastersTime = Date.now();
    }

    return { hasChanges, addedItems, updatedMasters };
  },

  async getExpenses({ forceRefresh = false } = {}) {
    if (!forceRefresh && cache.expenses && (Date.now() - cache.expensesTime < CACHE_TTL_STOCK_MS)) {
      return cache.expenses;
    }
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          };
        });
        cache.expenses = list;
        cache.expensesTime = Date.now();
        return list;
      } catch (err) {
        console.warn("Firestore fetch error for expenses, reading local fallback:", err);
      }
    }
    const fallback = getLocal(STORAGE_KEYS.EXPENSES, []);
    cache.expenses = fallback;
    cache.expensesTime = Date.now();
    return fallback;
  },

  async addExpense(expenseData) {
    this.invalidateCache('expenses');
    const formattedData = {
      ...expenseData,
      amount: Number(expenseData.amount || 0),
      date: expenseData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'expenses'), {
          ...formattedData,
          createdAt: serverTimestamp()
        });
        const saved = { ...formattedData, id: docRef.id };
        const currentLocal = getLocal(STORAGE_KEYS.EXPENSES, []);
        setLocal(STORAGE_KEYS.EXPENSES, [saved, ...currentLocal]);
        return saved;
      } catch (err) {
        console.warn("Firestore add error for expense, falling back to local:", err);
      }
    }
    const currentExpenses = getLocal(STORAGE_KEYS.EXPENSES, []);
    const newRecord = {
      ...formattedData,
      id: `exp-${Date.now()}`
    };
    setLocal(STORAGE_KEYS.EXPENSES, [newRecord, ...currentExpenses]);
    return newRecord;
  },

  async updateExpense(id, expenseData) {
    this.invalidateCache('expenses');
    const formattedData = {
      ...expenseData,
      amount: Number(expenseData.amount || 0),
      updatedAt: new Date().toISOString()
    };
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'expenses', id);
        await updateDoc(docRef, formattedData);
      } catch (err) {
        console.warn("Firestore update error for expense:", err);
      }
    }
    const currentExpenses = getLocal(STORAGE_KEYS.EXPENSES, []);
    const updated = currentExpenses.map(item => item.id === id ? { ...item, ...formattedData } : item);
    setLocal(STORAGE_KEYS.EXPENSES, updated);
    return { id, ...formattedData };
  },

  async deleteExpense(id) {
    this.invalidateCache('expenses');
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'expenses', id));
      } catch (err) {
        console.warn("Firestore delete error for expense:", err);
      }
    }
    const currentExpenses = getLocal(STORAGE_KEYS.EXPENSES, []);
    const updated = currentExpenses.filter(item => item.id !== id);
    setLocal(STORAGE_KEYS.EXPENSES, updated);
    return true;
  },

  async clearDatabase() {
    if (isFirebaseConfigured && db) {
      try {
        const collectionsToClear = ['stockIn', 'stockOut'];
        const CHUNK_SIZE = 400; // Chunking to safely stay well under Firestore's 500-operation writeBatch limit
        for (const collName of collectionsToClear) {
          const querySnapshot = await getDocs(collection(db, collName));
          const docs = querySnapshot.docs;
          for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
            const chunk = docs.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(db);
            chunk.forEach((docSnap) => {
              batch.delete(docSnap.ref);
            });
            await batch.commit();
          }
        }
      } catch (err) {
        console.error("Error clearing Firestore database:", err);
      }
    }
    
    // Clear local storage
    setLocal(STORAGE_KEYS.STOCK_IN, []);
    setLocal(STORAGE_KEYS.STOCK_OUT, []);
    return true;
  }
};
