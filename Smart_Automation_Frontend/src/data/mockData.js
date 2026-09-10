// src/data/mockData.js
// All data below is static mock data for front-end demo purposes only.

export const extractedFields = [
  { field: 'MRP (incl. of all taxes)', value: '₹120.00', confidence: 98.7, status: 'valid' },
  { field: 'Net Quantity', value: '500 g', confidence: 99.1, status: 'valid' },
  { field: 'Batch No.', value: 'A1234', confidence: 98.3, status: 'valid' },
  { field: 'Packed Date', value: '01/04/2024', confidence: 97.6, status: 'valid' },
  { field: 'Expiry Date', value: '31/03/2025', confidence: 96.9, status: 'valid' },
  { field: 'FSSAI License No.', value: '10012022001031', confidence: 96.2, status: 'valid' },
  { field: 'Manufacturer Name', value: '—', confidence: 0, status: 'missing' },
  { field: 'FSSAI Logo', value: 'Not Detected', confidence: 0, status: 'missing' },
]

export const stats = [
  { label: 'Total Scans', value: '24,532', delta: '+18.6%', deltaDir: 'up', vs: 'vs Apr 2025' },
  { label: 'Violations Found', value: '5,640', delta: '+12.4%', deltaDir: 'up', vs: 'vs Apr 2025' },
  { label: 'Compliance Rate', value: '76.98%', delta: '+6.3%', deltaDir: 'up', vs: 'vs Apr 2025' },
  { label: 'Pending Review', value: '2,345', delta: '-5.3%', deltaDir: 'down', vs: 'vs Apr 2025' },
]

export const violationsOverTime = [
  { date: '1 May', value: 620 }, { date: '3 May', value: 780 }, { date: '6 May', value: 690 },
  { date: '9 May', value: 940 }, { date: '11 May', value: 1080 }, { date: '13 May', value: 860 },
  { date: '16 May', value: 1220 }, { date: '18 May', value: 1150 }, { date: '21 May', value: 1480 },
  { date: '23 May', value: 1360 }, { date: '26 May', value: 1640 }, { date: '28 May', value: 1520 },
  { date: '31 May', value: 1790 },
]

export const productCategories = [
  { name: 'Food & Beverages', value: 45, color: '#3b82f6' },
  { name: 'FMCG', value: 25, color: '#22c55e' },
  { name: 'Pharmaceuticals', value: 15, color: '#f5a524' },
  { name: 'Agri Products', value: 10, color: '#a855f7' },
  { name: 'Others', value: 5, color: '#64748b' },
]

export const recentViolations = [
  { id: 1, product: 'Turmeric Powder 500g', brand: 'Spice Trail', type: 'Missing FSSAI Logo', location: 'Mumbai, MH', date: '31 May 2025', severity: 'High', action: 'Open' },
  { id: 2, product: 'Sunflower Oil 1L', brand: 'Healthy Life', type: 'MRP Not Declared', location: 'Pune, MH', date: '30 May 2025', severity: 'Medium', action: 'Open' },
  { id: 3, product: 'Basmati Rice 5kg', brand: 'Golden Harvest', type: 'Expiry Date Missing', location: 'Nagpur, MH', date: '29 May 2025', severity: 'High', action: 'Open' },
  { id: 4, product: 'Chilli Powder 200g', brand: 'Spice Trail', type: 'Net Quantity Mismatch', location: 'Nashik, MH', date: '28 May 2025', severity: 'Medium', action: 'In Review' },
  { id: 5, product: 'Shampoo 200ml', brand: 'Silky Soft', type: 'Manufacturer Name Missing', location: 'Thane, MH', date: '27 May 2025', severity: 'Low', action: 'Closed' },
]

export const industries = [
  { name: 'Food & Beverages' }, { name: 'FMCG' }, { name: 'Pharmaceuticals' },
  { name: 'Agri Products' }, { name: 'Chemicals' }, { name: 'Consumer Goods' },
]

export const features = [
  { title: 'AI-Powered OCR', desc: 'Advanced OCR engine extracts text from any packaging with unmatched accuracy.' },
  { title: 'Compliance Validation', desc: 'Auto-validates data against legal standards and flags non-compliance instantly.' },
  { title: 'Instant Results', desc: 'Get structured results in seconds, not minutes.' },
  { title: 'Audit Ready Reports', desc: 'Download and share compliance reports that are audit and inspection ready.' },
]

export const trustedByLogos = ['Nutrivo', 'Harvest & Co.', 'Meridian Foods', 'Sundrop Mills', 'Verdant Agro', 'Northfield Retail']