import { TIERS } from '../lib/rating';
import { TIER_COLORS } from '../lib/data';

export default function TierIcon({ tier, size = 22 }) {
  const t = TIERS[tier];
  return (
    <span title={t.name} role="img" aria-label={`${t.n.toFixed(1)} ${t.name}`}
      style={{ display: 'inline-grid', placeItems: 'center', width: size, height: size, borderRadius: '50%', background: TIER_COLORS[tier], color: '#fff', fontSize: size * 0.5, fontWeight: 900, flex: 'none', verticalAlign: 'middle' }}>
      {t.name[0]}
    </span>
  );
}
