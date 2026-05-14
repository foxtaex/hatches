const { useState } = React;

function AdminSettings() {
  const [activeSection, setActiveSection] = useState('general');
  
  const [generalSettings, setGeneralSettings] = useState({
    orgName: 'Hatches',
    orgEmail: 'team@hatches.dev',
    timezone: 'Europe/Berlin'
  });
  
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'OpenAI API', service: 'openai', key: 'sk-proj-...', status: 'active', lastUsed: '2024-01-15' },
    { id: 2, name: 'GitHub Token', service: 'github', key: 'ghp_...', status: 'active', lastUsed: '2024-01-14' }
  ]);
  
  const [addingKey, setAddingKey] = useState(false);
  const [newKeyService, setNewKeyService] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showKey, setShowKey] = useState({});
  
  const availableServices = [
    { id: 'openai', name: 'OpenAI', icon: 'fa-brain', color: '#10a37f' },
    { id: 'github', name: 'GitHub', icon: 'fa-github', color: '#6e5494' },
    { id: 'gitlab', name: 'GitLab', icon: 'fa-gitlab', color: '#fc6d26' },
    { id: 'jira', name: 'Jira', icon: 'fa-tasks', color: '#0052cc' },
    { id: 'linear', name: 'Linear', icon: 'fa-diagram-project', color: '#5e6ad2' },
    { id: 'slack', name: 'Slack', icon: 'fa-slack', color: '#4a154b' }
  ];
  
  const sections = [
    { id: 'general', name: 'Allgemein', icon: 'fa-gear' },
    { id: 'api', name: 'API Keys', icon: 'fa-key' },
    { id: 'integrations', name: 'Integrationen', icon: 'fa-puzzle-piece' },
    { id: 'users', name: 'Benutzer', icon: 'fa-users' },
    { id: 'security', name: 'Sicherheit', icon: 'fa-shield-halved' }
  ];
  
  const addApiKey = () => {
    if (newKeyService && newKeyName && newKeyValue) {
      const newId = Math.max(...apiKeys.map(k => k.id), 0) + 1;
      setApiKeys([...apiKeys, {
        id: newId,
        name: newKeyName,
        service: newKeyService,
        key: newKeyValue,
        status: 'active',
        lastUsed: 'Never'
      }]);
      setNewKeyService('');
      setNewKeyName('');
      setNewKeyValue('');
      setAddingKey(false);
    }
  };
  
  const deleteApiKey = (id) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };
  
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', background: 'rgb(24 24 27)', borderRight: '1px solid rgb(39 39 42)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgb(39 39 42)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'rgb(244 244 245)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-screwdriver-wrench" style={{ color: 'rgb(113 113 122)' }}></i>
            Admin
          </h2>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                fontSize: '14px',
                cursor: 'pointer',
                background: activeSection === section.id ? 'rgb(39 39 42)' : 'transparent',
                color: activeSection === section.id ? 'rgb(244 244 245)' : 'rgb(161 161 170)',
                border: 'none',
                borderRadius: '6px',
                width: '100%',
                textAlign: 'left',
                fontWeight: 500,
                transition: 'all 200ms',
                marginBottom: '2px'
              }}
              onMouseEnter={e => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = 'rgb(39 39 42)';
                  e.currentTarget.style.color = 'rgb(212 212 216)';
                }
              }}
              onMouseLeave={e => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgb(161 161 170)';
                }
              }}
            >
              <i className={`fa-solid ${section.icon}`} style={{ width: '16px', fontSize: '14px' }}></i>
              {section.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', background: 'rgb(9 9 11)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px' }}>
          
          {/* General Settings */}
          {activeSection === 'general' && (
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', color: 'rgb(244 244 245)' }}>
                Allgemeine Einstellungen
              </h1>
              <p style={{ fontSize: '14px', color: 'rgb(161 161 170)', margin: '0 0 32px 0' }}>
                Grundlegende Konfiguration deiner Organisation
              </p>
              
              <div style={{ background: 'rgb(24 24 27)', borderRadius: '12px', border: '1px solid rgb(39 39 42)', padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgb(212 212 216)', marginBottom: '8px' }}>
                    Organisation Name
                  </label>
                  <input
                    value={generalSettings.orgName}
                    onChange={e => setGeneralSettings({ ...generalSettings, orgName: e.target.value })}
                    style={{ width: '100%', background: 'rgb(39 39 42)', border: '1px solid rgb(63 63 70)', color: 'rgb(244 244 245)', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgb(212 212 216)', marginBottom: '8px' }}>
                    Kontakt E-Mail
                  </label>
                  <input
                    type="email"
                    value={generalSettings.orgEmail}
                    onChange={e => setGeneralSettings({ ...generalSettings, orgEmail: e.target.value })}
                    style={{ width: '100%', background: 'rgb(39 39 42)', border: '1px solid rgb(63 63 70)', color: 'rgb(244 244 245)', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgb(212 212 216)', marginBottom: '8px' }}>
                    Zeitzone
                  </label>
                  <select
                    value={generalSettings.timezone}
                    onChange={e => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                    style={{ width: '100%', background: 'rgb(39 39 42)', border: '1px solid rgb(63 63 70)', color: 'rgb(244 244 245)', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                  >
                    <option>Europe/Berlin</option>
                    <option>Europe/London</option>
                    <option>America/New_York</option>
                    <option>America/Los_Angeles</option>
                    <option>Asia/Tokyo</option>
                  </select>
                </div>
                
                <button style={{
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
              </div>
            </div>
          )}
          
          {/* API Keys */}
          {activeSection === 'api' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', color: 'rgb(244 244 245)' }}>
                    API Keys
                  </h1>
                  <p style={{ fontSize: '14px', color: 'rgb(161 161 170)', margin: 0 }}>
                    Verwalte API-Schlüssel für externe Services
                  </p>
                </div>
                <button
                  onClick={() => setAddingKey(true)}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
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
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                    transition: 'all 200ms'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <i className="fa-solid fa-plus"></i>
                  API Key hinzufügen
                </button>
              </div>
              
              {/* Add Key Form */}
              {addingKey && (
                <div style={{ background: 'rgb(24 24 27)', borderRadius: '12px', border: '1px solid rgb(39 39 42)', padding: '24px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: 'rgb(244 244 245)' }}>
                    Neuer API Key
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgb(212 212 216)', marginBottom: '8px' }}>
                        Service
                      </label>
                      <select
                        value={newKeyService}
                        onChange={e => setNewKeyService(e.target.value)}
                        style={{ width: '100%', background: 'rgb(39 39 42)', border: '1px solid rgb(63 63 70)', color: 'rgb(244 244 245)', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                      >
                        <option value="">Service wählen...</option>
                        {availableServices.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgb(212 212 216)', marginBottom: '8px' }}>
                        Name
                      </label>
                      <input
                        value={newKeyName}
                        onChange={e => setNewKeyName(e.target.value)}
                        placeholder="z.B. Haupt-API oder Production Key"
                        style={{ width: '100%', background: 'rgb(39 39 42)', border: '1px solid rgb(63 63 70)', color: 'rgb(244 244 245)', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgb(212 212 216)', marginBottom: '8px' }}>
                        API Key
                      </label>
                      <input
                        type="password"
                        value={newKeyValue}
                        onChange={e => setNewKeyValue(e.target.value)}
                        placeholder="Gib deinen API Key ein..."
                        style={{ width: '100%', background: 'rgb(39 39 42)', border: '1px solid rgb(63 63 70)', color: 'rgb(244 244 245)', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={addApiKey}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Hinzufügen
                    </button>
                    <button
                      onClick={() => {
                        setAddingKey(false);
                        setNewKeyService('');
                        setNewKeyName('');
                        setNewKeyValue('');
                      }}
                      style={{
                        background: 'transparent',
                        color: 'rgb(161 161 170)',
                        border: '1px solid rgb(63 63 70)',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
              
              {/* API Keys List */}
              <div style={{ display: 'grid', gap: '12px' }}>
                {apiKeys.map(key => {
                  const service = availableServices.find(s => s.id === key.service);
                  return (
                    <div key={key.id} style={{ background: 'rgb(24 24 27)', borderRadius: '12px', border: '1px solid rgb(39 39 42)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: service?.color + '22', border: '1px solid ' + service?.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: service?.color, fontSize: '20px' }}>
                        <i className={`fa-brands ${service?.icon}`}></i>
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'rgb(244 244 245)' }}>
                            {key.name}
                          </h3>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e44', fontWeight: 600 }}>
                            {key.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'rgb(113 113 122)' }}>
                          <span style={{ fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {showKey[key.id] ? key.key : '••••••••••••••••'}
                            <button
                              onClick={() => setShowKey({ ...showKey, [key.id]: !showKey[key.id] })}
                              style={{ background: 'none', border: 'none', color: 'rgb(113 113 122)', cursor: 'pointer', padding: '2px' }}
                            >
                              <i className={`fa-solid fa-eye${showKey[key.id] ? '-slash' : ''}`}></i>
                            </button>
                          </span>
                          <span>•</span>
                          <span>Zuletzt: {key.lastUsed}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteApiKey(key.id)}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                          transition: 'all 200ms'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <i className="fa-solid fa-trash" style={{ marginRight: '6px' }}></i>
                        Löschen
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Integrations */}
          {activeSection === 'integrations' && (
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', color: 'rgb(244 244 245)' }}>
                Integrationen
              </h1>
              <p style={{ fontSize: '14px', color: 'rgb(161 161 170)', margin: '0 0 32px 0' }}>
                Verbinde externe Tools und Services
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {availableServices.map(service => (
                  <div key={service.id} style={{ background: 'rgb(24 24 27)', borderRadius: '12px', border: '1px solid rgb(39 39 42)', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: service.color + '22', border: '1px solid ' + service.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: service.color, fontSize: '18px' }}>
                        <i className={`fa-brands ${service.icon}`}></i>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'rgb(244 244 245)' }}>
                        {service.name}
                      </h3>
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgb(161 161 170)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                      {service.id === 'openai' && 'KI-gestützte Text-Generierung und Verbesserungen'}
                      {service.id === 'github' && 'Import von Issues und Pull Requests'}
                      {service.id === 'gitlab' && 'Synchronisation mit GitLab Issues'}
                      {service.id === 'jira' && 'Jira Tickets importieren'}
                      {service.id === 'linear' && 'Linear Issues synchronisieren'}
                      {service.id === 'slack' && 'Benachrichtigungen und Updates'}
                    </p>
                    <button style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, ' + service.color + ' 0%, ' + service.color + 'cc 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 200ms'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Konfigurieren
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Users */}
          {activeSection === 'users' && (
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 32px 0', color: 'rgb(244 244 245)' }}>
                Benutzerverwaltung
              </h1>
              <div style={{ background: 'rgb(24 24 27)', borderRadius: '12px', border: '1px solid rgb(39 39 42)', padding: '80px 24px', textAlign: 'center' }}>
                <i className="fa-solid fa-users" style={{ fontSize: '48px', color: 'rgb(63 63 70)', marginBottom: '16px' }}></i>
                <p style={{ fontSize: '14px', color: 'rgb(161 161 170)' }}>Benutzerverwaltung in Entwicklung...</p>
              </div>
            </div>
          )}
          
          {/* Security */}
          {activeSection === 'security' && (
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 32px 0', color: 'rgb(244 244 245)' }}>
                Sicherheitseinstellungen
              </h1>
              <div style={{ background: 'rgb(24 24 27)', borderRadius: '12px', border: '1px solid rgb(39 39 42)', padding: '80px 24px', textAlign: 'center' }}>
                <i className="fa-solid fa-shield-halved" style={{ fontSize: '48px', color: 'rgb(63 63 70)', marginBottom: '16px' }}></i>
                <p style={{ fontSize: '14px', color: 'rgb(161 161 170)' }}>Sicherheitsoptionen in Entwicklung...</p>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

window.AdminSettings = AdminSettings;