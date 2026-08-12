export function StatusBadge({ children, tone = 'info' }: { children: string; tone?: 'info' | 'success' | 'warning' }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}
