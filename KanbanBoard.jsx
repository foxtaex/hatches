const { useState } = React;

function KanbanBoard() {
  const [boards, setBoards] = useState([
    { id: 1, name: 'Development Sprint', teamId: null, team: null, _count: { columns: 3 } },
    { id: 2, name: 'Design Tasks', teamId: 1, team: { id: 1, name: 'Design', color: '#22c55e' }, _count: { columns: 2 } }
  ]);
  const [activeBoardId, setActiveBoardId] = useState(1);
  const [addingBoard, setAddingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardTeamId, setNewBoardTeamId] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  
  const userTeams = [
    { id: 1, name: 'Design', color: '#22c55e' },
    { id: 2, name: 'Development', color: '#3b82f6' },
    { id: 3, name: 'Product', color: '#a855f7' }
  ];
  
  const boardTemplates = [
    {
      id: 'dev-sprint',
      name: 'Development Sprint',
      icon: 'fa-code',
      color: '#3b82f6',
      description: 'Klassisches Scrum/Kanban Board für Software-Entwicklung',
      columns: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done']
    },
    {
      id: 'design-project',
      name: 'Design Project',
      icon: 'fa-palette',
      color: '#22c55e',
      description: 'Board für Design-Workflows und kreative Projekte',
      columns: ['Ideas', 'Design', 'Feedback', 'Approved', 'Delivered']
    },
    {
      id: 'bug-tracker',
      name: 'Bug Tracker',
      icon: 'fa-bug',
      color: '#ef4444',
      description: 'Bug-Tracking und Issue Management',
      columns: ['Reported', 'Triaged', 'In Progress', 'Testing', 'Fixed']
    },
    {
      id: 'content-calendar',
      name: 'Content Calendar',
      icon: 'fa-calendar',
      color: '#f59e0b',
      description: 'Content-Planung und Publishing Pipeline',
      columns: ['Ideas', 'Draft', 'Review', 'Scheduled', 'Published']
    },
    {
      id: 'roadmap',
      name: 'Product Roadmap',
      icon: 'fa-map',
      color: '#a855f7',
      description: 'Feature-Planung und Product Roadmap',
      columns: ['Planned', 'This Quarter', 'Next Quarter', 'In Development', 'Shipped']
    },
    {
      id: 'simple',
      name: 'Simple Kanban',
      icon: 'fa-table-columns',
      color: '#6b7280',
      description: 'Minimales 3-Spalten Board',
      columns: ['To Do', 'Doing', 'Done']
    }
  ];
  
  const createFromTemplate = (template) => {
    const newId = Math.max(...boards.map(b => b.id), 0) + 1;
    const team = newBoardTeamId ? userTeams.find(t => t.id === Number(newBoardTeamId)) : null;
    const boardName = newBoardName.trim() || template.name;
    setBoards([...boards, { 
      id: newId, 
      name: boardName, 
      teamId: team?.id || null, 
      team: team || null, 
      _count: { columns: template.columns.length },
      template: template.id
    }]);
    setActiveBoardId(newId);
    setNewBoardName('');
    setNewBoardTeamId('');
    setShowTemplates(false);
    setAddingBoard(false);
  };
  
  // Mock board data
  const mockBoard = {
    id: activeBoardId,
    name: boards.find(b => b.id === activeBoardId)?.name || 'Board',
    columns: [
      {
        id: 1,
        title: 'To Do',
        position: 0,
        cards: [
          { id: 1, title: 'Setup development environment', description: 'Install Node.js, npm, and configure project', position: 0, columnId: 1, assigneeId: null, assignee: null, externalIssue: null, labels: [{ id: 1, name: 'Bug', color: '#ef4444' }] },
          { id: 2, title: 'Design database schema', description: null, position: 1, columnId: 1, assigneeId: 1, assignee: { id: 1, username: 'foxtaex', displayName: 'foxtaex', teams: [{ id: 2, name: 'Development', color: '#3b82f6' }] }, externalIssue: { integration: { type: 'GitHub' }, externalId: '123' }, labels: [] }
        ]
      },
      {
        id: 2,
        title: 'In Progress',
        position: 1,
        cards: [
          { id: 3, title: 'Implement authentication', description: 'Add session management and password hashing', position: 0, columnId: 2, assigneeId: 1, assignee: { id: 1, username: 'foxtaex', displayName: 'foxtaex', teams: [{ id: 2, name: 'Development', color: '#3b82f6' }] }, externalIssue: null, labels: [{ id: 2, name: 'Feature', color: '#3b82f6' }, { id: 3, name: 'High Priority', color: '#f59e0b' }] }
        ]
      },
      {
        id: 3,
        title: 'Done',
        position: 2,
        cards: [
          { id: 4, title: 'Project initialization', description: null, position: 0, columnId: 3, assigneeId: null, assignee: null, externalIssue: null, labels: [] }
        ]
      }
    ]
  };
  
  const [addingCol, setAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  
  const sidebarStyles = {
    width: '260px',
    background: 'rgba(18, 18, 18, 0.6)',
    backdropFilter: 'blur(30px) saturate(180%)',
    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };
  
  const boardItemStyles = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    margin: '0 8px',
    fontSize: '15px',
    cursor: 'pointer',
    background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    color: isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.6)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    borderRadius: '10px',
    width: 'calc(100% - 16px)',
    textAlign: 'left',
    transform: 'scale(1)',
    boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none'
  });
  
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={sidebarStyles}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 600, margin: '0 0 16px 0', color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px' }}>
            <i className="fa-solid fa-table-columns" style={{ color: 'rgba(255, 255, 255, 0.5)', width: '16px', fontSize: '15px' }}></i>
            Boards
          </h2>
          
          {addingBoard ? (
            showTemplates ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(212 212 216)', margin: 0 }}>Template wählen</h4>
                  <button
                    onClick={() => setShowTemplates(false)}
                    style={{ background: 'none', border: 'none', color: 'rgb(113 113 122)', cursor: 'pointer', padding: '4px' }}
                  >
                    <i className="fa-solid fa-arrow-left" style={{ fontSize: '12px' }}></i>
                  </button>
                </div>
                {boardTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => createFromTemplate(template)}
                    style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      padding: '10px', 
                      background: 'rgb(39 39 42)', 
                      border: '1px solid rgb(63 63 70)', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 200ms'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgb(63 63 70)';
                      e.currentTarget.style.borderColor = 'rgb(113 113 122)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgb(39 39 42)';
                      e.currentTarget.style.borderColor = 'rgb(63 63 70)';
                    }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: template.color + '22', border: '1px solid ' + template.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: template.color, fontSize: '14px', flexShrink: 0 }}>
                      <i className={`fa-solid ${template.icon}`}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(244 244 245)', marginBottom: '2px' }}>{template.name}</div>
                      <div style={{ fontSize: '11px', color: 'rgb(113 113 122)', marginBottom: '4px', lineHeight: 1.3 }}>{template.description}</div>
                      <div style={{ fontSize: '10px', color: 'rgb(82 82 91)' }}>{template.columns.length} Spalten</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  autoFocus
                  value={newBoardName}
                  onChange={e => setNewBoardName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') {
                      setNewBoardName('');
                      setNewBoardTeamId('');
                      setAddingBoard(false);
                    }
                  }}
                  placeholder="Board-Name (optional)"
                  style={{ background: 'rgb(39 39 42)', border: '1px solid rgb(63 63 70)', color: 'rgb(244 244 245)', borderRadius: '4px', padding: '8px', fontSize: '14px', outline: 'none' }}
                />
                <select
                  value={newBoardTeamId}
                  onChange={e => setNewBoardTeamId(e.target.value)}
                  style={{ background: 'rgb(39 39 42)', border: '1px solid rgb(63 63 70)', color: 'rgb(244 244 245)', borderRadius: '4px', padding: '8px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="">🔒 Privat</option>
                  {userTeams.map(t => <option key={t.id} value={t.id}>👥 {t.name}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setShowTemplates(true)}
                    style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <i className="fa-solid fa-layer-group"></i>
                    Template wählen
                  </button>
                  <button
                    onClick={() => {
                      setNewBoardName('');
                      setNewBoardTeamId('');
                      setAddingBoard(false);
                    }}
                    style={{ padding: '6px 8px', background: 'transparent', border: 'none', color: 'rgb(113 113 122)', cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
            )
          ) : (
            <button
              onClick={() => setAddingBoard(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', background: 'transparent', border: '1px dashed rgb(63 63 70)', borderRadius: '4px', color: 'rgb(113 113 122)', fontSize: '14px', cursor: 'pointer', width: '100%', transition: 'color 200ms, border-color 200ms' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'rgb(161 161 170)';
                e.currentTarget.style.borderColor = 'rgb(113 113 122)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgb(113 113 122)';
                e.currentTarget.style.borderColor = 'rgb(63 63 70)';
              }}
            >
              <i className="fa-solid fa-plus" style={{ width: '14px' }}></i>
              Neues Board
            </button>
          )}
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {boards.map(board => (
            <button
              key={board.id}
              onClick={() => setActiveBoardId(board.id)}
              style={boardItemStyles(board.id === activeBoardId)}
              onMouseEnter={e => {
                if (board.id !== activeBoardId) {
                  e.currentTarget.style.background = 'rgb(39 39 42)';
                  e.currentTarget.style.color = 'rgb(244 244 245)';
                }
              }}
              onMouseLeave={e => {
                if (board.id !== activeBoardId) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgb(161 161 170)';
                }
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {board.name}
                </div>
                {board.team && (
                  <div style={{ fontSize: '11px', color: 'rgb(113 113 122)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: board.team.color }}></span>
                    {board.team.name}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '11px', color: 'rgb(82 82 91)' }}>{board._count.columns}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Board Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgb(39 39 42)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: 'rgb(244 244 245)' }}>
            {mockBoard.name}
          </h1>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', height: '100%', alignItems: 'flex-start' }}>
            {mockBoard.columns.map(column => (
              <KanbanColumn key={column.id} column={column} />
            ))}
            
            {/* Add Column Button */}
            {addingCol ? (
              <div style={{ width: '288px', flexShrink: 0, background: 'rgb(24 24 27)', borderRadius: '12px', border: '1px solid rgb(63 63 70)', padding: '12px' }}>
                <input
                  autoFocus
                  value={newColTitle}
                  onChange={e => setNewColTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newColTitle.trim()) {
                      setNewColTitle('');
                      setAddingCol(false);
                    }
                    if (e.key === 'Escape') {
                      setNewColTitle('');
                      setAddingCol(false);
                    }
                  }}
                  placeholder="Spaltentitel"
                  style={{ width: '100%', background: 'rgb(39 39 42)', border: '1px solid rgb(63 63 70)', color: 'rgb(244 244 245)', borderRadius: '4px', padding: '8px', fontSize: '14px', outline: 'none', marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => {
                      if (newColTitle.trim()) {
                        setNewColTitle('');
                        setAddingCol(false);
                      }
                    }}
                    style={{ flex: 1, background: 'rgb(37 99 235)', color: 'white', border: 'none', borderRadius: '4px', padding: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Hinzufügen
                  </button>
                  <button
                    onClick={() => {
                      setNewColTitle('');
                      setAddingCol(false);
                    }}
                    style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: 'rgb(113 113 122)', cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingCol(true)}
                style={{ width: '288px', flexShrink: 0, background: 'transparent', border: '1px dashed rgb(63 63 70)', borderRadius: '12px', padding: '16px', color: 'rgb(113 113 122)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'border-color 200ms, color 200ms' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgb(113 113 122)';
                  e.currentTarget.style.color = 'rgb(161 161 170)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgb(63 63 70)';
                  e.currentTarget.style.color = 'rgb(113 113 122)';
                }}
              >
                <i className="fa-solid fa-plus"></i>
                Spalte hinzufügen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ column }) {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  
  return (
    <div style={{ 
      width: '320px', 
      flexShrink: 0, 
      borderRadius: '16px', 
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      background: 'rgba(28, 28, 28, 0.7)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 16px 12px' }}>
        <h3 style={{ flex: 1, fontSize: '15px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', margin: 0, letterSpacing: '-0.3px' }}>
          {column.title}
        </h3>
        <span style={{ 
          fontSize: '13px', 
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.5)',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '2px 8px',
          borderRadius: '6px'
        }}>{column.cards.length}</span>
        <button style={{ background: 'none', border: 'none', color: 'rgb(63 63 70)', cursor: 'pointer', padding: '4px' }}>
          <i className="fa-solid fa-xmark" style={{ fontSize: '12px' }}></i>
        </button>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px 8px 12px', minHeight: '64px' }}>
        {column.cards.map(card => (
          <KanbanCard key={card.id} card={card} />
        ))}
      </div>
      
      <div style={{ padding: '0 12px 12px 12px' }}>
        {addingCard ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <input
              autoFocus
              value={newCardTitle}
              onChange={e => setNewCardTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newCardTitle.trim()) {
                  setNewCardTitle('');
                  setAddingCard(false);
                }
                if (e.key === 'Escape') {
                  setNewCardTitle('');
                  setAddingCard(false);
                }
              }}
              placeholder="Karte benennen..."
              style={{ background: 'rgb(63 63 70)', border: '1px solid rgb(113 113 122)', color: 'rgb(244 244 245)', borderRadius: '6px', padding: '8px', fontSize: '14px', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => {
                  if (newCardTitle.trim()) {
                    setNewCardTitle('');
                    setAddingCard(false);
                  }
                }}
                style={{ flex: 1, background: 'rgb(37 99 235)', color: 'white', border: 'none', borderRadius: '4px', padding: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              >
                Hinzufügen
              </button>
              <button
                onClick={() => {
                  setNewCardTitle('');
                  setAddingCard(false);
                }}
                style={{ padding: '6px 8px', background: 'transparent', border: 'none', color: 'rgb(113 113 122)', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingCard(true)}
            style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgb(82 82 91)', background: 'transparent', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer', transition: 'background-color 200ms, color 200ms' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgb(39 39 42)';
              e.currentTarget.style.color = 'rgb(161 161 170)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgb(82 82 91)';
            }}
          >
            <i className="fa-solid fa-plus" style={{ width: '12px' }}></i>
            Karte hinzufügen
          </button>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ card }) {
  return (
    <div style={{ 
      background: 'rgba(40, 40, 40, 0.9)', 
      borderRadius: '12px', 
      padding: '14px', 
      border: '1px solid rgba(255, 255, 255, 0.12)', 
      cursor: 'pointer', 
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'scale(1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
        <div style={{ color: 'rgb(82 82 91)', cursor: 'grab', paddingTop: '2px' }}>
          <i className="fa-solid fa-grip-vertical" style={{ fontSize: '12px' }}></i>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.95)', margin: '0 0 6px 0', wordBreak: 'break-word', lineHeight: 1.4 }}>
            {card.title}
          </p>
          {card.description && (
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
              {card.description}
            </p>
          )}
          
          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {card.labels.map(label => (
                <span key={label.id} style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: label.color + '22', color: label.color, border: '1px solid ' + label.color + '44' }}>
                  {label.name}
                </span>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {card.externalIssue && (
              <span style={{ fontSize: '11px', background: 'rgb(63 63 70)', color: 'rgb(161 161 170)', borderRadius: '4px', padding: '2px 6px' }}>
                {card.externalIssue.integration.type} #{card.externalIssue.externalId}
              </span>
            )}
            {card.assignee && (
              <span style={{ fontSize: '11px', background: 'rgb(63 63 70)', color: 'rgb(161 161 170)', borderRadius: '4px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {card.assignee.teams && card.assignee.teams.length > 0 && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: card.assignee.teams[0].color }}></span>
                )}
                <i className="fa-solid fa-user" style={{ fontSize: '10px' }}></i>
                {card.assignee.displayName || card.assignee.username}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.KanbanBoard = KanbanBoard;