import React, { useState, useEffect } from 'react';
import './registration.css';

export default function RegistrationFloatMenu({
  lang = 'es',
  isOpen,
  setIsOpen,
  showLauncher = false,
  requiredNotice = '',
  isRegistered = false,
  onUnlockDemo = null,
  onRegistered = null,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Listen for iframe registration event
  useEffect(() => {
    const handleMsg = (e) => {
      if (e.data && (e.data.type === 'HCGA_REGISTRATION_COMPLETED' || e.data.type === 'HCGA_REGISTRATION_DONE')) {
        if (onRegistered) onRegistered();
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [onRegistered]);

  // Synchronize internal and controlled state
  const modalOpen = isOpen !== undefined ? isOpen : internalOpen;
  const setModalOpen = (val) => {
    if (setIsOpen) setIsOpen(val);
    setInternalOpen(val);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (modalOpen) setModalOpen(false);
        if (showMenu) setShowMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, showMenu]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const isEs = lang === 'es';

  return (
    <>
      {/* Floating launcher trigger (rendered only if showLauncher is true) */}
      {showLauncher && (
      <aside className="reg-float" aria-label={isEs ? "Registro de Interés" : "Interest Registration"}>
        {showMenu && (
          <div className="reg-float__menu-popover" role="menu">
            <div className="reg-float__menu-header">
              <span className="reg-float__menu-heading">
                {isEs ? 'Opciones de Registro' : 'Registration Options'}
              </span>
            </div>

            <button
              type="button"
              className="reg-float__menu-item reg-float__menu-item--primary"
              onClick={() => {
                setShowMenu(false);
                setModalOpen(true);
              }}
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>{isEs ? 'Abrir Formulario de Registro' : 'Open Registration Form'}</span>
            </button>

            <a
              href={`${import.meta.env.BASE_URL}formulario-registro.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="reg-float__menu-item"
              onClick={() => setShowMenu(false)}
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>{isEs ? 'Abrir en Ventana Completa' : 'Open Full Window'}</span>
            </a>

            <a
              href={`${import.meta.env.BASE_URL}certificado/hcga-certificado-ci.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="reg-float__menu-item"
              onClick={() => setShowMenu(false)}
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{isEs ? 'Ver Modelo de Certificado (CUI)' : 'View Certificate Model (CUI)'}</span>
            </a>
          </div>
        )}

        <button
          type="button"
          className="reg-float__trigger"
          onClick={() => setModalOpen(true)}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowMenu(!showMenu);
          }}
          aria-haspopup="dialog"
          aria-expanded={modalOpen}
          title={isEs ? "Clic para abrir formulario de registro (clic derecho para opciones)" : "Click to open registration form (right click for options)"}
        >
          <div className="reg-float__icon-box">
            <svg className="reg-float__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="reg-float__pulse-dot" aria-hidden="true" />
          </div>

          <div className="reg-float__text-group">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="reg-float__title">
                {isEs ? 'Lista de Registro' : 'Interest Registration'}
              </span>
              <span className="reg-float__badge">
                {isEs ? 'Gratis' : 'Free'}
              </span>
            </div>
            <span className="reg-float__subtitle">
              {isEs ? 'Carrier & Shipper · Certificado CI' : 'Carrier & Shipper · CI Certificate'}
            </span>
          </div>

          <button
            type="button"
            aria-label={isEs ? "Más opciones de registro" : "More registration options"}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--reg-text-muted)',
              cursor: 'pointer',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </button>
      </aside>
      )}

      {/* Floating Modal Dialog */}
      {modalOpen && (
        <div
          className="reg-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reg-modal-title"
        >
          <div className="reg-modal-dialog">
            {/* Modal Header */}
            <div className="reg-modal__header">
              <div className="reg-modal__brand">
                <img
                  src={`${import.meta.env.BASE_URL}hcga-logo-horizontal-white.png`}
                  alt="HCGA Trading LLC"
                  className="reg-modal__logo"
                />
                <div className="reg-modal__title-group">
                  <h2 id="reg-modal-title" className="reg-modal__title">
                    {isEs ? 'Registro de Interés y Capacidad' : 'Commercial Intent & Capacity Registration'}
                  </h2>
                  <p className="reg-modal__subtitle">
                    {isEs
                      ? 'Certificado Digital de Intención Comercial (No vinculante · Sin cobros)'
                      : 'Digital Certificate of Commercial Intent (Non-binding · Free)'}
                  </p>
                  <p className="reg-modal__demo-note">
                    {isEs
                      ? 'Revisa la maqueta del DEMO CONTROLLER por tiempo limitado'
                      : 'Check out the DEMO CONTROLLER mockup for a limited time'}
                  </p>
                </div>
              </div>

              <div className="reg-modal__actions">
                <button
                  type="button"
                  className="reg-modal__btn-close"
                  onClick={() => setModalOpen(false)}
                  aria-label={isEs ? 'Cerrar ventana' : 'Close window'}
                  title={isEs ? 'Cerrar (Esc)' : 'Close (Esc)'}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Restricted Access Alert Banner */}
            {requiredNotice && (
              <div
                style={{
                  background: 'linear-gradient(90deg, rgba(137, 0, 0, 0.35) 0%, rgba(30, 20, 20, 0.7) 100%)',
                  borderBottom: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#fca5a5',
                  fontSize: '0.88rem',
                  lineHeight: '1.4',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#ffffff', marginRight: '6px' }}>
                    {isEs ? 'Acceso Restringido:' : 'Restricted Access:'}
                  </strong>
                  <span>{requiredNotice}</span>
                </div>
              </div>
            )}

            {/* Quick Demo Bypass for Testing */}
            {onUnlockDemo && !isRegistered && (
              <div style={{ padding: '6px 20px', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid var(--reg-border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    onUnlockDemo();
                  }}
                  style={{
                    background: 'none',
                    border: '1px dashed rgba(255,255,255,0.3)',
                    color: '#cbd5e1',
                    fontSize: '0.78rem',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>⚡</span>
                  <span>{isEs ? 'Simular Registro Aprobado (Bypass Demo)' : 'Simulate Approved Registration (Demo Bypass)'}</span>
                </button>
              </div>
            )}

            {/* Modal Body with embedded Iframe */}
            <div className="reg-modal__body">
              <iframe
                src={`${import.meta.env.BASE_URL}formulario-registro.html${isEs ? '?lang=es' : '?lang=en'}`}
                title={isEs ? 'Formulario de Registro de Interés HCGA' : 'HCGA Registration Form'}
                className="reg-modal__iframe"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
