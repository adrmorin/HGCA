import React, { useState, useEffect } from 'react';
import './registration.css';

const SUPABASE_URL = 'https://nhyovijaojrcowgxbaif.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3SJz2nqAAu18_q1WhJFGDA_YtaKc9NL';

export default function RegistrationFloatMenu({
  lang = 'es',
  isOpen,
  setIsOpen,
  showLauncher = true,
  requiredNotice = '',
  isRegistered = false,
  onUnlockDemo = null,
  onRegistered = null,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [formType, setFormType] = useState('driver'); // 'driver' | 'shipper'

  // Listen for iframe registration event
  useEffect(() => {
    const handleMsg = (e) => {
      if (e.data && (
        e.data.type === 'HCGA_REGISTRATION_COMPLETED' || 
        e.data.type === 'HCGA_REGISTRATION_DONE' ||
        e.data.type === 'HCGA_SHIPPER_REGISTERED'
      )) {
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

  // Header counters (registered / confirmed), read from Supabase while the modal is open
  const [stats, setStats] = useState(null);
  useEffect(() => {
    if (!modalOpen) return;
    let alive = true;
    const load = () => {
      fetch(`${SUPABASE_URL}/rest/v1/rpc/registration_counts`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: '{}',
      })
        .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
        .then((d) => { const row = Array.isArray(d) ? d[0] : d; if (alive && row) setStats(row); })
        .catch(() => { /* keep "—": never show made-up numbers */ });
    };
    load();
    const id = setInterval(load, 60000);
    const onMsg = (e) => { if (e.data && /^HCGA_(REGISTRATION|SHIPPER)_/.test(e.data.type || '')) load(); };
    window.addEventListener('message', onMsg);
    return () => { alive = false; clearInterval(id); window.removeEventListener('message', onMsg); };
  }, [modalOpen]);

  const isEs = lang === 'es';
  const fmtCount = (n) => (n == null ? '—' : new Intl.NumberFormat(isEs ? 'es-US' : 'en-US').format(Number(n) || 0));

  return (
    <>
      {/* Floating launcher trigger (rendered only if showLauncher is true) */}
      {showLauncher && (
      <aside className="reg-float" aria-label={isEs ? "Portal de Registro de Choferes y Shippers" : "Driver and Shipper Registration Portal"}>
        {showMenu && (
          <div className="reg-float__menu-popover" role="menu">
            <div className="reg-float__menu-header">
              <span className="reg-float__menu-heading">
                {isEs ? 'Opciones de Registro Comercial' : 'Registration Portal Options'}
              </span>
            </div>

            {/* Opción 1: Formulario del Chofer */}
            <button
              type="button"
              className="reg-float__menu-item reg-float__menu-item--primary"
              onClick={() => {
                setFormType('driver');
                setShowMenu(false);
                setModalOpen(true);
              }}
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>{isEs ? 'Registro del Chofer (FMCSA §391)' : 'Driver Registration (FMCSA §391)'}</span>
            </button>

            {/* Opción 2: Formulario del Shipper */}
            <button
              type="button"
              className="reg-float__menu-item reg-float__menu-item--shipper"
              onClick={() => {
                setFormType('shipper');
                setShowMenu(false);
                setModalOpen(true);
              }}
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 21h18" />
                <path d="M9 8h1" /><path d="M9 12h1" /><path d="M9 16h1" />
                <path d="M14 8h1" /><path d="M14 12h1" /><path d="M14 16h1" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
              </svg>
              <span>{isEs ? 'Registro de Shipper (Carga Directa)' : 'Shipper Onboarding (Direct Freight)'}</span>
            </button>

            <a
              href={`${import.meta.env.BASE_URL}formulario-registro.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="reg-float__menu-item"
              onClick={() => setShowMenu(false)}
              role="menuitem"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>{isEs ? 'Abrir Chofer en Ventana Completa' : 'Open Driver in Full Window'}</span>
            </a>

            <a
              href={`${import.meta.env.BASE_URL}formulario-shipper.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="reg-float__menu-item"
              onClick={() => setShowMenu(false)}
              role="menuitem"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>{isEs ? 'Abrir Shipper en Ventana Completa' : 'Open Shipper in Full Window'}</span>
            </a>

            <a
              href={`${import.meta.env.BASE_URL}certificado/hcga-certificado-ci.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="reg-float__menu-item"
              onClick={() => setShowMenu(false)}
              role="menuitem"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                {isEs ? 'Registro Chofer & Shipper' : 'Driver & Shipper Signup'}
              </span>
              <span className="reg-float__badge">
                FMCSA
              </span>
              <span className="reg-float__badge reg-float__badge--shipper">
                SHIPPER
              </span>
            </div>
            <span className="reg-float__subtitle">
              {isEs ? 'Expedientes Oficiales · USDOT 4150721' : 'Official Onboarding · USDOT 4150721'}
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
                    {isEs ? 'Formulario de registro' : 'Registration form'}
                  </h2>
                  <p className="reg-modal__subtitle">
                    {formType === 'driver'
                      ? (isEs
                          ? 'Expediente Oficial FMCSA 49 CFR §391 · USDOT #4150721 · Tel. (239) 961-0175'
                          : 'Official FMCSA 49 CFR §391 Driver Qualification File · USDOT #4150721 · Tel. (239) 961-0175')
                      : (isEs
                          ? 'Alta Comercial & Licitación Directa EDI 204 · USDOT #4150721 · MC-1689201 · Tel. (239) 961-0175'
                          : 'Commercial Onboarding & Direct EDI 204 Freight · USDOT #4150721 · MC-1689201 · Tel. (239) 961-0175')
                    }
                  </p>
                  <p className="reg-modal__demo-note" style={{ color: '#EF5350' }}>
                    {formType === 'driver'
                      ? (isEs
                          ? '8 Acápites en Acordeón · Validación Biométrica, VIN y Rótulo de Puerta'
                          : '8 Dropdown Accordion Sections · Biometrics, VIN & Door Decal Verification')
                      : (isEs
                          ? '8 Acápites en Acordeón · Integración EDI, Términos de Crédito y Firma Digital'
                          : '8 Dropdown Accordion Sections · EDI Integration, Credit Terms & Signature')
                    }
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

            {/* Cartel de cabecera del menú de registro */}
            <section className="reg-banner" aria-labelledby="reg-banner-title">
              <h3 id="reg-banner-title" className="reg-banner__title">
                {isEs ? 'Regístrese y sea de los primeros en usar HCGA' : 'Register and be among the first to use HCGA'}
              </h3>
              <p className="reg-banner__lead">
                {isEs
                  ? 'Cuéntenos cómo quiere participar. Le avisaremos cuando la plataforma esté activa.'
                  : 'Tell us how you want to take part. We will let you know when the platform is live.'}
              </p>
              <span className="reg-banner__free">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {isEs
                  ? 'Registrarse es gratis. No se solicita ningún pago ni datos de pago.'
                  : 'Registration is free. No payment or payment details are requested.'}
              </span>

              {/* Contadores: se leen del servidor, nunca se incrementan a mano */}
              <div className="reg-banner__stats" aria-live="polite">
                <div className="reg-banner__stat">
                  <span className="reg-banner__stat-num">{fmtCount(stats?.registered)}</span>
                  <h4 className="reg-banner__stat-label">{isEs ? 'Registrados' : 'Registered'}</h4>
                </div>
                <div className="reg-banner__stat reg-banner__stat--ok">
                  <span className="reg-banner__stat-num">{fmtCount(stats?.verified)}</span>
                  <h4 className="reg-banner__stat-label">{isEs ? 'Confirmados' : 'Confirmed'}</h4>
                </div>
              </div>
            </section>

            {/* Subheader Navigation: Switch between Driver and Shipper forms */}
            <div className="reg-modal__nav">
              <div className="reg-modal__tabs" role="tablist" aria-label={isEs ? 'Seleccionar tipo de registro' : 'Select registration form'}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={formType === 'driver'}
                  className={`reg-modal__tab-btn ${formType === 'driver' ? 'reg-modal__tab-btn--active' : ''}`}
                  onClick={() => setFormType('driver')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="1" y="3" width="15" height="13" rx="2" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>{isEs ? 'Registro Chofer (FMCSA §391)' : 'Driver Registration (FMCSA)'}</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={formType === 'shipper'}
                  className={`reg-modal__tab-btn reg-modal__tab-btn--shipper ${formType === 'shipper' ? 'reg-modal__tab-btn--active' : ''}`}
                  onClick={() => setFormType('shipper')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 21h18" />
                    <path d="M9 8h1" /><path d="M9 12h1" /><path d="M9 16h1" />
                    <path d="M14 8h1" /><path d="M14 12h1" /><path d="M14 16h1" />
                    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                  </svg>
                  <span>{isEs ? 'Registro Shipper (Carga Directa)' : 'Shipper Registration (Freight)'}</span>
                </button>
              </div>

              <div className="reg-modal__nav-meta">
                <span style={{ fontFamily: 'var(--font-family-mono, monospace)', color: '#EF5350', fontSize: '0.74rem' }}>
                  {formType === 'driver' ? 'USDOT #4150721' : 'USDOT #4150721 · MC-1689201'}
                </span>
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

            {/* Modal Body with embedded Iframe */}
            <div className="reg-modal__body">
              <iframe
                key={formType}
                src={`${import.meta.env.BASE_URL}${formType === 'driver' ? 'formulario-registro.html' : 'formulario-shipper.html'}${isEs ? '?lang=es' : '?lang=en'}`}
                title={formType === 'driver'
                  ? (isEs ? 'Formulario de Registro del Chofer' : 'Driver Registration Form')
                  : (isEs ? 'Formulario de Alta del Shipper' : 'Shipper Registration Form')
                }
                className="reg-modal__iframe"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
