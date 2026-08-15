import React, { useState, useRef } from 'react';
import './index.css';
import mobileVideo from './assets/video/mobile-hero-video.mp4';

const SERVICES_DATA = [
  {
    id: 'dedicated-routes',
    title: 'Dedicated Routes',
    subtitle: 'Reliable capacity and guaranteed service levels for your consistent lanes.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    ),
    description: [
      'HCGA Trading LLC provides custom-tailored dedicated fleet solutions for businesses requiring consistent, high-volume shipping corridors.',
      'We commit trucks, drivers, and equipment exclusively to your operation, guaranteeing capacity and predictable transit times even during peak market surges.',
      'Our dedicated services integrate seamlessly with your supply chain, allowing for custom delivery protocols, pre-scheduled pickup times, and specialized driver training specific to your freight.'
    ],
    features: [
      '100% capacity guarantees for scheduled lanes',
      'Single-source accountability with dedicated driver pools',
      'Custom loading protocols & yard management integration',
      'Structured weekly and monthly performance reports'
    ],
    kpis: [
      { label: 'On-Time Performance', value: '99.8%' },
      { label: 'Dedicated Assets', value: '150+' },
      { label: 'Driver Retention', value: '85%' }
    ]
  },
  {
    id: 'contract-transportation',
    title: 'Contract Transportation',
    subtitle: 'Long-term partnership with agreed-upon rates and committed equipment.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
    ),
    description: [
      'Secure your transportation costs and logistics pipeline with our flexible contract services.',
      'We work closely with your logistics team to establish fixed-rate lanes and pre-allocated equipment, mitigating spot-market volatility and protecting your bottom line.',
      'Our long-term partnerships are built on service-level agreement (SLA) adherence, digital reporting transparency, and mutual operational integration.'
    ],
    features: [
      'Multi-year rate stability & predictable budgeting',
      'Committed equipment allocations (dry van, flatbed, etc.)',
      'Tailored Service Level Agreements (SLAs)',
      'Full EDI integration & standardized communication'
    ],
    kpis: [
      { label: 'Rate Predictability', value: '100%' },
      { label: 'Contract Compliance', value: '99.9%' },
      { label: 'Avg Partnership', value: '5+ Yrs' }
    ]
  },
  {
    id: 'facility-to-facility',
    title: 'Facility-to-Facility',
    subtitle: 'Efficient movement of goods between warehouses, hubs, or distribution centers.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
    ),
    description: [
      'Efficiently move raw materials, work-in-progress inventory, or finished goods between manufacturing hubs, warehouses, and distribution centers.',
      'Our close-loop logistics system ensures optimal truck utilization and fast turnaround times, preventing facility bottlenecks and supply chain idle times.',
      'We run high-frequency, timed shuttle services configured to your dynamic warehouse capacities.'
    ],
    features: [
      'Pre-scheduled drop-and-hook trailer programs',
      'Just-in-time (JIT) inventory movement flow',
      'Live geofenced arrival & departure alerts',
      'Integrated yard-management synchronization'
    ],
    kpis: [
      { label: 'Avg Turnaround', value: '<30m' },
      { label: 'Geofence Accuracy', value: '99.9%' },
      { label: 'Daily Capacity', value: '10k+ T' }
    ]
  },
  {
    id: 'final-mile-delivery',
    title: 'Final-Mile Delivery',
    subtitle: 'Professional last-leg transportation to retail or end-customer destinations.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    ),
    description: [
      'Deliver your products directly to retail storefronts, commercial distribution nodes, or end-users with our professional final-mile transport.',
      'We prioritize timeliness, product safety, and driver professionalism to represent your brand perfectly at delivery.',
      'Our dispatch system offers tight scheduling windows, ensuring your recipients are prepared for arrival and minimizing detention times.'
    ],
    features: [
      'Specialized liftgate equipment & inside delivery',
      'Real-time digital signature & photo proof of delivery',
      'Tight delivery window scheduling (<1h precision)',
      'Drivers trained in professional client representation'
    ],
    kpis: [
      { label: 'Window Accuracy', value: '98.6%' },
      { label: 'Digital POD Delivery', value: 'Instant' },
      { label: 'Customer Rating', value: '4.9/5' }
    ]
  },
  {
    id: 'multi-stop-routes',
    title: 'Multi-Stop Routes',
    subtitle: 'Optimized routing for multiple drop-offs with AI-assisted sequencing.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
    ),
    description: [
      'Maximize transit efficiency on multi-stop delivery routes using our state-of-the-art route sequencing algorithms.',
      'Our software analyzes geographic constraints, traffic patterns, and delivery windows to sequence drop-offs perfectly, minimizing fuel consumption and transit time.',
      'This service is ideal for regional distributors looking to bundle multiple deliveries into single, high-efficiency dispatches.'
    ],
    features: [
      'Dynamic route sequencing & dispatch overlay',
      'Multi-stop load building with weight constraints',
      'Real-time routing adjustments for traffic bypass',
      'Automated customer alerts as driver approaches'
    ],
    kpis: [
      { label: 'Route Efficiency', value: '+22%' },
      { label: 'Empty Miles Cut', value: '35%' },
      { label: 'Stops per Route', value: '5-12' }
    ]
  },
  {
    id: 'equipment-repositioning',
    title: 'Equipment Repositioning',
    subtitle: 'Strategic movement of your assets and trailers to where they are needed most.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 12l-4-4-4 4M12 8v8"></path></svg>
    ),
    description: [
      'Ensure your trailers, containers, and dry vans are in the right place at the right time.',
      'We specialize in rapid asset repositioning across regions to eliminate equipment shortages, prepare for peak loads, or relocate idle equipment.',
      'Whether you are an intermodal carrier balancing containers or a retailer moving seasonal assets, we provide swift one-way tow-away operations.'
    ],
    features: [
      'Empty container repositioning for intermodal carriers',
      'One-way trailer tow-away services',
      'High-velocity asset shifts ahead of season demands',
      'Full tracking of customer-owned assets in transit'
    ],
    kpis: [
      { label: 'Asset Util Gain', value: '+18%' },
      { label: 'Repositioning Time', value: '<48h' },
      { label: 'Asset Tracking', value: '100%' }
    ]
  },
  {
    id: 'seasonal-capacity',
    title: 'Seasonal Capacity',
    subtitle: 'Flexible fleet scaling to handle your peak season volume surges.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
    ),
    description: [
      'Handle your holiday rushes, harvest seasons, or end-of-quarter volume surges without operational stress.',
      'HCGA\'s scalable fleet program provides pre-committed surge capacity, ensuring your shipping pipeline stays completely fluid when demand peaks.',
      'We work months in advance with our partners to design custom seasonal playbooks.'
    ],
    features: [
      'Pre-committed seasonal capacity allocations',
      'Rapid onboarding of specialized trailers for peaks',
      'Dedicated surge support & dispatch planning teams',
      'Daily performance auditing & path corrections'
    ],
    kpis: [
      { label: 'Peak Scalability', value: '250%' },
      { label: 'Surge Activation', value: '<24h' },
      { label: 'On-Time Surge', value: '99.2%' }
    ]
  },
  {
    id: 'overflow-transportation',
    title: 'Overflow Transportation',
    subtitle: 'On-demand truck capacity when your internal fleet is fully utilized.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
    ),
    description: [
      'Never turn down a shipment or risk production delays. When your private fleet or primary contract carriers hit capacity limits, HCGA\'s overflow service steps in.',
      'We handle spillover volumes with the same high standards, compliance, and real-time tracking as our dedicated runs.',
      'Our team is on standby 24/7/365 to catch unexpected lane overloads.'
    ],
    features: [
      'Rapid response times for unexpected lane volume',
      'Seamless integration into your current TMS system',
      'Dedicated standby driver pool for rapid dispatch',
      'Flexible overflow volume pricing'
    ],
    kpis: [
      { label: 'Booking Time', value: '<15m' },
      { label: 'Dispatch Lead', value: '<2h' },
      { label: 'Standby Coverage', value: '24/7' }
    ]
  },
  {
    id: 'u-box-storage-transport',
    title: 'U-Box Storage Transport',
    subtitle: 'Specialized readiness for portable storage and U-Box container logistics.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
    ),
    description: [
      'HCGA Trading LLC is a premier provider of logistics and relocation services for portable storage containers, including U-Box units.',
      'Our drivers are fully trained in the specific securement, weight limits, and towing configurations required to move residential and commercial storage pods.',
      'We guarantee safe, vibration-minimized transport, ensuring your customers\' contents remain in pristine condition throughout the journey.'
    ],
    features: [
      'Custom trailers optimized for multiple storage containers',
      'Rigid multi-point cargo securement protocols',
      'Coordinated transport between storage hubs & depots',
      'Vibration-damping transport configuration'
    ],
    kpis: [
      { label: 'Cargo Damage', value: '0.001%' },
      { label: 'Specialized Units', value: '80+' },
      { label: 'Monthly moves', value: '5,000+' }
    ]
  }
];


function App() {
  const [showContent, setShowContent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const videoRef = useRef(null);
  const servicesRef = useRef(null);

  const handleSelectService = (id) => {
    setSelectedServiceId(id);
    setQuoteSubmitted(false);
    setTimeout(() => {
      if (servicesRef.current) {
        servicesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleBackToServices = () => {
    setSelectedServiceId(null);
    setQuoteSubmitted(false);
    setTimeout(() => {
      if (servicesRef.current) {
        servicesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const togglePlayStop = () => {
    if (videoRef.current) {
      if (isPlaying) {
        // Stop action
        videoRef.current.pause();
        if (videoRef.current.duration) {
          videoRef.current.currentTime = videoRef.current.duration - 0.1; // Jump to end frame
        }
        setShowContent(true);
      } else {
        // Play action
        videoRef.current.currentTime = 0;
        setShowContent(false);
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };


  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <a href="#" className="header__logo">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="HCGA Trading LLC" className="header__logo-img" />
          </a>
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>

          <div className={`header__menu ${isMobileMenuOpen ? 'header__menu--open' : ''}`}>
            <nav className="nav">
              <ul className="nav__list">
                <li><a href="#services" className="nav__link" onClick={() => { setIsMobileMenuOpen(false); setSelectedServiceId(null); }}>Services</a></li>
                <li><a href="#technology" className="nav__link" onClick={() => setIsMobileMenuOpen(false)}>Technology</a></li>
                <li><a href="#safety" className="nav__link" onClick={() => setIsMobileMenuOpen(false)}>Safety</a></li>
                <li><a href="#client-portal" className="nav__link" onClick={() => setIsMobileMenuOpen(false)}>Client Portal</a></li>
              </ul>
            </nav>

            <div className="header__actions">
              <a href="#" className="nav__link">Driver Login</a>
              <a href="#client-portal" className="nav__link">
                Client Login
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <video 
            ref={videoRef}
            className="hero__video-bg" 
            autoPlay 
            muted 
            playsInline
            onEnded={() => setShowContent(true)}
          >
            {/* Mobile Video (Samsung Z Fold 5 and standard mobile up to 1023px) */}
            <source src={mobileVideo} media="(max-width: 1023px)" type="video/mp4" />
            {/* Desktop Video */}
            <source src={`${import.meta.env.BASE_URL}hero-video.mp4`} type="video/mp4" />
          </video>
          <div className="hero__video-overlay"></div>
          
          <div className="hero__video-controls">
            <button onClick={togglePlayStop} className="btn-play-pause" aria-label="Toggle Play/Stop">
              {isPlaying ? (
                /* Stop Icon */
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>
              ) : (
                /* Play Icon */
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              )}
            </button>
          </div>

          <div className={`container hero__content ${showContent ? 'hero__content--visible' : 'hero__content--hidden'}`}>
            
            <h1 className="hero__title">
              Scalable commercial transportation, <span className="hero__title-highlight">powered by data.</span>
            </h1>

            <p className="hero__description">
              HCGA TRADING LLC provides scalable commercial transportation solutions supported by real-time fleet visibility, disciplined operations, professional drivers, and modern route-management technology.
            </p>

            <div className="hero__actions">
              <a href="#services" className="btn btn--primary" onClick={() => setSelectedServiceId(null)}>
                Request Transportation Services
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>

              <a href="#technology" className="btn btn--secondary">
                Explore Our Technology
              </a>
              <a href="#" className="btn btn--outline">
                Partner With HCGA
              </a>
            </div>

          </div>
        </section>

        <section id="services" ref={servicesRef} className="section services-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Transportation Services</h2>
              <p className="section-subtitle">Scalable, reliable, and technology-driven operations tailored for commercial clients.</p>
            </div>
            
            {selectedServiceId ? (() => {
              const service = SERVICES_DATA.find(s => s.id === selectedServiceId);
              return (
                <div className="service-detail">
                  <div className="service-detail__header">
                    <button className="service-detail__back-btn" onClick={handleBackToServices}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                      Back to Services
                    </button>
                  </div>
                  
                  <div className="service-detail__hero">
                    <div className="service-detail__hero-icon">
                      {service.icon}
                    </div>
                    <div className="service-detail__hero-text">
                      <h3 className="service-detail__title">{service.title}</h3>
                      <p className="service-detail__subtitle">{service.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="service-detail__body">
                    {/* Left Column: Info & Features */}
                    <div className="service-detail__info-col">
                      <div className="service-detail__description-box">
                        {service.description.map((para, i) => (
                          <p key={i} className="service-detail__description">{para}</p>
                        ))}
                      </div>
                      
                      <div className="service-detail__features-box">
                        <h4 className="service-detail__section-title">Operational Capabilities</h4>
                        <ul className="service-detail__features-list">
                          {service.features.map((feature, i) => (
                            <li key={i}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right Column: KPIs & Action Form */}
                    <div className="service-detail__action-col">
                      <div className="service-detail__kpis-box">
                        <h4 className="service-detail__section-title">Performance Metrics</h4>
                        <div className="service-detail__kpi-grid">
                          {service.kpis.map((kpi, i) => (
                            <div key={i} className="service-detail__kpi-card">
                              <span className="service-detail__kpi-value">{kpi.value}</span>
                              <span className="service-detail__kpi-label">{kpi.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="service-detail__form-box">
                        <h4 className="service-detail__section-title">Request Quote & Info</h4>
                        {quoteSubmitted ? (
                          <div className="service-detail__success-msg">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            <h4>Request Received!</h4>
                            <p>An HCGA route manager will contact you within 15 minutes to discuss {service.title} details.</p>
                          </div>
                        ) : (
                          <form className="service-detail__form" onSubmit={(e) => {
                            e.preventDefault();
                            setQuoteSubmitted(true);
                          }}>
                            <div className="form-group">
                              <label htmlFor="detail-company">Company Name</label>
                              <input type="text" id="detail-company" className="form-input" placeholder="Acme Logistics" required />
                            </div>
                            <div className="form-group">
                              <label htmlFor="detail-contact">Contact Person</label>
                              <input type="text" id="detail-contact" className="form-input" placeholder="Jane Doe" required />
                            </div>
                            <div className="form-group">
                              <label htmlFor="detail-phone">Phone Number</label>
                              <input type="tel" id="detail-phone" className="form-input" placeholder="(555) 000-0000" required />
                            </div>
                            <div className="form-group">
                              <label htmlFor="detail-email">Work Email</label>
                              <input type="email" id="detail-email" className="form-input" placeholder="jdoe@acme.com" required />
                            </div>
                            <div className="form-group">
                              <label htmlFor="detail-notes">Additional Details / Route Lanes</label>
                              <textarea id="detail-notes" className="form-input form-input--textarea" placeholder="Describe your lane volume or specific requirements..." rows="3"></textarea>
                            </div>
                            <button type="submit" className="btn btn--primary btn--full">Get Started</button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="services-grid">
                {SERVICES_DATA.map((service) => (
                  <div 
                    key={service.id} 
                    className="service-card"
                    onClick={() => handleSelectService(service.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="service-icon">
                      {service.icon}
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.subtitle}</p>
                    <span className="service-card__learn-more">
                      Learn More
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>


        <section id="technology" className="section tech-section">
          <div className="container tech-container">
            <div className="tech-content">
              <h2 className="section-title tech-title">Intelligent Fleet Control</h2>
              <p className="section-subtitle tech-subtitle">
                HCGA FleetOS gives you total operational visibility and control. Our custom-built technology stack ensures safety, efficiency, and compliance.
              </p>
              
              <ul className="tech-feature-list">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Live fleet visibility</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Driver tablet system</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Route monitoring</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Fuel control & tracking</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Maintenance alerts</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Digital driver inspections</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Digital proof of delivery</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Automated customer reporting</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>AI-assisted route & cost analysis</span>
                </li>
              </ul>
            </div>

            <div className="tech-visual">
              <div className="dashboard-mockup">
                <div className="mockup-header">
                  <div className="mockup-dot" style={{ backgroundColor: '#ef4444' }}></div>
                  <div className="mockup-dot" style={{ backgroundColor: '#f59e0b' }}></div>
                  <div className="mockup-dot" style={{ backgroundColor: '#10b981' }}></div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-sidebar">
                    <div className="mockup-line"></div>
                    <div className="mockup-line mockup-line--short"></div>
                    <div className="mockup-line"></div>
                    <div className="mockup-line"></div>
                  </div>
                  <div className="mockup-content">
                    <div className="mockup-cards">
                      <div className="mockup-card"></div>
                      <div className="mockup-card"></div>
                      <div className="mockup-card"></div>
                    </div>
                    <div className="mockup-map"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="safety" className="section safety-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title" style={{ color: 'var(--color-primary)' }}>Safety & Compliance</h2>
              <p className="section-subtitle">A culture of safety built into every route, backed by digital records and constant monitoring.</p>
            </div>
            
            <div className="safety-grid">
              {/* Feature 1 */}
              <div className="safety-item">
                <div className="safety-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <h4>Driver Qualification</h4>
              </div>
              
              {/* Feature 2 */}
              <div className="safety-item">
                <div className="safety-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h4>Vehicle Inspections</h4>
              </div>
              
              {/* Feature 3 */}
              <div className="safety-item">
                <div className="safety-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </div>
                <h4>Preventive Maintenance</h4>
              </div>
              
              {/* Feature 4 */}
              <div className="safety-item">
                <div className="safety-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <h4>GPS Monitoring</h4>
              </div>

              {/* Feature 5 */}
              <div className="safety-item">
                <div className="safety-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <h4>Digital Compliance</h4>
              </div>

              {/* Feature 6 */}
              <div className="safety-item">
                <div className="safety-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <h4>Incident Reporting</h4>
              </div>

              {/* Feature 7 */}
              <div className="safety-item">
                <div className="safety-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <h4>Insurance Compliance</h4>
              </div>

              {/* Feature 8 */}
              <div className="safety-item">
                <div className="safety-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h4>DOT Readiness</h4>
              </div>
            </div>
          </div>
        </section>

        <section id="client-portal" className="section portal-section">
          <div className="container portal-container">
            <div className="portal-content">
              <h2 className="section-title">Client Portal</h2>
              <p className="section-subtitle">Access your dedicated fleet dashboard. Monitor live routes, download delivery proofs, and analyze performance data.</p>
              
              <form className="portal-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label htmlFor="email">Work Email</label>
                  <input type="email" id="email" className="form-input" placeholder="name@company.com" required />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input type="password" id="password" className="form-input" placeholder="••••••••" required />
                </div>
                <div className="form-actions">
                  <a href="#" className="forgot-password">Forgot password?</a>
                  <button type="submit" className="btn btn--primary btn--full">Sign In to FleetOS</button>
                </div>
              </form>
              
              <div className="portal-footer">
                <p>Not a client yet? <a href="#">Request Partnership</a></p>
              </div>
            </div>
            
            <div className="portal-visual">
               <div className="portal-graphics">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="portal-lock-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                 <h3>Secure Access</h3>
                 <p>Enterprise-grade encryption for your operational data.</p>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="HCGA TRADING LLC Logo" className="footer-logo-img" />
            <p>Scalable commercial transportation, powered by data.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <a href="#services" onClick={() => handleSelectService('dedicated-routes')}>Dedicated Routes</a>
              <a href="#services" onClick={() => handleSelectService('contract-transportation')}>Contract Transportation</a>
              <a href="#services" onClick={() => handleSelectService('facility-to-facility')}>Facility-to-Facility</a>
            </div>

            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} HCGA TRADING LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
