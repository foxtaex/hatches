const { useState } = React;

function Navigation({ active, onNavigate, currentUser }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navItems = [
    { id: 'board', label: 'Board', icon: 'table-columns' },
    { id: 'docs', label: 'Docs', icon: 'file-lines' },
    { id: 'notes', label: 'Notizen', icon: 'note-sticky' },
    { id: 'websites', label: 'Websites', icon: 'globe' },
    { id: 'integrations', label: 'Integrationen', icon: 'puzzle-piece' }
  ];
  
  if (currentUser?.isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: 'gear' });
  }
  
  return (
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 32px', 
      height: '72px', 
      background: 'rgba(18, 18, 18, 0.7)', 
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Logo - Mark B (Subtle) from user's design */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginRight: '48px' }}>
        <svg width="28" height="28" viewBox="0 0 280 280">
          <defs>
            <linearGradient id="nav-mark-m" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1a3f33"/>
              <stop offset="100%" stopColor="#0e2620"/>
            </linearGradient>
            <linearGradient id="nav-mark-l" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7CE3B3"/>
              <stop offset="100%" stopColor="#3CC79A"/>
            </linearGradient>
            <filter id="nav-mark-f" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3"/>
            </filter>
          </defs>
          <path d="M 64 20 Q 20 20 20 64 L 20 216 Q 20 260 64 260 L 216 260 Q 260 260 260 216 L 260 64 Q 260 20 216 20 Z" fill="url(#nav-mark-m)" stroke="#23574a" strokeWidth="1"/>
          <g filter="url(#nav-mark-f)" opacity="0.85">
            <rect x="74" y="66" width="32" height="148" rx="5" fill="#3CC79A"/>
            <rect x="174" y="66" width="32" height="148" rx="5" fill="#3CC79A"/>
            <polygon points="74,128 206,112 206,140 74,156" fill="#3CC79A"/>
          </g>
          <g fill="#7CE3B3">
            <rect x="74" y="66" width="32" height="148" rx="5"/>
            <rect x="174" y="66" width="32" height="148" rx="5"/>
          </g>
          <polygon points="74,158 206,142 206,150 74,168" fill="#000" opacity="0.35"/>
          <polygon points="74,128 206,112 206,140 74,156" fill="url(#nav-mark-l)"/>
          <polygon points="74,128 206,112 206,116 74,132" fill="#ffffff" opacity="0.25"/>
        </svg>
        <span style={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.8px' 
        }}>
          hatches
        </span>
      </div>
      
      {/* Nav Items */}
      <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: active === item.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: active === item.id ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.6)',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'scale(1)',
              boxShadow: active === item.id ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
            }}
            onMouseEnter={e => {
              if (active !== item.id) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={e => {
              if (active !== item.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <i className={`fa-solid fa-${item.icon}`} style={{ width: '16px', textAlign: 'center', fontSize: '14px' }}></i>
            {item.label}
          </button>
        ))}
      </div>
      
      {/* User Menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 14px',
            background: showUserMenu ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.9)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={e => {
            if (!showUserMenu) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '14px', 
            fontWeight: 600, 
            color: '#fff',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
          }}>
            {currentUser.displayName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '15px', fontWeight: 500 }}>{currentUser.displayName}</span>
          <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px', opacity: 0.6 }}></i>
        </button>
        
        {showUserMenu && (
          <div style={{ 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            marginTop: '12px', 
            width: '220px', 
            background: 'rgba(28, 28, 28, 0.85)', 
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '14px', 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)', 
            zIndex: 1000,
            padding: '6px'
          }}>
            <button
              onClick={() => {
                onNavigate('user');
                setShowUserMenu(false);
              }}
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '12px 14px', 
                background: 'transparent', 
                border: 'none', 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '15px', 
                cursor: 'pointer', 
                textAlign: 'left', 
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <i className="fa-solid fa-user" style={{ width: '16px', opacity: 0.8 }}></i>
              Mein Account
            </button>
            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '6px 8px' }}></div>
            <button
              onClick={() => alert('Abmelden')}
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '12px 14px', 
                background: 'transparent', 
                border: 'none', 
                color: '#ef4444', 
                fontSize: '15px', 
                cursor: 'pointer', 
                textAlign: 'left', 
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: '16px' }}></i>
              Abmelden
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

window.Navigation = Navigation;