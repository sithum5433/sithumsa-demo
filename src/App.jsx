import { useCallback, useEffect, useState } from 'react';
import { Lock, RotateCcw, Store } from 'lucide-react';
import { apiRequest, setCsrfToken } from './api/client.js';
import { resetDemoData } from './api/demoBackend.js';
import { Navbar } from './components/Navbar.jsx';
import { Hero } from './components/Hero.jsx';
import { LuxuryPromise } from './components/LuxuryPromise.jsx';
import { VehicleCatalog } from './components/VehicleCatalog.jsx';
import { VehicleModal } from './components/VehicleModal.jsx';
import { CompareBarAndModal } from './components/CompareDrawer.jsx';
import { BookingModal } from './components/BookingModal.jsx';
import { LeasingCalculator } from './components/LeasingCalculator.jsx';
import { ExchangeSection } from './components/ExchangeSection.jsx';
import { HappyCustomersReviews } from './components/HappyCustomersReviews.jsx';
import { Footer } from './components/Footer.jsx';
import { ToastBanner } from './components/Toast.jsx';
import { AdminGate } from './admin/AdminGate.jsx';
import { AdminLayout } from './admin/AdminLayout.jsx';
import { DashboardTab } from './admin/DashboardTab.jsx';
import { InventoryTab } from './admin/InventoryTab.jsx';
import { PosTab } from './admin/PosTab.jsx';
import { InvoicesTab } from './admin/InvoicesTab.jsx';
import { ReportsTab } from './admin/ReportsTab.jsx';
import { InquiriesTab } from './admin/InquiriesTab.jsx';
import { ExchangesTab } from './admin/ExchangesTab.jsx';
import { CustomersTab } from './admin/CustomersTab.jsx';
import { SecurityBackupsTab } from './admin/SecurityBackupsTab.jsx';
import { SettingsTab } from './admin/SettingsTab.jsx';

export default function App() {
  const [routeMode, setRouteMode] = useState(() =>
    window.location.hash.startsWith('#/admin') ? 'admin' : 'public'
  );

  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // Public State
  const [publicData, setPublicData] = useState({
    business: null,
    vehicles: [],
    reviews: [],
    soldCount: 0,
  });
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [activeVehicleModal, setActiveVehicleModal] = useState(null);
  const [leaseTargetVehicle, setLeaseTargetVehicle] = useState(null);
  const [exchangeTargetVehicle, setExchangeTargetVehicle] = useState(null);
  const [quickFilter, setQuickFilter] = useState(null);
  const [bookingModal, setBookingModal] = useState({ open: false, vehicle: null });

  // Shortlist (Wishlist) & Compare State
  const [shortlistIds, setShortlistIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sithumsa_shortlist') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [compareIds, setCompareIds] = useState([]);

  const toggleShortlist = (id) => {
    setShortlistIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('sithumsa_shortlist', JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        showToast('You can compare up to 3 vehicles at once.', 'error');
        return prev;
      }
      return [...prev, id];
    });
  };

  // Admin State
  const [authState, setAuthState] = useState({
    loading: true,
    needsSetup: false,
    authenticated: false,
    user: null,
  });
  const [adminTab, setAdminTab] = useState('dashboard');
  const [adminData, setAdminData] = useState({
    dashboard: null,
    vehicles: [],
    invoices: [],
    inquiries: [],
    exchanges: [],
    reviews: [],
    business: null,
  });

  const loadPublic = useCallback(async () => {
    try {
      const data = await apiRequest('/api/public/bootstrap');
      setPublicData(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingPublic(false);
    }
  }, [showToast]);

  const checkAuth = useCallback(async () => {
    try {
      const data = await apiRequest('/api/auth/status');
      setCsrfToken(data.csrfToken);
      setAuthState({
        loading: false,
        needsSetup: data.needsSetup,
        authenticated: data.authenticated,
        user: data.user,
      });
    } catch {
      setAuthState({ loading: false, needsSetup: false, authenticated: false, user: null });
    }
  }, []);

  const loadAdmin = useCallback(async () => {
    try {
      const [dashRes, vehRes, invRes, inqRes, exRes, revRes, bizRes] = await Promise.all([
        apiRequest('/api/admin/dashboard'),
        apiRequest('/api/admin/vehicles'),
        apiRequest('/api/admin/invoices'),
        apiRequest('/api/admin/inquiries'),
        apiRequest('/api/admin/exchanges'),
        apiRequest('/api/admin/reviews'),
        apiRequest('/api/admin/business'),
      ]);
      setAdminData({
        dashboard: dashRes,
        vehicles: vehRes.vehicles || [],
        invoices: invRes.invoices || [],
        inquiries: inqRes.inquiries || [],
        exchanges: exRes.exchanges || [],
        reviews: revRes.reviews || [],
        business: bizRes.business || null,
      });
    } catch (err) {
      if (err.status === 401) {
        setAuthState((prev) => ({ ...prev, authenticated: false, user: null }));
      } else {
        showToast(err.message, 'error');
      }
    }
  }, [showToast]);

  useEffect(() => {
    loadPublic();
    checkAuth();
  }, [loadPublic, checkAuth]);

  useEffect(() => {
    if (routeMode === 'admin' && authState.authenticated) {
      loadAdmin();
    }
  }, [routeMode, authState.authenticated, loadAdmin]);

  useEffect(() => {
    const onHashChange = () => {
      setRouteMode(window.location.hash.startsWith('#/admin') ? 'admin' : 'public');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateMode = (mode) => {
    setRouteMode(mode);
    const targetHash = mode === 'admin' ? '#/admin' : '#/';
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
    if (mode === 'public') {
      loadPublic();
    }
  };

  const handleResetDemo = async () => {
    resetDemoData();
    await loadPublic();
    await checkAuth();
    if (routeMode === 'admin') {
      navigateMode('public');
    }
    showToast('Demo data restored to original showroom stock.');
  };

  const demoRibbon = (
    <div className="no-print border-b border-[#D4AF37]/35 bg-[#0A0E17] px-4 py-2 text-xs text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-slate-950 uppercase">
            Static Demo
          </span>
          <span className="text-slate-300">
            Interactive Static Demo (Browser Storage — No Database)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {routeMode === 'admin' ? (
            <button
              type="button"
              onClick={() => navigateMode('public')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-bold text-[#F6E7C1] hover:bg-[#D4AF37]/20 cursor-pointer"
            >
              <Store className="h-3.5 w-3.5" />
              Back to Showroom
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigateMode('admin')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-bold text-[#F6E7C1] hover:bg-[#D4AF37]/20 cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              Open Owner &amp; POS Demo
            </button>
          )}
          <button
            type="button"
            onClick={handleResetDemo}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  );

  const handleLogout = async (allDevices = false) => {
    try {
      await apiRequest(allDevices ? '/api/auth/logout-all' : '/api/auth/logout', { method: 'POST' });
    } finally {
      setCsrfToken(null);
      setAuthState({
        loading: false,
        needsSetup: false,
        authenticated: false,
        user: null,
      });
      navigateMode('public');
      showToast(allDevices ? 'Signed out of all devices.' : 'Signed out securely.');
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (routeMode === 'admin') {
    if (authState.loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#05070B] text-sm text-slate-300">
          Loading Executive Portal...
        </div>
      );
    }

    if (!authState.authenticated) {
      return (
        <>
          {demoRibbon}
          <AdminGate
            authState={authState}
            onAuthenticated={(res) => {
              setAuthState({
                loading: false,
                needsSetup: false,
                authenticated: true,
                user: res.user,
              });
            }}
            onBackToStorefront={() => navigateMode('public')}
          />
          <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
        </>
      );
    }

    const badges = {
      newInquiries: adminData.dashboard?.inquiries?.new_inquiries || 0,
      newExchanges: adminData.dashboard?.exchanges?.new_exchanges || 0,
      pendingReviews: adminData.dashboard?.reviews?.pending_reviews || 0,
    };

    const reloadAll = async () => {
      await Promise.all([loadAdmin(), loadPublic()]);
    };

    return (
      <>
        {demoRibbon}
        <AdminLayout
          activeTab={adminTab}
          onTabChange={setAdminTab}
          user={authState.user}
          business={adminData.business || publicData.business}
          badges={badges}
          onLogout={() => handleLogout(false)}
          onViewPublic={() => navigateMode('public')}
        >
          {adminTab === 'dashboard' && (
            <DashboardTab
              dashboard={adminData.dashboard}
              business={adminData.business || publicData.business}
              onNavigate={setAdminTab}
            />
          )}
          {adminTab === 'pos' && (
            <PosTab
              vehicles={adminData.vehicles}
              business={adminData.business || publicData.business}
              onReload={reloadAll}
              onNotify={showToast}
            />
          )}
          {adminTab === 'invoices' && (
            <InvoicesTab
              invoices={adminData.invoices}
              business={adminData.business || publicData.business}
              onReload={reloadAll}
              onNotify={showToast}
            />
          )}
          {adminTab === 'reports' && (
            <ReportsTab
              business={adminData.business || publicData.business}
              onNotify={showToast}
            />
          )}
          {adminTab === 'inventory' && (
            <InventoryTab
              vehicles={adminData.vehicles}
              business={adminData.business || publicData.business}
              onReload={reloadAll}
              onNotify={showToast}
            />
          )}
          {adminTab === 'inquiries' && (
            <InquiriesTab
              inquiries={adminData.inquiries}
              business={adminData.business || publicData.business}
              onReload={reloadAll}
              onNotify={showToast}
            />
          )}
          {adminTab === 'exchanges' && (
            <ExchangesTab
              exchanges={adminData.exchanges}
              business={adminData.business || publicData.business}
              onReload={reloadAll}
              onNotify={showToast}
            />
          )}
          {adminTab === 'customers' && (
            <CustomersTab
              reviews={adminData.reviews}
              onReload={reloadAll}
              onNotify={showToast}
            />
          )}
          {adminTab === 'security' && (
            <SecurityBackupsTab
              user={authState.user}
              onAuthRefresh={checkAuth}
              onLogoutAll={() => handleLogout(true)}
              onNotify={showToast}
            />
          )}
          {adminTab === 'settings' && (
            <SettingsTab
              business={adminData.business || publicData.business}
              onReload={reloadAll}
              onNotify={showToast}
            />
          )}
        </AdminLayout>
        <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2]">
      {demoRibbon}
      <Navbar
        business={publicData.business}
        shortlistCount={shortlistIds.length}
        onShowShortlist={() => {
          setQuickFilter({ onlySaved: true, ts: Date.now() });
          scrollToSection('inventory');
        }}
        onBookViewing={(veh) => setBookingModal({ open: true, vehicle: veh || null })}
      />

      <main className="flex-1">
        <Hero
          business={publicData.business}
          vehicleCount={publicData.vehicles.length}
          handoverCount={publicData.reviews.filter((r) => r.photo_url).length}
          soldCount={publicData.soldCount || 0}
          onBookViewing={(veh) => setBookingModal({ open: true, vehicle: veh || null })}
        />

        <LuxuryPromise
          onSelectQuickFilter={(f) => {
            setQuickFilter({ ...f, ts: Date.now() });
            scrollToSection('inventory');
          }}
        />

        {loadingPublic ? (
          <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-slate-500">
            Loading curated showroom collection...
          </div>
        ) : (
          <>
            <VehicleCatalog
              vehicles={publicData.vehicles}
              business={publicData.business}
              quickFilter={quickFilter}
              shortlistIds={shortlistIds}
              compareIds={compareIds}
              onToggleShortlist={toggleShortlist}
              onToggleCompare={toggleCompare}
              onSelectVehicle={(v) => setActiveVehicleModal(v)}
              onCalculateLease={(v) => {
                setLeaseTargetVehicle(v);
                scrollToSection('leasing');
              }}
              onExchangeForVehicle={(v) => {
                setExchangeTargetVehicle(v);
                scrollToSection('exchange');
              }}
              onBookViewing={(veh) => setBookingModal({ open: true, vehicle: veh })}
            />

            <LeasingCalculator
              vehicles={publicData.vehicles}
              business={publicData.business}
              selectedVehicle={leaseTargetVehicle}
            />

            <ExchangeSection
              vehicles={publicData.vehicles}
              business={publicData.business}
              selectedVehicle={exchangeTargetVehicle}
              onNotify={showToast}
            />

            <HappyCustomersReviews
              reviews={publicData.reviews}
              onNotify={showToast}
            />
          </>
        )}
      </main>

      <Footer
        business={publicData.business}
        onBookViewing={(veh) => setBookingModal({ open: true, vehicle: veh || null })}
      />

      <CompareBarAndModal
        compareIds={compareIds}
        vehicles={publicData.vehicles}
        business={publicData.business}
        onToggleCompare={toggleCompare}
        onClear={() => setCompareIds([])}
        onBookViewing={(veh) => setBookingModal({ open: true, vehicle: veh })}
      />

      <BookingModal
        open={bookingModal.open}
        vehicle={bookingModal.vehicle}
        vehicles={publicData.vehicles}
        business={publicData.business}
        onClose={() => setBookingModal({ open: false, vehicle: null })}
        onNotify={showToast}
      />

      <VehicleModal
        vehicle={activeVehicleModal}
        business={publicData.business}
        onClose={() => setActiveVehicleModal(null)}
        onCalculateLease={(v) => {
          setLeaseTargetVehicle(v);
          scrollToSection('leasing');
        }}
        onExchangeForVehicle={(v) => {
          setExchangeTargetVehicle(v);
          scrollToSection('exchange');
        }}
        onBookViewing={(veh) => setBookingModal({ open: true, vehicle: veh })}
      />

      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
