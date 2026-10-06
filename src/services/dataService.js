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

  async updateStockOut(id, memoData, originalLinkedLrNos = []) {
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

        // Reset removed LRs back to godown
        const removedLrNos = originalLinkedLrNos.filter(lrNo => !newLinkedLrNos.includes(lrNo));
        for (const lrNo of removedLrNos) {
          const q = query(collection(db, 'stockIn'), where('lrNo', '==', lrNo));
          const snap = await getDocs(q);
          snap.forEach(document => {
            batch.update(document.ref, { status: 'in-godown', memoNo: '' });
          });
        }

        // Update all currently linked LRs with status 'dispatched' and updated memoNo
        for (const lrNo of newLinkedLrNos) {
          const q = query(collection(db, 'stockIn'), where('lrNo', '==', lrNo));
          const snap = await getDocs(q);
          snap.forEach(document => {
            batch.update(document.ref, { status: 'dispatched', memoNo: formattedData.memoNo });
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

        // Reset linked LRs back to godown
        for (const lrNo of linkedLrNos) {
          const q = query(collection(db, 'stockIn'), where('lrNo', '==', lrNo));
          const snap = await getDocs(q);
          snap.forEach(document => {
            batch.update(document.ref, { status: 'in-godown', memoNo: '' });
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

  async clearDatabase() {
    if (isFirebaseConfigured && db) {
      try {
        const collectionsToClear = ['stockIn', 'stockOut'];
        for (const collName of collectionsToClear) {
          const querySnapshot = await getDocs(collection(db, collName));
          const batch = writeBatch(db);
          querySnapshot.forEach((docSnap) => {
            batch.delete(docSnap.ref);
          });
          if (!querySnapshot.empty) {
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
