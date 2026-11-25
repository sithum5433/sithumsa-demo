export function calculateLeasing({
  vehiclePrice = 0,
  downPaymentAmount = 0,
  tradeInCredit = 0,
  annualInterestRate = 13.5,
  tenureMonths = 48,
  processingFee = 0,
}) {
  const price = Math.max(0, Number(vehiclePrice) || 0);
  const down = Math.max(0, Number(downPaymentAmount) || 0);
  const trade = Math.max(0, Number(tradeInCredit) || 0);
  const fee = Math.max(0, Number(processingFee) || 0);
  const months = Math.max(1, Math.round(Number(tenureMonths) || 12));
  const rate = Math.max(0, Number(annualInterestRate) || 0);

  const financedPrincipal = Math.max(0, price - down - trade);

  let monthlyInstallment = 0;
  if (financedPrincipal > 0) {
    if (rate === 0) {
      monthlyInstallment = financedPrincipal / months;
    } else {
      const r = rate / 100 / 12;
      const factor = Math.pow(1 + r, months);
      monthlyInstallment = (financedPrincipal * r * factor) / (factor - 1);
    }
  }

  const totalInstallmentsPaid = monthlyInstallment * months;
  const totalInterest = Math.max(0, totalInstallmentsPaid - financedPrincipal);
  const upfrontRequired = down + fee;
  const totalOutlay = upfrontRequired + trade + totalInstallmentsPaid;

  return {
    financedPrincipal,
    monthlyInstallment,
    totalInstallmentsPaid,
    totalInterest,
    upfrontRequired,
    totalOutlay,
  };
}
