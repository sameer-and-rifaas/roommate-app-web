import React, { useState } from 'react';
import { Folder, Upload, FileText, Download, Eye, X, Trash2, GraduationCap } from 'lucide-react';
import { FileCard, useUploader, isPDF, isImage } from './StudyView';

export default function AchievementsView({ studyFiles, uploadFile, deleteFile, renameFile }) {
  const [previewFile, setPreviewFile] = useState(null);

  // Group files under '__general_docs__'
  const allDocs = (studyFiles || []).filter(f => f.subject === '__general_docs__');
  const sameerDocs = allDocs.filter(f => f.owner === 'Sameer');
  const rifaasDocs = allDocs.filter(f => f.owner === 'Rifaas');

  // Certificates
  const allCerts = (studyFiles || []).filter(f => f.subject === '__certificates__');
  const sameerCerts = allCerts.filter(f => f.owner === 'Sameer');
  const rifaasCerts = allCerts.filter(f => f.owner === 'Rifaas');

  const sameerUp = useUploader((det) => uploadFile({ ...det, subject: '__general_docs__', owner: 'Sameer' }), '__general_docs__');
  const rifaasUp = useUploader((det) => uploadFile({ ...det, subject: '__general_docs__', owner: 'Rifaas' }), '__general_docs__');
  const sameerCertUp = useUploader((det) => uploadFile({ ...det, subject: '__certificates__', owner: 'Sameer' }), '__certificates__');
  const rifaasCertUp = useUploader((det) => uploadFile({ ...det, subject: '__certificates__', owner: 'Rifaas' }), '__certificates__');

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

      {/* HEADER */}
      <div className="cyber-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(79,134,247,0.06))', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', boxShadow: '0 4px 14px rgba(16,185,129,0.35)', flexShrink: 0 }}>🗂️</div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>Documents Vault</h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>General Documents • Certificates — all in one vault</p>
        </div>
      </div>

      {/* DOCUMENTS SPLIT BOX */}
      <div className="cyber-card" style={{ border: '1px solid rgba(16,185,129,0.2)', padding: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Folder size={17} color="#10B981" />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1rem', fontFamily: 'var(--font-heading)', color: '#10B981' }}>📁 General Documents</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{allDocs.length} file{allDocs.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          
          {/* Sameer's Docs */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>👨‍💻</span> Sameer
              </div>
              <input type="file" ref={sameerUp.ref} style={{ display: 'none' }} onChange={sameerUp.onChange} />
              <button onClick={sameerUp.trigger} disabled={sameerUp.loading} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', color: '#10B981', cursor: 'pointer', padding: '0.4rem 0.6rem', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Upload size={13} /> {sameerUp.loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <FileList files={sameerDocs} emptyMsg="No documents uploaded yet." />
          </div>

          {/* Rifaas's Docs */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>👨‍💻</span> Rifaas
              </div>
              <input type="file" ref={rifaasUp.ref} style={{ display: 'none' }} onChange={rifaasUp.onChange} />
              <button onClick={rifaasUp.trigger} disabled={rifaasUp.loading} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', color: '#10B981', cursor: 'pointer', padding: '0.4rem 0.6rem', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Upload size={13} /> {rifaasUp.loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <FileList files={rifaasDocs} emptyMsg="No documents uploaded yet." />
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          🏆 CERTIFICATES (Split for Both Users)
         ══════════════════════════════════════════════════════ */}
      <div className="cyber-card" style={{ border: '1px solid rgba(245,158,11,0.2)', padding: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(245,158,11,0.1)' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={17} color="#F59E0B" />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1rem', fontFamily: 'var(--font-heading)', color: '#F59E0B' }}>🏆 Certificates</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{allCerts.length} file{allCerts.length !== 1 ? 's' : ''} • Awards &amp; course completions</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>

          {/* Sameer's Certificates */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🥇</span> Sameer
              </div>
              <input type="file" ref={sameerCertUp.ref} style={{ display: 'none' }} onChange={sameerCertUp.onChange} accept=".pdf,.jpg,.jpeg,.png,.webp" />
              <button onClick={sameerCertUp.trigger} disabled={sameerCertUp.loading} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', color: '#F59E0B', cursor: 'pointer', padding: '0.4rem 0.6rem', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Upload size={13} /> {sameerCertUp.loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <FileList files={sameerCerts} emptyMsg="Sameer hasn't uploaded certificates." />
          </div>

          {/* Rifaas's Certificates */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🥇</span> Rifaas
              </div>
              <input type="file" ref={rifaasCertUp.ref} style={{ display: 'none' }} onChange={rifaasCertUp.onChange} accept=".pdf,.jpg,.jpeg,.png,.webp" />
              <button onClick={rifaasCertUp.trigger} disabled={rifaasCertUp.loading} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', color: '#F59E0B', cursor: 'pointer', padding: '0.4rem 0.6rem', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Upload size={13} /> {rifaasCertUp.loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <FileList files={rifaasCerts} emptyMsg="Rifaas hasn't uploaded certificates." />
          </div>

        </div>
      </div>

    </div>
  );
}
