import { useState } from 'react';
import { CalendarCheck2, Heart, Menu, MessageCircle, X } from 'lucide-react';
import { buildWhatsAppUrl } from '../utils/format.js';

export function Navbar({ business, shortlistCount = 0, onShowShortlist, onBookViewing }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '#inventory', label: 'Showroom' },
    { href: '#promise', label: 'Why Sithumsa' },
    { href: '#leasing', label: 'Leasing Studio' },
    { href: '#exchange', label: 'Trade-In' },
    { href: '#reviews', label: 'Deliveries' },
    { href: '#contact', label: 'Contact' },
  ];

  const whatsappUrl = buildWhatsAppUrl(
    business?.whatsapp_number,
    `Hello ${business?.business_name || 'Sithumsa Enterprise'}, I would like to inquire about your showroom vehicles and leasing options.`
  );

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[#D4AF37]/20 bg-[#05070B]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <a href="#top" className="group flex min-w-0 items-center" aria-label="Sithumsa Enterprise home">
          <img
            src="./images/sithumsa-logo.jpg"
            alt="Sithumsa Enterprises — Best One Vehicle Dealer"
            className="h-12 w-auto max-w-[260px] object-contain transition duration-200 group-hover:brightness-110"
          />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-semibold tracking-[0.14em] text-slate-300 uppercase transition hover:text-[#E5C158]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          {shortlistCount > 0 && (
            <button
              type="button"
              onClick={onShowShortlist}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-2 text-xs font-bold text-[#F6E7C1] transition hover:bg-[#D4AF37]/20 cursor-pointer"
            >
              <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
              Saved ({shortlistCount})
            </button>
          )}
          <button
            type="button"
            onClick={() => onBookViewing?.(null)}
            className="btn-luxury-outline py-2 px-3.5 text-xs"
          >
            <CalendarCheck2 className="h-3.5 w-3.5 text-[#E5C158]" />
            Book Viewing
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-crimson py-2 px-4 text-xs"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl border border-white/15 p-2 text-slate-200 transition hover:bg-white/10 md:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#05070B] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wider text-slate-200 uppercase hover:bg-white/5 hover:text-[#E5C158]"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onBookViewing?.(null);
                }}
                className="btn-luxury-outline py-2.5 text-xs"
              >
                <CalendarCheck2 className="h-4 w-4" />
                Book Viewing
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-crimson py-2.5 text-xs"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
