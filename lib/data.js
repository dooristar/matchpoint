// 데모용 매칭 데이터 (kind: '일반' | '랭크', lo/hi: 등급 인덱스)
export const AREAS = ['서울', '경기', '인천', '부산'];
export const POSTS = [
  { id: 1, court: '올림픽공원 테니스장 3번', addr: '서울 송파구 올림픽로 424', area: '서울', date: '2026-10-18', time: '저녁', clock: '19:00', kind: '랭크', lo: 1, hi: 3, cap: 4, people: ['민수', '지현'], cond: '복식 · 2시간 · 공 지참' },
  { id: 2, court: '양재 시민의숲 2번', addr: '서울 서초구 매헌로 99', area: '서울', date: '2026-10-19', time: '오전', clock: '09:00', kind: '일반', lo: 0, hi: 6, cap: 4, people: ['서연'], cond: '복식 · 가볍게 랠리' },
  { id: 3, court: '장충 테니스장 1번', addr: '서울 중구 동호로 261', area: '서울', date: '2026-10-21', time: '저녁', clock: '20:00', kind: '랭크', lo: 2, hi: 4, cap: 2, people: ['태호'], cond: '단식 · 1시간 30분' },
  { id: 4, court: '수원 광교 테니스장', addr: '경기 수원시 영통구 광교호수공원로', area: '경기', date: '2026-10-24', time: '오후', clock: '15:00', kind: '일반', lo: 0, hi: 6, cap: 4, people: ['하늘', '도윤', '유진'], cond: '복식 · 초보 환영' },
];
export const RANK_HELP = '랭크 매칭은 모집 등급 범위 안에서만 참가할 수 있고 승급전 경기로 인정돼요. 일반 매칭은 등급 제한이 없고, 결과를 입력하면 일반 경기도 랭크 점수에 반영돼요.';
