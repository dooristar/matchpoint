import { buildRounds, winnerOf, playersOf } from './tournaments';

// 운영진이 고르는 점수 방법(기준) — 점수는 클럽 경기 기록에서 자동으로 쌓여요
export const TRIGGERS = [['game', '경기 참여 (1경기당)'], ['win', '경기 승리 (1승당)'], ['attend', '정모 참석 (1회당)'], ['champ', '월례대회 우승'], ['runner', '월례대회 준우승'], ['mvp', '월례대회 MVP']];
export const quarterOf = (d) => Math.floor((+d.slice(5, 7) - 1) / 3) + 1;
const blank = (name) => ({ name, games: 0, w: 0, l: 0, att: 0, champ: 0, runner: 0, mvp: 0, pts: 0 });
const rankSort = (a, b) => b.pts - a.pts || b.w - a.w || b.games - a.games;
export const seasonKey = (d) => `${d.slice(0, 4)}-${quarterOf(d)}`;

// 클럽 정모매칭·월례대회 결과를 분기별로 집계: { '2026-4': { 이름: 집계 } }
export function liveSeasons(club, posts, tours) {
  const S = {};
  const row = (d, n) => { const k = seasonKey(d); if (!S[k]) S[k] = {}; if (!S[k][n]) S[k][n] = blank(n); return S[k][n]; };
  posts.filter((p) => p.clubId === club.id && p.result && p.result.final).forEach((p) => {
    [p.host, ...p.accepted].map((x) => x.name).forEach((n) => {
      const r = row(p.date, n), win = p.result.opps.includes(n) ? !p.result.win : p.result.win;
      r.games++; r.att++; if (win) r.w++; else r.l++;
    });
  });
  tours.filter((t) => t.clubId === club.id && t.bracket).forEach((t) => {
    const rounds = buildRounds(t.bracket.slots, t.bracket.results);
    rounds.forEach((rd) => rd.forEach((m) => {
      if (!m.a || !m.b || !m.res) return;
      const w = winnerOf(m.res); if (!w) return;
      [[m.a, w === 'a'], [m.b, w === 'b']].forEach(([team, win]) => playersOf(team).forEach((n) => { const r = row(t.date, n); r.games++; if (win) r.w++; else r.l++; }));
    }));
    const fin = rounds.length ? rounds[rounds.length - 1][0] : null;
    if (fin && fin.a && fin.b && fin.res) {
      const w = winnerOf(fin.res);
      if (w) { playersOf(w === 'a' ? fin.a : fin.b).forEach((n) => { row(t.date, n).champ++; }); playersOf(w === 'a' ? fin.b : fin.a).forEach((n) => { row(t.date, n).runner++; }); }
    }
    if (t.mvp) row(t.date, t.mvp).mvp++;
  });
  return S;
}
const per = { game: 'games', win: 'w', attend: 'att', champ: 'champ', runner: 'runner', mvp: 'mvp' };
const score = (r, rules) => (rules || []).reduce((a, ru) => a + ru.pts * (r[per[ru.trigger]] || 0), 0);

// 한 시즌의 전체 회원 순위표 (지난 시즌은 저장된 기록 history 우선)
export function seasonRows(club, live, key) {
  const h = (club.history || []).find((x) => `${x.y}-${x.q}` === key);
  if (h) return h.rows.map((r) => ({ ...blank(r.name), ...r })).sort(rankSort);
  const l = live[key] || {};
  const rows = club.members.map((m) => ({ ...blank(m.name), ...(l[m.name] || {}) }));
  rows.forEach((r) => { r.pts = score(r, club.rankRules); });
  return rows.sort(rankSort);
}
// 해당 연도 4시즌 통합 점수 (연간 MVP)
export function yearTotals(club, posts, tours, y) {
  const year = y || new Date().getFullYear() + '', live = liveSeasons(club, posts, tours);
  const keys = new Set([...(club.history || []).map((h) => `${h.y}-${h.q}`), ...Object.keys(live)]);
  const tot = Object.fromEntries(club.members.map((m) => [m.name, { name: m.name, pts: 0, games: 0 }]));
  [...keys].filter((k) => k.startsWith(year)).forEach((k) => seasonRows(club, live, k).forEach((r) => { if (tot[r.name]) { tot[r.name].pts += r.pts; tot[r.name].games += r.games; } }));
  return Object.values(tot).sort((a, b) => b.pts - a.pts || b.games - a.games);
}
