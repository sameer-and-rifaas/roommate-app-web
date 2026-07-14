import React, { useState, useRef } from 'react';
import { Plus, Trash2, Upload, FileText, Download, Folder, Eye, X, Award, BookOpen } from 'lucide-react';

// ─── File type helpers ────────────────────────────────────────
export const getFileIcon = (name = '') => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf')                          return { icon: '📄', color: '#EF4444', rgb: '239,68,68' };
  if (['doc','docx'].includes(ext))           return { icon: '📝', color: '#4F86F7', rgb: '79,134,247' };
  if (['ppt','pptx'].includes(ext))           return { icon: '📊', color: '#F59E0B', rgb: '245,158,11' };
  if (['xls','xlsx','csv'].includes(ext))     return { icon: '📋', color: '#10B981', rgb: '16,185,129' };
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return { icon: '🖼️', color: '#A855F7', rgb: '168,85,247' };
  return { icon: '📁', color: '#4F86F7', rgb: '79,134,247' };
};
export const isPDF   = (name = '') => /\.pdf$/i.test(name);
export const isImage = (name = '') => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);

// ─── Reusable file card ───────────────────────────────────────
export function FileCard({ file, onOpen, onDownload, onDelete, onRename }) {
  const { icon, color, rgb } = getFileIcon(file.name);
  const hasData = !!file.dataUrl;
  const canOpen = hasData && (isPDF(file.name) || isImage(file.name));

  return (
    <div
      onClick={() => {
        if (hasData) {
          onOpen(file);
        } else {
          alert('This is an old file (metadata only). Please delete it and upload again to view.');
        }
      }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.7rem 0.9rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        cursor: hasData ? 'pointer' : 'not-allowed',
        transition: 'all 0.18s',
      }}
      onMouseEnter={e => { if (hasData) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = `rgba(${rgb},0.3)`; } }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
    >
      <div style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0, background: `rgba(${rgb},0.12)`, border: `1px solid rgba(${rgb},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: hasData ? 'none' : 'line-through', opacity: hasData ? 1 : 0.6 }}>{file.name}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '0.1rem' }}>{file.size} • {file.date} {!hasData && <span style={{color: '#EF4444'}}> (Corrupted file)</span>}</div>
      </div>
      <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
        {canOpen && (
          <button onClick={e => { e.stopPropagation(); onOpen(file); }} title="Open"
            style={{ background: `rgba(${rgb},0.12)`, border: `1px solid rgba(${rgb},0.25)`, borderRadius: '7px', color, cursor: 'pointer', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: '700' }}>
            <Eye size={12} /> Open
          </button>
        )}
        {hasData && (
          <button onClick={e => { e.stopPropagation(); onDownload(file); }} title="Download"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '7px', color: '#10B981', cursor: 'pointer', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center' }}>
            <Download size={14} />
          </button>
        )}
        <button onClick={e => { e.stopPropagation(); onRename(file.id, file.name); }} title="Rename"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '7px', color: '#F59E0B', cursor: 'pointer', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
          ✎ Edit
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(file.id, file.name); }} title="Delete"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '7px', color: '#EF4444', cursor: 'pointer', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center' }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Upload hook helper ───────────────────────────────────────
export function useUploader(uploadFile, defaultSubject) {
  const ref = useRef(null);
  const [loading, setLoading] = useState(false);

  const trigger = () => ref.current?.click();

  const onChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Prompt for file name
    const extMatch = file.name.match(/(\.[^.]+)$/);
    const ext = extMatch ? extMatch[0] : '';
    const baseName = file.name.replace(ext, '');

    const userChosenName = window.prompt(`Enter a name for this file:`, baseName);
    if (userChosenName === null || userChosenName.trim() === '') {
      e.target.value = null; // Cancelled
      return;
    }

    const finalName = userChosenName.trim() + ext;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      uploadFile({
        name:    finalName,
        size:    (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type:    file.type || 'application/octet-stream',
        subject: defaultSubject,
        dataUrl: evt.target.result,
      });
      setLoading(false);
    };
    reader.onerror = () => setLoading(false);
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  return { ref, loading, trigger, onChange };
}

// ─── Main Component ───────────────────────────────────────────
export default function StudyView({ subjects, addSubject, deleteSubject, studyFiles, uploadFile, deleteFile, currentUser }) {
  const [newSubject,      setNewSubject]     = useState('');
  const [selectedSubject, setSelectedSubject]= useState(null); // null = show all subjects
  const [previewFile,     setPreviewFile]    = useState(null);

  const myFiles    = studyFiles.filter(f => f.owner === currentUser);
  const mySubjects = subjects.filter(s => s.owner === currentUser);

  // Categorised files
  const allResumes = studyFiles.filter(f => f.subject === '__resume__');
  const sameerResumes = allResumes.filter(f => f.owner === 'Sameer');
  const rifaasResumes = allResumes.filter(f => f.owner === 'Rifaas');

  const subjectFiles= myFiles.filter(f => f.subject !== '__resume__' && f.subject !== '__certificates__');

  // Uploaders
  const sameerResumeUp = useUploader((det) => uploadFile({ ...det, subject: '__resume__', owner: 'Sameer' }), '__resume__');
  const rifaasResumeUp = useUploader((det) => uploadFile({ ...det, subject: '__resume__', owner: 'Rifaas' }), '__resume__');
  const subjectUp= useUploader(
    (det) => uploadFile({ ...det, subject: selectedSubject || (mySubjects[0]?.name) || 'General' }),
    selectedSubject || 'General'
  );

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    addSubject(newSubject.trim());
    setNewSubject('');
  };

  const openFile = (file) => {
    if (!file.dataUrl) { alert('Re-upload this file to enable preview.'); return; }
    if (isPDF(file.name) || isImage(file.name)) setPreviewFile(file);
    else { const a = document.createElement('a'); a.href = file.dataUrl; a.download = file.name; a.click(); }
  };
  const downloadFile = (file) => {
    if (!file.dataUrl) { alert('Re-upload to download.'); return; }
    const a = document.createElement('a'); a.href = file.dataUrl; a.download = file.name; a.click();
  };
  const confirmDelete = (id, name) => { if (window.confirm(`Delete "${name}"?`)) deleteFile(id); };

  const handleRename = (id, oldName) => {
    const extMatch = oldName.match(/(\.[^.]+)$/);
    const ext = extMatch ? extMatch[0] : '';
    const baseName = oldName.replace(ext, '');
    
    let newBase = window.prompt(`Rename file (current: ${baseName}):`, baseName);
    if (newBase && newBase.trim() !== '' && newBase !== baseName) {
      if (renameFile) renameFile(id, newBase.trim() + ext);
    }
  };

  // Common file list renderer
  const FileList = ({ files, emptyMsg }) => files.length > 0
    ? <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {files.map(f => <FileCard key={f.id} file={f} onOpen={openFile} onDownload={downloadFile} onDelete={confirmDelete} onRename={handleRename} />)}
      </div>
    : <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-subtle)', fontSize: '0.85rem', fontStyle: 'italic' }}>{emptyMsg}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

      {/* ── PREVIEW MODAL ──────────────────────────────────── */}
      {previewFile && (
        <div onClick={() => setPreviewFile(null)} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.6rem 1rem' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>📄 {previewFile.name}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => downloadFile(previewFile)} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10B981', cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Download size={13} /> Download</button>
              <button onClick={() => setPreviewFile(null)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#EF4444', cursor: 'pointer', padding: '0.4rem 0.7rem', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
            </div>
          </div>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '900px', maxHeight: '80vh', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
            {isPDF(previewFile.name)
              ? <iframe src={previewFile.dataUrl} title={previewFile.name} style={{ width: '100%', height: '80vh', border: 'none' }} />
              : <img src={previewFile.dataUrl} alt={previewFile.name} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0a0e1a' }} />
            }
          </div>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="cyber-card" style={{ background: 'linear-gradient(135deg, rgba(79,134,247,0.1), rgba(168,85,247,0.06))', border: '1px solid rgba(79,134,247,0.2)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', boxShadow: '0 4px 14px rgba(79,134,247,0.35)', flexShrink: 0 }}>📚</div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Study Hub <span style={{ color: 'var(--primary)' }}>({currentUser})</span></h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Subjects • Resume — study files in one place</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          BOX 1 — 📚 SUBJECTS
         ══════════════════════════════════════════════════════ */}
      <div className="cyber-card" style={{ border: '1px solid rgba(79,134,247,0.25)', padding: '1.2rem' }}>
        {/* Box header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(79,134,247,0.15)', border: '1px solid rgba(79,134,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={17} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>📚 Subjects</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{subjectFiles.length} file{subjectFiles.length !== 1 ? 's' : ''} • {mySubjects.length} subject{mySubjects.length !== 1 ? 's' : ''}</div>
            </div>
          </div>

          {/* Add subject form */}
          <form onSubmit={handleAddSubject} className="mobile-wrap" style={{ gap: '0.4rem' }}>
            <input type="text" required placeholder="Add new subject..." className="cyber-input" value={newSubject} onChange={e => setNewSubject(e.target.value)} style={{ fontSize: '0.82rem', padding: '0.45rem 0.7rem', width: '180px' }} />
            <button type="submit" className="cyber-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}><Plus size={15} /></button>
          </form>
        </div>

        {/* Grouped Subjects List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          {mySubjects.map(sub => {
            const filesForSub = subjectFiles.filter(f => f.subject === sub.name);
            
            // We need an uploader specifically for this subject
            // We can just use the global uploadFile directly here to avoid hooks inside map
            const handleSubjectUpload = (e) => {
              const file = e.target.files[0];
              if (!file) return;

              // Prompt for file name
              const extMatch = file.name.match(/(\.[^.]+)$/);
              const ext = extMatch ? extMatch[0] : '';
              const baseName = file.name.replace(ext, '');

              const userChosenName = window.prompt(`Enter a name for this file:`, baseName);
              if (userChosenName === null || userChosenName.trim() === '') {
                e.target.value = null; // Cancelled
                return;
              }

              const finalName = userChosenName.trim() + ext;

              const reader = new FileReader();
              reader.onload = (evt) => {
                uploadFile({
                  name:    finalName,
                  size:    (file.size / 1024 / 1024).toFixed(2) + ' MB',
                  type:    file.type || 'application/octet-stream',
                  subject: sub.name,
                  dataUrl: evt.target.result,
                });
              };
              reader.readAsDataURL(file);
              e.target.value = null; // reset
            };

            return (
              <div key={sub.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
                {/* Subject Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Folder size={16} color="var(--primary)" />
                    <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1.05rem' }}>{sub.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', background: 'rgba(79,134,247,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{filesForSub.length} items</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ cursor: 'pointer', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '6px', color: '#10B981', padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Upload size={13} /> Upload
                      <input type="file" style={{ display: 'none' }} onChange={handleSubjectUpload} />
                    </label>
                    <button onClick={() => { if (window.confirm(`Delete "${sub.name}"?`)) deleteSubject(sub.id); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '0.3rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subject Files */}
                <FileList files={filesForSub} emptyMsg={`No documents uploaded for ${sub.name} yet.`} />
              </div>
            );
          })}

          {mySubjects.length === 0 && (
             <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-subtle)', fontSize: '0.85rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
               Create a subject above to start organizing your files.
             </div>
          )}

          {/* "General" / Uncategorised files (if any exist but don't match current subjects) */}
          {subjectFiles.filter(f => !mySubjects.find(s => s.name === f.subject)).length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Folder size={16} color="var(--text-subtle)" />
                <span style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '1.05rem' }}>Other Files</span>
              </div>
              <FileList files={subjectFiles.filter(f => !mySubjects.find(s => s.name === f.subject))} emptyMsg="" />
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          BOX 2 — 📄 RESUMES (Split for Both Users)
         ══════════════════════════════════════════════════════ */}
      <div className="cyber-card" style={{ border: '1px solid rgba(239,68,68,0.2)', padding: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={17} color="#EF4444" />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1rem', fontFamily: 'var(--font-heading)', color: '#EF4444' }}>📄 Resumes</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{allResumes.length} file{allResumes.length !== 1 ? 's' : ''} • Click to open & preview</div>
          </div>
        </div>

        <div className="mobile-grid">
          
          {/* Sameer's Resume Column */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>👨‍💻</span> Sameer's Resume
              </div>
              <input type="file" ref={sameerResumeUp.ref} style={{ display: 'none' }} onChange={sameerResumeUp.onChange} accept=".pdf,.doc,.docx" />
              <button onClick={sameerResumeUp.trigger} disabled={sameerResumeUp.loading} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#EF4444', cursor: 'pointer', padding: '0.4rem 0.6rem', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Upload size={13} /> {sameerResumeUp.loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <FileList files={sameerResumes} emptyMsg="Sameer hasn't uploaded a resume yet." />
          </div>

          {/* Rifaas's Resume Column */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>👨‍💻</span> Rifaas's Resume
              </div>
              <input type="file" ref={rifaasResumeUp.ref} style={{ display: 'none' }} onChange={rifaasResumeUp.onChange} accept=".pdf,.doc,.docx" />
              <button onClick={rifaasResumeUp.trigger} disabled={rifaasResumeUp.loading} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#EF4444', cursor: 'pointer', padding: '0.4rem 0.6rem', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Upload size={13} /> {rifaasResumeUp.loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <FileList files={rifaasResumes} emptyMsg="Rifaas hasn't uploaded a resume yet." />
          </div>

        </div>
      </div>



    </div>
  );
}
