import { useState } from 'react';
import { CalendarCheck2, Heart, Menu, MessageCircle, X } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import { buildWhatsAppUrl } from '../utils/format.js';

export function Navbar({ business, shortlistCount = 0, onShowShortlist, onBookViewing }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  const navLinks = [
    { href: '#inventory', label: t('nav_showroom') },
    { href: '#promise', label: t('nav_why') },
    { href: '#leasing', label: t('nav_leasing') },
    { href: '#exchange', label: t('nav_exchange') },
    { href: '#reviews', label: t('nav_deliveries') },
    { href: '#contact', label: t('nav_contact') },
  ];

  const langOptions = [
    { id: 'en', label: 'EN' },
    { id: 'si', label: 'සිං' },
    { id: 'ta', label: 'தமி' },
  ];

  const whatsappUrl = buildWhatsAppUrl(
    business?.whatsapp_number,
    `Hello ${business?.business_name || 'Sithumsa Enterprise'}, I would like to inquire about your showroom vehicles and leasing options.`
  );

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[#D4AF37]/20 bg-[#05070B]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
        {/* Brand Logo */}
        <a href="#top" className="group flex min-w-0 items-center" aria-label="Sithumsa Enterprise home">
          <img
            src="./images/sithumsa-logo.jpg"
            alt="Sithumsa Enterprises — Best One Vehicle Dealer"
            className="h-9 sm:h-12 w-auto max-w-[175px] sm:max-w-[260px] object-contain transition duration-200 group-hover:brightness-110"
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

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-0.5 text-[11px] font-bold">
            {langOptions.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setLang(o.id)}
                className={`rounded-full px-2 py-1 transition cursor-pointer ${
                  lang === o.id ? 'bg-[#D4AF37] text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          {shortlistCount > 0 && (
            <button
              type="button"
              onClick={onShowShortlist}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-2 text-xs font-bold text-[#F6E7C1] transition hover:bg-[#D4AF37]/20 cursor-pointer"
            >
              <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
              {t('nav_saved')} ({shortlistCount})
            </button>
          )}
          <button
            type="button"
            onClick={() => onBookViewing?.(null)}
            className="btn-luxury-outline py-2 px-3.5 text-xs"
          >
            <CalendarCheck2 className="h-3.5 w-3.5 text-[#E5C158]" />
            {t('nav_book')}
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-crimson py-2 px-4 text-xs"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {t('nav_whatsapp')}
          </a>
        </div>

        {/* Mobile Quick Actions + Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {shortlistCount > 0 && (
            <button
              type="button"
              onClick={onShowShortlist}
              className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-2.5 py-2 text-xs font-bold text-[#F6E7C1] cursor-pointer"
              aria-label="View saved vehicles"
            >
              <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
              <span>{shortlistCount}</span>
            </button>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#9E1B32] p-2.5 text-white shadow-xs"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 p-2.5 text-slate-200 transition hover:bg-white/10 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/10 bg-[#05070B] px-4 py-4 md:hidden">
          <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <span className="text-[11px] font-semibold text-slate-400">Language</span>
            <div className="inline-flex gap-1">
              {langOptions.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setLang(o.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                    lang === o.id ? 'bg-[#D4AF37] text-slate-950' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold tracking-wider text-slate-200 uppercase hover:bg-white/5 hover:text-[#E5C158]"
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
                className="btn-luxury-outline py-3 text-xs"
              >
                <CalendarCheck2 className="h-4 w-4" />
                {t('nav_book')}
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-crimson py-3 text-xs"
              >
                <MessageCircle className="h-4 w-4" />
                {t('nav_whatsapp')}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
