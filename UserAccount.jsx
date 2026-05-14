const { useState } = React;

function UserAccount() {
  const [user, setUser] = useState({
    id: 1,
    username: 'foxtaex',
    displayName: 'foxtaex',
    email: 'foxtaex@example.com',
    avatar: null,
    teams: [
      { id: 1, name: 'Design', color: '#22c55e', role: 'Member' },
      { id: 2, name: 'Development', color: '#3b82f6', role: 'Admin' }
    ]
  });
  
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.displayName);
  const [editedEmail, setEditedEmail] = useState(user.email);
  
  const saveChanges = () => {
    setUser({ ...user, displayName: editedName, email: editedEmail });
    setEditing(false);
  };
  
  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'rgb(9 9 11)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>
        
        {/* Profile Header */}
        <div style={{ background: 'rgb(24 24 27)', borderRadius: '12px', border: '1px solid rgb(39 39 42)', padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgb(63 63 70)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 700, color: 'rgb(212 212 216)', border: '3px solid rgb(39 39 42)' }}>
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <button
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  border: '3px solid rgb(24 24 27)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                  transition: 'transform 200ms'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Foto ändern"
              >
                <i className="fa-solid fa-camera"></i>
              </button>
            </div>
            
            {/* User Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 4px 0', color: 'rgb(244 244 245)' }}>
                {user.displayName}
              </h1>
              <p style={{ fontSize: '16px', color: 'rgb(113 113 122)', margin: '0 0 20px 0' }}>
                @{user.username}
              </p>
              
              {/* Teams */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {user.teams.map(team => (
                  <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: team.color + '22', border: '1px solid ' + team.color + '44', fontSize: '13px', fontWeight: 600 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: team.color }}></span>
                    <span style={{ color: team.color }}>{team.name}</span>
                    <span style={{ color: team.color + 'aa', fontSize: '11px' }}>• {team.role}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setEditing(!editing)}
                style={{
                  background: editing ? 'transparent' : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  color: 'white',
                  border: editing ? '1px solid rgb(63 63 70)' : 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: editing ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.4)',
                  transition: 'all 200ms'
                }}
                onMouseEnter={e => !editing && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => !editing && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <i className={`fa-solid fa-${editing ? 'xmark' : 'pen'}`}></i>
                {editing ? 'Abbrechen' : 'Profil bearbeiten'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Account Settings */}
        <div style={{ background: 'rgb(24 24 27)', borderRadius: '12px', border: '1px solid rgb(39 39 42)', padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 20px 0', color: 'rgb(244 244 245)' }}>
            Account-Einstellungen
          </h2>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Display Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgb(212 212 216)', marginBottom: '8px' }}>
                Anzeigename
              </label>
              <input
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                disabled={!editing}
                style={{ 
                  width: '100%', 
                  background: editing ? 'rgb(39 39 42)' : 'rgb(24 24 27)', 
                  border: '1px solid rgb(63 63 70)', 
                  color: 'rgb(244 244 245)', 
                  borderRadius: '8px', 
                  padding: '10px 12px', 
                  fontSize: '14px', 
                  outline: 'none',
                  cursor: editing ? 'text' : 'not-allowed',
                  opacity: editing ? 1 : 0.6
                }}
              />
            </div>
            
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgb(212 212 216)', marginBottom: '8px' }}>
                E-Mail
              </label>
              <input
                type="email"
                value={editedEmail}
                onChange={e => setEditedEmail(e.target.value)}
                disabled={!editing}
                style={{ 
                  width: '100%', 
                  background: editing ? 'rgb(39 39 42)' : 'rgb(24 24 27)', 
                  border: '1px solid rgb(63 63 70)', 
                  color: 'rgb(244 244 245)', 
                  borderRadius: '8px', 
                  padding: '10px 12px', 
                  fontSize: '14px', 
                  outline: 'none',
                  cursor: editing ? 'text' : 'not-allowed',
                  opacity: editing ? 1 : 0.6
                }}
              />
            </div>
            
            {/* Username (read-only) */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgb(212 212 216)', marginBottom: '8px' }}>
                Benutzername
              </label>
              <input
                value={user.username}
                disabled
                style={{ 
                  width: '100%', 
                  background: 'rgb(24 24 27)', 
                  border: '1px solid rgb(63 63 70)', 
                  color: 'rgb(113 113 122)', 
                  borderRadius: '8px', 
                  padding: '10px 12px', 
                  fontSize: '14px', 
                  outline: 'none',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />
              <p style={{ fontSize: '12px', color: 'rgb(113 113 122)', margin: '6px 0 0 0' }}>
                Der Benutzername kann nicht geändert werden
              </p>
            </div>
            
            {editing && (
              <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
                <button
                  onClick={saveChanges}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                    transition: 'all 200ms'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Änderungen speichern
                </button>
                <button
                  onClick={() => {
                    setEditedName(user.displayName);
                    setEditedEmail(user.email);
                    setEditing(false);
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    color: 'rgb(161 161 170)',
                    border: '1px solid rgb(63 63 70)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 200ms'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgb(113 113 122)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgb(63 63 70)'}
                >
                  Abbrechen
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Danger Zone */}
        <div style={{ background: 'rgb(24 24 27)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '24px', marginTop: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: 'rgb(244 244 245)' }}>
            Gefahrenbereich
          </h2>
          <p style={{ fontSize: '13px', color: 'rgb(161 161 170)', margin: '0 0 16px 0' }}>
            Vorsicht: Diese Aktionen können nicht rückgängig gemacht werden
          </p>
          <button
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
              transition: 'all 200ms'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <i className="fa-solid fa-trash"></i>
            Account löschen
          </button>
        </div>
        
      </div>
    </div>
  );
}

window.UserAccount = UserAccount;