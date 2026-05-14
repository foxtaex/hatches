const { useState, useRef, useEffect } = React;

function DocsEditor() {
  const [docs, setDocs] = useState([
    { id: 1, title: 'Getting Started', content: '# Getting Started\n\nWelcome to Hatches documentation.\n\n## Overview\n\nHatches is a lean, self-hosted team workspace.', teamId: null, team: null, updatedAt: '2024-01-15T10:30:00Z' },
    { id: 2, title: 'API Documentation', content: '# API Documentation\n\n## Authentication\n\nAll API endpoints require authentication.', teamId: 1, team: { id: 1, name: 'Development', color: '#3b82f6' }, updatedAt: '2024-01-14T15:20:00Z' },
    { id: 3, title: 'Team Guidelines', content: '# Team Guidelines\n\n## Code Review Process\n\n1. Create PR\n2. Request review\n3. Address feedback', teamId: 1, team: { id: 1, name: 'Development', color: '#3b82f6' }, updatedAt: '2024-01-13T09:15:00Z' }
  ]);
  const [activeId, setActiveId] = useState(1);
  const [content, setContent] = useState(docs[0].content);
  const [title, setTitle] = useState(docs[0].title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [previewMode, setPreviewMode] = useState('split'); // 'split', 'edit', 'preview'
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const userTeams = [
    { id: 1, name: 'Development', color: '#3b82f6' },
    { id: 2, name: 'Design', color: '#22c55e' }
  ];
  
  const activeDoc = docs.find(d => d.id === activeId);
  
  const generateWithAI = async (prompt) => {
    setAiGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const generatedText = `\n\n---\n\n## AI Generated Content\n\n${prompt}\n\n[AI-generated content would appear here based on your prompt]\n\n`;
      setContent(content + generatedText);
      setDocs(docs.map(d => d.id === activeId ? { ...d, content: content + generatedText } : d));
      setAiPrompt('');
      setShowAiPanel(false);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setAiGenerating(false);
    }
  };
  
  const openDoc = (doc) => {
    setActiveId(doc.id);
    setContent(doc.content);
    setTitle(doc.title);
    setEditingTitle(false);
  };
  
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    // Update doc in real-time
    setDocs(docs.map(d => d.id === activeId ? { ...d, content: newContent } : d));
  };
  
  // Live preview updates as you type in edit mode
  useEffect(() => {
    if (activeDoc) {
      setContent(activeDoc.content);
    }
  }, [activeDoc?.id]);
  
  const handlePreviewEdit = (e) => {
    // Allow editing in preview by clicking on elements
    const newContent = e.target.innerText;
    setContent(content); // Keep synced
  };
  
  const saveTitle = () => {
    if (title.trim()) {
      setDocs(docs.map(d => d.id === activeId ? { ...d, title: title.trim() } : d));
    } else {
      setTitle(activeDoc.title);
    }
    setEditingTitle(false);
  };
  
  const createDoc = () => {
    if (!createTitle.trim()) return;
    const newDoc = {
      id: Math.max(...docs.map(d => d.id)) + 1,
      title: createTitle.trim(),
      content: '# ' + createTitle.trim() + '\n\n',
      teamId: null,
      team: null,
      updatedAt: new Date().toISOString()
    };
    setDocs([newDoc, ...docs]);
    openDoc(newDoc);
    setCreateTitle('');
    setCreating(false);
  };
  
  const deleteDoc = (id) => {
    const remaining = docs.filter(d => d.id !== id);
    setDocs(remaining);
    if (activeId === id && remaining.length > 0) {
      openDoc(remaining[0]);
    }
  };
  
  // Simple markdown preview
  const renderMarkdown = (text) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', color: 'rgb(244 244 245)' }}>{line.slice(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '22px', fontWeight: 600, marginBottom: '12px', marginTop: '20px', color: 'rgb(244 244 245)' }}>{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', marginTop: '16px', color: 'rgb(244 244 245)' }}>{line.slice(4)}</h3>;
        if (line.trim() === '') return <div key={i} style={{ height: '12px' }}></div>;
        if (line.match(/^\d+\. /)) return <li key={i} style={{ fontSize: '14px', color: 'rgb(212 212 216)', lineHeight: 1.6, marginLeft: '20px' }}>{line.replace(/^\d+\. /, '')}</li>;
        return <p key={i} style={{ fontSize: '14px', color: 'rgb(212 212 216)', lineHeight: 1.6, marginBottom: '8px' }}>{line}</p>;
      });
  };
  
  const privateDocs = docs.filter(d => !d.teamId);
  const teamGroups = userTeams.map(t => ({
    team: t,
    items: docs.filter(d => d.teamId === t.id)
  })).filter(g => g.items.length > 0);
  
  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        flexShrink: 0, 
        borderRight: '1px solid rgba(255, 255, 255, 0.08)', 
        background: 'rgba(18, 18, 18, 0.6)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {creating ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                autoFocus
                value={createTitle}
                onChange={e => setCreateTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') createDoc();
                  if (e.key === 'Escape') { setCreateTitle(''); setCreating(false); }
                }}
                placeholder="Dokumenttitel..."
                style={{ width: '100%', background: 'rgb(39 39 42)', border: '1px solid rgb(63 63 70)', color: 'rgb(244 244 245)', borderRadius: '6px', padding: '8px', fontSize: '13px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={createDoc} style={{ flex: 1, background: 'linear-gradient(135deg, rgb(59 130 246) 0%, rgb(37 99 235) 100%)', color: 'white', border: 'none', borderRadius: '6px', padding: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Erstellen
                </button>
                <button onClick={() => { setCreateTitle(''); setCreating(false); }} style={{ padding: '6px 10px', background: 'transparent', border: 'none', color: 'rgb(113 113 122)', cursor: 'pointer' }}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setCreating(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgb(39 39 42)', color: 'rgb(161 161 170)', border: 'none', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', cursor: 'pointer', transition: 'all 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgb(63 63 70)'; e.currentTarget.style.color = 'rgb(212 212 216)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgb(39 39 42)'; e.currentTarget.style.color = 'rgb(161 161 170)'; }}>
              <i className="fa-solid fa-plus" style={{ width: '14px' }}></i>
              Neues Dokument
            </button>
          )}
        </div>
        
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {privateDocs.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', marginTop: '4px' }}>
                <i className="fa-solid fa-lock" style={{ width: '10px', fontSize: '10px', color: 'rgb(82 82 91)' }}></i>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgb(82 82 91)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Privat</span>
              </div>
              {privateDocs.map(doc => (
                <DocItem key={doc.id} doc={doc} active={activeId === doc.id} onOpen={() => openDoc(doc)} onDelete={deleteDoc} />
              ))}
            </div>
          )}
          
          {teamGroups.map(({ team, items }) => (
            <div key={team.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', marginTop: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: team.color, flexShrink: 0 }}></span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: team.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{team.name}</span>
              </div>
              {items.map(doc => (
                <DocItem key={doc.id} doc={doc} active={activeId === doc.id} onOpen={() => openDoc(doc)} onDelete={deleteDoc} />
              ))}
            </div>
          ))}
        </nav>
      </aside>
      
      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgb(39 39 42)', background: 'rgb(24 24 27)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            {editingTitle ? (
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') { setTitle(activeDoc.title); setEditingTitle(false); }
                }}
                style={{ fontSize: '20px', fontWeight: 600, background: 'transparent', color: 'rgb(244 244 245)', outline: 'none', borderBottom: '2px solid rgb(113 113 122)', width: '100%', padding: '4px 0' }}
              />
            ) : (
              <h2 onClick={() => setEditingTitle(true)} style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: 'rgb(244 244 245)', cursor: 'pointer' }}>
                {title}
              </h2>
            )}
          </div>
          
          {activeDoc?.team && (
            <span style={{ fontSize: '12px', borderRadius: '8px', padding: '4px 12px', background: activeDoc.team.color + '22', color: activeDoc.team.color, border: '1px solid ' + activeDoc.team.color + '44', fontWeight: 500 }}>
              {activeDoc.team.name}
            </span>
          )}
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              style={{ 
                padding: '6px 12px', 
                background: showAiPanel ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' : 'rgb(39 39 42)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '12px', 
                fontWeight: 600, 
                cursor: 'pointer', 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: showAiPanel ? '0 2px 8px rgba(168, 85, 247, 0.4)' : 'none',
                transition: 'all 200ms' 
              }}
              onMouseEnter={e => !showAiPanel && (e.currentTarget.style.background = 'rgb(63 63 70)')}
              onMouseLeave={e => !showAiPanel && (e.currentTarget.style.background = 'rgb(39 39 42)')}
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              AI
            </button>
            
            <div style={{ display: 'flex', gap: '4px', background: 'rgb(39 39 42)', borderRadius: '8px', padding: '4px' }}>
              <button onClick={() => setPreviewMode('edit')} style={{ padding: '6px 12px', background: previewMode === 'edit' ? 'rgb(59 130 246)' : 'transparent', color: previewMode === 'edit' ? 'white' : 'rgb(161 161 170)', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 200ms' }}>
                <i className="fa-solid fa-pen" style={{ marginRight: '4px' }}></i>
                Edit
              </button>
              <button onClick={() => setPreviewMode('split')} style={{ padding: '6px 12px', background: previewMode === 'split' ? 'rgb(59 130 246)' : 'transparent', color: previewMode === 'split' ? 'white' : 'rgb(161 161 170)', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 200ms' }}>
                <i className="fa-solid fa-columns" style={{ marginRight: '4px' }}></i>
                Split
              </button>
              <button onClick={() => setPreviewMode('preview')} style={{ padding: '6px 12px', background: previewMode === 'preview' ? 'rgb(59 130 246)' : 'transparent', color: previewMode === 'preview' ? 'white' : 'rgb(161 161 170)', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 200ms' }}>
                <i className="fa-solid fa-eye" style={{ marginRight: '4px' }}></i>
                Preview
              </button>
            </div>
          </div>
        </div>
        
        {/* AI Panel */}
        {showAiPanel && (
          <div style={{ borderBottom: '1px solid rgb(39 39 42)', background: 'linear-gradient(135deg, rgb(24 24 27) 0%, rgba(168, 85, 247, 0.05) 100%)', padding: '12px 24px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Sag der AI, was sie schreiben soll... (z.B. 'Schreibe eine Zusammenfassung über Kanban' oder 'Erstelle eine To-Do-Liste für ein Projekt-Setup')"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.ctrlKey && aiPrompt.trim()) {
                      generateWithAI(aiPrompt);
                    }
                  }}
                  style={{ 
                    width: '100%', 
                    minHeight: '60px',
                    background: 'rgb(39 39 42)', 
                    border: '1px solid rgba(168, 85, 247, 0.3)', 
                    color: 'rgb(244 244 245)', 
                    borderRadius: '8px', 
                    padding: '10px 12px', 
                    fontSize: '13px', 
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                />
                <div style={{ marginTop: '6px', fontSize: '11px', color: 'rgb(113 113 122)' }}>
                  Drücke <kbd style={{ padding: '2px 6px', background: 'rgb(39 39 42)', border: '1px solid rgb(63 63 70)', borderRadius: '4px', fontFamily: 'monospace' }}>Ctrl+Enter</kbd> zum Generieren
                </div>
              </div>
              <button
                onClick={() => aiPrompt.trim() && generateWithAI(aiPrompt)}
                disabled={!aiPrompt.trim() || aiGenerating}
                style={{ 
                  padding: '10px 20px',
                  background: aiGenerating ? 'rgb(63 63 70)' : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  cursor: aiGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: aiGenerating ? 'none' : '0 2px 8px rgba(168, 85, 247, 0.4)',
                  transition: 'all 200ms',
                  minWidth: '100px',
                  justifyContent: 'center'
                }}
                onMouseEnter={e => !aiGenerating && (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => !aiGenerating && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {aiGenerating ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Generiert...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Generieren
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Markdown Toolbar */}
        {(previewMode === 'edit' || previewMode === 'split') && (
          <div style={{ borderBottom: '1px solid rgb(39 39 42)', background: 'rgb(24 24 27)', padding: '8px 24px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button 
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = textarea.value;
                  const selectedText = text.substring(start, end);
                  const newText = text.substring(0, start) + '**' + selectedText + '**' + text.substring(end);
                  setContent(newText);
                  setDocs(docs.map(d => d.id === activeId ? { ...d, content: newText } : d));
                }
              }}
              style={{ padding: '6px 10px', background: 'rgb(39 39 42)', border: 'none', borderRadius: '6px', color: 'rgb(161 161 170)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgb(63 63 70)'; e.currentTarget.style.color = 'rgb(212 212 216)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgb(39 39 42)'; e.currentTarget.style.color = 'rgb(161 161 170)'; }}
              title="Bold"
            >
              <i className="fa-solid fa-bold"></i>
            </button>
            <button 
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = textarea.value;
                  const selectedText = text.substring(start, end);
                  const newText = text.substring(0, start) + '_' + selectedText + '_' + text.substring(end);
                  setContent(newText);
                  setDocs(docs.map(d => d.id === activeId ? { ...d, content: newText } : d));
                }
              }}
              style={{ padding: '6px 10px', background: 'rgb(39 39 42)', border: 'none', borderRadius: '6px', color: 'rgb(161 161 170)', cursor: 'pointer', fontSize: '13px', fontStyle: 'italic', transition: 'all 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgb(63 63 70)'; e.currentTarget.style.color = 'rgb(212 212 216)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgb(39 39 42)'; e.currentTarget.style.color = 'rgb(161 161 170)'; }}
              title="Italic"
            >
              <i className="fa-solid fa-italic"></i>
            </button>
            <div style={{ width: '1px', height: '20px', background: 'rgb(63 63 70)', margin: '0 4px' }}></div>
            <button 
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const text = textarea.value;
                  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
                  const newText = text.substring(0, lineStart) + '# ' + text.substring(lineStart);
                  setContent(newText);
                  setDocs(docs.map(d => d.id === activeId ? { ...d, content: newText } : d));
                }
              }}
              style={{ padding: '6px 10px', background: 'rgb(39 39 42)', border: 'none', borderRadius: '6px', color: 'rgb(161 161 170)', cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgb(63 63 70)'; e.currentTarget.style.color = 'rgb(212 212 216)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgb(39 39 42)'; e.currentTarget.style.color = 'rgb(161 161 170)'; }}
              title="Heading"
            >
              H
            </button>
            <button 
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = textarea.value;
                  const selectedText = text.substring(start, end) || 'Link Text';
                  const newText = text.substring(0, start) + '[' + selectedText + '](url)' + text.substring(end);
                  setContent(newText);
                  setDocs(docs.map(d => d.id === activeId ? { ...d, content: newText } : d));
                }
              }}
              style={{ padding: '6px 10px', background: 'rgb(39 39 42)', border: 'none', borderRadius: '6px', color: 'rgb(161 161 170)', cursor: 'pointer', fontSize: '13px', transition: 'all 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgb(63 63 70)'; e.currentTarget.style.color = 'rgb(212 212 216)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgb(39 39 42)'; e.currentTarget.style.color = 'rgb(161 161 170)'; }}
              title="Link"
            >
              <i className="fa-solid fa-link"></i>
            </button>
            <button 
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = textarea.value;
                  const selectedText = text.substring(start, end);
                  const newText = text.substring(0, start) + '`' + selectedText + '`' + text.substring(end);
                  setContent(newText);
                  setDocs(docs.map(d => d.id === activeId ? { ...d, content: newText } : d));
                }
              }}
              style={{ padding: '6px 10px', background: 'rgb(39 39 42)', border: 'none', borderRadius: '6px', color: 'rgb(161 161 170)', cursor: 'pointer', fontSize: '13px', fontFamily: 'monospace', transition: 'all 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgb(63 63 70)'; e.currentTarget.style.color = 'rgb(212 212 216)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgb(39 39 42)'; e.currentTarget.style.color = 'rgb(161 161 170)'; }}
              title="Code"
            >
              <i className="fa-solid fa-code"></i>
            </button>
            <div style={{ width: '1px', height: '20px', background: 'rgb(63 63 70)', margin: '0 4px' }}></div>
            <button 
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const text = textarea.value;
                  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
                  const newText = text.substring(0, lineStart) + '- ' + text.substring(lineStart);
                  setContent(newText);
                  setDocs(docs.map(d => d.id === activeId ? { ...d, content: newText } : d));
                }
              }}
              style={{ padding: '6px 10px', background: 'rgb(39 39 42)', border: 'none', borderRadius: '6px', color: 'rgb(161 161 170)', cursor: 'pointer', fontSize: '13px', transition: 'all 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgb(63 63 70)'; e.currentTarget.style.color = 'rgb(212 212 216)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgb(39 39 42)'; e.currentTarget.style.color = 'rgb(161 161 170)'; }}
              title="List"
            >
              <i className="fa-solid fa-list"></i>
            </button>
          </div>
        )}
        
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {(previewMode === 'edit' || previewMode === 'split') && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: previewMode === 'split' ? '1px solid rgb(39 39 42)' : 'none' }}>
              <textarea
                value={content}
                onChange={handleContentChange}
                style={{ flex: 1, background: 'rgb(9 9 11)', color: 'rgb(212 212 216)', border: 'none', padding: '24px', fontSize: '14px', fontFamily: 'ui-monospace, monospace', lineHeight: 1.6, outline: 'none', resize: 'none' }}
                placeholder="Markdown eingeben..."
              />
            </div>
          )}
          
          {(previewMode === 'preview' || previewMode === 'split') && (
            <div 
              contentEditable={previewMode === 'preview'}
              onInput={(e) => {
                if (previewMode === 'preview') {
                  // Extract text from contenteditable and update markdown
                  const text = e.currentTarget.innerText;
                  setContent(text);
                  setDocs(docs.map(d => d.id === activeId ? { ...d, content: text } : d));
                }
              }}
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                background: 'rgb(9 9 11)', 
                padding: '24px',
                outline: previewMode === 'preview' ? '1px solid transparent' : 'none',
                cursor: previewMode === 'preview' ? 'text' : 'default'
              }}
              onFocus={(e) => {
                if (previewMode === 'preview') {
                  e.currentTarget.style.outline = '1px solid rgb(59 130 246)';
                }
              }}
              onBlur={(e) => {
                if (previewMode === 'preview') {
                  e.currentTarget.style.outline = '1px solid transparent';
                }
              }}
            >
              {renderMarkdown(content)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DocItem({ doc, active, onOpen, onDelete }) {
  const [hover, setHover] = React.useState(false);
  
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 12px',
        cursor: 'pointer',
        background: active ? 'rgb(39 39 42)' : (hover ? 'rgba(39, 39, 42, 0.5)' : 'transparent'),
        color: active ? 'rgb(244 244 245)' : 'rgb(113 113 122)',
        transition: 'all 200ms',
        borderRadius: '6px',
        margin: '0 8px'
      }}
    >
      <span style={{ flex: 1, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {doc.title}
      </span>
      {hover && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
          style={{ background: 'none', border: 'none', color: 'rgb(82 82 91)', cursor: 'pointer', padding: '4px', transition: 'color 200ms' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgb(239 68 68)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgb(82 82 91)'}
        >
          <i className="fa-solid fa-xmark" style={{ fontSize: '12px' }}></i>
        </button>
      )}
    </div>
  );
}

window.DocsEditor = DocsEditor;