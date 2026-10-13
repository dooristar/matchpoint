'use client';
import { useEffect, useState } from 'react';
import Profile from '../components/Profile';
import Matches from '../components/Matches';
import Tournaments from '../components/Tournaments';
import Club from '../components/Club';
import Missions from '../components/Missions';
import Inquiry from '../components/Inquiry';
import Market from '../components/Market';
import Soon from '../components/Soon';
import { initialMe } from '../lib/rating';
import { SEED_POSTS } from '../lib/data';
import { SEED_TOURS } from '../lib/tournaments';
import { SEED_CLUBS } from '../lib/clubs';

// 상단 메뉴 / 하단 메뉴
const TOP = [['match', '일반/랭크 매칭'], ['club', '클럽'], ['tour', '대회'], ['lesson', '(추후)레슨/대관'], ['market', '(추후)마켓']];
const BOT = [['profile', '프로필정보'], ['mission', '미션'], ['chat', '채팅'], ['ask', '문의']];
const KEYS = { me: 'court-mate-dev', posts: 'court-mate-posts-v2', tours: 'court-mate-tours-v1', clubs: 'court-mate-clubs-v1' };

export default function Page() {
  const [tab, setTab] = useState('match');
  const [me, setMe] = useState(initialMe());
  const [posts, setPosts] = useState(SEED_POSTS);
  const [tours, setTours] = useState(SEED_TOURS);
  const [clubs, setClubs] = useState(SEED_CLUBS);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const load = (k, set) => { try { const v = JSON.parse(localStorage.getItem(KEYS[k])); if (v) set(v); } catch (e) {} };
    load('me', setMe); load('posts', setPosts); load('tours', setTours); load('clubs', setClubs);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEYS.me, JSON.stringify(me)); localStorage.setItem(KEYS.posts, JSON.stringify(posts)); localStorage.setItem(KEYS.tours, JSON.stringify(tours)); localStorage.setItem(KEYS.clubs, JSON.stringify(clubs)); } catch (e) {}
  }, [me, posts, tours, clubs, ready]);
  const go = (k) => { setTab(k); scrollTo(0, 0); };
  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 15, display: 'flex', overflowX: 'auto', background: 'var(--card)', borderBottom: '1px solid var(--line)' }}>
        {TOP.map(([k, t]) => (
          <button key={k} aria-current={tab === k ? 'page' : undefined} onClick={() => go(k)}
            style={{ flex: '1 0 auto', border: 0, background: 'none', font: 'inherit', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', padding: '14px 12px', cursor: 'pointer', color: tab === k ? 'var(--court)' : 'var(--mute)', boxShadow: tab === k ? 'inset 0 -3px 0 var(--court)' : 'none' }}>{t}</button>))}
      </header>
      <main>
        {tab === 'profile' && <Profile me={me} setMe={setMe} />}
        {tab === 'match' && <Matches me={me} setMe={setMe} posts={posts} setPosts={setPosts} />}
        {tab === 'club' && <Club me={me} setMe={setMe} clubs={clubs} setClubs={setClubs} posts={posts} setPosts={setPosts} />}
        {tab === 'tour' && <Tournaments tours={tours} setTours={setTours} me={me} />}
        {tab === 'lesson' && <Soon title="레슨/대관" items={['추후 업데이트']} />}
        {tab === 'market' && <Market />}
        {tab === 'mission' && <Missions me={me} setMe={setMe} />}
        {tab === 'chat' && <Soon title="채팅" items={['클럽 단체채팅', '개인채팅 (카카오톡처럼)']} />}
        {tab === 'ask' && <Inquiry />}
      </main>
      <nav>{BOT.map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => go(k)} style={{ flex: 1 }}>{t}</button>)}</nav>
    </>
  );
}
