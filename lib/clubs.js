import { ME } from './data';

const m = (name, birth, career, ntrp, joined) => ({ name, birth, career, ntrp, joined });
const rules = [{ id: 1, name: '정모 참석', pts: 10 }, { id: 2, name: '정모 매칭 승리', pts: 20 }, { id: 3, name: '월례대회 입상', pts: 50 }, { id: 4, name: '월례대회 우승', pts: 100 }];
const log = (member, ruleId, date, id) => ({ id, member, ruleId, date });
export const SEED_CLUBS = [
  { id: 'c1', name: '송파 라켓클럽', intro: '주말마다 모여서 즐겁게 치는 송파 동호회예요. 초보 환영!', area: '서울', district: '송파구', admin: ME,
    court: '올림픽공원 테니스장', meetDay: '토', rules: ['정모 불참 시 전날까지 공지해요.', '매너 있는 플레이를 지켜요.'], achievements: ['2026 상반기 교류전 우승'],
    members: [m(ME, '1990', 5, 3.0, '2025-03'), m('민수', '1988', 8, 3.5, '2024-11'), m('지현', '1993', 3, 2.5, '2026-01'), m('서연', '1995', 2, 2.5, '2026-05')],
    notices: [{ id: 1, title: '10월 정모 안내', body: '10/18(토) 19시 올림픽공원 3번 코트입니다.', date: '2026-10-10', author: ME }],
    rankRules: rules, rankLog: [log('민수', 4, '2026-08-20', 1), log('지현', 1, '2026-10-04', 2), log(ME, 2, '2026-10-04', 3), log('민수', 1, '2026-10-04', 4), log(ME, 3, '2026-05-15', 5)],
    fees: { amount: 20000, dueDay: 5, paid: { '2026-10': [ME, '민수'], '2026-09': [ME, '민수', '지현'] },
      account: { bank: '카카오뱅크 모임통장', last4: '4567', holder: '송파 라켓클럽' },
      tx: [{ id: 1, date: '2026-10-12', type: 'out', amount: 45000, cat: '공구입', memo: '테니스공 2박스' }, { id: 2, date: '2026-10-06', type: 'in', amount: 20000, who: '민수', cat: '회비' }, { id: 3, date: '2026-10-05', type: 'in', amount: 20000, who: ME, cat: '회비' }, { id: 4, date: '2026-09-28', type: 'out', amount: 60000, cat: '코트비', memo: '정모 코트 대관' }, { id: 5, date: '2026-09-07', type: 'in', amount: 20000, who: '지현', cat: '회비' }, { id: 6, date: '2026-09-06', type: 'in', amount: 20000, who: '민수', cat: '회비' }, { id: 7, date: '2026-09-05', type: 'in', amount: 20000, who: ME, cat: '회비' }],
      alerts: [{ id: 1, date: '2026-10-12', text: '통장 출금 45,000원 · 공구입 (테니스공 2박스)' }] } },
  { id: 'c2', name: '광교 테니스모임', intro: '광교호수공원 근처에서 평일 저녁에 모여요.', area: '경기', district: '수원시', admin: '하늘',
    court: '광교 테니스장', meetDay: '수', rules: [], achievements: [],
    members: [m('하늘', '1991', 6, 3.5, '2025-01'), m('도윤', '1992', 4, 3.0, '2025-06')],
    notices: [], rankRules: rules.slice(0, 2), rankLog: [], fees: { amount: 15000, paid: {} } },
];
