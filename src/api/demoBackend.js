import QRCode from 'qrcode';
import { calculateLeasing } from '../utils/leasing.js';

const STORAGE_KEY = 'sithumsa_demo_db_v1';

function nowIso() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function round2(n) {
  return Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
}

function createSeedState() {
  const today = todayIso();
  const created = nowIso();
  return {
    nextId: {
      vehicle: 6,
      photo: 10,
      invoice: 2,
      payment: 2,
      exchange: 2,
      review: 4,
      inquiry: 2,
      expense: 2,
      audit: 3,
    },
    auth: {
      authenticated: false,
      username: 'Sithum',
      twoFactorEnabled: false,
      totpSecret: '',
    },
    business: {
      id: 1,
      business_name: 'Sithumsa Enterprise',
      tagline: 'Wholesale & Retail Cars, SUVs, Instant Leasing & Fair Vehicle Exchange',
      about_text:
        'Trusted automotive dealership specializing in inspected used & brand-new vehicles, wholesale dealer supply, flexible same-day leasing, and transparent trade-in exchanges.',
      registration_no: 'BR-SE-2026-0148',
      phone: '+94 77 000 0000',
      whatsapp_number: '+94 77 000 0000',
      email: 'sales@sithumsa.example',
      address: 'No. 142 High Level Road, Colombo',
      opening_hours: 'Mon – Sat: 8:30 AM – 6:30 PM | Sun: 9:30 AM – 4:00 PM',
      currency_code: 'LKR',
      currency_symbol: 'Rs.',
      default_interest_rate: 13.5,
      default_down_payment_pct: 25,
      default_lease_months: 48,
      default_tax_pct: 0,
      invoice_footer_note:
        'Thank you for choosing Sithumsa Enterprise. All vehicles undergo 120-point mechanical & document inspection prior to handover.',
    },
    vehicles: [
      {
        id: 1,
        stock_code: 'SE-SUV-101',
        title: 'Toyota RAV4 Hybrid AWD Limited',
        make: 'Toyota',
        model: 'RAV4 Hybrid',
        year: 2024,
        condition: 'Reconditioned',
        category: 'SUV',
        status: 'Available',
        retail_price: 24500000,
        wholesale_price: 23400000,
        cost_price: 21800000,
        expenses_total: 350000,
        mileage_km: 14200,
        fuel_type: 'Hybrid',
        transmission: 'CVT',
        engine_cc: '2,500 cc Hybrid',
        color: 'Pearl White',
        vin_chassis: 'JTMB63FV00D108942',
        registration_no: 'Unregistered',
        seats: 5,
        features: '360° Camera, Panoramic Sunroof, JBL Audio, Power Tailgate, Adaptive Cruise Control, Leather Heated Seats',
        description:
          'Auction Grade 5A showroom-condition RAV4 Hybrid AWD. Available for retail purchase, dealer wholesale, or instant 48-month leasing with trade-in support.',
        featured: 1,
        leasing_eligible: 1,
        exchange_eligible: 1,
        photos: [{ id: 1, vehicle_id: 1, url: './images/lux-suv.jpg', is_primary: 1, sort_order: 0 }],
      },
      {
        id: 2,
        stock_code: 'SE-CAR-102',
        title: 'Honda Civic e:HEV RS Sport',
        make: 'Honda',
        model: 'Civic e:HEV',
        year: 2025,
        condition: 'Brand New',
        category: 'Hybrid / EV',
        status: 'Available',
        retail_price: 18900000,
        wholesale_price: 18100000,
        cost_price: 16900000,
        expenses_total: 220000,
        mileage_km: 45,
        fuel_type: 'Hybrid',
        transmission: 'CVT',
        engine_cc: '2,000 cc e:HEV',
        color: 'Sonic Silver Metallic',
        vin_chassis: 'JHMFE4880SS204119',
        registration_no: 'Brand New',
        seats: 5,
        features: 'Bose 12-Speaker Sound, Honda Sensing, Digital Cockpit, Wireless CarPlay, Dual-Zone Climate, LED Matrix Headlights',
        description:
          'Zero-mileage brand new executive hybrid sedan combining 22+ km/L fuel efficiency with crisp sport handling and full warranty.',
        featured: 1,
        leasing_eligible: 1,
        exchange_eligible: 1,
        photos: [{ id: 2, vehicle_id: 2, url: './images/lux-sedan.jpg', is_primary: 1, sort_order: 0 }],
      },
      {
        id: 3,
        stock_code: 'SE-TRK-103',
        title: 'Toyota Hilux Rocco 4x4 Double Cab',
        make: 'Toyota',
        model: 'Hilux Rocco',
        year: 2023,
        condition: 'Used',
        category: 'Pickup / Truck',
        status: 'Available',
        retail_price: 21200000,
        wholesale_price: 20300000,
        cost_price: 18900000,
        expenses_total: 310000,
        mileage_km: 31500,
        fuel_type: 'Diesel',
        transmission: 'Automatic',
        engine_cc: '2,800 cc Turbo Diesel',
        color: 'Graphite Grey Metallic',
        vin_chassis: 'MR0HA3CD400441289',
        registration_no: 'WP CBI-8421',
        seats: 5,
        features: '4WD High/Low Range, Diff Lock, Matte Black Canopy Bar, 18" Alloy Wheels, Touchscreen Navigation, Reverse Camera',
        description:
          'Single-owner serviced Hilux Rocco 4x4 with full company service records. Ideal for commercial fleets, wholesale buyers, or weekend utility.',
        featured: 1,
        leasing_eligible: 1,
        exchange_eligible: 1,
        photos: [{ id: 3, vehicle_id: 3, url: './images/lux-pickup.jpg', is_primary: 1, sort_order: 0 }],
      },
      {
        id: 4,
        stock_code: 'SE-EV-104',
        title: 'BYD Atto 3 Extended Range SUV',
        make: 'BYD',
        model: 'Atto 3',
        year: 2025,
        condition: 'Brand New',
        category: 'Hybrid / EV',
        status: 'Available',
        retail_price: 14800000,
        wholesale_price: 14100000,
        cost_price: 13200000,
        expenses_total: 180000,
        mileage_km: 18,
        fuel_type: 'Electric',
        transmission: 'Automatic',
        engine_cc: '60.4 kWh Blade Battery',
        color: 'Obsidian Midnight',
        vin_chassis: 'LC0CE4CB8S0192837',
        registration_no: 'Brand New',
        seats: 5,
        features: '420 km WLTP Range, Rotating 15.6" Display, Panoramic Sunroof, ADAS Suite, 7kW Home Charger Included, V2L Power',
        description:
          'Next-generation pure electric SUV with Blade Battery safety architecture. Special low-down-payment green leasing packages available.',
        featured: 1,
        leasing_eligible: 1,
        exchange_eligible: 1,
        photos: [{ id: 4, vehicle_id: 4, url: './images/vehicle-ev.svg', is_primary: 1, sort_order: 0 }],
      },
      {
        id: 5,
        stock_code: 'SE-CAR-105',
        title: 'Suzuki Swift RS Hybrid Turbo',
        make: 'Suzuki',
        model: 'Swift RS',
        year: 2022,
        condition: 'Used',
        category: 'Car',
        status: 'Available',
        retail_price: 8950000,
        wholesale_price: 8450000,
        cost_price: 7900000,
        expenses_total: 140000,
        mileage_km: 38400,
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        engine_cc: '1,200 cc Mild Hybrid',
        color: 'Crimson Pearl',
        vin_chassis: 'ZC83S-418205',
        registration_no: 'WP CBL-5190',
        seats: 5,
        features: 'Paddle Shifters, Keyless Push Start, Adaptive Cruise, Lane Keep Assist, Alloy Wheels, Apple CarPlay',
        description:
          'Clean, fuel-efficient daily hatchback ready for immediate cash sale, exchange trade-in, or affordable monthly leasing.',
        featured: 0,
        leasing_eligible: 1,
        exchange_eligible: 1,
        photos: [{ id: 5, vehicle_id: 5, url: './images/vehicle-hatch.svg', is_primary: 1, sort_order: 0 }],
      },
    ],
    reviews: [
      {
        id: 1,
        customer_name: 'Kasun & Dilani Perera',
        vehicle_purchased: '2024 Toyota RAV4 Hybrid AWD',
        rating: 5,
        comment:
          'Traded in our 2018 sedan via WhatsApp photos in the morning and drove away in our RAV4 by evening. Transparent valuation and super fast leasing paperwork!',
        photo_url: './images/customer-handover-1.svg',
        delivery_date: '2026-10-18',
        is_handover: 1,
        published: 1,
        created_at: created,
      },
      {
        id: 2,
        customer_name: 'Nuwan Jayasuriya (AutoTrade Partners)',
        vehicle_purchased: '2023 Toyota Hilux Rocco (Wholesale Lot)',
        rating: 5,
        comment:
          'Reliable wholesale partner. Vehicle inspection sheets, chassis numbers, and POS invoice documentation were accurate and ready on arrival.',
        photo_url: './images/customer-handover-2.svg',
        delivery_date: '2026-11-02',
        is_handover: 1,
        published: 1,
        created_at: created,
      },
      {
        id: 3,
        customer_name: 'Roshan Fernando',
        vehicle_purchased: '2025 Honda Civic e:HEV RS',
        rating: 5,
        comment:
          'The online leasing calculator matched the exact final monthly installment at the showroom. Zero hidden charges and genuine friendly service.',
        photo_url: '',
        delivery_date: '2026-11-12',
        is_handover: 0,
        published: 1,
        created_at: created,
      },
    ],
    invoices: [
      {
        id: 1,
        invoice_number: 'INV-2026-0001',
        sale_type: 'Cash Sale',
        payment_method: 'Bank Transfer',
        payment_status: 'Paid',
        customer_name: 'Kasun Perera (Sample)',
        customer_phone: '+94 77 222 3344',
        customer_nic: '199123400123',
        customer_email: 'kasun@example.com',
        customer_address: 'Colombo 05',
        vehicle_id: null,
        vehicle_snapshot_title: '2023 Toyota Corolla Cross Hybrid (Sample Sold)',
        vehicle_snapshot_specs: 'Automatic • Hybrid • Reconditioned',
        vehicle_price: 17500000,
        line_items: [{ label: 'RMV Registration & Full Detailing', qty: 1, unit_price: 150000, line_total: 150000 }],
        extras_total: 150000,
        subtotal: 17650000,
        discount_amount: 150000,
        trade_in_vehicle: '',
        trade_in_credit: 0,
        tax_pct: 0,
        tax_amount: 0,
        grand_total: 17500000,
        amount_paid: 17500000,
        balance_due: 0,
        lease_company: '',
        lease_interest_rate: 0,
        lease_months: 0,
        lease_monthly_emi: 0,
        notes: 'Sample completed showroom invoice for demonstration.',
        created_by: 'Sithum',
        cost_snapshot: 15900000,
        net_sales: 17500000,
        created_at: `${today} 10:15:00`,
      },
    ],
    invoicePayments: [
      {
        id: 1,
        invoice_id: 1,
        amount: 17500000,
        payment_method: 'Bank Transfer',
        note: 'Full settlement on delivery',
        recorded_by: 'Sithum',
        paid_at: `${today} 10:15:00`,
      },
    ],
    exchanges: [
      {
        id: 1,
        reference_code: 'EX-2026-DEMO01',
        customer_name: 'Nimali Jayawardena (Sample)',
        customer_phone: '+94 77 444 5566',
        old_make: 'Toyota',
        old_model: 'Aqua G Grade',
        old_year: 2018,
        old_mileage_km: 64000,
        old_condition: 'Good',
        expected_price: 7800000,
        target_vehicle_id: 1,
        target_vehicle_title: 'Toyota RAV4 Hybrid AWD Limited (SE-SUV-101)',
        notes: 'Single owner, company maintained. Looking to upgrade to RAV4.',
        photos: ['./images/lux-sedan.jpg'],
        status: 'New',
        owner_valuation: 0,
        owner_notes: '',
        created_at: created,
      },
    ],
    inquiries: [
      {
        id: 1,
        kind: 'Test Drive / Viewing',
        customer_name: 'Dinesh Wijeratne (Sample)',
        customer_phone: '+94 77 999 1122',
        vehicle_id: 2,
        vehicle_title: '2025 Honda Civic e:HEV RS Sport (SE-CAR-102)',
        preferred_time: 'Saturday 10:30 AM',
        message: 'Would like to inspect and discuss 48-month lease options.',
        status: 'New',
        created_at: created,
      },
    ],
    expenses: [
      {
        id: 1,
        expense_date: today,
        category: 'Rent',
        amount: 250000,
        note: 'Sample Showroom Facility & Utilities',
        created_at: created,
      },
    ],
    backups: [{ name: `sithumsa-${today}.db`, size: 98304, modified: new Date().toISOString() }],
    auditLogs: [
      { id: 1, username: 'Sithum', action: 'DEMO_INITIALIZED', detail: 'Static browser demo loaded', ip: 'browser-demo', created_at: created },
      { id: 2, username: 'Sithum', action: 'POST /invoices', detail: 'invoice=INV-2026-0001, total=17500000', ip: 'browser-demo', created_at: created },
    ],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback to fresh seed
  }
  const seed = createSeedState();
  saveState(seed);
  return seed;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    throw new Error('Browser demo storage is full. Please delete old photos or click Reset Demo Data.');
  }
}

export function resetDemoData() {
  const fresh = createSeedState();
  saveState(fresh);
  return fresh;
}

export function getDemoStateSnapshot() {
  return loadState();
}

function logAudit(state, action, detail = '') {
  const id = state.nextId.audit++;
  state.auditLogs.unshift({
    id,
    username: state.auth.username || 'Sithum',
    action,
    detail: String(detail).slice(0, 300),
    ip: 'browser-demo',
    created_at: nowIso(),
  });
  if (state.auditLogs.length > 200) state.auditLogs.length = 200;
}

async function fileToCompactDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read uploaded image.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(String(reader.result));
      img.onload = () => {
        const maxW = 900;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function parseFormDataEntries(fd) {
  const fields = {};
  const files = [];
  for (const [k, v] of fd.entries()) {
    if (v instanceof File) {
      if (v.size > 0) files.push({ field: k, file: v });
    } else {
      fields[k] = v;
    }
  }
  return { fields, files };
}

const CURRENCY_SYMBOLS = {
  LKR: 'Rs.',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  AED: 'AED',
};

export async function demoRequest(url, options = {}) {
  const { method = 'GET', body, isFormData = false } = options;
  const upperMethod = method.toUpperCase();
  const [pathname, queryStr = ''] = url.split('?');
  const params = new URLSearchParams(queryStr);

  const state = loadState();
  let parsedBody = body;
  let uploadedFiles = [];
  if (isFormData && body instanceof FormData) {
    const parsed = parseFormDataEntries(body);
    parsedBody = parsed.fields;
    uploadedFiles = parsed.files;
  }

  // ---- AUTH ----
  if (pathname === '/api/auth/status' && upperMethod === 'GET') {
    return {
      needsSetup: false,
      authenticated: state.auth.authenticated,
      user: state.auth.authenticated
        ? {
            username: state.auth.username,
            role: 'owner',
            twoFactorEnabled: state.auth.twoFactorEnabled,
          }
        : null,
      csrfToken: state.auth.authenticated ? 'demo-csrf-token' : null,
    };
  }

  if ((pathname === '/api/auth/login' || pathname === '/api/auth/setup') && upperMethod === 'POST') {
    state.auth.authenticated = true;
    if (parsedBody?.username?.trim()) state.auth.username = parsedBody.username.trim();
    logAudit(state, 'DEMO_LOGIN_SUCCESS', `user=${state.auth.username}`);
    saveState(state);
    return {
      authenticated: true,
      user: {
        username: state.auth.username,
        role: 'owner',
        twoFactorEnabled: state.auth.twoFactorEnabled,
      },
      csrfToken: 'demo-csrf-token',
    };
  }

  if ((pathname === '/api/auth/logout' || pathname === '/api/auth/logout-all') && upperMethod === 'POST') {
    state.auth.authenticated = false;
    logAudit(state, pathname.endsWith('all') ? 'LOGOUT_ALL_DEVICES' : 'LOGOUT');
    saveState(state);
    return { ok: true };
  }

  if (pathname === '/api/auth/change-password' && upperMethod === 'POST') {
    logAudit(state, 'PASSWORD_CHANGED_DEMO');
    saveState(state);
    return { ok: true, csrfToken: 'demo-csrf-token' };
  }

  if (pathname === '/api/auth/2fa/setup' && upperMethod === 'POST') {
    const secret = 'JBSWY3DPEHPK3PXP';
    state.auth.totpSecret = secret;
    const uri = `otpauth://totp/Sithumsa%20Enterprise:${encodeURIComponent(state.auth.username)}?secret=${secret}&issuer=Sithumsa%20Enterprise`;
    const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220 });
    saveState(state);
    return { secret, uri, qr };
  }

  if (pathname === '/api/auth/2fa/enable' && upperMethod === 'POST') {
    state.auth.twoFactorEnabled = true;
    logAudit(state, '2FA_ENABLED_DEMO');
    saveState(state);
    return {
      ok: true,
      recoveryCodes: ['A1B2C-D3E4F', 'F5E4D-3C2B1', '98A7B-65C4D', '11AA2-2BB33', '44CC5-5DD66', '77EE8-8FF99', '12345-ABCDE', '67890-FGHIJ'],
    };
  }

  if (pathname === '/api/auth/2fa/disable' && upperMethod === 'POST') {
    state.auth.twoFactorEnabled = false;
    state.auth.totpSecret = '';
    logAudit(state, '2FA_DISABLED_DEMO');
    saveState(state);
    return { ok: true };
  }

  // ---- PUBLIC ----
  if (pathname === '/api/public/bootstrap' && upperMethod === 'GET') {
    const publicVehicles = state.vehicles
      .filter((v) => v.status !== 'Sold')
      .map(({ cost_price, expenses_total, ...pub }) => pub);
    const soldCount = state.vehicles.filter((v) => v.status === 'Sold').length + state.invoices.filter((i) => i.payment_status !== 'Void').length;
    return {
      business: state.business,
      vehicles: publicVehicles,
      reviews: state.reviews.filter((r) => r.published),
      soldCount,
    };
  }

  if (pathname === '/api/public/exchanges' && upperMethod === 'POST') {
    const photos = [];
    for (const f of uploadedFiles.slice(0, 5)) {
      photos.push(await fileToCompactDataUrl(f.file));
    }
    const targetId = parsedBody?.target_vehicle_id ? Number(parsedBody.target_vehicle_id) : null;
    const targetVeh = targetId ? state.vehicles.find((v) => v.id === targetId) : null;
    const targetTitle = targetVeh ? `${targetVeh.title} (${targetVeh.stock_code})` : '';
    const refCode = `EX-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const newItem = {
      id: state.nextId.exchange++,
      reference_code: refCode,
      customer_name: String(parsedBody.customer_name || '').trim(),
      customer_phone: String(parsedBody.customer_phone || '').trim(),
      old_make: String(parsedBody.old_make || '').trim(),
      old_model: String(parsedBody.old_model || '').trim(),
      old_year: Number(parsedBody.old_year || new Date().getFullYear()),
      old_mileage_km: Number(parsedBody.old_mileage_km || 0),
      old_condition: parsedBody.old_condition || 'Good',
      expected_price: Number(parsedBody.expected_price || 0),
      target_vehicle_id: targetId,
      target_vehicle_title: targetTitle,
      notes: String(parsedBody.notes || '').trim(),
      photos,
      status: 'New',
      owner_valuation: 0,
      owner_notes: '',
      created_at: nowIso(),
    };
    state.exchanges.unshift(newItem);
    saveState(state);
    return { id: newItem.id, reference_code: refCode, photos, target_vehicle_title: targetTitle };
  }

  if (pathname === '/api/public/reviews' && upperMethod === 'POST') {
    const rev = {
      id: state.nextId.review++,
      customer_name: String(parsedBody.customer_name || '').trim(),
      vehicle_purchased: String(parsedBody.vehicle_purchased || '').trim(),
      rating: Number(parsedBody.rating || 5),
      comment: String(parsedBody.comment || '').trim(),
      photo_url: '',
      delivery_date: todayIso(),
      is_handover: 0,
      published: 0,
      created_at: nowIso(),
    };
    state.reviews.unshift(rev);
    saveState(state);
    return { id: rev.id, message: 'Thank you! Review submitted — approve it inside Owner -> Reviews & Photos.' };
  }

  if (pathname === '/api/public/inquiries' && upperMethod === 'POST') {
    const vid = parsedBody.vehicle_id ? Number(parsedBody.vehicle_id) : null;
    const veh = vid ? state.vehicles.find((v) => v.id === vid) : null;
    const vehicle_title = veh ? `${veh.year} ${veh.title} (${veh.stock_code})` : '';
    const inq = {
      id: state.nextId.inquiry++,
      kind: parsedBody.kind || 'Test Drive / Viewing',
      customer_name: String(parsedBody.customer_name || '').trim(),
      customer_phone: String(parsedBody.customer_phone || '').trim(),
      vehicle_id: vid,
      vehicle_title,
      preferred_time: String(parsedBody.preferred_time || '').trim(),
      message: String(parsedBody.message || '').trim(),
      status: 'New',
      created_at: nowIso(),
    };
    state.inquiries.unshift(inq);
    saveState(state);
    return { id: inq.id, vehicle_title, message: 'VIP inquiry saved to Owner -> VIP Leads!' };
  }

  // ---- ADMIN DASHBOARD & SETTINGS ----
  if (pathname === '/api/admin/dashboard' && upperMethod === 'GET') {
    const nonVoidInvoices = state.invoices.filter((i) => i.payment_status !== 'Void');
    return {
      vehicles: {
        total_vehicles: state.vehicles.length,
        available_count: state.vehicles.filter((v) => v.status === 'Available').length,
        reserved_count: state.vehicles.filter((v) => v.status === 'Reserved').length,
        sold_count: state.vehicles.filter((v) => v.status === 'Sold').length,
        wholesale_only_count: state.vehicles.filter((v) => v.status === 'Wholesale Only').length,
        inventory_retail_value: state.vehicles.filter((v) => v.status !== 'Sold').reduce((s, v) => s + Number(v.retail_price || 0), 0),
      },
      invoices: {
        total_invoices: state.invoices.length,
        total_sales_value: nonVoidInvoices.reduce((s, i) => s + Number(i.grand_total || 0), 0),
        total_collected: nonVoidInvoices.reduce((s, i) => s + Number(i.amount_paid || 0), 0),
        total_receivable: nonVoidInvoices.reduce((s, i) => s + Number(i.balance_due || 0), 0),
        gross_profit: nonVoidInvoices.reduce((s, i) => s + (Number(i.net_sales || 0) - Number(i.cost_snapshot || 0)), 0),
      },
      exchanges: {
        total_exchanges: state.exchanges.length,
        new_exchanges: state.exchanges.filter((e) => e.status === 'New').length,
      },
      inquiries: {
        total_inquiries: state.inquiries.length,
        new_inquiries: state.inquiries.filter((i) => i.status === 'New').length,
      },
      reviews: {
        total_reviews: state.reviews.length,
        published_reviews: state.reviews.filter((r) => r.published).length,
        pending_reviews: state.reviews.filter((r) => !r.published).length,
      },
      monthlyTrend: (() => {
        const now = new Date();
        const buckets = new Map();
        for (let i = 5; i >= 0; i -= 1) {
          const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
          const ym = d.toISOString().slice(0, 7);
          buckets.set(ym, { month: ym, net_sales: 0, gross_profit: 0, invoice_count: 0 });
        }
        for (const inv of nonVoidInvoices) {
          const ym = String(inv.created_at || '').slice(0, 7);
          const b = buckets.get(ym);
          if (b) {
            const net = Number(inv.net_sales || 0);
            b.net_sales += net;
            b.gross_profit += net - Number(inv.cost_snapshot || 0);
            b.invoice_count += 1;
          }
        }
        return Array.from(buckets.values());
      })(),
      recentInvoices: state.invoices.slice(0, 5),
      recentExchanges: state.exchanges.slice(0, 5),
    };
  }

  if (pathname === '/api/admin/business') {
    if (upperMethod === 'GET') return { business: state.business };
    if (upperMethod === 'PUT') {
      const code = parsedBody.currency_code || state.business.currency_code;
      state.business = {
        ...state.business,
        ...parsedBody,
        currency_code: code,
        currency_symbol: CURRENCY_SYMBOLS[code] || code,
      };
      logAudit(state, 'PUT /business', `name=${state.business.business_name}`);
      saveState(state);
      return { business: state.business };
    }
  }

  // ---- ADMIN VEHICLES ----
  if (pathname === '/api/admin/vehicles') {
    if (upperMethod === 'GET') return { vehicles: state.vehicles };
    if (upperMethod === 'POST') {
      const id = state.nextId.vehicle++;
      const stockCode = parsedBody.stock_code?.trim() || `SE-VEH-${100 + id}`;
      const veh = {
        id,
        ...parsedBody,
        stock_code: stockCode,
        featured: parsedBody.featured ? 1 : 0,
        leasing_eligible: parsedBody.leasing_eligible === false ? 0 : 1,
        exchange_eligible: parsedBody.exchange_eligible === false ? 0 : 1,
        photos: [],
      };
      state.vehicles.unshift(veh);
      logAudit(state, 'POST /vehicles', `stock=${stockCode}`);
      saveState(state);
      return { vehicle: veh };
    }
  }

  const vehPhotoPrimaryMatch = /^\/api\/admin\/vehicles\/(\d+)\/photos\/(\d+)\/primary$/.exec(pathname);
  if (vehPhotoPrimaryMatch && upperMethod === 'PUT') {
    const vid = Number(vehPhotoPrimaryMatch[1]);
    const pid = Number(vehPhotoPrimaryMatch[2]);
    const veh = state.vehicles.find((v) => v.id === vid);
    if (!veh) throw new Error('Vehicle not found.');
    veh.photos = veh.photos.map((p) => ({ ...p, is_primary: p.id === pid ? 1 : 0 }));
    saveState(state);
    return { vehicle: veh };
  }

  const vehPhotoDelMatch = /^\/api\/admin\/vehicles\/(\d+)\/photos\/(\d+)$/.exec(pathname);
  if (vehPhotoDelMatch && upperMethod === 'DELETE') {
    const vid = Number(vehPhotoDelMatch[1]);
    const pid = Number(vehPhotoDelMatch[2]);
    const veh = state.vehicles.find((v) => v.id === vid);
    if (!veh) throw new Error('Vehicle not found.');
    veh.photos = veh.photos.filter((p) => p.id !== pid);
    if (veh.photos.length && !veh.photos.some((p) => p.is_primary)) {
      veh.photos[0].is_primary = 1;
    }
    saveState(state);
    return { vehicle: veh };
  }

  const vehPhotosMatch = /^\/api\/admin\/vehicles\/(\d+)\/photos$/.exec(pathname);
  if (vehPhotosMatch && upperMethod === 'POST') {
    const vid = Number(vehPhotosMatch[1]);
    const veh = state.vehicles.find((v) => v.id === vid);
    if (!veh) throw new Error('Vehicle not found.');
    for (const f of uploadedFiles) {
      const dataUrl = await fileToCompactDataUrl(f.file);
      veh.photos.push({
        id: state.nextId.photo++,
        vehicle_id: vid,
        url: dataUrl,
        is_primary: veh.photos.length === 0 ? 1 : 0,
        sort_order: veh.photos.length,
      });
    }
    saveState(state);
    return { vehicle: veh };
  }

  const vehIdMatch = /^\/api\/admin\/vehicles\/(\d+)$/.exec(pathname);
  if (vehIdMatch) {
    const vid = Number(vehIdMatch[1]);
    const idx = state.vehicles.findIndex((v) => v.id === vid);
    if (idx === -1) throw new Error('Vehicle not found.');
    if (upperMethod === 'PUT') {
      state.vehicles[idx] = {
        ...state.vehicles[idx],
        ...parsedBody,
        stock_code: parsedBody.stock_code?.trim() || state.vehicles[idx].stock_code,
        featured: parsedBody.featured ? 1 : 0,
        leasing_eligible: parsedBody.leasing_eligible === false ? 0 : 1,
        exchange_eligible: parsedBody.exchange_eligible === false ? 0 : 1,
      };
      logAudit(state, 'PUT /vehicles', `id=${vid}`);
      saveState(state);
      return { vehicle: state.vehicles[idx] };
    }
    if (upperMethod === 'DELETE') {
      const removed = state.vehicles[idx];
      state.vehicles.splice(idx, 1);
      logAudit(state, 'DELETE /vehicles', `stock=${removed.stock_code}`);
      saveState(state);
      return { ok: true };
    }
  }

  // ---- ADMIN INVOICES & PAYMENTS ----
  if (pathname === '/api/admin/invoices') {
    if (upperMethod === 'GET') return { invoices: state.invoices };
    if (upperMethod === 'POST') {
      const id = state.nextId.invoice++;
      const invNum = `INV-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`;
      const lineItems = (parsedBody.line_items || []).map((li) => ({
        label: li.label,
        qty: Number(li.qty || 1),
        unit_price: round2(li.unit_price),
        line_total: round2(Number(li.qty || 1) * Number(li.unit_price || 0)),
      }));
      const extrasTotal = round2(lineItems.reduce((s, li) => s + li.line_total, 0));
      const subtotal = round2(Number(parsedBody.vehicle_price || 0) + extrasTotal);
      const afterDiscount = Math.max(0, round2(subtotal - Number(parsedBody.discount_amount || 0)));
      const taxAmount = round2(afterDiscount * (Number(parsedBody.tax_pct || 0) / 100));
      const grandTotal = Math.max(0, round2(afterDiscount + taxAmount - Number(parsedBody.trade_in_credit || 0)));
      const amountPaid = Math.min(grandTotal, round2(Number(parsedBody.amount_paid || 0)));
      const balanceDue = Math.max(0, round2(grandTotal - amountPaid));
      const paymentStatus = balanceDue <= 0.01 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Pending';

      let costSnapshot = 0;
      if (parsedBody.vehicle_id) {
        const veh = state.vehicles.find((v) => v.id === Number(parsedBody.vehicle_id));
        if (veh) {
          costSnapshot = round2(Number(veh.cost_price || 0) + Number(veh.expenses_total || 0));
          if (parsedBody.mark_vehicle_sold !== false) {
            veh.status = 'Sold';
          }
        }
      }

      const leaseEmi =
        parsedBody.sale_type === 'Lease Sale' && Number(parsedBody.lease_months) > 0
          ? round2(
              calculateLeasing({
                vehiclePrice: balanceDue,
                downPaymentAmount: 0,
                annualInterestRate: parsedBody.lease_interest_rate,
                tenureMonths: parsedBody.lease_months,
              }).monthlyInstallment
            )
          : 0;

      const inv = {
        id,
        invoice_number: invNum,
        sale_type: parsedBody.sale_type,
        payment_method: parsedBody.payment_method,
        payment_status: paymentStatus,
        customer_name: parsedBody.customer_name,
        customer_phone: parsedBody.customer_phone,
        customer_nic: parsedBody.customer_nic || '',
        customer_email: parsedBody.customer_email || '',
        customer_address: parsedBody.customer_address || '',
        vehicle_id: parsedBody.vehicle_id || null,
        vehicle_snapshot_title: parsedBody.vehicle_snapshot_title,
        vehicle_snapshot_specs: parsedBody.vehicle_snapshot_specs || '',
        vehicle_price: round2(parsedBody.vehicle_price),
        line_items: lineItems,
        extras_total: extrasTotal,
        subtotal,
        discount_amount: round2(parsedBody.discount_amount),
        trade_in_vehicle: parsedBody.trade_in_vehicle || '',
        trade_in_credit: round2(parsedBody.trade_in_credit),
        tax_pct: Number(parsedBody.tax_pct || 0),
        tax_amount: taxAmount,
        grand_total: grandTotal,
        amount_paid: amountPaid,
        balance_due: balanceDue,
        lease_company: parsedBody.lease_company || '',
        lease_interest_rate: Number(parsedBody.lease_interest_rate || 0),
        lease_months: Number(parsedBody.lease_months || 0),
        lease_monthly_emi: leaseEmi,
        notes: parsedBody.notes || '',
        created_by: state.auth.username || 'Sithum',
        cost_snapshot: costSnapshot,
        net_sales: afterDiscount,
        created_at: nowIso(),
      };
      state.invoices.unshift(inv);
      if (amountPaid > 0) {
        state.invoicePayments.push({
          id: state.nextId.payment++,
          invoice_id: id,
          amount: amountPaid,
          payment_method: parsedBody.payment_method,
          note: 'Initial payment on invoice creation',
          recorded_by: state.auth.username || 'Sithum',
          paid_at: nowIso(),
        });
      }
      logAudit(state, 'POST /invoices', `invoice=${invNum}, total=${grandTotal}`);
      saveState(state);
      return { invoice: inv };
    }
  }

  const invPayPatch = /^\/api\/admin\/invoices\/(\d+)\/payment$/.exec(pathname);
  if (invPayPatch && upperMethod === 'PATCH') {
    const id = Number(invPayPatch[1]);
    const inv = state.invoices.find((i) => i.id === id);
    if (!inv) throw new Error('Invoice not found.');
    if (parsedBody?.void === true) {
      inv.payment_status = 'Void';
      logAudit(state, 'INVOICE_VOIDED', `invoice=${inv.invoice_number}`);
    } else {
      const nextPaid = Math.min(inv.grand_total, round2(parsedBody.amount_paid));
      inv.amount_paid = nextPaid;
      inv.balance_due = Math.max(0, round2(inv.grand_total - nextPaid));
      inv.payment_status = inv.balance_due <= 0.01 ? 'Paid' : nextPaid > 0 ? 'Partial' : 'Pending';
    }
    saveState(state);
    return { invoice: inv };
  }

  const invPaymentsMatch = /^\/api\/admin\/invoices\/(\d+)\/payments$/.exec(pathname);
  if (invPaymentsMatch) {
    const id = Number(invPaymentsMatch[1]);
    const inv = state.invoices.find((i) => i.id === id);
    if (!inv) throw new Error('Invoice not found.');
    if (upperMethod === 'GET') {
      return { payments: state.invoicePayments.filter((p) => p.invoice_id === id) };
    }
    if (upperMethod === 'POST') {
      const applied = Math.min(inv.balance_due, round2(parsedBody.amount));
      if (applied <= 0) throw new Error('Invoice is already paid in full.');
      inv.amount_paid = round2(inv.amount_paid + applied);
      inv.balance_due = Math.max(0, round2(inv.grand_total - inv.amount_paid));
      inv.payment_status = inv.balance_due <= 0.01 ? 'Paid' : 'Partial';
      state.invoicePayments.push({
        id: state.nextId.payment++,
        invoice_id: id,
        amount: applied,
        payment_method: parsedBody.payment_method || inv.payment_method,
        note: parsedBody.note || '',
        recorded_by: state.auth.username || 'Sithum',
        paid_at: nowIso(),
      });
      logAudit(state, 'INSTALLMENT_RECORDED', `invoice=${inv.invoice_number}, amount=${applied}`);
      saveState(state);
      return { invoice: inv, payments: state.invoicePayments.filter((p) => p.invoice_id === id) };
    }
  }

  // ---- ADMIN INQUIRIES ----
  if (pathname === '/api/admin/inquiries' && upperMethod === 'GET') {
    return { inquiries: state.inquiries };
  }
  const inqIdMatch = /^\/api\/admin\/inquiries\/(\d+)$/.exec(pathname);
  if (inqIdMatch) {
    const id = Number(inqIdMatch[1]);
    const idx = state.inquiries.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Lead not found.');
    if (upperMethod === 'PATCH') {
      state.inquiries[idx].status = parsedBody.status || state.inquiries[idx].status;
      saveState(state);
      return { inquiry: state.inquiries[idx] };
    }
    if (upperMethod === 'DELETE') {
      state.inquiries.splice(idx, 1);
      saveState(state);
      return { ok: true };
    }
  }

  // ---- ADMIN EXCHANGES ----
  if (pathname === '/api/admin/exchanges' && upperMethod === 'GET') {
    return { exchanges: state.exchanges };
  }
  const exIdMatch = /^\/api\/admin\/exchanges\/(\d+)$/.exec(pathname);
  if (exIdMatch) {
    const id = Number(exIdMatch[1]);
    const idx = state.exchanges.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Exchange request not found.');
    if (upperMethod === 'PATCH') {
      state.exchanges[idx] = { ...state.exchanges[idx], ...parsedBody };
      saveState(state);
      return { exchange: state.exchanges[idx] };
    }
    if (upperMethod === 'DELETE') {
      state.exchanges.splice(idx, 1);
      saveState(state);
      return { ok: true };
    }
  }

  // ---- ADMIN REVIEWS ----
  if (pathname === '/api/admin/reviews') {
    if (upperMethod === 'GET') return { reviews: state.reviews };
    if (upperMethod === 'POST') {
      let photoUrl = '';
      if (uploadedFiles.length > 0) {
        photoUrl = await fileToCompactDataUrl(uploadedFiles[0].file);
      }
      const rev = {
        id: state.nextId.review++,
        customer_name: String(parsedBody.customer_name || '').trim(),
        vehicle_purchased: String(parsedBody.vehicle_purchased || '').trim(),
        rating: Number(parsedBody.rating || 5),
        comment: String(parsedBody.comment || '').trim(),
        photo_url: photoUrl,
        delivery_date: parsedBody.delivery_date || todayIso(),
        is_handover: photoUrl ? 1 : 0,
        published: 1,
        created_at: nowIso(),
      };
      state.reviews.unshift(rev);
      logAudit(state, 'POST /reviews', `customer=${rev.customer_name}`);
      saveState(state);
      return { review: rev };
    }
  }
  const revIdMatch = /^\/api\/admin\/reviews\/(\d+)$/.exec(pathname);
  if (revIdMatch) {
    const id = Number(revIdMatch[1]);
    const idx = state.reviews.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Review not found.');
    if (upperMethod === 'PATCH') {
      state.reviews[idx].published = parsedBody.published ? 1 : 0;
      saveState(state);
      return { review: state.reviews[idx] };
    }
    if (upperMethod === 'DELETE') {
      state.reviews.splice(idx, 1);
      saveState(state);
      return { ok: true };
    }
  }

  // ---- ADMIN EXPENSES & REPORTS ----
  if (pathname === '/api/admin/expenses') {
    if (upperMethod === 'GET') return { expenses: state.expenses };
    if (upperMethod === 'POST') {
      const exp = {
        id: state.nextId.expense++,
        expense_date: parsedBody.expense_date || todayIso(),
        category: parsedBody.category || 'Other',
        amount: round2(parsedBody.amount),
        note: parsedBody.note || '',
        created_at: nowIso(),
      };
      state.expenses.unshift(exp);
      saveState(state);
      return { expense: exp };
    }
  }
  const expIdMatch = /^\/api\/admin\/expenses\/(\d+)$/.exec(pathname);
  if (expIdMatch && upperMethod === 'DELETE') {
    const id = Number(expIdMatch[1]);
    state.expenses = state.expenses.filter((e) => e.id !== id);
    saveState(state);
    return { ok: true };
  }

  if (pathname === '/api/admin/reports' && upperMethod === 'GET') {
    const today = todayIso();
    const from = params.get('from') || `${today.slice(0, 4)}-01-01`;
    const to = params.get('to') || today;

    const invoices = state.invoices
      .filter((i) => {
        const d = (i.created_at || '').slice(0, 10);
        return i.payment_status !== 'Void' && d >= from && d <= to;
      })
      .map((i) => {
        const net = Number(i.net_sales ?? Math.max(0, Number(i.subtotal || 0) - Number(i.discount_amount || 0)));
        const cost = Number(i.cost_snapshot || 0);
        return {
          ...i,
          sale_date: (i.created_at || '').slice(0, 10),
          net_sales: round2(net),
          gross_profit: round2(net - cost),
        };
      });

    const expenses = state.expenses.filter((e) => e.expense_date >= from && e.expense_date <= to);
    const netSales = round2(invoices.reduce((s, i) => s + i.net_sales, 0));
    const cogs = round2(invoices.reduce((s, i) => s + Number(i.cost_snapshot || 0), 0));
    const grossProfit = round2(netSales - cogs);
    const opEx = round2(expenses.reduce((s, e) => s + Number(e.amount || 0), 0));

    return {
      range: { from, to },
      summary: {
        invoices_count: invoices.length,
        net_sales: netSales,
        vehicle_cogs: cogs,
        gross_profit: grossProfit,
        operating_expenses: opEx,
        net_profit: round2(grossProfit - opEx),
        collected: round2(invoices.reduce((s, i) => s + Number(i.amount_paid || 0), 0)),
        receivable: round2(invoices.reduce((s, i) => s + Number(i.balance_due || 0), 0)),
      },
      invoices,
      expenses,
    };
  }

  // ---- BACKUPS & AUDIT ----
  if (pathname === '/api/admin/backups' && upperMethod === 'GET') {
    return { backups: state.backups };
  }
  if (pathname === '/api/admin/backups/snapshot' && upperMethod === 'POST') {
    const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
    state.backups.unshift({ name: `sithumsa-${stamp}.db`, size: 102400, modified: new Date().toISOString() });
    logAudit(state, 'MANUAL_BACKUP_SNAPSHOT', stamp);
    saveState(state);
    return { backups: state.backups };
  }
  if (pathname === '/api/admin/audit' && upperMethod === 'GET') {
    return { logs: state.auditLogs };
  }

  throw new Error(`Unsupported demo route: ${upperMethod} ${pathname}`);
}
