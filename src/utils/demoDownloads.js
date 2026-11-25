import { zipSync, strToU8 } from 'fflate';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getDemoStateSnapshot } from '../api/demoBackend.js';

const A4_W = 595.28;
const A4_H = 841.89;
const MX = 42;
const CW = A4_W - MX * 2;

const COL = {
  obsidian: rgb(11 / 255, 15 / 255, 23 / 255),
  slate800: rgb(30 / 255, 41 / 255, 59 / 255),
  slate600: rgb(71 / 255, 85 / 255, 105 / 255),
  slate400: rgb(148 / 255, 163 / 255, 184 / 255),
  slate200: rgb(226 / 255, 232 / 255, 240 / 255),
  slate50: rgb(248 / 255, 250 / 255, 252 / 255),
  gold: rgb(198 / 255, 154 / 255, 69 / 255),
  goldLight: rgb(253 / 255, 246 / 255, 226 / 255),
  emerald: rgb(5 / 255, 150 / 255, 105 / 255),
  white: rgb(1, 1, 1),
};

function safeWinAnsi(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/[\u2022\u25CF]/g, '-')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '?')
    .replace(/\s+/g, ' ')
    .trim();
}

function fmtMoney(amount, symbol = 'Rs.', decimals = 2) {
  const num = Number(amount || 0);
  const safe = Number.isFinite(num) ? num : 0;
  return safeWinAnsi(
    `${symbol} ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(safe)}`
  );
}

function drawRight(page, text, rightX, y, font, size, color = COL.obsidian) {
  const clean = safeWinAnsi(text);
  const w = font.widthOfTextAtSize(clean, size);
  page.drawText(clean, { x: rightX - w, y, size, font, color });
}

function wrapLines(text, font, size, maxW) {
  const clean = safeWinAnsi(text);
  if (!clean) return [];
  const words = clean.split(' ');
  const out = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) <= maxW) {
      cur = next;
    } else {
      if (cur) out.push(cur);
      cur = w;
    }
  }
  if (cur) out.push(cur);
  return out;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function drawBanner(page, fonts, business, rightTitle, rightSub, badge) {
  page.drawRectangle({ x: 0, y: A4_H - 106, width: A4_W, height: 106, color: COL.obsidian });
  page.drawRectangle({ x: 0, y: A4_H - 110, width: A4_W, height: 4, color: COL.gold });

  page.drawText(safeWinAnsi(business?.business_name || 'Sithumsa Enterprise'), {
    x: MX,
    y: A4_H - 38,
    size: 18,
    font: fonts.bold,
    color: COL.white,
  });
  page.drawText(safeWinAnsi(business?.tagline || '').slice(0, 66), {
    x: MX,
    y: A4_H - 54,
    size: 8.5,
    font: fonts.regular,
    color: COL.goldLight,
  });
  page.drawText(safeWinAnsi(business?.address || '').slice(0, 68), {
    x: MX,
    y: A4_H - 70,
    size: 8.5,
    font: fonts.regular,
    color: COL.slate200,
  });
  page.drawText(
    safeWinAnsi([business?.phone ? `Tel: ${business.phone}` : '', business?.email || ''].filter(Boolean).join(' | ')),
    { x: MX, y: A4_H - 84, size: 8, font: fonts.regular, color: COL.slate400 }
  );

  const rx = A4_W - MX;
  drawRight(page, rightTitle, rx, A4_H - 36, fonts.bold, 10, COL.goldLight);
  drawRight(page, rightSub, rx, A4_H - 56, fonts.bold, 15, COL.white);
  if (badge) {
    const clean = safeWinAnsi(badge);
    const bw = Math.max(70, fonts.bold.widthOfTextAtSize(clean, 8.5) + 18);
    page.drawRectangle({ x: rx - bw, y: A4_H - 84, width: bw, height: 18, color: COL.gold });
    const tw = fonts.bold.widthOfTextAtSize(clean, 8.5);
    page.drawText(clean, { x: rx - bw + (bw - tw) / 2, y: A4_H - 78, size: 8.5, font: fonts.bold, color: COL.obsidian });
  }
}

export async function downloadInvoicePdf(invoice, business) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([A4_W, A4_H]);
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const currency = business?.currency_symbol || 'Rs.';

  drawBanner(page, fonts, business, 'VEHICLE SALES INVOICE', invoice.invoice_number, `${invoice.sale_type} | ${invoice.payment_status}`);

  let y = A4_H - 134;
  const bw = (CW - 14) / 2;
  const bh = 86;
  page.drawRectangle({ x: MX, y: y - bh, width: bw, height: bh, color: COL.slate50, borderColor: COL.slate200, borderWidth: 1 });
  page.drawRectangle({ x: MX + bw + 14, y: y - bh, width: bw, height: bh, color: COL.slate50, borderColor: COL.slate200, borderWidth: 1 });

  page.drawText('BILLED TO (CUSTOMER)', { x: MX + 12, y: y - 16, size: 8, font: fonts.bold, color: COL.slate600 });
  page.drawText(safeWinAnsi(invoice.customer_name), { x: MX + 12, y: y - 32, size: 11, font: fonts.bold, color: COL.obsidian });
  [
    `Phone: ${safeWinAnsi(invoice.customer_phone)}`,
    invoice.customer_nic ? `NIC/ID: ${safeWinAnsi(invoice.customer_nic)}` : '',
    invoice.customer_address ? `Addr: ${safeWinAnsi(invoice.customer_address)}` : '',
  ]
    .filter(Boolean)
    .slice(0, 3)
    .forEach((line, idx) => {
      page.drawText(line.slice(0, 42), { x: MX + 12, y: y - 47 - idx * 12, size: 8.5, font: fonts.regular, color: COL.slate800 });
    });

  const rxBox = MX + bw + 26;
  page.drawText('TRANSACTION DETAILS', { x: rxBox, y: y - 16, size: 8, font: fonts.bold, color: COL.slate600 });
  [
    ['Invoice Date:', safeWinAnsi((invoice.created_at || '').slice(0, 10))],
    ['Payment Method:', safeWinAnsi(invoice.payment_method)],
    ['Prepared By:', safeWinAnsi(invoice.created_by || 'Owner')],
    invoice.trade_in_vehicle ? ['Trade-In:', safeWinAnsi(invoice.trade_in_vehicle).slice(0, 24)] : null,
  ]
    .filter(Boolean)
    .forEach(([k, v], idx) => {
      const ry = y - 32 - idx * 13;
      page.drawText(k, { x: rxBox, y: ry, size: 8.5, font: fonts.regular, color: COL.slate600 });
      drawRight(page, v, MX + CW - 12, ry, fonts.bold, 8.5, COL.obsidian);
    });

  y -= bh + 20;
  page.drawRectangle({ x: MX, y: y - 24, width: CW, height: 24, color: COL.obsidian });
  page.drawText('Description / Vehicle Specifications', { x: MX + 10, y: y - 16, size: 8.5, font: fonts.bold, color: COL.white });
  page.drawText('Qty', { x: MX + 318, y: y - 16, size: 8.5, font: fonts.bold, color: COL.white });
  drawRight(page, 'Unit Amount', MX + 425, y - 16, fonts.bold, 8.5, COL.white);
  drawRight(page, 'Line Total', MX + CW - 10, y - 16, fonts.bold, 8.5, COL.white);
  y -= 24;

  const rows = [
    { title: invoice.vehicle_snapshot_title, sub: invoice.vehicle_snapshot_specs, qty: 1, unit_price: invoice.vehicle_price, line_total: invoice.vehicle_price },
    ...(invoice.line_items || []).map((li) => ({
      title: li.label,
      sub: '',
      qty: li.qty,
      unit_price: li.unit_price,
      line_total: li.line_total ?? li.qty * li.unit_price,
    })),
  ];

  for (const r of rows) {
    const tl = wrapLines(r.title, fonts.bold, 9, 285);
    const sl = r.sub ? wrapLines(r.sub, fonts.regular, 7.5, 285) : [];
    const rh = Math.max(26, 12 + tl.length * 11 + sl.length * 10);
    page.drawRectangle({ x: MX, y: y - rh, width: CW, height: rh, borderColor: COL.slate200, borderWidth: 0.75, color: COL.white });
    let ty = y - 14;
    tl.forEach((line) => {
      page.drawText(line, { x: MX + 10, y: ty, size: 9, font: fonts.bold, color: COL.obsidian });
      ty -= 11;
    });
    sl.forEach((line) => {
      page.drawText(line, { x: MX + 10, y: ty, size: 7.5, font: fonts.regular, color: COL.slate600 });
      ty -= 10;
    });
    const my = y - 15;
    page.drawText(String(r.qty), { x: MX + 322, y: my, size: 8.5, font: fonts.regular, color: COL.slate800 });
    drawRight(page, fmtMoney(r.unit_price, currency), MX + 425, my, fonts.regular, 8.5, COL.slate800);
    drawRight(page, fmtMoney(r.line_total, currency), MX + CW - 10, my, fonts.bold, 8.5, COL.obsidian);
    y -= rh;
  }

  y -= 18;
  const sw = 248;
  const sx = MX + CW - sw;
  const sumRows = [
    ['Subtotal', fmtMoney(invoice.subtotal, currency), COL.slate800, false],
    invoice.discount_amount > 0 ? ['Discount', `- ${fmtMoney(invoice.discount_amount, currency)}`, COL.emerald, false] : null,
    invoice.tax_amount > 0 ? [`Tax (${invoice.tax_pct}%)`, fmtMoney(invoice.tax_amount, currency), COL.slate800, false] : null,
    invoice.trade_in_credit > 0 ? ['Trade-In Credit', `- ${fmtMoney(invoice.trade_in_credit, currency)}`, COL.emerald, false] : null,
    ['GRAND TOTAL PAYABLE', fmtMoney(invoice.grand_total, currency), COL.obsidian, true],
    ['Amount Paid', fmtMoney(invoice.amount_paid, currency), COL.emerald, false],
    ['BALANCE DUE', fmtMoney(invoice.balance_due, currency), COL.obsidian, true],
  ].filter(Boolean);

  const sh = 18 + sumRows.length * 16;
  page.drawRectangle({ x: sx, y: y - sh, width: sw, height: sh, color: COL.slate50, borderColor: COL.slate200, borderWidth: 1 });
  sumRows.forEach(([lbl, val, c, b], idx) => {
    const ry = y - 16 - idx * 16;
    page.drawText(lbl, { x: sx + 10, y: ry, size: b ? 9 : 8.5, font: b ? fonts.bold : fonts.regular, color: c });
    drawRight(page, val, sx + sw - 10, ry, b ? fonts.bold : fonts.regular, b ? 9.5 : 8.5, c);
  });

  const bytes = await doc.save();
  triggerDownload(new Blob([bytes], { type: 'application/pdf' }), `Sithumsa-Invoice-${invoice.invoice_number}.pdf`);
}

export async function downloadLeaseQuotePdf({
  business,
  vehicleTitle,
  vehiclePrice,
  downPaymentAmount,
  downPct,
  tradeInCredit,
  interestRate,
  tenureMonths,
  processingFee,
  result,
}) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([A4_W, A4_H]);
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const currency = business?.currency_symbol || 'Rs.';
  const today = new Date().toISOString().slice(0, 10);

  drawBanner(page, fonts, business, 'OFFICIAL LEASE QUOTATION', `Date: ${today}`, `${tenureMonths} Months Plan`);

  let y = A4_H - 140;
  page.drawRectangle({ x: MX, y: y - 76, width: CW, height: 76, color: COL.obsidian });
  page.drawText('ESTIMATED MONTHLY INSTALLMENT (EMI)', { x: MX + 20, y: y - 24, size: 9, font: fonts.bold, color: COL.goldLight });
  page.drawText(`${fmtMoney(result.monthlyInstallment, currency)} / month`, { x: MX + 20, y: y - 52, size: 22, font: fonts.bold, color: COL.white });
  drawRight(page, `${tenureMonths} mo @ ${interestRate}% p.a.`, MX + CW - 20, y - 46, fonts.bold, 10, COL.slate200);

  y -= 104;
  const rows = [
    ['Vehicle Selected', safeWinAnsi(vehicleTitle)],
    ['Vehicle Selling Price', fmtMoney(vehiclePrice, currency)],
    [`Down Payment (${downPct}%)`, fmtMoney(downPaymentAmount, currency)],
    ['Trade-In Credit', fmtMoney(tradeInCredit, currency)],
    ['Processing / Doc Fee', fmtMoney(processingFee, currency)],
    ['Annual Interest Rate', `${interestRate}% p.a.`],
    ['Lease Tenure', `${tenureMonths} Months`],
    ['Net Financed Principal', fmtMoney(result.financedPrincipal, currency)],
    ['Total Interest', fmtMoney(result.totalInterest, currency)],
    ['Upfront Cash Required', fmtMoney(result.upfrontRequired, currency)],
    ['Total Payable Outlay', fmtMoney(result.totalOutlay, currency)],
  ];
  rows.forEach(([lbl, val], idx) => {
    const rh = 28;
    page.drawRectangle({
      x: MX,
      y: y - rh,
      width: CW,
      height: rh,
      color: idx % 2 === 0 ? COL.slate50 : COL.white,
      borderColor: COL.slate200,
      borderWidth: 0.6,
    });
    page.drawText(lbl, { x: MX + 12, y: y - 18, size: 9.5, font: idx >= 7 ? fonts.bold : fonts.regular, color: COL.slate800 });
    drawRight(page, val, MX + CW - 12, y - 18, fonts.bold, 9.5, idx === 10 ? COL.gold : COL.obsidian);
    y -= rh;
  });

  const bytes = await doc.save();
  triggerDownload(new Blob([bytes], { type: 'application/pdf' }), 'Sithumsa-Lease-Quote.pdf');
}

export async function downloadVehicleSpecPdf(vehicle, business) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([A4_W, A4_H]);
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const currency = business?.currency_symbol || 'Rs.';

  drawBanner(page, fonts, business, 'VEHICLE SPECIFICATION SHEET', vehicle.stock_code, `${vehicle.condition} | ${vehicle.status}`);

  let y = A4_H - 134;
  page.drawText(safeWinAnsi(`${vehicle.year} ${vehicle.title}`).slice(0, 48), { x: MX, y, size: 16, font: fonts.bold, color: COL.obsidian });
  drawRight(page, fmtMoney(vehicle.retail_price, currency, 0), A4_W - MX, y, fonts.bold, 14, COL.gold);
  y -= 36;

  const specs = [
    ['Stock Code', vehicle.stock_code],
    ['Make / Model', `${vehicle.make} ${vehicle.model}`],
    ['Year', String(vehicle.year)],
    ['Condition', vehicle.condition],
    ['Category', vehicle.category],
    ['Mileage', vehicle.mileage_km ? `${Number(vehicle.mileage_km).toLocaleString('en-US')} km` : 'Brand New (0 km)'],
    ['Fuel Type', vehicle.fuel_type],
    ['Transmission', vehicle.transmission],
    ['Engine / Battery', vehicle.engine_cc || 'Standard'],
    ['Color', vehicle.color || 'Showroom Finish'],
    ['Registration', vehicle.registration_no || 'Inspect on Visit'],
    ['VIN / Chassis', vehicle.vin_chassis || 'Verified'],
  ];
  const cw = (CW - 10) / 2;
  for (let i = 0; i < specs.length; i += 2) {
    [specs[i], specs[i + 1]].forEach((pair, colIdx) => {
      if (!pair) return;
      const sx = MX + colIdx * (cw + 10);
      page.drawRectangle({ x: sx, y: y - 26, width: cw, height: 26, color: COL.slate50, borderColor: COL.slate200, borderWidth: 0.6 });
      page.drawText(safeWinAnsi(pair[0]), { x: sx + 8, y: y - 16, size: 8, font: fonts.regular, color: COL.slate600 });
      drawRight(page, pair[1], sx + cw - 8, y - 16, fonts.bold, 8.5, COL.obsidian);
    });
    y -= 30;
  }

  y -= 16;
  if (vehicle.features) {
    page.drawText('KEY FEATURES', { x: MX, y, size: 9.5, font: fonts.bold, color: COL.obsidian });
    y -= 14;
    wrapLines(vehicle.features, fonts.regular, 8.5, CW).slice(0, 4).forEach((line) => {
      page.drawText(line, { x: MX, y, size: 8.5, font: fonts.regular, color: COL.slate800 });
      y -= 12;
    });
  }

  const bytes = await doc.save();
  const safeCode = String(vehicle.stock_code || 'vehicle').replace(/[^a-zA-Z0-9._-]/g, '-');
  triggerDownload(new Blob([bytes], { type: 'application/pdf' }), `Sithumsa-${safeCode}-Specs.pdf`);
}

function csvCell(v) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function downloadSalesCsv(from, to) {
  const state = getDemoStateSnapshot();
  const rows = state.invoices.filter((i) => {
    const d = (i.created_at || '').slice(0, 10);
    return d >= from && d <= to;
  });
  const header = ['Invoice Number', 'Date', 'Sale Type', 'Status', 'Payment Method', 'Customer', 'Phone', 'Vehicle', 'Net Sales', 'Vehicle Cost', 'Gross Profit', 'Grand Total', 'Paid', 'Balance Due'];
  const lines = [header.map(csvCell).join(',')];
  for (const r of rows) {
    const net = Number(r.net_sales ?? r.subtotal - (r.discount_amount || 0));
    const profit = r.payment_status === 'Void' ? 0 : net - Number(r.cost_snapshot || 0);
    lines.push(
      [r.invoice_number, (r.created_at || '').slice(0, 10), r.sale_type, r.payment_status, r.payment_method, r.customer_name, r.customer_phone, r.vehicle_snapshot_title, net, r.cost_snapshot || 0, profit, r.grand_total, r.amount_paid, r.balance_due]
        .map(csvCell)
        .join(',')
    );
  }
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `sithumsa-sales-${from}-to-${to}.csv`);
}

export function downloadDemoBackupZip() {
  const state = getDemoStateSnapshot();
  const zipped = zipSync({ 'sithumsa-demo-state.json': strToU8(JSON.stringify(state, null, 2)) }, { level: 1 });
  const today = new Date().toISOString().slice(0, 10);
  triggerDownload(new Blob([zipped], { type: 'application/zip' }), `sithumsa-demo-backup-${today}.zip`);
}
