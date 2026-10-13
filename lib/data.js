// 데모용 데이터. kind: '일반'|'랭크', lo/hi: 모집 등급 인덱스(0=2.0 ... 6=5.0)
export const ME = '뚜리스타';
export const AREAS = ['서울', '경기', '인천', '부산'];
export const COURTS = {
  '올림픽공원 테니스장': { addr: '서울 송파구 올림픽로 424', area: '서울', n: 6 },
  '양재 시민의숲': { addr: '서울 서초구 매헌로 99', area: '서울', n: 4 },
  '장충 테니스장': { addr: '서울 중구 동호로 261', area: '서울', n: 3 },
  '광교 테니스장': { addr: '경기 수원시 영통구 광교호수공원로', area: '경기', n: 4 },
};
export const TIER_COLORS = ['#a9713f', '#8e9aa6', '#c79a1a', '#3fa7a0', '#4a7bd0', '#8e52c9', '#d6453d'];
export const NAMES = ['지훈', '수아', '현우', '예린', '도현', '민지', '준서', '하은'];
const h = (name, tier) => ({ name, tier });
const base = { result: null, evals: {}, recvDemo: false };
export const SEED_POSTS = [
  { ...base, id: 1, court: '올림픽공원 테니스장', no: 3, date: '2026-10-18', time: '19:00', kind: '랭크', format: '복식', gender: '무관', lo: 1, hi: 3, career: 2, fee: 8000, cap: 3, memo: '복식 같이 쳐요. 공 지참!', host: h('민수', 2), waiting: [], accepted: [h('지현', 1)] },
  { ...base, id: 2, court: '양재 시민의숲', no: 2, date: '2026-10-19', time: '09:00', kind: '일반', format: '복식', gender: '무관', lo: 0, hi: 6, career: 1, fee: 5000, cap: 3, memo: '가볍게 랠리해요', host: h('서연', 2), waiting: [], accepted: [] },
  { ...base, id: 3, court: '장충 테니스장', no: 1, date: '2026-10-21', time: '20:00', kind: '랭크', format: '단식', gender: '남', lo: 2, hi: 4, career: 3, fee: 10000, cap: 1, memo: '단식 랭크전', host: h('태호', 3), waiting: [], accepted: [] },
  { ...base, id: 4, court: '광교 테니스장', no: 2, date: '2026-10-24', time: '15:00', kind: '랭크', format: '단복식', gender: '무관', lo: 0, hi: 4, career: 1, fee: 0, cap: 3, memo: '내가 연 매칭 (대기자 선택 연습용)', host: h(ME, 2), waiting: [h('지훈', 2), h('수아', 3)], accepted: [] },
];
