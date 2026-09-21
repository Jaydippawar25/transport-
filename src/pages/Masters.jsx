import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Trash2, 
  Building2, 
  Store, 
  Truck, 
  MapPin, 
  UserCheck, 
  User, 
  ShieldCheck,
  X
} from 'lucide-react';
import { dataService } from '../services/dataService';

export default function Masters() {
  const [masters, setMasters] = useState({
    consignors: [],
    consignees: [],
    vehicles: [],
    stations: [],
    deliveryPersons: [],
    drivers: [],
    transporters: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('consignors');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Record Form State
  const [formData, setFormData] = useState({
    name: '',
    vehicleNo: '',
    address: '',
    mobile: '',
    gstin: '',
    ownerName: ''
  });

  const CATEGORIES = [
    { key: 'consignors', label: 'Consignors', icon: Building2, color: 'blue' },
    { key: 'consignees', label: 'Consignees', icon: Store, color: 'indigo' },
    { key: 'vehicles', label: 'Vehicles / Lorry No', icon: Truck, color: 'emerald' },
    { key: 'stations', label: 'Stations', icon: MapPin, color: 'amber' },
    { key: 'deliveryPersons', label: 'Delivery Persons', icon: UserCheck, color: 'cyan' },
    { key: 'drivers', label: 'Drivers', icon: User, color: 'violet' },
    { key: 'transporters', label: 'Transporters', icon: ShieldCheck, color: 'rose' }
  ];

  const loadMasters = async () => {
    setLoading(true);
    try {
      const data = await dataService.getMasters();
      setMasters({
        consignors: data.consignors || [],
        consignees: data.consignees || [],
        vehicles: data.vehicles || [],
        stations: data.stations || [],
        deliveryPersons: data.deliveryPersons || [],
        drivers: data.drivers || [],
        transporters: data.transporters || []
      });
    } catch (err) {
      console.error("Failed to load masters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasters();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      vehicleNo: '',
      address: '',
      mobile: '',
      gstin: '',
      ownerName: ''
    });
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    // Validation based on active tab
    if (activeTab === 'vehicles' && !formData.vehicleNo.trim()) {
      alert('Vehicle / Lorry No is required.');
      return;
    }
    if (activeTab !== 'vehicles' && !formData.name.trim()) {
      alert('Name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      let payload = {};
      if (activeTab === 'consignors' || activeTab === 'consignees' || activeTab === 'transporters') {
        payload = {
          name: formData.name.trim(),
          address: formData.address.trim(),
          mobile: formData.mobile.trim(),
          gstin: formData.gstin.trim()
        };
      } else if (activeTab === 'vehicles') {
        payload = {
          vehicleNo: formData.vehicleNo.trim().toUpperCase(),
          address: formData.address.trim(),
          mobile: formData.mobile.trim(),
          ownerName: formData.ownerName.trim()
        };
      } else if (activeTab === 'stations') {
        payload = {
          name: formData.name.trim().toUpperCase()
        };
      } else { // deliveryPersons, drivers
        payload = {
          name: formData.name.trim(),
          address: formData.address.trim(),
          mobile: formData.mobile.trim()
        };
      }

      await dataService.addMaster(activeTab, payload);
      await loadMasters();
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding master entry:", err);
      alert('Failed to add master record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, nameOrNo) => {
    if (!window.confirm(`Are you sure you want to delete "${nameOrNo}" from Drop Box?`)) {
      return;
    }
    try {
      await dataService.deleteMaster(activeTab, id);
      await loadMasters();
    } catch (err) {
      console.error("Error deleting master entry:", err);
      alert('Failed to delete master record.');
    }
  };

  const currentCategory = CATEGORIES.find(c => c.key === activeTab);
  const currentList = masters[activeTab] || [];

  // Real-time Search Filtering
  const filteredList = currentList.filter(item => {
    const query = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.vehicleNo && item.vehicleNo.toLowerCase().includes(query)) ||
      (item.address && item.address.toLowerCase().includes(query)) ||
      (item.mobile && item.mobile.includes(query)) ||
      (item.gstin && item.gstin.toLowerCase().includes(query)) ||
      (item.ownerName && item.ownerName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold">
              <FolderKanban className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Masters Management (Drop Box)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create and maintain pre-saved master records. Selecting entries in Stock In & Stock Out forms will auto-fill addresses, GSTIN, and vehicle details.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {currentCategory.label.replace(/s$/, '')}</span>
        </button>
      </div>

      {/* Category Selection Tabs */}
      <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200 overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-1.5 min-w-max">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = (masters[cat.key] || []).length;
            const isActive = activeTab === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveTab(cat.key);
                  setSearchTerm('');
                }}
                className={`
                  flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all duration-150 cursor-pointer
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-[10px] font-bold
                  ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${currentCategory.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredList.length}</span> of {currentList.length} entries
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">
            Loading Drop Box Master Records...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FolderKanban className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-600">No master records found in {currentCategory.label}</p>
            <p className="text-xs text-slate-400">Click "Add New" above to save entries into Drop Box for auto-filling forms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Sr No</th>
                  {activeTab === 'vehicles' ? (
                    <>
                      <th className="py-3.5 px-4 sm:px-6">Vehicle / Lorry No</th>
                      <th className="py-3.5 px-4 sm:px-6">Owner Name</th>
                      <th className="py-3.5 px-4 sm:px-6">Mobile No</th>
                      <th className="py-3.5 px-4 sm:px-6">Address</th>
                    </>
                  ) : activeTab === 'stations' ? (
                    <th className="py-3.5 px-4 sm:px-6">Station Name</th>
                  ) : (
                    <>
                      <th className="py-3.5 px-4 sm:px-6">Name</th>
                      <th className="py-3.5 px-4 sm:px-6">Address</th>
                      <th className="py-3.5 px-4 sm:px-6">Mobile No</th>
                      {(activeTab === 'consignors' || activeTab === 'consignees' || activeTab === 'transporters') && (
                        <th className="py-3.5 px-4 sm:px-6">GSTIN No</th>
                      )}
                    </>
                  )}
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredList.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-4 sm:px-6 font-mono text-xs text-slate-400 font-semibold">{index + 1}</td>
                    
                    {activeTab === 'vehicles' ? (
                      <>
                        <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 tracking-wide font-mono">
                          {item.vehicleNo}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-slate-700 font-medium">{item.ownerName || '-'}</td>
                        <td className="py-4 px-4 sm:px-6 font-mono text-xs text-slate-600">{item.mobile || '-'}</td>
                        <td className="py-4 px-4 sm:px-6 text-slate-600 text-xs max-w-xs truncate">{item.address || '-'}</td>
                      </>
                    ) : activeTab === 'stations' ? (
                      <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 tracking-wider font-mono">
                        {item.name}
                      </td>
                    ) : (
                      <>
                        <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900">
                          {item.name}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-slate-600 text-xs max-w-xs truncate">{item.address || '-'}</td>
                        <td className="py-4 px-4 sm:px-6 font-mono text-xs text-slate-600">{item.mobile || '-'}</td>
                        {(activeTab === 'consignors' || activeTab === 'consignees' || activeTab === 'transporters') && (
                          <td className="py-4 px-4 sm:px-6 font-mono text-xs text-blue-700 font-medium">
                            {item.gstin || '-'}
                          </td>
                        )}
                      </>
                    )}

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleDelete(item.id, item.name || item.vehicleNo)}
                        title="Delete record"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Master Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Add New {currentCategory.label.replace(/s$/, '')}</h3>
                  <p className="text-xs text-slate-400">Save details into Drop Box for fast form pre-filling</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {activeTab === 'vehicles' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Vehicle / Lorry No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MH 09 CA 4589"
                      value={formData.vehicleNo}
                      onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mahalaxmi Logistics Fleet"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile No
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9822012345"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Vehicle garage or owner address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : activeTab === 'stations' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Station Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SANGLI, MUMBAI, PUNE"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      {currentCategory.label.replace(/s$/, '')} Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={`Enter ${currentCategory.label.replace(/s$/, '').toLowerCase()} name`}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {(activeTab === 'consignors' || activeTab === 'consignees' || activeTab === 'transporters') && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        GSTIN No
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 27AAACG1234F1Z5"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Mobile No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9822012345"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Full street address, area, city"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save to Drop Box'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
