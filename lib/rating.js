// 랭크 알고리즘 v1 — 규칙 수정은 이 파일에서
export const TIERS = [
  { n: 2.0, name: '브론즈' }, { n: 2.5, name: '실버' }, { n: 3.0, name: '골드' },
  { n: 3.5, name: '플래티넘' }, { n: 4.0, name: '다이아' }, { n: 4.5, name: '마스터' }, { n: 5.0, name: '챌린저' },
];
export const PROMO_AT = 100;     // 승급전 진입 점수
export const tierLabel = (t) => `${TIERS[t].n.toFixed(1)} ${TIERS[t].name}`;
// 환산 NTRP (참고 표시용): 등급 + 점수/200, 최대 5.0
export const ntrp = (t, pts) => Math.min(5, Math.round((TIERS[t].n + pts / 200) * 10) / 10);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const initialMe = () => ({ name: '나', tier: 2, pts: 40, promo: null, matches: [] });

// 같은 상대 최근 30일 보정: 1~2번째 100% / 3~4번째 50% / 5번째~ 25%
export function oppMult(matches, opp, now = Date.now()) {
  const n = matches.filter((m) => m.opp === opp && m.ts > now - 30 * 864e5).length;
  return n < 2 ? 1 : n < 4 ? 0.5 : 0.25;
}
// 승 +1~3 / 패 -1~-3 (상대가 높을수록 승은 크게·패는 작게)
export function calc(win, steps, mult) {
  const s = clamp(steps, -1, 1);
  return Math.round((win ? 2 + s : -(2 - s)) * mult);
}

// 결과 반영: 새 me 반환 (불변)
export function applyResult(me, { opp, oppTier, win, kind }) {
  const next = { ...me, promo: me.promo ? { ...me.promo } : null };
  const rec = { opp, oppTier, win, kind, ts: Date.now(), delta: 0, note: '' };
  if (next.promo) {
    if (oppTier < next.tier) { rec.note = '승급전은 같은 등급 이상 상대만 인정'; }
    else {
      win ? next.promo.w++ : next.promo.l++;
      rec.note = `승급전 ${next.promo.w}승 ${next.promo.l}패`;
      if (next.promo.w >= 3) { next.tier++; next.pts = 25; next.promo = null; rec.note = `승급! ${tierLabel(next.tier)}`; }
      else if (next.promo.l >= 3) { next.pts = 70; next.promo = null; rec.note = '승급전 실패, 70점 복귀'; }
    }
  } else {
    rec.delta = calc(win, oppTier - next.tier, oppMult(me.matches, opp));
    next.pts += rec.delta;
    if (next.pts >= PROMO_AT) { next.pts = PROMO_AT; if (next.tier < 6) { next.promo = { w: 0, l: 0 }; rec.note = '승급전 시작'; } }
    else if (next.pts <= 0) { if (next.tier > 0) { next.tier--; next.pts = 75; rec.note = `강등 ${tierLabel(next.tier)}`; } else next.pts = 0; }
  }
  next.matches = [...me.matches, rec];
  return next;
}
