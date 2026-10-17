type BadgeStatus =
  | "BORROWED"
  | "RETURNED"
  | "OVERDUE"
  | "AVAILABLE"
  | "UNAVAILABLE";

interface StatusBadgeProps {
  status?: BadgeStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({
  status = "AVAILABLE",
  size = "sm",
}: StatusBadgeProps) {
  const configs = {
    BORROWED: {
      label: 'Borrowed',
      bg: 'rgba(74,124,106,0.2)',
      color: '#7ecdb0',
      border: 'rgba(74,124,106,0.4)',
    },
    RETURNED: {
      label: 'Returned',
      bg: 'rgba(90,90,110,0.2)',
      color: '#a0a0b8',
      border: 'rgba(90,90,110,0.4)',
    },
    OVERDUE: {
      label: 'Overdue',
      bg: 'rgba(139,58,58,0.2)',
      color: '#e07878',
      border: 'rgba(139,58,58,0.4)',
      pulse: true,
    },
    AVAILABLE: {
      label: 'Available',
      bg: 'rgba(58,107,90,0.15)',
      color: '#7ecdb0',
      border: 'rgba(58,107,90,0.3)',
    },
    UNAVAILABLE: {
      label: 'Unavailable',
      bg: 'rgba(80,60,40,0.2)',
      color: '#a89880',
      border: 'rgba(80,60,40,0.4)',
    },
  }

  const config = configs[status]
  const padding = size === 'sm' ? '2px 8px' : '4px 12px'
  const fontSize = size === 'sm' ? '11px' : '12px'

  return (
    <span
      className={"pulse" in config && config.pulse ? 'badge-overdue' : ''}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding,
        borderRadius: '999px',
        fontSize,
        fontWeight: 600,
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        letterSpacing: '0.02em',
      }}
    >
      <span style={{
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        background: config.color,
        display: 'inline-block',
        flexShrink: 0
      }} />
      {config.label}
    </span>
  )
}
