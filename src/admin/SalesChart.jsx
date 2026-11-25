import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '../utils/format.js';

export function SalesChart({ data = [], currency = 'Rs.' }) {
  if (!data.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <BarChart3 className="h-4 w-4 text-[#9A7418]" />
          <h3 className="font-serif-lux">Monthly Sales &amp; Gross Profit Trend</h3>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Complete POS sales to visualize monthly revenue and gross profit performance.
        </p>
      </div>
    );
  }

  const maxVal = Math.max(
    1,
    ...data.map((d) => Math.max(Number(d.sales) || 0, Number(d.profit) || 0))
  );
  const chartW = 520;
  const chartH = 160;
  const slotW = chartW / Math.max(data.length, 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#9A7418]" />
          <h3 className="font-serif-lux text-sm font-bold text-slate-900">
            Monthly Revenue vs Gross Profit (Last {data.length} mo)
          </h3>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#0B0F17]" />
            Net Sales
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#D4AF37]" />
            Gross Profit
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${chartW} ${chartH + 28}`} className="h-44 w-full min-w-[340px]">
          {[0.25, 0.5, 0.75, 1].map((frac) => (
            <line
              key={frac}
              x1="0"
              y1={chartH - chartH * frac}
              x2={chartW}
              y2={chartH - chartH * frac}
              stroke="#E2E8F0"
              strokeDasharray="3 3"
            />
          ))}
          {data.map((d, idx) => {
            const xCenter = idx * slotW + slotW / 2;
            const barW = Math.min(26, slotW * 0.28);
            const salesH = Math.max(4, Math.round(((Number(d.sales) || 0) / maxVal) * (chartH - 12)));
            const profitVal = Math.max(0, Number(d.profit) || 0);
            const profitH = profitVal > 0 ? Math.max(4, Math.round((profitVal / maxVal) * (chartH - 12))) : 2;
            return (
              <g key={d.month}>
                <rect
                  x={xCenter - barW - 2}
                  y={chartH - salesH}
                  width={barW}
                  height={salesH}
                  rx="4"
                  fill="#0B0F17"
                >
                  <title>{`${d.month} Sales: ${formatCurrency(d.sales, currency)}`}</title>
                </rect>
                <rect
                  x={xCenter + 2}
                  y={chartH - profitH}
                  width={barW}
                  height={profitH}
                  rx="4"
                  fill="#D4AF37"
                >
                  <title>{`${d.month} Profit: ${formatCurrency(d.profit, currency)}`}</title>
                </rect>
                <text
                  x={xCenter}
                  y={chartH + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748B"
                  fontWeight="600"
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
