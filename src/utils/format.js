export function formatCurrency(amount, symbol = 'Rs.') {
  const num = Number(amount || 0);
  if (!Number.isFinite(num)) return `${symbol} 0`;
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(num));
  return `${symbol} ${formatted}`;
}

export function formatCurrencyExact(amount, symbol = 'Rs.') {
  const num = Number(amount || 0);
  if (!Number.isFinite(num)) return `${symbol} 0.00`;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  return `${symbol} ${formatted}`;
}

export function formatMileage(km) {
  const num = Number(km || 0);
  if (!Number.isFinite(num) || num === 0) return 'Brand New (0 km)';
  return `${new Intl.NumberFormat('en-US').format(num)} km`;
}

export function normalizeWhatsAppDigits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

export function buildWhatsAppUrl(businessWhatsapp, message) {
  const digits = normalizeWhatsAppDigits(businessWhatsapp);
  const encoded = encodeURIComponent(message);
  if (!digits) {
    return `https://wa.me/?text=${encoded}`;
  }
  return `https://wa.me/${digits}?text=${encoded}`;
}

export function assetUrl(p) {
  if (!p) return './images/lux-suv.jpg';
  if (p.startsWith('data:') || p.startsWith('blob:') || p.startsWith('http') || p.startsWith('./')) {
    return p;
  }
  if (p.startsWith('/')) return `.${p}`;
  return `./${p}`;
}

export function getPrimaryPhoto(vehicle) {
  if (!vehicle?.photos?.length) return './images/lux-suv.jpg';
  const primary = vehicle.photos.find((p) => p.is_primary);
  return assetUrl(primary ? primary.url : vehicle.photos[0].url);
}
