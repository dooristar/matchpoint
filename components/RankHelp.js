const TIER_LIST = '2.0(브론즈) / 2.5(실버) / 3.0(골드) / 3.5(플래티넘) / 4.0(다이아) / 4.5(마스터) / 5.0(챌린저)';
const NTRP_TABLE = [
  ['1.0 ~ 1.5', '입문/초보', ['테니스를 막 시작함.', '라켓에 공을 맞추고 코트 안으로 겨우 넘기는 수준 (경기 진행 불가).']],
  ['2.0', '테린이 초급', ['단/복식의 기본적인 포지션은 이해함.', '스윙이 불안정하고 서브 토스 및 타점 찾기에 어려움이 많음.']],
  ['2.5', '테린이 중급', ['천천히 오는 공으로 짧은 랠리가 가능함.', '코트 커버 범위는 좁으나 간단한 클럽 정모/초급자 경기 참여 시작.']],
  ['3.0', '중급 (구력 1~3년차)', ['보통 속도의 공에 대해 포/백핸드 스트로크에 안정성이 생김.', '구속/깊이/방향 조절은 아직 미숙하며, 빠른 볼이나 네트 플레이에 약함.']],
  ['3.5', '중상급 (동호인 표준)', ['중등도 스피드의 스트로크 방향 조절이 안정적임.', '네트 플레이(발리) 및 복식 팀워크 이해도가 높아지며, 스핀/로브 활용 시작.']],
  ['4.0', '상급 (동호회 에이스)', ['강한 구속에서도 포/백 모두 코스(방향)와 깊이 조절(Depth Control)이 가능.', '퍼스트 서브에 파워/위치가 생기고, 위기 상황에서 패싱샷/스매시 성공률이 높음.']],
  ['4.5', '최상급 (지역대회 우승권)', ['파워와 스핀 조절 능력이 뛰어나며, 상황에 따라 플레이 전략 변경 가능.', '퍼스트 서브 성공률이 높고 세컨 서브도 공격적이며 네트 점령이 능숙함.']],
  ['5.0 ~ 5.5', '아마추어 최정상/선수 출신', ['상대의 샷을 예리하게 예측하고, 코트 구석으로 빈틈없는 위너(Winner)를 만듦.', '스핀/체력/멘탈을 무기로 경기 전체 흐름을 주도함.']],
  ['6.0 ~ 7.0', '프로 선수', ['전국 랭커, 대학/주니어 선수 출신(6.0)부터 ATP/WTA 투어 프로 선수(7.0)까지.']],
];
const SELF_CHECK = [
  ['NTRP 3.0', '공을 넘길 수는 있지만 원하는 코스와 깊이로 보내기는 어려워요. 세컨 서브는 그냥 넣는 데 급급한 편이에요.'],
  ['NTRP 3.5', '포핸드는 원하는 방향으로 보낼 수 있지만, 깊고 빠른 공에는 백핸드 실수가 많아요. 발리와 오버헤드를 시도하지만 가끔 찬스볼을 놓쳐요.'],
  ['NTRP 4.0', '포핸드와 백핸드 모두 스핀과 깊이를 조절하고, 원하는 게임 플랜으로 포인트를 만들어요. 복식에서 포칭과 네트 커버가 자연스러워요.'],
];
const CSS = `.nt-row{display:grid;grid-template-columns:62px 118px 1fr;gap:4px 10px;padding:10px 0;border-top:1px solid var(--line)}
.nt-row ul{margin:0;padding-left:16px}.nt-row li{margin-bottom:3px}
@media (max-width:480px){.nt-row{grid-template-columns:62px 1fr}.nt-row ul{grid-column:1 / -1}}`;
const RULES = [
  '한 등급 안에서 0~100점을 쌓고, 100점이 되면 승급전을 해요.',
  '승급전은 5판 중 3승이에요. 3승이나 3패가 먼저 나오면 바로 끝나요.',
  '승급하면 새 등급 25점에서 시작하고, 실패하면 70점으로 돌아가요. 수치는 조정 가능해요.',
  '0점에서 지면 강등이에요.',
  '브론즈는 강등이 없고, 마스터는 승급전이 없어요.',
  '시작 등급은 본인이 설정하며(골드까지만 설정 가능) 신규 가입자는 배치 5경기 동안 점수 변동이 커요.',
  '복식: 두 사람 평균 등급으로 상대 단계차를 계산해요.',
  '어뷰징/조작 방지: 고의로 져서 등급을 낮추거나 이겨서 등급을 높이는 경우를 막기 위해 같은 상대와의 반복 경기는 주당 횟수를 제한해요(초과분은 점수 감소).',
  '결과 확인 필수: 경기 후 상대방 양쪽이 결과를 확인해야 해요.',
  '시즌제: 시즌 종료 시 점수를 리셋하고, 시즌 최고 등급은 배지로 남겨요. 시즌 길이는 3개월이에요.',
];

export default function RankHelp() {
  const h = { margin: '14px 0 6px', fontSize: 15, fontWeight: 700 };
  const ul = { margin: 0, paddingLeft: 18 };
  return (
    <div className="card" style={{ marginTop: 8, fontSize: 14 }}>
      <style>{CSS}</style>
      <div style={{ ...h, marginTop: 0 }}>1. NTRP 설명</div>
      <div className="mute" style={{ marginBottom: 6 }}>앱 등급: {TIER_LIST}</div>
      <div className="nt-row mute" style={{ borderTop: 0, paddingBottom: 4, fontSize: 12 }}><span>등급</span><span>수준</span><span style={{ gridColumn: 'span 1' }}>주요 기술 및 플레이 특징</span></div>
      {NTRP_TABLE.map(([g, lv, f]) => (
        <div className="nt-row" key={g}>
          <b>{g}</b><b>{lv}</b>
          <ul>{f.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>))}
      <div style={h}>💡 주요 세부 기술별 자가 진단 포인트 (3.0 vs 3.5 vs 4.0)</div>
      <div className="mute" style={{ marginBottom: 6 }}>국내 동호인이 가장 많이 몰려 있고 가장 헷갈려 하는 3.0~4.0 구간의 구분법이에요.</div>
      <ul style={ul}>{SELF_CHECK.map(([k, v]) => <li key={k} style={{ marginBottom: 6 }}><b>{k}</b>: {v}</li>)}</ul>
      <div style={h}>2. 점수 규칙</div>
      <div>이기면 +1~3점, 지면 −1~−3점이에요. 상대와의 NTRP 차이만큼 보정해서 합산 100점이 되면 승급전을 해요.</div>
      <div style={h}>3. 승급과 강등</div>
      <ul style={ul}>{RULES.map((t) => <li key={t} style={{ marginBottom: 4 }}>{t}</li>)}</ul>
    </div>
  );
}
