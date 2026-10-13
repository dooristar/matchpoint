import { ME } from './data';

// 표준 시드 배치 순서 (1번 시드와 2번 시드가 양 끝, 상위 시드가 부전승을 받음)
export const seedOrder = (S) => { let o = [1]; while (o.length < S) { const n = o.length * 2; o = o.flatMap((x) => [x, n + 1 - x]); } return o; };
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// method: 'random'(올랜덤) | 'seedRandom'(시드 배정 후 랜덤) | 'rank'(랭크점수 시드·배정)
export function makeSlots(teams, method) {
  const n = teams.length; let S = 2; while (S < n) S *= 2;
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const k = Math.min(n, Math.max(2, S / 4)), by = {};
  if (method === 'rank') sorted.forEach((t, i) => { by[i + 1] = { ...t, seed: i + 1 }; });
  else if (method === 'seedRandom') { sorted.slice(0, k).forEach((t, i) => { by[i + 1] = { ...t, seed: i + 1 }; }); shuffle(sorted.slice(k)).forEach((t, i) => { by[k + 1 + i] = { ...t }; }); }
  else shuffle(teams).forEach((t, i) => { by[i + 1] = { ...t }; });
  return seedOrder(S).map((s) => by[s] || null);   // null = 부전승
}
// 라운드별 대진: 팀 객체 / null(부전승) / undefined(승자 미정)
export function buildRounds(slots) {
  let cur = slots; const rounds = [];
  while (cur.length > 1) {
    const m = [], nxt = [];
    for (let i = 0; i < cur.length; i += 2) { const a = cur[i], b = cur[i + 1]; m.push([a, b]); nxt.push(a === null ? b : b === null ? a : undefined); }
    rounds.push(m); cur = nxt;
  }
  return rounds;
}

const T = (id, name, score) => ({ id, name, score });
const six = [T('a', '민수 / 지현', 120), T('b', '서연 / 태호', 180), T('c', '하늘 / 도윤', 240), T('d', '유진 / 지훈', 310), T('e', '수아 / 현우', 350), T('f', '예린 / 민지', 420)];
const eight = ['지훈', '수아', '현우', '예린', '도현', '민지', '준서', '하은'].map((n, i) => T('s' + i, n, 150 + i * 40));
export const SEED_TOURS = [
  { id: 't1', name: '가을 오픈 복식대회', area: '서울', place: '올림픽공원 테니스장', date: '2026-10-24', time: '09:00', regStart: '2026-10-01', regEnd: '2026-10-20', format: '복식', cap: 16, fee: 40000, prize: '우승 50만원 · 준우승 30만원 · 공동 3위 라켓가방', host: ME, participants: six, bracket: null },
  { id: 't2', name: '광교 챌린저 단식대회', area: '경기', place: '광교 테니스장', date: '2026-10-25', time: '10:00', regStart: '2026-09-25', regEnd: '2026-10-15', format: '단식', cap: 8, fee: 20000, prize: '우승 30만원 · 준우승 15만원', host: '광교테니스협회', participants: eight, bracket: { method: 'rank', slots: makeSlots(eight, 'rank') } },
  { id: 't3', name: '인천 클럽 대항전', area: '인천', place: '인천 송도 테니스장', date: '2026-10-31', time: '13:00', regStart: '2026-10-05', regEnd: '2026-10-25', format: '복식', cap: 8, fee: 30000, prize: '우승 트로피 · 상품권', host: '인천테니스연합', participants: six.slice(0, 3), bracket: null },
  { id: 't4', name: '서울 혼합복식 페스티벌', area: '서울', place: '양재 시민의숲', date: '2026-11-07', time: '09:30', regStart: '2026-10-20', regEnd: '2026-11-01', format: '혼합복식', cap: 16, fee: 40000, prize: '우승 40만원 · 준우승 20만원', host: '양재테니스클럽', participants: [], bracket: null },
  { id: 't5', name: '해운대 오픈', area: '부산', place: '부산 해운대 테니스장', date: '2026-11-14', time: '09:00', regStart: '2026-10-10', regEnd: '2026-11-05', format: '단식', cap: 32, fee: 25000, prize: '우승 60만원 · 준우승 30만원 · 3위 20만원', host: '부산테니스협회', participants: eight.slice(0, 4), bracket: null },
];
