'use client';
import { useEffect, useState } from 'react';
import Profile from '../components/Profile';
import Matches from '../components/Matches';
import Tournaments from '../components/Tournaments';
import Soon from '../components/Soon';
import { initialMe } from '../lib/rating';
import { SEED_POSTS } from '../lib/data';
import { SEED_TOURS } from '../lib/tournaments';

const TABS = [['profile', '프로필'], ['match', '일반/랭크 매칭'], ['club', '클럽'], ['tour', '대회'], ['gear', '(추후)라켓/스트링'], ['market', '(추후)중고마켓'], ['lesson', '(추후)레슨/대관']];
const KEY = 'court-mate-dev', PKEY = 'court-mate-posts-v2', TKEY = 'court-mate-tours-v1';

export default function Page() {
  const [tab, setTab] = useState('match');
  const [me, setMe] = useState(initialMe());
  const [posts, setPosts] = useState(SEED_POSTS);
  const [tours, setTours] = useState(SEED_TOURS);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) setMe(s); } catch (e) {}
    try { const p = JSON.parse(localStorage.getItem(PKEY)); if (p) setPosts(p); } catch (e) {}
    try { const t = JSON.parse(localStorage.getItem(TKEY)); if (t) setTours(t); } catch (e) {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(KEY, JSON.stringify(me)); localStorage.setItem(PKEY, JSON.stringify(posts)); localStorage.setItem(TKEY, JSON.stringify(tours)); } catch (e) {}
  }, [me, posts, tours, ready]);
  return (
    <>
      <main>
        {tab === 'profile' && <Profile me={me} setMe={setMe} />}
        {tab === 'match' && <Matches me={me} setMe={setMe} posts={posts} setPosts={setPosts} />}
        {tab === 'club' && <Soon title="클럽" items={['클럽 만들기 · 멤버 관리', '클럽 내 경기 기록과 랭킹', '자동 대진 생성']} />}
        {tab === 'tour' && <Tournaments tours={tours} setTours={setTours} me={me} />}
        {tab === 'gear' && <Soon title="라켓/스트링" items={['추후 업데이트']} />}
        {tab === 'market' && <Soon title="중고마켓" items={['추후 업데이트']} />}
        {tab === 'lesson' && <Soon title="레슨/대관" items={['추후 업데이트']} />}
      </main>
      <nav>{TABS.map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); scrollTo(0, 0); }}>{t}</button>)}</nav>
    </>
  );
}
