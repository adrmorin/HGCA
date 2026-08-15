import React, { useState, useRef, useEffect } from 'react';
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

const SAFETY_DATA = [
  {
    id: 'driver-qualification',
    title: 'Driver Qualification',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    ),
    desc: "Rigorous vetting process for all operators including background checks, road testing, and ongoing safety training.",
    bullets: [
      "CDL Class A license verification and tracking",
      "Clean driving records (MVR checks) updated quarterly",
      "Regular medical exams and DOT card compliance audits",
      "Hands-on defensive driver training modules"
    ],
    ctaText: "Launch Driver Console",
    ctaState: "driver_marketplace",
    image: "safety_driver_qual.png"
  },
  {
    id: 'vehicle-inspections',
    title: 'Vehicle Inspections',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    ),
    desc: "Continuous pre-trip and post-trip inspections powered by FleetOS to guarantee vehicle readiness and prevent en-route failures.",
    bullets: [
      "Mandatory digital DVIR walk-arounds for all drivers",
      "Real-time defect reporting directly to maintenance shops",
      "Instant electronic logs sent to compliance dispatch",
      "Brake, tire pressure, and lighting validation checklists"
    ],
    ctaText: "Launch Compliance Simulator",
    ctaState: "driver_pretrip",
    image: "safety_vehicle_insp.png"
  },
  {
    id: 'preventive-maintenance',
    title: 'Preventive Maintenance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    ),
    desc: "Scheduled maintenance programs based on real-time mileage tracking, engine hours, and proactive telemetry diagnostics.",
    bullets: [
      "A-service, B-service, and C-service scheduling alerts",
      "Certified diesel technicians performing 120-point checks",
      "Automated parts ordering and fleet downtime reduction",
      "Tire rotation and wear-index predictive analytics"
    ],
    ctaText: "Launch Compliance Simulator",
    ctaState: "driver_compliant",
    image: "safety_prev_maint.png"
  },
  {
    id: 'gps-monitoring',
    title: 'GPS Monitoring',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
    ),
    desc: "Continuous satellite tracking and geofencing to ensure cargo safety, optimized routing, and immediate hazard response.",
    bullets: [
      "Real-time breadcrumb tracking at 10-second intervals",
      "Geofenced terminal notifications for automatic check-in",
      "Traffic and weather-delay alternate route calculator",
      "Driver speeding and harsh-braking telemetry feedback"
    ],
    ctaText: "Launch Route Simulator",
    ctaState: "driver_transit",
    image: "safety_gps_monitor.png"
  },
  {
    id: 'digital-compliance',
    title: 'Digital Compliance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    ),
    desc: "100% digital records of ELD logs, hours of service (HOS), and driver credentials stored securely in FleetOS database.",
    bullets: [
      "ELD electronic logging device integration per FMCSA rules",
      "Hours of Service (HOS) cycle alerts and clock monitoring",
      "Instant roadside inspection report sharing",
      "Digital document archive for historical audit readiness"
    ],
    ctaText: "Launch Safety Console",
    ctaState: "driver_compliant",
    image: "safety_digi_compliance.png"
  },
  {
    id: 'incident-reporting',
    title: 'Incident Reporting',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
    ),
    desc: "Streamlined digital intake forms for rapid roadside incident reporting, insurance notification, and dispatch re-routing.",
    bullets: [
      "Mobile incident intake form with photo upload utility",
      "Instant notifications sent to safety managers and clients",
      "Roadside assistance dispatch integration",
      "Root cause analysis (RCA) auditing and compliance logging"
    ],
    ctaText: "Launch Safety Console",
    ctaState: "driver_compliant",
    image: "safety_inc_reporting.png"
  },
  {
    id: 'insurance-compliance',
    title: 'Insurance Compliance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
    ),
    desc: "Comprehensive active liability and cargo insurance coverage, with digital certificate sharing for enterprise logistics clients.",
    bullets: [
      "$5,000,000 auto liability and $500,000 cargo coverage limits",
      "Instant digital certificate of insurance (COI) requests",
      "A-rated carrier backing and zero-gap risk management",
      "Brokerage bond and trailer interchange compliance"
    ],
    ctaText: "Instant Client HUD Demo",
    ctaState: "client_dashboard",
    image: "safety_ins_compliance.png"
  },
  {
    id: 'dot-readiness',
    title: 'DOT Readiness',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    ),
    desc: "Flawless FMCSA compliance profile with top-tier safety scores and instant documentation packages.",
    bullets: [
      "Clean DOT registration and active authority verification",
      "Satisfactory safety ratings from official DOT audits",
      "Unified carrier registration (UCR) compliance checks",
      "Intrastate and interstate permits active (IFTA, HUT, weight)"
    ],
    ctaText: "Instant Client HUD Demo",
    ctaState: "client_dashboard",
    image: "safety_dot_readiness.png"
  }
];

function App() {
  const [showContent, setShowContent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [showDevNotice, setShowDevNotice] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedSafetyId, setSelectedSafetyId] = useState(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const videoRef = useRef(null);
  const servicesRef = useRef(null);

  // Driver Dashboard states
  const [isDriverLoggedIn, setIsDriverLoggedIn] = useState(false);
  const [showDriverLoginModal, setShowDriverLoginModal] = useState(false);
  const [showDriverDashboard, setShowDriverDashboard] = useState(false);
  const [driverUsername, setDriverUsername] = useState('carlos');
  const [driverPin, setDriverPin] = useState('1042');
  const [loginError, setLoginError] = useState('');
  const [driverStats, setDriverStats] = useState({ tripsCompleted: 24, milesDriven: 12450, safetyScore: 98 });
  const [loadsList, setLoadsList] = useState([
    { id: '48291', origin: 'Chicago, IL', dest: 'Dallas, TX', dist: 960, type: 'Reefer', vehicle: '53ft Semi Truck', rate: 2850 },
    { id: '85023', origin: 'Los Angeles, CA', dest: 'Phoenix, AZ', dist: 370, type: 'Flatbed', vehicle: '26ft Box Truck', rate: 1200 },
    { id: '12984', origin: 'Houston, TX', dest: 'Atlanta, GA', dist: 790, type: 'Dry Van', vehicle: 'Cargo Van', rate: 2100 },
    { id: '90248', origin: 'Seattle, WA', dest: 'Salt Lake City, UT', dist: 820, type: 'Dry Van', vehicle: '53ft Semi Truck', rate: 2350 }
  ]);
  const [activeLoad, setActiveLoad] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [dvisChecked, setDvisChecked] = useState({ tires: false, lights: false, brakes: false, coupling: false });
  const [isDemoPanelOpen, setIsDemoPanelOpen] = useState(false);

  const launchDemoState = (state) => {
    // Reset states first
    setShowDriverDashboard(false);
    setShowClientDashboard(false);
    setIsDriverLoggedIn(false);
    setIsClientLoggedIn(false);
    setSelectedServiceId(null);
    setSelectedSafetyId(null);
    
    if (state === 'driver_marketplace') {
      setIsDriverLoggedIn(true);
      setActiveLoad(null);
      setShowDriverDashboard(true);
    } else if (state === 'driver_pretrip') {
      setIsDriverLoggedIn(true);
      setActiveLoad(loadsList[0]);
      setDvisChecked({ tires: false, lights: false, brakes: false, coupling: false });
      setLoadProgress(0);
      setShowDriverDashboard(true);
    } else if (state === 'driver_compliant') {
      setIsDriverLoggedIn(true);
      setActiveLoad(loadsList[0]);
      setDvisChecked({ tires: true, lights: true, brakes: true, coupling: true });
      setLoadProgress(0);
      setShowDriverDashboard(true);
    } else if (state === 'driver_transit') {
      setIsDriverLoggedIn(true);
      setActiveLoad(loadsList[0]);
      setDvisChecked({ tires: true, lights: true, brakes: true, coupling: true });
      setLoadProgress(50);
      setShowDriverDashboard(true);
    } else if (state === 'driver_arrived') {
      setIsDriverLoggedIn(true);
      setActiveLoad(loadsList[0]);
      setDvisChecked({ tires: true, lights: true, brakes: true, coupling: true });
      setLoadProgress(100);
      setShowDriverDashboard(true);
    } else if (state === 'client_dashboard') {
      setIsClientLoggedIn(true);
      setShowClientDashboard(true);
    }
  };

  window.__activeLoad = activeLoad;
  window.__loadProgress = loadProgress;
  window.__dvisChecked = dvisChecked;

  // Client Dashboard states
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  const [showClientDashboard, setShowClientDashboard] = useState(false);
  const [clientWorkEmail, setClientWorkEmail] = useState('demo@company.com');
  const [clientPassword, setClientPassword] = useState('password');
  const [clientLoginError, setClientLoginError] = useState('');
  const [downloadingPodId, setDownloadingPodId] = useState(null);

  const [clientActiveShipments, setClientActiveShipments] = useState([
    { id: 'TRK-98402', origin: 'Chicago, IL', dest: 'Dallas, TX', status: 'En Route', tractor: '#1042', temp: '36°F', speed: '62 MPH', progress: 50, eta: '8 hours', vehicle: '53ft Semi Truck' },
    { id: 'TRK-10928', origin: 'Los Angeles, CA', dest: 'Phoenix, AZ', status: 'Loading', tractor: '#1105', temp: '38°F', speed: '0 MPH', progress: 5, eta: '14 hours', vehicle: '26ft Box Truck' }
  ]);

  const [clientCompletedShipments, setClientCompletedShipments] = useState([
    { id: 'TRK-82941', origin: 'Houston, TX', dest: 'Atlanta, GA', date: '2026-08-12', payout: 2100, status: 'Delivered', podName: 'POD-82941.pdf' },
    { id: 'TRK-74920', origin: 'Seattle, WA', dest: 'Salt Lake City, UT', date: '2026-08-10', payout: 2350, status: 'Delivered', podName: 'POD-74920.pdf' }
  ]);

  const handleDriverLogin = (e) => {
    e.preventDefault();
    if ((driverUsername.toLowerCase() === 'carlos' && driverPin === '1042') ||
        (driverUsername.toLowerCase() === 'sarah' && driverPin === '1192') ||
        driverUsername.toLowerCase() === 'demo') {
      setIsDriverLoggedIn(true);
      setShowDriverLoginModal(false);
      setShowDriverDashboard(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Driver ID or PIN. Use carlos / 1042 or click Demo Login.');
    }
  };

  const handleClientLogin = (e) => {
    e.preventDefault();
    if (clientWorkEmail.length > 3 && clientPassword.length >= 4) {
      setIsClientLoggedIn(true);
      setShowClientDashboard(true);
      setClientLoginError('');
    } else {
      setClientLoginError('Please enter a valid work email and password.');
    }
  };


  const handleSelectService = (id) => {
    setSelectedServiceId(id);
    setQuoteSubmitted(false);
  };

  const handleBackToServices = () => {
    setSelectedServiceId(null);
    setQuoteSubmitted(false);
  };

  useEffect(() => {
    if (!showDevNotice) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowDevNotice(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDevNotice]);

  const openDevNotice = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setShowDevNotice(true);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (showDriverDashboard) {
      window.scrollTo(0, 0);
    }
  }, [showDriverDashboard]);

  useEffect(() => {
    if (showClientDashboard) {
      window.scrollTo(0, 0);
    }
  }, [showClientDashboard]);


  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const togglePlayStop = () => {
    if (videoRef.current) {
      if (isPlaying) {
        // Stop action
        videoRef.current.pause();
        if (videoRef.current.duration) {
          videoRef.current.currentTime = videoRef.current.duration - 0.1; // Jump to end frame
        }
      } else {
        // Play action
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(err => console.log("Play failed:", err));
      }
    }
  };


  if (showDriverDashboard) {
    return (
      <>
        <div className="driver-dashboard" style={{ backgroundColor: 'var(--color-surface)', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--color-text-primary)' }}>
        {/* Dashboard Header */}
        <header className="header" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--color-border)' }}>
          <div className="container header__inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="HCGA Trading LLC" style={{ height: '40px' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', backgroundColor: 'var(--color-accent)', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FleetOS Driver</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn--outline btn--sm"
                onClick={() => {
                  setShowDriverDashboard(false);
                  setTimeout(() => {
                    const el = document.querySelector('#safety');
                    if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
                  }, 250);
                }}
              >
                Return to Safety
              </button>
              <button
                className="btn btn--outline btn--sm"
                onClick={() => {
                  setShowDriverDashboard(false);
                }}
              >
                Exit Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Body - Stacked Full-Width Row Layout */}
        <div className="container" style={{ flex: 1, padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Row 1: Profile & Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem', alignItems: 'stretch' }}>
            
            {/* Operator Sidebar Card (Styled as a premium horizontal info card) */}
            <div className="dashboard-sidebar" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justify: 'space-between', gap: '1rem' }}>
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Active Operator</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', display: 'block' }}>Carlos Mendoza</strong>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>ID: #1042 | CDL Class A</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>ELD Driving Clock</span>
                  <strong style={{ fontSize: '0.95rem', color: '#10b981' }}>08h 45m remaining</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>Cycle: Compliant</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Assigned Tractor</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>Tractor #1042</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>Trailer: 53' Reefer</span>
                </div>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="dashboard-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              
              <div className="summary-card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(153,0,0,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Trips Completed</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{driverStats.tripsCompleted}</strong>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Miles Logged</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{driverStats.milesDriven.toLocaleString()}</strong>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Safety Score</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{driverStats.safetyScore}%</strong>
                </div>
              </div>

            </div>

          </div>

          {/* Main workspace area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
            
            {/* Workspace Board */}
            {activeLoad ? (
              <div className="active-dispatch-card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-accent)', letterSpacing: '0.1em' }}>Active Route Dispatch</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.25rem 0 0 0' }}>Load #{activeLoad.id} - In Transit</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid #10b981', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' }}>
                      Status: {loadProgress === 0 ? 'Assigned' : loadProgress === 100 ? 'Arrived' : 'En Route'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', alignItems: 'stretch' }}>
                    {/* Left Column: Route specifications & DVIR check */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', margin: '0 0 0.75rem 0', fontWeight: '700' }}>Route Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
                          <div><span style={{ color: 'var(--color-text-secondary)' }}>Origin:</span> <strong>{activeLoad.origin}</strong></div>
                          <div><span style={{ color: 'var(--color-text-secondary)' }}>Destination:</span> <strong>{activeLoad.dest}</strong></div>
                          <div><span style={{ color: 'var(--color-text-secondary)' }}>Distance:</span> <strong>{activeLoad.dist} miles</strong></div>
                          <div><span style={{ color: 'var(--color-text-secondary)' }}>Vehicle Class:</span> <strong>{activeLoad.vehicle}</strong></div>
                          <div><span style={{ color: 'var(--color-text-secondary)' }}>Equipment:</span> <strong>{activeLoad.type}</strong></div>
                          <div><span style={{ color: 'var(--color-text-secondary)' }}>Rate payout:</span> <strong style={{ color: 'var(--color-accent)' }}>${activeLoad.rate.toLocaleString()} USD</strong></div>
                        </div>
                      </div>

                      {/* Pre-trip DVIR Checklist */}
                      <div>
                        <h4 style={{ fontSize: '1rem', margin: '0 0 0.75rem 0', fontWeight: '700' }}>Pre-Trip DVIR Compliance</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem 0' }}>Federal HOS regulations require a full mechanical walk-around before starting transit.</p>
                        
                        <div className="safety-dvir" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                          <label className="checklist-item" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem', cursor: loadProgress > 0 ? 'not-allowed' : 'pointer' }}>
                            <input type="checkbox" checked={dvisChecked.tires} disabled={loadProgress > 0} onChange={() => setDvisChecked(p => ({ ...p, tires: !p.tires }))} />
                            <span>Tires & Tread Checked (PSI compliant)</span>
                          </label>
                          <label className="checklist-item" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem', cursor: loadProgress > 0 ? 'not-allowed' : 'pointer' }}>
                            <input type="checkbox" checked={dvisChecked.lights} disabled={loadProgress > 0} onChange={() => setDvisChecked(p => ({ ...p, lights: !p.lights }))} />
                            <span>All Brake & Turn signal lights verified</span>
                          </label>
                          <label className="checklist-item" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem', cursor: loadProgress > 0 ? 'not-allowed' : 'pointer' }}>
                            <input type="checkbox" checked={dvisChecked.brakes} disabled={loadProgress > 0} onChange={() => setDvisChecked(p => ({ ...p, brakes: !p.brakes }))} />
                            <span>Air lines & Service brake pads checked</span>
                          </label>
                          <label className="checklist-item" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem', cursor: loadProgress > 0 ? 'not-allowed' : 'pointer' }}>
                            <input type="checkbox" checked={dvisChecked.coupling} disabled={loadProgress > 0} onChange={() => setDvisChecked(p => ({ ...p, coupling: !p.coupling }))} />
                            <span>Fifth-wheel connection locked securely</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Telemetry Progress Console */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center' }}>
                      {/* Telemetry Control Dashboard Graphic Banner */}
                      <div style={{ width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative' }}>
                        <img src={`${import.meta.env.BASE_URL}driver_control_panel.png`} alt="Control Panel Telemetry HUD" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      <div style={{ backgroundColor: '#0f141c', border: '1px solid #1a2333', borderRadius: '12px', padding: '1.25rem', color: '#a5b4fc', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', fontSize: '0.8rem' }}>
                          <span>FLEETOS TELEMETRY v4.1</span>
                          <span style={{ color: loadProgress === 100 ? '#10b981' : '#f59e0b' }}>● {loadProgress === 0 ? 'PENDING DEPARTURE' : loadProgress === 100 ? 'ARRIVED' : 'TRANSIT ACTIVE'}</span>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                            <span>Route Progress</span>
                            <span>{loadProgress}%</span>
                          </div>
                          <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ width: `${loadProgress}%`, height: '100%', backgroundColor: 'var(--color-accent)', transition: 'width 0.4s ease' }}></div>
                          </div>
                        </div>

                        {/* Live logs */}
                        <div style={{ height: '70px', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: '#cbd5e1' }}>
                          <div>[18:03] Load Accepted by Driver Carlos Mendoza.</div>
                          {Object.values(dvisChecked).every(v => v) && <div>[18:03] DVIR compliance report completed. Pre-trip pass.</div>}
                          {loadProgress > 0 && <div>[18:04] Engine Telemetry linked. Speed: 62 MPH. Odometer: 142,380 mi.</div>}
                          {loadProgress >= 50 && <div>[18:04] GPS checkpoint: Mid-route pass. Cargo temp: 36F (Normal).</div>}
                          {loadProgress === 100 && <div style={{ color: '#10b981' }}>[18:04] Destination geo-fence crossed. Route complete. Ready to unload.</div>}
                        </div>

                        {/* Interactive Controls */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {!Object.values(dvisChecked).every(v => v) ? (
                            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>Complete pre-trip inspection to unlock dispatch.</div>
                          ) : loadProgress < 100 ? (
                            <button
                              className="btn btn--primary btn--sm"
                              onClick={() => {
                                setLoadProgress(prev => Math.min(prev + 50, 100));
                              }}
                            >
                              {loadProgress === 0 ? 'Start Route / Leave Hub' : 'Simulate 500 Miles'}
                            </button>
                          ) : (
                            <button
                              className="btn btn--primary btn--sm"
                              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                              onClick={() => {
                                // Reset active load & add stats
                                setDriverStats(p => ({
                                  ...p,
                                  tripsCompleted: p.tripsCompleted + 1,
                                  milesDriven: p.milesDriven + activeLoad.dist
                                }));
                                // Remove load from available list
                                setLoadsList(prev => prev.filter(l => l.id !== activeLoad.id));
                                setActiveLoad(null);
                                setLoadProgress(0);
                                setDvisChecked({ tires: false, lights: false, brakes: false, coupling: false });
                              }}
                            >
                              Complete Delivery & Unlock Dispatch
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Load Marketplace table */
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>Available Dispatch Offers</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: '0 0 1.5rem 0' }}>Select and accept a load to allocate Tractor #1042 capacity. Only one route may be active at a time.</p>
                  
                  {loadsList.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                      No loads available. All commercial routes have been successfully dispatched.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="loads-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: '700' }}>
                            <th style={{ padding: '0.75rem 1rem' }}>Load ID</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Origin & Destination</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Distance</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Vehicle Class</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Equipment</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Payout</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loadsList.map((load) => (
                            <tr key={load.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s' }}>
                              <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>#{load.id}</td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <strong>{load.origin} &rarr; {load.dest}</strong>
                                </div>
                              </td>
                              <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{load.dist} mi</td>
                              <td style={{ padding: '1rem' }}><span style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>{load.vehicle}</span></td>
                              <td style={{ padding: '1rem' }}><span style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{load.type}</span></td>
                              <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--color-accent)' }}>${load.rate.toLocaleString()}</td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button
                                  className="btn btn--primary btn--sm"
                                  onClick={() => {
                                    setActiveLoad(load);
                                    setLoadProgress(0);
                                    setDvisChecked({ tires: false, lights: false, brakes: false, coupling: false });
                                  }}
                                >
                                  Accept Load
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        {/* Footer */}
        <footer className="footer" style={{ borderTop: '1px solid var(--color-border)', padding: '1.5rem 0', marginTop: 'auto' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            <span>HCGA FleetOS &copy; {new Date().getFullYear()}</span>
            <span>Driver Session: Carlos Mendoza (Tractor #1042)</span>
            <button
              onClick={() => {
                setIsDriverLoggedIn(false);
                setShowDriverDashboard(false);
                setActiveLoad(null);
                setLoadProgress(0);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
            >
              Sign Out Session
            </button>
          </div>
        </footer>
        </div>

        {/* Floating Interactive Demo Controller */}
        <div className="demo-controller">
          <div className="demo-controller__header">
            <span>Demo Controller</span>
            <button className="demo-controller__toggle" onClick={() => setIsDemoPanelOpen(!isDemoPanelOpen)}>
              {isDemoPanelOpen ? 'Collapse' : 'Interactive Demo Links'}
            </button>
          </div>
          {isDemoPanelOpen && (
            <div className="demo-controller__body">
              <button className="demo-controller__btn" onClick={() => { setShowDriverDashboard(false); setShowClientDashboard(false); }}>
                Back to Landing Page
              </button>
              
              <div className="demo-controller__section-title">Driver Console States</div>
              <button className="demo-controller__btn" onClick={() => launchDemoState('driver_marketplace')}>
                1. Available Loads
              </button>
              <button className="demo-controller__btn" onClick={() => launchDemoState('driver_pretrip')}>
                2. DVIR (Uncompliant)
              </button>
              <button className="demo-controller__btn" onClick={() => launchDemoState('driver_compliant')}>
                3. DVIR (Compliant)
              </button>
              <button className="demo-controller__btn" onClick={() => launchDemoState('driver_transit')}>
                4. In Transit (50%)
              </button>
              <button className="demo-controller__btn" onClick={() => launchDemoState('driver_arrived')}>
                5. Arrived (100%)
              </button>
              
              <div className="demo-controller__section-title">Client Console States</div>
              <button className="demo-controller__btn demo-controller__btn--client" onClick={() => launchDemoState('client_dashboard')}>
                Client Portal HUD
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  if (showClientDashboard) {
    return (
      <>
        <div className="client-dashboard" style={{ backgroundColor: 'var(--color-surface)', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--color-text-primary)' }}>
        {/* Dashboard Header */}
        <header className="header" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--color-border)' }}>
          <div className="container header__inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="HCGA Trading LLC" style={{ height: '40px' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', backgroundColor: '#10b981', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FleetOS Client</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn--outline btn--sm"
                onClick={() => {
                  setShowClientDashboard(false);
                  setTimeout(() => {
                    const el = document.querySelector('#safety');
                    if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
                  }, 250);
                }}
              >
                Return to Safety
              </button>
              <button
                className="btn btn--outline btn--sm"
                onClick={() => {
                  setShowClientDashboard(false);
                }}
              >
                Exit Console
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Body - Stacked Full-Width Row Layout */}
        <div className="container" style={{ flex: 1, padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Row 1: Profile & Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem', alignItems: 'stretch' }}>
            
            {/* Account Sidebar Card (Styled as a premium horizontal info card) */}
            <div className="dashboard-sidebar" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Active Account</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', display: 'block' }}>ACME Logistics Corp</strong>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>#AC-92841</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Account Manager</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>Sarah Jenkins</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>(800) 555-0192</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>On-Time Rate</span>
                  <strong style={{ fontSize: '0.95rem', color: '#10b981' }}>99.2% (Excellent)</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>Goal threshold: 98.0%</span>
                </div>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="dashboard-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              
              <div className="summary-card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Active Dispatches</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{clientActiveShipments.length} Routes</strong>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(153,0,0,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Freight Spent (Mo)</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>$48,250 USD</strong>
                </div>
              </div>

              <div className="summary-card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Tonnage Moved</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>124,500 lbs</strong>
                </div>
              </div>

            </div>

          </div>

          {/* Row 2: Active Cargo Dispatches - Displayed horizontally & full width */}
          <div className="active-dispatch-card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Active Cargo Dispatches</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {clientActiveShipments.map((shipment) => (
                <div key={shipment.id} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                  
                  {/* Left block: Text info details */}
                  <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--color-accent)' }}>#{shipment.id}</span>
                      <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}>{shipment.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                      <div>Origin: <strong style={{ color: 'var(--color-text-primary)' }}>{shipment.origin}</strong></div>
                      <div>Destination: <strong style={{ color: 'var(--color-text-primary)' }}>{shipment.dest}</strong></div>
                      <div>Vehicle: <strong style={{ color: 'var(--color-text-primary)' }}>{shipment.vehicle}</strong></div>
                      <div>Tractor: <strong style={{ color: 'var(--color-text-primary)' }}>{shipment.tractor}</strong></div>
                      <div>Reefer Temp: <strong style={{ color: 'var(--color-text-primary)' }}>{shipment.temp}</strong></div>
                      <div style={{ gridColumn: 'span 2' }}>ETA Remaining: <strong style={{ color: '#10b981' }}>{shipment.eta}</strong></div>
                    </div>
                  </div>
                  
                  {/* Right block: Live HUD mini tracking map (wider horizontal format) */}
                  <div style={{ flex: '1.5 1 400px', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative' }}>
                    <img src={`${import.meta.env.BASE_URL}driver_control_panel.png`} alt="Transit tracking HUD" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                  </div>
                  
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Proofs of Delivery Table - Full Width */}
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 1rem 0' }}>Archived Deliveries & PODs</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="loads-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: '700' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Shipment ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Origin & Destination</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Delivery Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Freight Cost</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Documents</th>
                  </tr>
                </thead>
                <tbody>
                  {clientCompletedShipments.map((shipment) => (
                    <tr key={shipment.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>#{shipment.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <strong>{shipment.origin} &rarr; {shipment.dest}</strong>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{shipment.date}</td>
                      <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--color-accent)' }}>${shipment.payout.toLocaleString()}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          className="btn btn--outline btn--sm"
                          onClick={() => {
                            setDownloadingPodId(shipment.id);
                            setTimeout(() => {
                              setDownloadingPodId(null);
                              alert(`Successfully downloaded Proof of Delivery document: ${shipment.podName}`);
                            }, 1500);
                          }}
                          disabled={downloadingPodId === shipment.id}
                        >
                          {downloadingPodId === shipment.id ? 'Downloading...' : 'Download POD'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="footer" style={{ borderTop: '1px solid var(--color-border)', padding: '1.5rem 0', marginTop: 'auto' }}>
          <div className="container" style={{ display: 'flex', justify: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            <span>HCGA FleetOS &copy; {new Date().getFullYear()}</span>
            <span>Client Session: ACME Logistics Corp</span>
            <button
              onClick={() => {
                setIsClientLoggedIn(false);
                setShowClientDashboard(false);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
            >
              Sign Out Session
            </button>
          </div>
        </footer>
      </div>

      {/* Floating Interactive Demo Controller */}
      <div className="demo-controller">
        <div className="demo-controller__header">
          <span>Demo Controller</span>
          <button className="demo-controller__toggle" onClick={() => setIsDemoPanelOpen(!isDemoPanelOpen)}>
            {isDemoPanelOpen ? 'Collapse' : 'Interactive Demo Links'}
          </button>
        </div>
        {isDemoPanelOpen && (
          <div className="demo-controller__body">
            <button className="demo-controller__btn" onClick={() => { setShowDriverDashboard(false); setShowClientDashboard(false); }}>
              Back to Landing Page
            </button>
            
            <div className="demo-controller__section-title">Driver Console States</div>
            <button className="demo-controller__btn" onClick={() => launchDemoState('driver_marketplace')}>
              1. Available Loads
            </button>
            <button className="demo-controller__btn" onClick={() => launchDemoState('driver_pretrip')}>
              2. DVIR (Uncompliant)
            </button>
            <button className="demo-controller__btn" onClick={() => launchDemoState('driver_compliant')}>
              3. DVIR (Compliant)
            </button>
            <button className="demo-controller__btn" onClick={() => launchDemoState('driver_transit')}>
              4. In Transit (50%)
            </button>
            <button className="demo-controller__btn" onClick={() => launchDemoState('driver_arrived')}>
              5. Arrived (100%)
            </button>
            
            <div className="demo-controller__section-title">Client Console States</div>
            <button className="demo-controller__btn demo-controller__btn--client" onClick={() => launchDemoState('client_dashboard')}>
              Client Portal HUD
            </button>
          </div>
        )}
      </div>
    </>
  );
}

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
              {isDriverLoggedIn ? (
                <a href="#" className="nav__link nav__link--dashboard" onClick={(e) => { e.preventDefault(); setShowDriverDashboard(true); }}>Driver Panel</a>
              ) : (
                <a href="#" className="nav__link" onClick={(e) => { e.preventDefault(); setShowDriverLoginModal(true); }}>Driver Login</a>
              )}
              {isClientLoggedIn ? (
                <a href="#" className="nav__link nav__link--dashboard" onClick={(e) => { e.preventDefault(); setShowClientDashboard(true); }} style={{ color: '#10b981', borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.05)' }}>Client Panel</a>
              ) : (
                <a href="#client-portal" className="nav__link">
                  Client Login
                </a>
              )}

              <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                )}
              </button>
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
            onPlay={() => { setShowContent(false); setIsPlaying(true); }}
            onPause={() => { setShowContent(true); setIsPlaying(false); }}
            onEnded={() => { setShowContent(true); setIsPlaying(false); }}
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
            <div className="section-banner-header" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}services_header.png)` }}>
              <div className="section-banner-header__overlay"></div>
              <div className="section-banner-header__content">
                <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="HCGA Trading LLC Logo" className="section-banner-header__logo" />
                <h2 className="section-title">Transportation Services</h2>
                <p className="section-subtitle">Scalable, reliable, and technology-driven operations tailored for commercial clients.</p>
              </div>
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
                      <div className="service-detail__map-preview" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1rem' }}>
                        <img src={`${import.meta.env.BASE_URL}services_thumbnail_usa.png`} alt="USA Active Routes HUD" style={{ width: '100%', height: 'auto', display: 'block' }} />
                      </div>
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
            <div className="section-cta-box" style={{ marginTop: '3rem', textAlign: 'center' }}>
              <button className="btn btn--secondary" onClick={() => launchDemoState('driver_marketplace')}>
                Launch Live Driver Dispatch Console Demo
              </button>
            </div>
          </div>
        </section>


        <section id="technology" className="section tech-section">
          <div className="container">
            <div className="section-banner-header" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}tech_header.png)` }}>
              <div className="section-banner-header__overlay"></div>
              <div className="section-banner-header__content">
                <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="HCGA Trading LLC Logo" className="section-banner-header__logo" />
                <h2 className="section-title">Intelligent Fleet Control</h2>
                <p className="section-subtitle">HCGA FleetOS gives you total operational visibility and control. Our custom-built technology stack ensures safety, efficiency, and compliance.</p>
              </div>
            </div>

            <div className="tech-container">
              <div className="tech-content">

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
              <button className="btn btn--secondary" style={{ marginTop: '2rem' }} onClick={() => launchDemoState('driver_transit')}>
                Launch Live Route Simulator Demo
              </button>
            </div>

            <div className="tech-visual">
              <div className="dashboard-mockup" style={{ padding: '0', display: 'block', height: 'auto', aspectRatio: '16/10' }}>
                <img src={`${import.meta.env.BASE_URL}tech_thumbnail.png`} alt="HCGA FleetOS Client Dashboard Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

        <section id="safety" className="section safety-section">
          <div className="container">
            <div className="section-banner-header" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}safety_header.png)` }}>
              <div className="section-banner-header__overlay"></div>
              <div className="section-banner-header__content">
                <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="HCGA Trading LLC Logo" className="section-banner-header__logo" />
                <h2 className="section-title">Safety & Compliance</h2>
                <p className="section-subtitle">A culture of safety built into every route, backed by digital records and constant monitoring.</p>
              </div>
            </div>            <div className={selectedSafetyId ? "" : "safety-container-layout"}>
              {selectedSafetyId ? (
                (() => {
                  const item = SAFETY_DATA.find(x => x.id === selectedSafetyId);
                  return (
                    <div className="safety-detail-card" style={{ flex: 1, padding: '2.5rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <div className="safety-icon" style={{ margin: 0, width: '48px', height: '48px', backgroundColor: 'rgba(153, 0, 0, 0.1)', color: 'var(--color-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.icon}
                          </div>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{item.title}</h3>
                          <button className="btn btn--secondary btn--sm" onClick={() => setSelectedSafetyId(null)} style={{ marginLeft: '1rem', padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}>
                            Return
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginBottom: '2rem', lineHeight: '1.6' }}>{item.desc}</p>
                          <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)' }}>Key Features & Compliance Standards</h4>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {item.bullets.map((bullet, idx) => (
                              <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.95rem' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span style={{ color: 'var(--color-text-secondary)' }}>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{ width: '100%', maxWidth: '480px', aspectRatio: '16/10', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                            <img src={`${import.meta.env.BASE_URL}${item.image}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '2.5rem', paddingTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button className="btn btn--primary" onClick={() => { launchDemoState(item.ctaState); setSelectedSafetyId(null); }}>
                          {item.ctaText}
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <>
                  <div className="safety-grid">
                    {SAFETY_DATA.map((item) => (
                      <div
                        key={item.id}
                        className="safety-item"
                        onClick={() => {
                          setSelectedSafetyId(item.id);
                          document.querySelector('#safety').scrollIntoView({ block: 'start', behavior: 'smooth' });
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="safety-icon">
                          {item.icon}
                        </div>
                        <h4>{item.title}</h4>
                      </div>
                    ))}
                  </div>

                  <div className="safety-visual">
                    <div className="dashboard-mockup" style={{ padding: '0', display: 'block', height: 'auto', aspectRatio: '16/10' }}>
                      <img src={`${import.meta.env.BASE_URL}safety_thumbnail.png`} alt="HCGA FleetOS Compliance Console Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  </div>
                </>
              )}
            </div>
            {!selectedSafetyId && (
              <div className="section-cta-box" style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button className="btn btn--secondary" onClick={() => launchDemoState('driver_compliant')}>
                  Launch Safety Compliance Console Demo
                </button>
              </div>
            )}
          </div>
        </section>

        <section id="client-portal" className="section portal-section">
          <div className="container">
            <div className="section-banner-header" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}portal_header.png)` }}>
              <div className="section-banner-header__overlay"></div>
              <div className="section-banner-header__content">
                <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="HCGA Trading LLC Logo" className="section-banner-header__logo" />
                <h2 className="section-title">Client Portal</h2>
                <p className="section-subtitle">Access your dedicated fleet dashboard. Monitor live routes, download delivery proofs, and analyze performance data.</p>
              </div>
            </div>

            <div className="portal-container">
              <div className="portal-content">

              <form className="portal-form" onSubmit={handleClientLogin}>
                <div className="form-group">
                  <label htmlFor="email">Work Email</label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="name@company.com"
                    value={clientWorkEmail}
                    onChange={(e) => setClientWorkEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                    required
                  />
                </div>
                {clientLoginError && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                    {clientLoginError}
                  </div>
                )}
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
                <button className="btn btn--secondary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => launchDemoState('client_dashboard')}>
                  Instant Client HUD Demo
                </button>
              </div>
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

      {showDevNotice && (
        <div className="dev-modal-overlay" onClick={() => setShowDevNotice(false)}>
          <div className="dev-modal" role="dialog" aria-modal="true" aria-labelledby="dev-modal-title" onClick={(e) => e.stopPropagation()}>
            <button className="dev-modal-close" onClick={() => setShowDevNotice(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="dev-modal-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3 id="dev-modal-title">Feature Coming Soon</h3>
            <p>This section is still under development. We're working on it and it will be available soon — thanks for your patience.</p>
            <button className="btn btn--primary" onClick={() => setShowDevNotice(false)}>Got it</button>
          </div>
        </div>
      )}

      {showDriverLoginModal && (
        <div className="dev-modal-overlay" onClick={() => setShowDriverLoginModal(false)}>
          <div className="dev-modal" role="dialog" aria-modal="true" aria-labelledby="driver-modal-title" onClick={(e) => e.stopPropagation()}>
            <button className="dev-modal-close" onClick={() => setShowDriverLoginModal(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="dev-modal-icon" style={{ color: 'var(--color-accent)', backgroundColor: 'rgba(153, 0, 0, 0.1)' }}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            </div>
            <h3 id="driver-modal-title" style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Driver Portal Login</h3>
            
            <form onSubmit={handleDriverLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
              <div className="form-group">
                <label htmlFor="driver-id" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Driver ID</label>
                <input
                  type="text"
                  id="driver-id"
                  className="form-input"
                  placeholder="e.g. carlos"
                  value={driverUsername}
                  onChange={(e) => setDriverUsername(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="driver-pin" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>PIN / Password</label>
                <input
                  type="password"
                  id="driver-pin"
                  className="form-input"
                  placeholder="e.g. 1042"
                  value={driverPin}
                  onChange={(e) => setDriverPin(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>
              {loginError && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: '600' }}>
                  {loginError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn--primary" style={{ flex: 1 }}>Sign In</button>
                <button
                  type="button"
                  className="btn btn--outline"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setDriverUsername('carlos');
                    setDriverPin('1042');
                    setIsDriverLoggedIn(true);
                    setShowDriverLoginModal(false);
                    setShowDriverDashboard(true);
                  }}
                >
                  Demo Bypass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Interactive Demo Controller */}
      <div className="demo-controller">
        <div className="demo-controller__header">
          <span>Demo Controller</span>
          <button className="demo-controller__toggle" onClick={() => setIsDemoPanelOpen(!isDemoPanelOpen)}>
            {isDemoPanelOpen ? 'Collapse' : 'Interactive Demo Links'}
          </button>
        </div>
        {isDemoPanelOpen && (
          <div className="demo-controller__body">
            <button className="demo-controller__btn" onClick={() => { setShowDriverDashboard(false); setShowClientDashboard(false); }}>
              Back to Landing Page
            </button>
            
            <div className="demo-controller__section-title">Driver Console States</div>
            <button className="demo-controller__btn" onClick={() => launchDemoState('driver_marketplace')}>
              1. Available Loads
            </button>
            <button className="demo-controller__btn" onClick={() => launchDemoState('driver_pretrip')}>
              2. DVIR (Uncompliant)
            </button>
            <button className="demo-controller__btn" onClick={() => launchDemoState('driver_compliant')}>
              3. DVIR (Compliant)
            </button>
            <button className="demo-controller__btn" onClick={() => launchDemoState('driver_transit')}>
              4. In Transit (50%)
            </button>
            <button className="demo-controller__btn" onClick={() => launchDemoState('driver_arrived')}>
              5. Arrived (100%)
            </button>
            
            <div className="demo-controller__section-title">Client Console States</div>
            <button className="demo-controller__btn demo-controller__btn--client" onClick={() => launchDemoState('client_dashboard')}>
              Client Portal HUD
            </button>
          </div>
        )}
      </div>

    </>
  );
}

export default App;
