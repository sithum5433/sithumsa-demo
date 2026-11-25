import { CalendarCheck2, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { buildWhatsAppUrl } from '../utils/format.js';

export function Footer({ business, onBookViewing }) {
  const waUrl = buildWhatsAppUrl(
    business?.whatsapp_number,
    `Hello ${business?.business_name || 'Sithumsa Enterprise'}, I would like to visit your showroom or inquire about a vehicle.`
  );

  return (
    <footer id="contact" className="no-print border-t border-[#D4AF37]/20 bg-[#05070B] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Business Summary */}
          <div className="md:col-span-5">
            <img
              src="./images/sithumsa-logo.jpg"
              alt="Sithumsa Enterprises"
              className="h-14 w-auto max-w-[300px] object-contain"
            />
            {business?.registration_no && (
              <div className="mt-2 text-xs text-slate-400">Reg No: {business.registration_no}</div>
            )}
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              {business?.about_text ||
                'Wholesale & retail used and brand-new cars, SUVs, instant leasing, and transparent trade-in exchanges.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onBookViewing?.(null)}
                className="btn-primary py-2.5 text-xs"
              >
                <CalendarCheck2 className="h-4 w-4" />
                Book Private Viewing
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp py-2.5 text-xs"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Concierge
              </a>
            </div>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-3 text-sm">
            <h3 className="font-serif-lux text-sm font-bold tracking-wider text-[#E5C158] uppercase">
              Showroom &amp; Concierge
            </h3>
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E5C158]" />
              <span>{business?.address || 'Showroom Address'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-[#E5C158]" />
              <a href={`tel:${business?.phone || ''}`} className="hover:text-white">
                {business?.phone}
              </a>
            </div>
            {business?.email && (
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#E5C158]" />
                <a href={`mailto:${business.email}`} className="hover:text-white">
                  {business.email}
                </a>
              </div>
            )}
            {business?.opening_hours && (
              <div className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#E5C158]" />
                <span>{business.opening_hours}</span>
              </div>
            )}
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-2.5 text-sm">
            <h3 className="font-serif-lux text-sm font-bold tracking-wider text-[#E5C158] uppercase">
              Showroom Navigation
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#inventory" className="hover:text-[#E5C158]">
                  Curated Stock
                </a>
              </li>
              <li>
                <a href="#promise" className="hover:text-[#E5C158]">
                  120-Point Certification
                </a>
              </li>
              <li>
                <a href="#leasing" className="hover:text-[#E5C158]">
                  Leasing Studio &amp; PDF Quote
                </a>
              </li>
              <li>
                <a href="#exchange" className="hover:text-[#E5C158]">
                  Trade-In Valuation
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-[#E5C158]">
                  Owner Deliveries
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <div>
            © {new Date().getFullYear()} {business?.business_name || 'Sithumsa Enterprise'}. All rights reserved.
          </div>
          <div>Curated Luxury • Wholesale • Tailored Leasing • Certified POS</div>
        </div>
      </div>
    </footer>
  );
}
