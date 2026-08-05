const NAV = [
  { id: 'home', icon: '🏠', label: 'Home / Upload' },
  { id: 'code', icon: '📁', label: 'Code & Review' },
  { id: 'organize', icon: '🧹', label: 'Organizer' },
  { id: 'terminal', icon: '💻', label: 'GitBash Terminal' },
  { id: 'deploy', icon: '🚀', label: 'Deploy' },
  { id: 'settings', icon: '⚙️', label: 'Settings' }
];

export default function Sidebar({ tab, setTab, hasProject }) {
  return (
    <nav className="sidebar">
      <div className="logo">⚡</div>
      {NAV.map(n => (
        <button
          key={n.id}
          className={`navbtn ${tab === n.id ? 'active' : ''}`}
          title={n.label}
          onClick={() => setTab(n.id)}
        >
          {n.icon}
        </button>
      ))}
    </nav>
  );
}
