type PremiumBadgeProps = {
  label?: string;
};

export function PremiumBadge({ label = "RR+" }: PremiumBadgeProps) {
  return (
    <span className="premium-badge" aria-label="RepRun premium feature">
      {label}
    </span>
  );
}
