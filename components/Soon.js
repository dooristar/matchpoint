export default function Soon({ title, items }) {
  return (
    <div>
      <h1>{title}</h1>
      <div className="card">
        <span className="tag ball">개발 예정</span>
        <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
    </div>
  );
}
