import { useCallback, useEffect, useState } from 'react';
import {
  DatabaseBackup,
  Download,
  History,
  LogOut,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '../api/client.js';
import { downloadDemoBackupZip } from '../utils/demoDownloads.js';

export function SecurityBackupsTab({ user, onAuthRefresh, onLogoutAll, onNotify }) {
  const [backups, setBackups] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [snapshotting, setSnapshotting] = useState(false);

  // 2FA setup state
  const [totpSetup, setTotpSetup] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [disableForm, setDisableForm] = useState({ password: '', code: '' });
  const [busy2fa, setBusy2fa] = useState(false);

  const loadSecurityData = useCallback(async () => {
    try {
      const [bRes, aRes] = await Promise.all([
        apiRequest('/api/admin/backups'),
        apiRequest('/api/admin/audit'),
      ]);
      setBackups(bRes.backups || []);
      setAuditLogs(aRes.logs || []);
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  }, [onNotify]);

  useEffect(() => {
    loadSecurityData();
  }, [loadSecurityData]);

  const handleSnapshot = async () => {
    setSnapshotting(true);
    try {
      const res = await apiRequest('/api/admin/backups/snapshot', { method: 'POST', body: {} });
      setBackups(res.backups || []);
      onNotify?.('Online SQLite snapshot created successfully.');
      await loadSecurityData();
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setSnapshotting(false);
    }
  };

  const start2faSetup = async () => {
    setBusy2fa(true);
    try {
      const data = await apiRequest('/api/auth/2fa/setup', { method: 'POST', body: {} });
      setTotpSetup(data);
      setRecoveryCodes(null);
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setBusy2fa(false);
    }
  };

  const confirm2faEnable = async (e) => {
    e.preventDefault();
    setBusy2fa(true);
    try {
      const res = await apiRequest('/api/auth/2fa/enable', {
        method: 'POST',
        body: { code: verifyCode },
      });
      setRecoveryCodes(res.recoveryCodes);
      setTotpSetup(null);
      setVerifyCode('');
      onNotify?.('Two-factor authentication is now enabled!');
      await onAuthRefresh?.();
      await loadSecurityData();
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setBusy2fa(false);
    }
  };

  const handleDisable2fa = async (e) => {
    e.preventDefault();
    setBusy2fa(true);
    try {
      await apiRequest('/api/auth/2fa/disable', {
        method: 'POST',
        body: disableForm,
      });
      setDisableForm({ password: '', code: '' });
      setRecoveryCodes(null);
      onNotify?.('Two-factor authentication disabled.');
      await onAuthRefresh?.();
      await loadSecurityData();
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setBusy2fa(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Backups Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <DatabaseBackup className="h-5 w-5 text-[#9A7418]" />
              <h2 className="font-serif-lux text-lg font-bold text-slate-900">
                Database &amp; Photo Backups
              </h2>
            </div>
            <button
              type="button"
              onClick={downloadDemoBackupZip}
              className="btn-primary py-2 px-4 text-xs"
            >
              <Download className="h-4 w-4" />
              Download Full ZIP Backup
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Automatic daily snapshots retain the last 14 days in <code className="rounded bg-slate-100 px-1">data/backups/</code>. Use “Download Full ZIP Backup” to save a complete copy of your SQLite database and all uploaded vehicle/customer photos to your computer or cloud drive.
          </p>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs font-bold text-slate-700">
              Stored Server Snapshots ({backups.length})
            </span>
            <button
              type="button"
              onClick={handleSnapshot}
              disabled={snapshotting}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${snapshotting ? 'animate-spin' : ''}`} />
              Create Snapshot Now
            </button>
          </div>

          <div className="max-h-44 divide-y divide-slate-100 overflow-y-auto text-xs">
            {backups.map((b) => (
              <div key={b.name} className="flex items-center justify-between py-2">
                <span className="font-mono font-semibold text-slate-800">{b.name}</span>
                <span className="text-slate-500">
                  {(b.size / 1024).toFixed(0)} KB • {b.modified?.slice(0, 10)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2FA & Session Control Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="font-serif-lux text-lg font-bold text-slate-900">
                2FA Authenticator &amp; Active Sessions
              </h2>
            </div>
            <button
              type="button"
              onClick={onLogoutAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out All Devices
            </button>
          </div>

          {recoveryCodes && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs">
              <div className="font-bold text-amber-950">
                Save Your One-Time Recovery Codes Now!
              </div>
              <p className="mt-1 text-amber-900">
                Store these 8 codes in a safe place. Each code can be used once if you lose your phone:
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono font-bold text-slate-900">
                {recoveryCodes.map((c) => (
                  <div key={c} className="rounded bg-white px-2.5 py-1 border border-amber-200">
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!user?.twoFactorEnabled ? (
            !totpSetup ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Protect POS billing, inventory prices, and customer records with Google Authenticator / Authy 2-Step Verification. Accounts also auto-lock after 5 failed attempts and auto-expire after 30 minutes of inactivity.
                </p>
                <button
                  type="button"
                  disabled={busy2fa}
                  onClick={start2faSetup}
                  className="btn-dark py-2.5 text-xs"
                >
                  <ShieldCheck className="h-4 w-4 text-[#E5C158]" />
                  Set Up 2FA (Google Authenticator)
                </button>
              </div>
            ) : (
              <form onSubmit={confirm2faEnable} className="space-y-3">
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row">
                  <img
                    src={totpSetup.qr}
                    alt="2FA QR Code"
                    className="h-36 w-36 rounded-xl border border-slate-200 bg-white p-1"
                  />
                  <div className="text-xs space-y-1.5">
                    <div className="font-bold text-slate-900">
                      1. Scan with Google Authenticator or Authy
                    </div>
                    <div className="text-slate-600">
                      Manual key:{' '}
                      <code className="break-all rounded bg-white px-1.5 py-0.5 font-mono font-bold text-slate-900">
                        {totpSetup.secret}
                      </code>
                    </div>
                    <div className="font-bold text-slate-900 pt-1">
                      2. Enter the 6-digit code shown in your app:
                    </div>
                    <input
                      required
                      type="text"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      placeholder="123456"
                      className="input-field font-mono tracking-widest"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={busy2fa} className="btn-primary py-2 text-xs">
                    Activate 2FA
                  </button>
                  <button
                    type="button"
                    onClick={() => setTotpSetup(null)}
                    className="btn-secondary py-2 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleDisable2fa} className="space-y-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <ShieldAlert className="h-4 w-4 text-emerald-700" />
                2FA is Active on Your Account
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  required
                  type="password"
                  placeholder="Current password"
                  value={disableForm.password}
                  onChange={(e) => setDisableForm({ ...disableForm, password: e.target.value })}
                  className="input-field text-xs"
                />
                <input
                  required
                  type="text"
                  placeholder="6-digit 2FA or recovery code"
                  value={disableForm.code}
                  onChange={(e) => setDisableForm({ ...disableForm, code: e.target.value })}
                  className="input-field text-xs font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={busy2fa}
                className="rounded-xl border border-rose-300 bg-white px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
              >
                Disable 2FA
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Append-Only Security Audit Log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-700" />
            <h3 className="font-serif-lux text-base font-bold text-slate-900">
              Immutable Owner &amp; POS Audit Trail
            </h3>
          </div>
          <span className="text-xs text-slate-500">Latest {auditLogs.length} events</span>
        </div>

        <div className="mt-4 max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 sticky top-0">
              <tr>
                <th className="px-3 py-2.5 font-bold">Timestamp (UTC)</th>
                <th className="px-3 py-2.5 font-bold">User</th>
                <th className="px-3 py-2.5 font-bold">Action</th>
                <th className="px-3 py-2.5 font-bold">Details</th>
                <th className="px-3 py-2.5 font-bold">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{log.created_at}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900">{log.username || '—'}</td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600 max-w-md truncate">{log.detail}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-400">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
