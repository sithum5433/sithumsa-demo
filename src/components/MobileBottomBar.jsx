import { Calculator, CalendarCheck2, MessageCircle, Phone } from 'lucide-react';
import { buildWhatsAppUrl } from '../utils/format.js';

export function MobileBottomBar({ business, onBookViewing }) {
  const waUrl = buildWhatsAppUrl(
    business?.whatsapp_number,
    `Hello ${business?.business_name || 'Sithumsa Enterprise'}, I am browsing your showroom on mobile and would like quick assistance.`
  );

  return (
    <nav
      aria-label="Mobile quick actions"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-[#D4AF37]/30 bg-[#05070B]/95 text-white backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid grid-cols-4">
        <a
          href={`tel:${business?.phone || ''}`}
          className="flex min-h-[56px] flex-col items-center justify-center gap-1 py-1.5 text-[10px] font-semibold text-slate-200 active:bg-white/10"
        >
          <Phone className="h-4 w-4 text-[#E5C158]" />
          <span>Call</span>
        </a>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[56px] flex-col items-center justify-center gap-1 py-1.5 text-[10px] font-semibold text-emerald-400 active:bg-white/10"
        >
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp</span>
        </a>
        <a
          href="#leasing"
          className="flex min-h-[56px] flex-col items-center justify-center gap-1 py-1.5 text-[10px] font-semibold text-slate-200 active:bg-white/10"
        >
          <Calculator className="h-4 w-4 text-[#E5C158]" />
          <span>Lease</span>
        </a>
        <button
          type="button"
          onClick={() => onBookViewing?.(null)}
          className="flex min-h-[56px] flex-col items-center justify-center gap-1 bg-gradient-to-r from-[#E5C158] to-[#B88E28] py-1.5 text-[10px] font-extrabold text-slate-950 active:brightness-95 cursor-pointer"
        >
          <CalendarCheck2 className="h-4 w-4" />
          <span>Book VIP</span>
        </button>
      </div>
    </nav>
  );
}
