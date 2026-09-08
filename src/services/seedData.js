// Seed / Sample data for Transport Stock In (LR) and Stock Out (Loading Memo)

export const INITIAL_STATIONS = [
  "SANGLI",
  "MUMBAI",
  "PUNE",
  "KOLHAPUR",
  "SOLAPUR",
  "NAGPUR",
  "SURAT",
  "AHMEDABAD"
];

// Seed Lorry Receipts (Stock In)
export const INITIAL_STOCK_IN = [
  {
    id: "lr-101",
    lrNo: "SNGT12061",
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    consignorName: "Shree Ganesh Plastics",
    consignorAddress: "Plot 42, MIDC Industrial Area, Chinchwad, Pune",
    consignorGSTIN: "27AAACG1234F1Z5",
    consigneeName: "Sangli General Traders",
    consigneeAddress: "Market Yard, Shop No 18, Sangli",
    consigneeGSTIN: "27BBBPS5678K1Z9",
    toStation: "SANGLI",
    packages: 45,
    weight: "450 Kg",
    description: "Plastic Moulded Goods & Containers",
    goodsValue: 125000,
    invoiceNo: "INV-2026-088",
    ewayBillNo: "341098452109",
    charges: {
      freight: 3500,
      hamali: 300,
      other: 150,
      stCharges: 100,
      total: 4050
    },
    paymentType: "ToPay",
    status: "dispatched",
    memoNo: "LM-8041",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: "lr-102",
    lrNo: "SNGT12062",
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    consignorName: "Mahalaxmi Textiles Ltd",
    consignorAddress: "Gat No 104, Ichalkaranji, Kolhapur",
    consignorGSTIN: "27CCCPM9012J1Z3",
    consigneeName: "Kohinoor Hardware Mart",
    consigneeAddress: "Crawford Market, Fort, Mumbai",
    consigneeGSTIN: "27EEEKH7890M1Z8",
    toStation: "MUMBAI",
    packages: 80,
    weight: "1200 Kg",
    description: "Cotton Fabric Rolls & Yarn Bales",
    goodsValue: 340000,
    invoiceNo: "MTL/26-904",
    ewayBillNo: "561234908123",
    charges: {
      freight: 7200,
      hamali: 500,
      other: 200,
      stCharges: 100,
      total: 8000
    },
    paymentType: "Paid",
    status: "dispatched",
    memoNo: "LM-8041",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: "lr-103",
    lrNo: "SNGT12063",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    consignorName: "Shree Ganesh Plastics",
    consignorAddress: "Plot 42, MIDC Industrial Area, Chinchwad, Pune",
    consignorGSTIN: "27AAACG1234F1Z5",
    consigneeName: "Sangli General Traders",
    consigneeAddress: "Market Yard, Shop No 18, Sangli",
    consigneeGSTIN: "27BBBPS5678K1Z9",
    toStation: "SANGLI",
    packages: 30,
    weight: "320 Kg",
    description: "Plastic Household Goods",
    goodsValue: 85000,
    invoiceNo: "INV-2026-102",
    ewayBillNo: "781094328901",
    charges: {
      freight: 2800,
      hamali: 250,
      other: 100,
      stCharges: 50,
      total: 3200
    },
    paymentType: "ToPay",
    status: "in-godown",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: "lr-104",
    lrNo: "SNGT12064",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    consignorName: "Mahalaxmi Textiles Ltd",
    consignorAddress: "Gat No 104, Ichalkaranji, Kolhapur",
    consignorGSTIN: "27CCCPM9012J1Z3",
    consigneeName: "Solapur Fabrics & Sons",
    consigneeAddress: "Station Road, Solapur",
    consigneeGSTIN: "27FFFSS2345N1Z4",
    toStation: "SOLAPUR",
    packages: 50,
    weight: "750 Kg",
    description: "Poly-Cotton Garment Bundles",
    goodsValue: 190000,
    invoiceNo: "MTL/26-940",
    ewayBillNo: "892019438290",
    charges: {
      freight: 4500,
      hamali: 400,
      other: 150,
      stCharges: 100,
      total: 5150
    },
    paymentType: "ToPay",
    status: "in-godown",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: "lr-105",
    lrNo: "SNGT12065",
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    consignorName: "Shree Ganesh Plastics",
    consignorAddress: "Plot 42, MIDC Industrial Area, Chinchwad, Pune",
    consignorGSTIN: "27AAACG1234F1Z5",
    consigneeName: "Apex Auto Parts Pvt Ltd",
    consigneeAddress: "Bhosari Industrial Estate, Pune",
    consigneeGSTIN: "27DDDAA3456L1Z2",
    toStation: "PUNE",
    packages: 120,
    weight: "1800 Kg",
    description: "Auto Molded Bumpers & Dashboards",
    goodsValue: 480000,
    invoiceNo: "SGP/P-554",
    ewayBillNo: "901284759302",
    charges: {
      freight: 9500,
      hamali: 800,
      other: 300,
      stCharges: 200,
      total: 10800
    },
    paymentType: "Paid",
    status: "in-godown",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: "lr-106",
    lrNo: "SNGT12066",
    date: new Date().toISOString(),
    consignorName: "Mahalaxmi Textiles Ltd",
    consignorAddress: "Gat No 104, Ichalkaranji, Kolhapur",
    consignorGSTIN: "27CCCPM9012J1Z3",
    consigneeName: "Sangli General Traders",
    consigneeAddress: "Market Yard, Shop No 18, Sangli",
    consigneeGSTIN: "27BBBPS5678K1Z9",
    toStation: "SANGLI",
    packages: 25,
    weight: "280 Kg",
    description: "Industrial Sewing Threads & Needles",
    goodsValue: 62000,
    invoiceNo: "MTL/26-988",
    ewayBillNo: "119028347109",
    charges: {
      freight: 2200,
      hamali: 200,
      other: 100,
      stCharges: 50,
      total: 2550
    },
    paymentType: "ToPay",
    status: "in-godown",
    createdAt: new Date().toISOString()
  }
];

// Seed Loading Memos (Stock Out)
export const INITIAL_STOCK_OUT = [
  {
    id: "memo-8041",
    memoNo: "LM-8041",
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    driverName: "Ramesh Pawar",
    lorryNo: "MH 09 CA 4589",
    ownerName: "Mahalaxmi Logistics Fleet",
    entries: [
      {
        srNo: 1,
        lrNo: "SNGT12061",
        consignor: "Shree Ganesh Plastics",
        consignee: "Sangli General Traders",
        station: "SANGLI",
        packages: 45,
        toPay: 4050,
        paid: 0
      },
      {
        srNo: 2,
        lrNo: "SNGT12062",
        consignor: "Mahalaxmi Textiles Ltd",
        consignee: "Kohinoor Hardware Mart",
        station: "MUMBAI",
        packages: 80,
        toPay: 0,
        paid: 8000
      }
    ],
    totalPackages: 125,
    totalToPay: 4050,
    totalPaid: 8000,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  }
];

// Seed Masters (Drop Box) Data
export const INITIAL_MASTERS = {
  consignors: [
    {
      id: "m-csg-1",
      name: "Shree Ganesh Plastics",
      address: "Plot 42, MIDC Industrial Area, Chinchwad, Pune",
      mobile: "9822012345",
      gstin: "27AAACG1234F1Z5"
    },
    {
      id: "m-csg-2",
      name: "Mahalaxmi Textiles Ltd",
      address: "Gat No 104, Ichalkaranji, Kolhapur",
      mobile: "9822098765",
      gstin: "27CCCPM9012J1Z3"
    }
  ],
  consignees: [
    {
      id: "m-csne-1",
      name: "Sangli General Traders",
      address: "Market Yard, Shop No 18, Sangli",
      mobile: "9890011223",
      gstin: "27BBBPS5678K1Z9"
    },
    {
      id: "m-csne-2",
      name: "Kohinoor Hardware Mart",
      address: "Crawford Market, Fort, Mumbai",
      mobile: "9890044556",
      gstin: "27EEEKH7890M1Z8"
    },
    {
      id: "m-csne-3",
      name: "Solapur Fabrics & Sons",
      address: "Station Road, Solapur",
      mobile: "9890077889",
      gstin: "27FFFSS2345N1Z4"
    }
  ],
  vehicles: [
    {
      id: "m-veh-1",
      vehicleNo: "MH 09 CA 4589",
      address: "Kolhapur Road, Sangli",
      mobile: "9422011223",
      ownerName: "Mahalaxmi Logistics Fleet"
    },
    {
      id: "m-veh-2",
      vehicleNo: "MH 12 AB 9988",
      address: "MIDC Chinchwad, Pune",
      mobile: "9422044556",
      ownerName: "Shree Transport Co."
    }
  ],
  stations: [
    { id: "m-stn-1", name: "SANGLI" },
    { id: "m-stn-2", name: "MUMBAI" },
    { id: "m-stn-3", name: "PUNE" },
    { id: "m-stn-4", name: "KOLHAPUR" },
    { id: "m-stn-5", name: "SOLAPUR" },
    { id: "m-stn-6", name: "NAGPUR" },
    { id: "m-stn-7", name: "SURAT" },
    { id: "m-stn-8", name: "AHMEDABAD" }
  ],
  deliveryPersons: [
    {
      id: "m-dp-1",
      name: "Vikas Patil",
      address: "Gaon Bhag, Sangli",
      mobile: "9765012345"
    },
    {
      id: "m-dp-2",
      name: "Rahul Shinde",
      address: "Market Yard, Sangli",
      mobile: "9765067890"
    }
  ],
  drivers: [
    {
      id: "m-drv-1",
      name: "Ramesh Pawar",
      address: "Vishrambag, Sangli",
      mobile: "9823011122"
    },
    {
      id: "m-drv-2",
      name: "Suresh Kadam",
      address: "Shivaji Nagar, Pune",
      mobile: "9823033344"
    }
  ],
  transporters: [
    {
      id: "m-tsp-1",
      name: "Shree 1 Transporter",
      address: "Transport Nagar, Pune",
      mobile: "9850012345",
      gstin: "27AAAAA1111A1Z1"
    },
    {
      id: "m-tsp-2",
      name: "Mahalaxmi 2 Freight",
      address: "Market Yard, Sangli",
      mobile: "9850067890",
      gstin: "27BBBBB2222B1Z2"
    },
    {
      id: "m-tsp-3",
      name: "Mahalaxmi 3 Express",
      address: "Station Road, Kolhapur",
      mobile: "9850099999",
      gstin: "27CCCCC3333C1Z3"
    }
  ]
};

