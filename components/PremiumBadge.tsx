type PremiumBadgeProps = {
  label?: string;
};

export function PremiumBadge({ label = "Ocht premium" }: PremiumBadgeProps) {
  return (
    <span className="premium-badge" aria-label={label} title={label}>
      <img src="/brand/ocht-badge-25-pro-dot-shield.svg" alt="" aria-hidden="true" />
    </span>
  );
}
