import { ME } from './data';

// 표준 시드 배치 순서 (상위 시드가 양 끝, 부전승은 상위 시드가 받음)
export const seedOrder = (S) => { let o = [1]; while (o.length < S) { const n = o.length * 2; o = o.flatMap((x) => [x, n + 1 - x]); } return o; };
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
export const playersOf = (t) => String(t.name).split(' / ');
export const setsWon = (r) => r.sets.reduce((a, s) => [a[0] + (s[0] > s[1] ? 1 : 0), a[1] + (s[1] > s[0] ? 1 : 0)], [0, 0]);
export const winnerOf = (r) => { if (!r) return null; const w = setsWon(r); return w[0] > w[1] ? 'a' : w[1] > w[0] ? 'b' : null; };

// method: 'random' 올랜덤 | 'rank' 랭킹 시드배정 | 'ntrp' NTRP배정(비슷한 실력끼리 1회전) | 'manual' 운영진 자유배정
export function makeSlots(teams, method, manualIds) {
  const n = teams.length; let S = 2; while (S < n) S *= 2;
  const order = seedOrder(S), sorted = [...teams].sort((a, b) => b.score - a.score);
  if (method === 'manual') return manualIds.map((id) => teams.find((t) => t.id === id) || null);
  if (method === 'ntrp') { let k = 0; return order.map((s) => (s <= n ? { ...sorted[k++] } : null)); }
  const by = {};
  if (method === 'rank') sorted.forEach((t, i) => { by[i + 1] = { ...t, seed: i + 1 }; });
  else shuffle(teams).forEach((t, i) => { by[i + 1] = { ...t }; });
  return order.map((s) => by[s] || null);   // null = 부전승
}

// 라운드별 대진 (결과가 있으면 승자가 다음 라운드로 올라감). 팀 객체 / null(부전승) / undefined(승자 미정)
export function buildRounds(slots, results) {
  const R = results || {};
  let cur = slots; const rounds = [];
  for (let r = 0; cur.length > 1; r++) {
    const m = [], nxt = [];
    for (let i = 0; i < cur.length; i += 2) {
      const a = cur[i], b = cur[i + 1], key = r + '-' + i / 2, res = R[key], w = winnerOf(res);
      m.push({ a, b, key, res });
      nxt.push(a === null ? b : b === null ? a : w === 'a' ? a : w === 'b' ? b : undefined);
    }
    rounds.push(m); cur = nxt;
  }
  rounds.champion = cur[0];
  return rounds;
}

// 경기 통계: 개인별 승/패/득실세트/득실게임/최대연승/베이글(6-0) 승
export function computeStats(rounds) {
  const S = {};
  const get = (n) => { if (!S[n]) S[n] = { name: n, w: 0, l: 0, sf: 0, sa: 0, gf: 0, ga: 0, cur: 0, best: 0, bagel: 0 }; return S[n]; };
  rounds.forEach((round) => round.forEach((mt) => {
    const a = mt.a, b = mt.b, res = mt.res;
    if (!a || !b || !res) return;
    const win = winnerOf(res); if (!win) return;
    const sw = setsWon(res), ga = res.sets.reduce((s, x) => s + x[0], 0), gb = res.sets.reduce((s, x) => s + x[1], 0);
    [[a, 'a', sw[0], sw[1], ga, gb], [b, 'b', sw[1], sw[0], gb, ga]].forEach(([t, side, sf, sa, gf, gA]) => {
      const bag = res.sets.filter((x) => (side === 'a' ? x[0] === 6 && x[1] === 0 : x[1] === 6 && x[0] === 0)).length;
      playersOf(t).forEach((n) => {
        const s = get(n);
        if (win === side) { s.w++; s.cur++; s.best = Math.max(s.best, s.cur); } else { s.l++; s.cur = 0; }
        s.sf += sf; s.sa += sa; s.gf += gf; s.ga += gA; s.bagel += bag;
      });
    });
  }));
  return Object.values(S).sort((x, y) => y.w - x.w || (y.sf - y.sa) - (x.sf - x.sa) || (y.gf - y.ga) - (x.gf - x.ga));
}

const T = (id, name, score) => ({ id, name, score });
const six = [T('a', '민수 / 지현', 120), T('b', '서연 / 태호', 180), T('c', '하늘 / 도윤', 240), T('d', '유진 / 지훈', 310), T('e', '수아 / 현우', 350), T('f', '예린 / 민지', 420)];
const eight = ['지훈', '수아', '현우', '예린', '도현', '민지', '준서', '하은'].map((n, i) => T('s' + i, n, 150 + i * 40));
export const SEED_TOURS = [
  { id: 't1', name: '가을 오픈 복식대회', area: '서울', place: '올림픽공원 테니스장', date: '2026-10-24', time: '09:00', regStart: '2026-10-01', regEnd: '2026-10-20', format: '복식', cap: 16, fee: 40000, prize: '우승 50만원 · 준우승 30만원 · 공동 3위 라켓가방', host: ME, participants: six, bracket: null },
  { id: 't2', name: '광교 챌린저 단식대회', area: '경기', place: '광교 테니스장', date: '2026-10-25', time: '10:00', regStart: '2026-09-25', regEnd: '2026-10-15', format: '단식', cap: 8, fee: 20000, prize: '우승 30만원 · 준우승 15만원', host: '광교테니스협회', participants: eight, bracket: { m1: 'tour', m2: 'rank', slots: makeSlots(eight, 'rank'), results: {} } },
  { id: 't3', name: '인천 클럽 대항전', area: '인천', place: '인천 송도 테니스장', date: '2026-10-31', time: '13:00', regStart: '2026-10-05', regEnd: '2026-10-25', format: '복식', cap: 8, fee: 30000, prize: '우승 트로피 · 상품권', host: '인천테니스연합', participants: six.slice(0, 3), bracket: null },
  { id: 't4', name: '서울 혼합복식 페스티벌', area: '서울', place: '양재 시민의숲', date: '2026-11-07', time: '09:30', regStart: '2026-10-20', regEnd: '2026-11-01', format: '혼합복식', cap: 16, fee: 40000, prize: '우승 40만원 · 준우승 20만원', host: '양재테니스클럽', participants: [], bracket: null },
  { id: 't5', name: '해운대 오픈', area: '부산', place: '부산 해운대 테니스장', date: '2026-11-14', time: '09:00', regStart: '2026-10-10', regEnd: '2026-11-05', format: '단식', cap: 32, fee: 25000, prize: '우승 60만원 · 준우승 30만원 · 3위 20만원', host: '부산테니스협회', participants: eight.slice(0, 4), bracket: null },
  { id: 'tc1', name: '송파 10월 월례대회', area: '서울', place: '올림픽공원 테니스장', date: '2026-10-31', time: '10:00', regStart: '2026-10-05', regEnd: '2026-10-28', format: '복식', cap: 8, fee: 20000, prize: '우승 상품권 · 준우승 음료권', host: ME, clubId: 'c1', pubExchange: true, pubMatch: false, participants: six.slice(0, 4), bracket: null },
  { id: 'tc2', name: '송파 11월 내부 월례대회', area: '서울', place: '올림픽공원 테니스장', date: '2026-11-15', time: '10:00', regStart: '2026-10-20', regEnd: '2026-11-10', format: '단식', cap: 8, fee: 10000, prize: '우승 트로피', host: ME, clubId: 'c1', pubExchange: false, pubMatch: false, participants: [], bracket: null },
];
