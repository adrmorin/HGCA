import React, { useState, useRef, useEffect } from 'react';
import './index.css';
import mobileVideo from './assets/video/mobile-hero-video.mp4';
import TruckBackground from './TruckBackground.jsx';

// Data functions for bilingual support
const getServicesData = (lang) => {
  const isEs = lang === 'es';
  return [
    {
      id: 'dedicated-routes',
      title: isEs ? 'Rutas Dedicadas' : 'Dedicated Routes',
      subtitle: isEs
        ? 'Capacidad garantizada y niveles de servicio consistentes para sus corredores habituales.'
        : 'Reliable capacity and guaranteed service levels for your consistent lanes.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      ),
      description: isEs ? [
        'HCGA Trading LLC ofrece soluciones de flota dedicada diseñadas a la medida para empresas que requieren corredores de alto volumen constante.',
        'Asignamos camiones, conductores y equipos exclusivamente a su operación, garantizando capacidad y tiempos de tránsito predecibles incluso durante picos del mercado.',
        'Nuestros servicios dedicados se integran sin problemas en su cadena de suministro, permitiendo protocolos de entrega personalizados y capacitación de conductores específica para sus cargas.'
      ] : [
        'HCGA Trading LLC provides custom-tailored dedicated fleet solutions for businesses requiring consistent, high-volume shipping corridors.',
        'We commit trucks, drivers, and equipment exclusively to your operation, guaranteeing capacity and predictable transit times even during peak market surges.',
        'Our dedicated services integrate seamlessly with your supply chain, allowing for custom delivery protocols, pre-scheduled pickup times, and specialized driver training specific to your freight.'
      ],
      features: isEs ? [
        'Garantía del 100% de capacidad para corredores programados',
        'Responsabilidad de fuente única con conductores dedicados',
        'Protocolos de carga personalizados e integración en patio',
        'Informes de rendimiento semanales y mensuales estructurados'
      ] : [
        '100% capacity guarantees for scheduled lanes',
        'Single-source accountability with dedicated driver pools',
        'Custom loading protocols & yard management integration',
        'Structured weekly and monthly performance reports'
      ],
      kpis: isEs ? [
        { label: 'Puntualidad en Entregas', value: '99.8%' },
        { label: 'Unidades Dedicadas', value: '150+' },
        { label: 'Retención de Conductores', value: '85%' }
      ] : [
        { label: 'On-Time Performance', value: '99.8%' },
        { label: 'Dedicated Assets', value: '150+' },
        { label: 'Driver Retention', value: '85%' }
      ]
    },
    {
      id: 'contract-transportation',
      title: isEs ? 'Transporte por Contrato' : 'Contract Transportation',
      subtitle: isEs
        ? 'Alianza a largo plazo con tarifas acordadas y equipo comprometido.'
        : 'Long-term partnership with agreed-upon rates and committed equipment.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      ),
      description: isEs ? [
        'Asegure sus costos de transporte y flujo logístico con nuestros servicios flexibles por contrato.',
        'Trabajamos estrechamente con su equipo para establecer tarifas fijas y equipo preasignado, mitigando la volatilidad del mercado spot.',
        'Nuestras alianzas a largo plazo se basan en el cumplimiento de Acuerdos de Nivel de Servicio (SLA) y transparencia en reportes digitales.'
      ] : [
        'Secure your transportation costs and logistics pipeline with our flexible contract services.',
        'We work closely with your logistics team to establish fixed-rate lanes and pre-allocated equipment, mitigating spot-market volatility and protecting your bottom line.',
        'Our long-term partnerships are built on service-level agreement (SLA) adherence, digital reporting transparency, and mutual operational integration.'
      ],
      features: isEs ? [
        'Estabilidad de tarifas multianual y presupuesto predecible',
        'Asignación de equipos comprometidos (Caja Seca, Refrigerados, Box Trucks)',
        'Acuerdos de Nivel de Servicio (SLA) personalizados',
        'Integración EDI completa y comunicación estandarizada'
      ] : [
        'Multi-year rate stability & predictable budgeting',
        'Committed equipment allocations (dry van, flatbed, etc.)',
        'Tailored Service Level Agreements (SLAs)',
        'Full EDI integration & standardized communication'
      ],
      kpis: isEs ? [
        { label: 'Predicción de Tarifas', value: '100%' },
        { label: 'Cumplimiento de Contrato', value: '99.9%' },
        { label: 'Alianza Promedio', value: '5+ Años' }
      ] : [
        { label: 'Rate Predictability', value: '100%' },
        { label: 'Contract Compliance', value: '99.9%' },
        { label: 'Avg Partnership', value: '5+ Yrs' }
      ]
    },
    {
      id: 'facility-to-facility',
      title: isEs ? 'Transferencia entre Instalaciones' : 'Facility-to-Facility',
      subtitle: isEs
        ? 'Movimiento eficiente de mercancías entre almacenes, centros de distribución o nodos.'
        : 'Efficient movement of goods between warehouses, hubs, or distribution centers.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
      ),
      description: isEs ? [
        'Mueva eficientemente materias primas, productos en proceso o mercancías terminadas entre sus centros logísticos.',
        'Nuestro sistema de logística cerrada garantiza una utilización óptima de camiones y tiempos de respuesta veloces.',
        'Ofrecemos servicios de lanzadera (shuttle) de alta frecuencia adaptados a las capacidades dinámicas de sus almacenes.'
      ] : [
        'Efficiently move raw materials, work-in-progress inventory, or finished goods between manufacturing hubs, warehouses, and distribution centers.',
        'Our close-loop logistics system ensures optimal truck utilization and fast turnaround times, preventing facility bottlenecks and supply chain idle times.',
        'We run high-frequency, timed shuttle services configured to your dynamic warehouse capacities.'
      ],
      features: isEs ? [
        'Programas de remolques con enganche y desenganche rápido (drop-and-hook)',
        'Flujo de inventario Just-in-Time (JIT)',
        'Alertas de llegada y salida mediante geocercas en tiempo real',
        'Sincronización integrada con gestión de patios'
      ] : [
        'Pre-scheduled drop-and-hook trailer programs',
        'Just-in-time (JIT) inventory movement flow',
        'Live geofenced arrival & departure alerts',
        'Integrated yard-management synchronization'
      ],
      kpis: isEs ? [
        { label: 'Tiempo de Rotación', value: '<30m' },
        { label: 'Precisión Geocerca', value: '99.9%' },
        { label: 'Capacidad Diaria', value: '10k+ T' }
      ] : [
        { label: 'Avg Turnaround', value: '<30m' },
        { label: 'Geofence Accuracy', value: '99.9%' },
        { label: 'Daily Capacity', value: '10k+ T' }
      ]
    },
    {
      id: 'final-mile-delivery',
      title: isEs ? 'Entrega de Última Milla' : 'Final-Mile Delivery',
      subtitle: isEs
        ? 'Transporte profesional en el tramo final hacia tiendas de conveniencia o clientes finales.'
        : 'Professional last-leg transportation to retail or end-customer destinations.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      ),
      description: isEs ? [
        'Entregue sus productos directamente a tiendas minoristas, nodos comerciales o usuarios finales con nuestro servicio profesional.',
        'Priorizamos la puntualidad, la seguridad de la carga y el profesionalismo del conductor para representar adecuadamente su marca.',
        'Nuestro sistema de despacho ofrece ventanas horarias estrictas, asegurando que los receptores estén preparados.'
      ] : [
        'Deliver your products directly to retail storefronts, commercial distribution nodes, or end-users with our professional final-mile transport.',
        'We prioritize timeliness, product safety, and driver professionalism to represent your brand perfectly at delivery.',
        'Our dispatch system offers tight scheduling windows, ensuring your recipients are prepared for arrival and minimizing detention times.'
      ],
      features: isEs ? [
        'Equipos con rampa hidráulica (liftgate) y entrega interior',
        'Firma digital en tiempo real y prueba fotográfica de entrega (POD)',
        'Programación con ventanas horarias precisas (<1h)',
        'Conductores capacitados en representación corporativa'
      ] : [
        'Specialized liftgate equipment & inside delivery',
        'Real-time digital signature & photo proof of delivery',
        'Tight delivery window scheduling (<1h precision)',
        'Drivers trained in professional client representation'
      ],
      kpis: isEs ? [
        { label: 'Precisión de Ventana', value: '98.6%' },
        { label: 'Envío de POD Digital', value: 'Instantáneo' },
        { label: 'Calificación Cliente', value: '4.9/5' }
      ] : [
        { label: 'Window Accuracy', value: '98.6%' },
        { label: 'Digital POD Delivery', value: 'Instant' },
        { label: 'Customer Rating', value: '4.9/5' }
      ]
    },
    {
      id: 'multi-stop-routes',
      title: isEs ? 'Rutas Multiparada' : 'Multi-Stop Routes',
      subtitle: isEs
        ? 'Enrutamiento optimizado para múltiples entregas con secuencia asistida por IA.'
        : 'Optimized routing for multiple drop-offs with AI-assisted sequencing.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
      ),
      description: isEs ? [
        'Maximice la eficiencia en rutas de entrega con múltiples paradas utilizando nuestros algoritmos de secuenciación de última generación.',
        'Nuestro software analiza restricciones geográficas, tráfico y ventanas de entrega para reducir millas vacías y consumo de combustible.',
        'Ideal para distribuidores regionales que buscan consolidar entregas en despachos únicos de alta eficiencia.'
      ] : [
        'Maximize transit efficiency on multi-stop delivery routes using our state-of-the-art route sequencing algorithms.',
        'Our software analyzes geographic constraints, traffic patterns, and delivery windows to sequence drop-offs perfectly, minimizing fuel consumption and transit time.',
        'This service is ideal for regional distributors looking to bundle multiple deliveries into single, high-efficiency dispatches.'
      ],
      features: isEs ? [
        'Secuenciación dinámica de rutas y despacho optimizado',
        'Consolidación de carga multiparada con restricciones de peso',
        'Ajustes de ruta en tiempo real para evitar congestiones',
        'Notificaciones automáticas al cliente cuando se aproxima el camión'
      ] : [
        'Dynamic route sequencing & dispatch overlay',
        'Multi-stop load building with weight constraints',
        'Real-time routing adjustments for traffic bypass',
        'Automated customer alerts as driver approaches'
      ],
      kpis: isEs ? [
        { label: 'Eficiencia de Ruta', value: '+22%' },
        { label: 'Reducción Millas Vacías', value: '35%' },
        { label: 'Paradas por Ruta', value: '5-12' }
      ] : [
        { label: 'Route Efficiency', value: '+22%' },
        { label: 'Empty Miles Cut', value: '35%' },
        { label: 'Stops per Route', value: '5-12' }
      ]
    },
    {
      id: 'equipment-repositioning',
      title: isEs ? 'Reposicionamiento de Equipos' : 'Equipment Repositioning',
      subtitle: isEs
        ? 'Movimiento estratégico de sus activos y remolques hacia donde más se necesitan.'
        : 'Strategic movement of your assets and trailers to where they are needed most.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 12l-4-4-4 4M12 8v8"></path></svg>
      ),
      description: isEs ? [
        'Asegúrese de que sus remolques, contenedores y cajas estén en el lugar correcto en el momento adecuado.',
        'Nos especializamos en el reposicionamiento veloz de activos a través de regiones para eliminar la escasez de equipos durante picos de demanda.',
        'Proporcionamos operaciones ágiles de remolque de un solo sentido (one-way tow-away).'
      ] : [
        'Ensure your trailers, containers, and dry vans are in the right place at the right time.',
        'We specialize in rapid asset repositioning across regions to eliminate equipment shortages, prepare for peak loads, or relocate idle equipment.',
        'Whether you are an intermodal carrier balancing containers or a retailer moving seasonal assets, we provide swift one-way tow-away operations.'
      ],
      features: isEs ? [
        'Reposicionamiento de contenedores vacíos para operadores intermodales',
        'Servicios de remolque de remolques de un solo sentido (tow-away)',
        'Reubicación de activos previa a temporadas de alta demanda',
        'Rastreo Satelital completo de activos del cliente en tránsito'
      ] : [
        'Empty container repositioning for intermodal carriers',
        'One-way trailer tow-away services',
        'High-velocity asset shifts ahead of season demands',
        'Full tracking of customer-owned assets in transit'
      ],
      kpis: isEs ? [
        { label: 'Ganancia en Uso de Activos', value: '+18%' },
        { label: 'Tiempo de Reposición', value: '<48h' },
        { label: 'Rastreo de Activos', value: '100%' }
      ] : [
        { label: 'Asset Util Gain', value: '+18%' },
        { label: 'Repositioning Time', value: '<48h' },
        { label: 'Asset Tracking', value: '100%' }
      ]
    },
    {
      id: 'seasonal-capacity',
      title: isEs ? 'Capacidad Estacional' : 'Seasonal Capacity',
      subtitle: isEs
        ? 'Escalabilidad flexible de flota para manejar sus picos de volumen en temporada alta.'
        : 'Flexible fleet scaling to handle your peak season volume surges.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
      ),
      description: isEs ? [
        'Maneje picos de fin de año, temporadas de cosecha o cierres de trimestre sin estrés operativo.',
        'El programa de flota escalable de HCGA ofrece capacidad de sobrecarga precomprometida para mantener su flujo constante.',
        'Planificamos con meses de anticipación junto con nuestros socios comerciales.'
      ] : [
        'Handle your holiday rushes, harvest seasons, or end-of-quarter volume surges without operational stress.',
        'HCGA\'s scalable fleet program provides pre-committed surge capacity, ensuring your shipping pipeline stays completely fluid when demand peaks.',
        'We work months in advance with our partners to design custom seasonal playbooks.'
      ],
      features: isEs ? [
        'Asignación precomprometida de capacidad estacional',
        'Incorporación rápida de remolques especializados para picos',
        'Equipo dedicado de planificación de despacho y respuesta a picos',
        'Auditoría diaria del rendimiento y corrección de rutas'
      ] : [
        'Pre-committed seasonal capacity allocations',
        'Rapid onboarding of specialized trailers for peaks',
        'Dedicated surge support & dispatch planning teams',
        'Daily performance auditing & path corrections'
      ],
      kpis: isEs ? [
        { label: 'Escalabilidad en Picos', value: '250%' },
        { label: 'Activación de Sobrecarga', value: '<24h' },
        { label: 'Puntualidad en Picos', value: '99.2%' }
      ] : [
        { label: 'Peak Scalability', value: '250%' },
        { label: 'Surge Activation', value: '<24h' },
        { label: 'On-Time Surge', value: '99.2%' }
      ]
    },
    {
      id: 'overflow-transportation',
      title: isEs ? 'Transporte de Sobrecarga (Overflow)' : 'Overflow Transportation',
      subtitle: isEs
        ? 'Capacidad a demanda cuando su flota interna o contratada alcanza el límite.'
        : 'On-demand truck capacity when your internal fleet is fully utilized.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
      ),
      description: isEs ? [
        'No rechace envíos ni arriesgue retrasos en la producción. Cuando sus transportistas primarios se saturante, el servicio de sobrecarga de HCGA interviene de inmediato.',
        'Manejamos los volúmenes excedentes con los mismos altos estándares de calidad, cumplimiento y rastreo en tiempo real.',
        'Nuestro equipo está disponible 24/7/365 para atender cualquier urgencia.'
      ] : [
        'Never turn down a shipment or risk production delays. When your private fleet or primary contract carriers hit capacity limits, HCGA\'s overflow service steps in.',
        'We handle spillover volumes with the same high standards, compliance, and real-time tracking as our dedicated runs.',
        'Our team is on standby 24/7/365 to catch unexpected lane overloads.'
      ],
      features: isEs ? [
        'Tiempos de respuesta ultrarrápidos para volúmenes inesperados',
        'Integración fluida en su sistema TMS actual',
        'Grupo de conductores en reserva para despacho inmediato',
        'Tarifas flexibles para volúmenes de excedente'
      ] : [
        'Rapid response times for unexpected lane volume',
        'Seamless integration into your current TMS system',
        'Dedicated standby driver pool for rapid dispatch',
        'Flexible overflow volume pricing'
      ],
      kpis: isEs ? [
        { label: 'Tiempo de Reserva', value: '<15m' },
        { label: 'Respuesta de Despacho', value: '<2h' },
        { label: 'Disponibilidad', value: '24/7' }
      ] : [
        { label: 'Booking Time', value: '<15m' },
        { label: 'Dispatch Lead', value: '<2h' },
        { label: 'Standby Coverage', value: '24/7' }
      ]
    },
    {
      id: 'u-box-storage-transport',
      title: isEs ? 'Transporte U-Box y Almacenamiento' : 'U-Box Storage Transport',
      subtitle: isEs
        ? 'Especialización logística para contenedores de almacenamiento portátil y unidades U-Box.'
        : 'Specialized readiness for portable storage and U-Box container logistics.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
      ),
      description: isEs ? [
        'HCGA Trading LLC es un proveedor de primer nivel en la logística y reubicación de contenedores de almacenamiento portátil, incluyendo unidades U-Box.',
        'Nuestros conductores están capacitados en los protocolos de sujeción, límites de peso y configuraciones de remolque requeridos.',
        'Garantizamos un transporte seguro con baja vibración, asegurando que las pertenencias permanezcan impecables.'
      ] : [
        'HCGA Trading LLC is a premier provider of logistics and relocation services for portable storage containers, including U-Box units.',
        'Our drivers are fully trained in the specific securement, weight limits, and towing configurations required to move residential and commercial storage pods.',
        'We guarantee safe, vibration-minimized transport, ensuring your customers\' contents remain in pristine condition throughout the journey.'
      ],
      features: isEs ? [
        'Remolques personalizados optimizados para múltiples contenedores de almacenamiento',
        'Protocolos de sujeción rígidos multipunto para la carga',
        'Transporte coordinado entre centros de almacenamiento y depósitos',
        'Configuración de transporte con amortiguación de vibraciones'
      ] : [
        'Custom trailers optimized for multiple storage containers',
        'Rigid multi-point cargo securement protocols',
        'Coordinated transport between storage hubs & depots',
        'Vibration-damping transport configuration'
      ],
      kpis: isEs ? [
        { label: 'Daño a la Carga', value: '0.001%' },
        { label: 'Unidades Especializadas', value: '80+' },
        { label: 'Movimientos Mensuales', value: '5,000+' }
      ] : [
        { label: 'Cargo Damage', value: '0.001%' },
        { label: 'Specialized Units', value: '80+' },
        { label: 'Monthly moves', value: '5,000+' }
      ]
    }
  ];
};

const getSafetyData = (lang) => {
  const isEs = lang === 'es';
  return [
    {
      id: 'driver-qualification',
      title: isEs ? 'Calificación de Conductores' : 'Driver Qualification',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
      ),
      desc: isEs
        ? "Proceso de selección riguroso para todos los operadores, incluyendo verificación de antecedentes, pruebas en carretera y capacitación continua."
        : "Rigorous vetting process for all operators including background checks, road testing, and ongoing safety training.",
      bullets: isEs ? [
        "Verificación y seguimiento de licencias CDL Clase A",
        "Historial de conducción limpio (MVR) actualizado trimestralmente",
        "Exámenes médicos periódicos y auditorías de cumplimiento DOT",
        "Módulos prácticos de conducción defensiva"
      ] : [
        "CDL Class A license verification and tracking",
        "Clean driving records (MVR checks) updated quarterly",
        "Regular medical exams and DOT card compliance audits",
        "Hands-on defensive driver training modules"
      ],
      ctaText: isEs ? "Abrir Consola de Conductores" : "Launch Driver Console",
      ctaState: "driver_marketplace",
      image: "safety_driver_qual.png"
    },
    {
      id: 'vehicle-inspections',
      title: isEs ? 'Inspecciones Vehiculares (DVIR)' : 'Vehicle Inspections',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      ),
      desc: isEs
        ? "Inspecciones continuas previas y posteriores al viaje impulsadas por FleetOS para garantizar el estado óptimo de la flota."
        : "Continuous pre-trip and post-trip inspections powered by FleetOS to guarantee vehicle readiness and prevent en-route failures.",
      bullets: isEs ? [
        "Walk-around digital DVIR obligatorio para todos los conductores",
        "Reporte de defectos en tiempo real directo a talleres de mantenimiento",
        "Registros electrónicos instantáneos enviados a despacho de cumplimiento",
        "Lista de validación de frenos, presión de neumáticos e iluminación"
      ] : [
        "Mandatory digital DVIR walk-arounds for all drivers",
        "Real-time defect reporting directly to maintenance shops",
        "Instant electronic logs sent to compliance dispatch",
        "Brake, tire pressure, and lighting validation checklists"
      ],
      ctaText: isEs ? "Probar Simulador de Cumplimiento" : "Launch Compliance Simulator",
      ctaState: "driver_pretrip",
      image: "safety_vehicle_insp.png"
    },
    {
      id: 'preventive-maintenance',
      title: isEs ? 'Mantenimiento Preventivo' : 'Preventive Maintenance',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
      ),
      desc: isEs
        ? "Programas de mantenimiento basados en millas recorridas, horas de motor y diagnóstico de telemetría proactiva."
        : "Scheduled maintenance programs based on real-time mileage tracking, engine hours, and proactive telemetry diagnostics.",
      bullets: isEs ? [
        "Alertas de programación de Servicio A, Servicio B y Servicio C",
        "Técnicos certificados en diésel realizando revisiones de 120 puntos",
        "Pedido automatizado de repuestos para minimizar inactividad",
        "Análisis predictivo de desgaste e índice de rotación de neumáticos"
      ] : [
        "A-service, B-service, and C-service scheduling alerts",
        "Certified diesel technicians performing 120-point checks",
        "Automated parts ordering and fleet downtime reduction",
        "Tire rotation and wear-index predictive analytics"
      ],
      ctaText: isEs ? "Ver Mantenimiento en Consola" : "Launch Compliance Simulator",
      ctaState: "driver_compliant",
      image: "safety_prev_maint.png"
    },
    {
      id: 'gps-monitoring',
      title: isEs ? 'Monitoreo GPS Continuo' : 'GPS Monitoring',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      ),
      desc: isEs
        ? "Seguimiento satelital y geocercas para garantizar la seguridad de la carga, rutas optimizadas y respuesta rápida ante imprevistos."
        : "Continuous satellite tracking and geofencing to ensure cargo safety, optimized routing, and immediate hazard response.",
      bullets: isEs ? [
        "Rastreo en tiempo real a intervalos de 10 segundos",
        "Notificaciones de terminal por geocerca para registro automático",
        "Calculadora de rutas alternativas por tráfico o clima",
        "Retroalimentación telemática de velocidad y frenado brusco"
      ] : [
        "Real-time breadcrumb tracking at 10-second intervals",
        "Geofenced terminal notifications for automatic check-in",
        "Traffic and weather-delay alternate route calculator",
        "Driver speeding and harsh-braking telemetry feedback"
      ],
      ctaText: isEs ? "Probar Simulador de Ruta Satelital" : "Launch Route Simulator",
      ctaState: "driver_transit",
      image: "safety_gps_monitor.png"
    },
    {
      id: 'digital-compliance',
      title: isEs ? 'Cumplimiento Digital ELD' : 'Digital Compliance',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      ),
      desc: isEs
        ? "Registros 100% digitales de bitácoras ELD, horas de servicio (HOS) y credenciales de conductor almacenados en FleetOS."
        : "100% digital records of ELD logs, hours of service (HOS), and driver credentials stored securely in FleetOS database.",
      bullets: isEs ? [
        "Integración de dispositivo de registro electrónico ELD bajo normas FMCSA",
        "Alertas de ciclo de Horas de Servicio (HOS) y reloj de conducción",
        "Envío instantáneo de informes de inspección en carretera",
        "Archivo de documentos digitales preparado para auditorías"
      ] : [
        "ELD electronic logging device integration per FMCSA rules",
        "Hours of Service (HOS) cycle alerts and clock monitoring",
        "Instant roadside inspection report sharing",
        "Digital document archive for historical audit readiness"
      ],
      ctaText: isEs ? "Consola de Seguridad" : "Launch Safety Console",
      ctaState: "driver_compliant",
      image: "safety_digi_compliance.png"
    },
    {
      id: 'incident-reporting',
      title: isEs ? 'Reporte de Incidentes' : 'Incident Reporting',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      ),
      desc: isEs
        ? "Formularios digitales ágiles para reportar incidentes en carretera, notificación de seguros y reenrutamiento de despacho."
        : "Streamlined digital intake forms for rapid roadside incident reporting, insurance notification, and dispatch re-routing.",
      bullets: isEs ? [
        "Formulario móvil de incidentes con utilidad de carga de fotos",
        "Notificaciones instantáneas enviadas a gerentes de seguridad y clientes",
        "Integración con despacho de asistencia en carretera",
        "Análisis de causa raíz (RCA) y registro de auditoría"
      ] : [
        "Mobile incident intake form with photo upload utility",
        "Instant notifications sent to safety managers and clients",
        "Roadside assistance dispatch integration",
        "Root cause analysis (RCA) auditing and compliance logging"
      ],
      ctaText: isEs ? "Consola de Seguridad" : "Launch Safety Console",
      ctaState: "driver_compliant",
      image: "safety_inc_reporting.png"
    },
    {
      id: 'insurance-compliance',
      title: isEs ? 'Cobertura de Seguro' : 'Insurance Compliance',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      ),
      desc: isEs
        ? "Cobertura integral de seguro de responsabilidad civil y carga activa, con intercambio de certificados para clientes corporativos."
        : "Comprehensive active liability and cargo insurance coverage, with digital certificate sharing for enterprise logistics clients.",
      bullets: isEs ? [
        "Límites de $5,000,000 USD en responsabilidad automotriz y $500,000 USD en carga",
        "Solicitud instantánea de Certificados de Seguro (COI) digitales",
        "Respaldado por aseguradoras de Calificación A",
        "Cumplimiento de fianzas de corretaje e intercambio de remolques"
      ] : [
        "$5,000,000 auto liability and $500,000 cargo coverage limits",
        "Instant digital certificate of insurance (COI) requests",
        "A-rated carrier backing and zero-gap risk management",
        "Brokerage bond and trailer interchange compliance"
      ],
      ctaText: isEs ? "Ver HUD del Cliente" : "Instant Client HUD Demo",
      ctaState: "client_dashboard",
      image: "safety_ins_compliance.png"
    },
    {
      id: 'dot-readiness',
      title: isEs ? 'Preparación DOT / FMCSA' : 'DOT Readiness',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      ),
      desc: isEs
        ? "Perfil de cumplimiento FMCSA impecable con excelentes índices de seguridad y paquetes de documentación inmediata."
        : "Flawless FMCSA compliance profile with top-tier safety scores and instant documentation packages.",
      bullets: isEs ? [
        "Registro DOT activo y verificación de autoridad comercial",
        "Calificación de seguridad satisfactoria en auditorías oficiales DOT",
        "Revisiones de cumplimiento del Registro Unificado de Transportistas (UCR)",
        "Permisos estatales e interestatales activos (IFTA, HUT, límites de peso)"
      ] : [
        "Clean DOT registration and active authority verification",
        "Satisfactory safety ratings from official DOT audits",
        "Unified carrier registration (UCR) compliance checks",
        "Intrastate and interstate permits active (IFTA, HUT, weight)"
      ],
      ctaText: isEs ? "Ver HUD del Cliente" : "Instant Client HUD Demo",
      ctaState: "client_dashboard",
      image: "safety_dot_readiness.png"
    }
  ];
};

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('hcga_lang') || 'es');
  const [showContent, setShowContent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('hcga_theme') || 'dark'
  );
  const [showDevNotice, setShowDevNotice] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedSafetyId, setSelectedSafetyId] = useState(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const videoRef = useRef(null);
  const servicesRef = useRef(null);

  const openDevNotice = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsMobileMenuOpen(false);
    setShowDevNotice(true);
  };

  // Helper for quick string translations
  const t = (esStr, enStr) => (lang === 'es' ? esStr : enStr);

  useEffect(() => {
    localStorage.setItem('hcga_lang', lang);
  }, [lang]);

  // Dynamic datasets based on language
  const SERVICES_DATA = getServicesData(lang);
  const SAFETY_DATA = getSafetyData(lang);

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
  const [driverNavSection, setDriverNavSection] = useState('loads'); // 'loads' | 'dispatch' | 'safety' | 'earnings'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const launchDemoState = (state) => {
    setShowDriverDashboard(false);
    setShowClientDashboard(false);
    setIsDriverLoggedIn(false);
    setIsClientLoggedIn(false);
    setSelectedServiceId(null);
    setSelectedSafetyId(null);

    if (state === 'driver_marketplace') {
      setIsDriverLoggedIn(true);
      setActiveLoad(null);
      setDriverNavSection('loads');
      setShowDriverDashboard(true);
    } else if (state === 'driver_pretrip') {
      setIsDriverLoggedIn(true);
      setActiveLoad(loadsList[0]);
      setDvisChecked({ tires: false, lights: false, brakes: false, coupling: false });
      setLoadProgress(0);
      setDriverNavSection('safety');
      setShowDriverDashboard(true);
    } else if (state === 'driver_compliant') {
      setIsDriverLoggedIn(true);
      setActiveLoad(loadsList[0]);
      setDvisChecked({ tires: true, lights: true, brakes: true, coupling: true });
      setLoadProgress(0);
      setDriverNavSection('safety');
      setShowDriverDashboard(true);
    } else if (state === 'driver_transit') {
      setIsDriverLoggedIn(true);
      setActiveLoad(loadsList[0]);
      setDvisChecked({ tires: true, lights: true, brakes: true, coupling: true });
      setLoadProgress(50);
      setDriverNavSection('dispatch');
      setShowDriverDashboard(true);
    } else if (state === 'driver_arrived') {
      setIsDriverLoggedIn(true);
      setActiveLoad(loadsList[0]);
      setDvisChecked({ tires: true, lights: true, brakes: true, coupling: true });
      setLoadProgress(100);
      setDriverNavSection('dispatch');
      setShowDriverDashboard(true);
    } else if (state === 'client_dashboard') {
      setIsClientLoggedIn(true);
      setClientActiveTab('overview');
      setShowClientDashboard(true);
    } else if (state === 'client_loadboards') {
      setIsClientLoggedIn(true);
      setClientActiveTab('loadboards');
      setShowClientDashboard(true);
    } else if (state === 'client_vetting') {
      setIsClientLoggedIn(true);
      setClientActiveTab('vetting');
      setShowClientDashboard(true);
    } else if (state === 'client_spotrates') {
      setIsClientLoggedIn(true);
      setClientActiveTab('spotrates');
      setShowClientDashboard(true);
    } else if (state === 'client_apilogs') {
      setIsClientLoggedIn(true);
      setClientActiveTab('apilogs');
      setShowClientDashboard(true);
    }
  };

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

  // Load Board & Carrier Vetting Integration States
  const [clientActiveTab, setClientActiveTab] = useState('overview'); // 'overview' | 'loadboards' | 'vetting' | 'spotrates' | 'apilogs'
  const [syndicationPlatforms, setSyndicationPlatforms] = useState({
    datOne: true,
    truckstop: true,
    loadboard123: true,
    truckSmarter: false
  });

  const [syndicatedLoadsList, setSyndicatedLoadsList] = useState([
    {
      id: 'LDB-9941',
      origin: 'Chicago, IL (60601)',
      dest: 'Dallas, TX (75201)',
      vehicle: '53ft Semi Truck',
      equipment: 'Reefer (-10°F)',
      weight: '42,000 lbs',
      targetRate: 2850,
      postedDate: '2026-09-12 10:15 AM',
      datId: 'DAT-884920',
      truckstopId: 'TS-304918',
      loadboard123Id: '123-77402',
      bidsReceived: 4,
      status: 'Syndicated & Active',
      topCarrier: 'Swift Freight Inc. (MC #984012)'
    },
    {
      id: 'LDB-8832',
      origin: 'Atlanta, GA (30301)',
      dest: 'Miami, FL (33101)',
      vehicle: '26ft Box Truck',
      equipment: 'Dry Van w/ Liftgate',
      weight: '18,500 lbs',
      targetRate: 1950,
      postedDate: '2026-09-12 09:30 AM',
      datId: 'DAT-771029',
      truckstopId: 'TS-291048',
      loadboard123Id: '123-66291',
      bidsReceived: 2,
      status: 'Syndicated & Active',
      topCarrier: 'Sunstate Logistics (MC #448920)'
    },
    {
      id: 'LDB-7719',
      origin: 'Seattle, WA (98101)',
      dest: 'Denver, CO (80201)',
      vehicle: 'Cargo Van',
      equipment: 'High Roof Van',
      weight: '3,200 lbs',
      targetRate: 1100,
      postedDate: '2026-09-11 04:45 PM',
      datId: 'DAT-663910',
      truckstopId: 'TS-182940',
      loadboard123Id: '123-55910',
      bidsReceived: 5,
      status: 'Assigned (Auto-Delisted)',
      topCarrier: 'Pacific Express (MC #820194)'
    }
  ]);

  const [mcInput, setMcInput] = useState('984012');
  const [isVettingLoading, setIsVettingLoading] = useState(false);
  const [vettingResult, setVettingResult] = useState({
    mcNumber: '984012',
    dotNumber: '3892019',
    legalName: 'Swift Freight Logistics LLC',
    dbaName: 'Swift Trans USA',
    fmcsaStatus: 'ACTIVE - Satisfactory Rating',
    authorityDate: '2019-04-12',
    autoLiability: '$1,000,000 USD (Progressive Casualty)',
    cargoInsurance: '$100,000 USD (Great American Ins)',
    safetyScore: '98/100 (Zero BASIC Violations)',
    telemetryStatus: 'Samsara / Geotab Integration Ready',
    overallStatus: 'APPROVED'
  });

  const [spotOriginZip, setSpotOriginZip] = useState('60601');
  const [spotDestZip, setSpotDestZip] = useState('75201');
  const [spotEquipment, setSpotEquipment] = useState('53ft Semi Truck');
  const [spotResult, setSpotResult] = useState({
    originCity: 'Chicago, IL (60601)',
    destCity: 'Dallas, TX (75201)',
    miles: 960,
    contractAvgRate: 2.45,
    contractTotal: 2352,
    spotAvgRate: 2.85,
    spotTotal: 2736,
    spotRangeLow: 2.60,
    spotRangeHigh: 3.10,
    demandIndex: 'HIGH (14.2 loads per truck ratio)',
    datOneConfidence: '99.4% (Based on DAT Freight & Analytics index)'
  });

  const [apiLogs, setApiLogs] = useState([
    { time: '11:40:02 AM', event: 'POST_LOAD_DAT', endpoint: 'POST /v1/loads/syndicate', status: 201, payload: 'DAT-884920 Created successfully' },
    { time: '11:40:03 AM', event: 'POST_LOAD_TRUCKSTOP', endpoint: 'POST /v2/partner/postings', status: 201, payload: 'TS-304918 Created successfully' },
    { time: '11:41:15 AM', event: 'CARRIER_VET_REQ', endpoint: 'GET /v1/fmcsa/authority?mc=984012', status: 200, payload: 'MC# 984012 ACTIVE | Ins: $1M Liability PASS' },
    { time: '11:41:20 AM', event: 'WEBHOOK_CARRIER_BID', endpoint: 'WEBHOOK /bids/incoming', status: 200, payload: 'Bid received: $2,850 from Swift Freight LLC' }
  ]);

  const [newLoadForm, setNewLoadForm] = useState({
    origin: 'Houston, TX (77001)',
    dest: 'Atlanta, GA (30301)',
    vehicle: '53ft Semi Truck',
    equipment: 'Dry Van',
    weight: '36,000 lbs',
    targetRate: 2200
  });
  const [showPostLoadModal, setShowPostLoadModal] = useState(false);

  const handleToggleSyndication = (platform) => {
    setSyndicationPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
    const newLog = {
      time: new Date().toLocaleTimeString(),
      event: `CONFIG_${platform.toUpperCase()}`,
      endpoint: `PATCH /v1/settings/syndication`,
      status: 200,
      payload: `${platform} syndication set to ${!syndicationPlatforms[platform] ? 'ENABLED' : 'DISABLED'}`
    };
    setApiLogs(prev => [newLog, ...prev]);
  };

  const handlePostNewLoad = (e) => {
    e.preventDefault();
    const newId = `LDB-${Math.floor(1000 + Math.random() * 9000)}`;
    const datId = `DAT-${Math.floor(100000 + Math.random() * 900000)}`;
    const tsId = `TS-${Math.floor(100000 + Math.random() * 900000)}`;
    const lb123Id = `123-${Math.floor(100000 + Math.random() * 900000)}`;

    const newLoad = {
      id: newId,
      origin: newLoadForm.origin,
      dest: newLoadForm.dest,
      vehicle: newLoadForm.vehicle,
      equipment: newLoadForm.equipment,
      weight: newLoadForm.weight,
      targetRate: Number(newLoadForm.targetRate),
      postedDate: new Date().toLocaleString(),
      datId: datId,
      truckstopId: tsId,
      loadboard123Id: lb123Id,
      bidsReceived: 0,
      status: 'Syndicated & Active',
      topCarrier: 'Pending Bids'
    };

    setSyndicatedLoadsList(prev => [newLoad, ...prev]);
    setShowPostLoadModal(false);

    const now = new Date().toLocaleTimeString();
    setApiLogs(prev => [
      { time: now, event: 'POST_LOAD_DAT', endpoint: 'POST https://api.dat.com/v1/loads', status: 201, payload: `${datId} Published to DAT One Broker` },
      { time: now, event: 'POST_LOAD_TRUCKSTOP', endpoint: 'POST https://api.truckstop.com/v2/loads', status: 201, payload: `${tsId} Published to Truckstop BookItNow` },
      { time: now, event: 'POST_LOAD_123', endpoint: 'POST https://api.123loadboard.com/v1/posts', status: 201, payload: `${lb123Id} Published to 123Loadboard` },
      ...prev
    ]);
  };

  const handleRunCarrierVetting = (e) => {
    e.preventDefault();
    setIsVettingLoading(true);

    const now = new Date().toLocaleTimeString();
    setApiLogs(prev => [
      { time: now, event: 'CARRIER_VET_REQ', endpoint: `GET /v1/fmcsa/authority?mc=${mcInput}`, status: 200, payload: `Querying FMCSA & Truckstop CarrierVetting API for MC #${mcInput}...` },
      ...prev
    ]);

    setTimeout(() => {
      setIsVettingLoading(false);
      if (mcInput === '999999' || mcInput === '000000') {
        setVettingResult({
          mcNumber: mcInput,
          dotNumber: '1029384',
          legalName: 'Risky Haulers Express LLC',
          dbaName: 'Unverified Logistics',
          fmcsaStatus: 'SUSPENDED - Policy Inactive',
          authorityDate: '2024-01-10',
          autoLiability: 'EXPIRED (01/2026)',
          cargoInsurance: 'NOT FOUND',
          safetyScore: '42/100 (High Risk Warnings)',
          telemetryStatus: 'No Active Telemetry Device',
          overallStatus: 'REJECTED'
        });
      } else {
        setVettingResult({
          mcNumber: mcInput,
          dotNumber: `3${Math.floor(100000 + Math.random() * 900000)}`,
          legalName: `Carrier ${mcInput} Logistics Inc`,
          dbaName: `Freight Express #${mcInput.slice(0, 3)}`,
          fmcsaStatus: 'ACTIVE - Satisfactory Rating',
          authorityDate: '2018-06-15',
          autoLiability: '$1,000,000 USD (Progressive / Travelers)',
          cargoInsurance: '$100,000 USD (Great American Ins)',
          safetyScore: '96/100 (Zero BASIC Violations)',
          telemetryStatus: 'Samsara / Geotab Integration Connected',
          overallStatus: 'APPROVED'
        });
      }

      setApiLogs(prev => [
        { time: new Date().toLocaleTimeString(), event: 'CARRIER_VET_RESP', endpoint: `RESP /v1/fmcsa/authority`, status: 200, payload: `Vetting Complete for MC #${mcInput}. Rating: PASS` },
        ...prev
      ]);
    }, 800);
  };

  const handleCalculateSpotRate = (e) => {
    e.preventDefault();
    const miles = Math.floor(400 + Math.random() * 800);
    const spotPerMile = spotEquipment.includes('53') ? 2.85 : spotEquipment.includes('26') ? 2.20 : 1.65;
    const contractPerMile = spotPerMile * 0.85;

    setSpotResult({
      originCity: `Zip ${spotOriginZip}`,
      destCity: `Zip ${spotDestZip}`,
      miles: miles,
      contractAvgRate: Number(contractPerMile.toFixed(2)),
      contractTotal: Math.round(miles * contractPerMile),
      spotAvgRate: Number(spotPerMile.toFixed(2)),
      spotTotal: Math.round(miles * spotPerMile),
      spotRangeLow: Number((spotPerMile * 0.92).toFixed(2)),
      spotRangeHigh: Number((spotPerMile * 1.15).toFixed(2)),
      demandIndex: 'HIGH (14.2 loads per truck ratio in region)',
      datOneConfidence: '99.4% (Based on DAT Freight & Analytics index)'
    });
  };

  const handleAutoDelistLoad = (loadId) => {
    setSyndicatedLoadsList(prev => prev.map(item => {
      if (item.id === loadId) {
        return { ...item, status: 'Assigned (Auto-Delisted)' };
      }
      return item;
    }));

    const now = new Date().toLocaleTimeString();
    setApiLogs(prev => [
      { time: now, event: 'DELETE_DAT_LOAD', endpoint: `DELETE https://api.dat.com/v1/loads/${loadId}`, status: 200, payload: `Removed load ${loadId} from DAT One` },
      { time: now, event: 'DELETE_TRUCKSTOP_LOAD', endpoint: `DELETE https://api.truckstop.com/v2/loads/${loadId}`, status: 200, payload: `Removed load ${loadId} from Truckstop` },
      { time: now, event: 'DELETE_123_LOAD', endpoint: `DELETE https://api.123loadboard.com/v1/posts/${loadId}`, status: 200, payload: `Removed load ${loadId} from 123Loadboard` },
      ...prev
    ]);
  };

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
      setLoginError(t('ID de conductor o PIN inválido. Use carlos / 1042 o acceso Demo.', 'Invalid Driver ID or PIN. Use carlos / 1042 or Demo Bypass.'));
    }
  };

  const handleClientLogin = (e) => {
    e.preventDefault();
    if (clientWorkEmail.length > 3 && clientPassword.length >= 4) {
      setIsClientLoggedIn(true);
      setShowClientDashboard(true);
      setClientLoginError('');
    } else {
      setClientLoginError(t('Por favor ingrese un correo corporativo válido y contraseña.', 'Please enter a valid work email and password.'));
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hcga_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (showDriverDashboard) window.scrollTo(0, 0);
  }, [showDriverDashboard]);

  useEffect(() => {
    if (showClientDashboard) window.scrollTo(0, 0);
  }, [showClientDashboard]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const toggleLang = () => {
    setLang((prevLang) => (prevLang === 'es' ? 'en' : 'es'));
  };

  // Scroll-reveal via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [showDriverDashboard, showClientDashboard, selectedServiceId, selectedSafetyId]);

  const togglePlayStop = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        if (videoRef.current.ended || (videoRef.current.duration && videoRef.current.currentTime >= videoRef.current.duration - 0.3)) {
          videoRef.current.currentTime = 0;
        }
        videoRef.current.play().catch(err => console.log("Play failed:", err));
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {
        videoRef.current.muted = true;
        setIsMuted(true);
        videoRef.current.play().catch(e => console.log("Muted autoplay fallback:", e));
      });
    }
  }, []);

  // Floating demo controller (shared by landing + both dashboards).
  // Animated dropdown that collapses automatically after a selection,
  // on outside click or on Escape.
  const demoControllerRef = useRef(null);

  useEffect(() => {
    if (!isDemoPanelOpen) return;
    const handlePointer = (e) => {
      if (demoControllerRef.current && !demoControllerRef.current.contains(e.target)) setIsDemoPanelOpen(false);
    };
    const handleKey = (e) => { if (e.key === 'Escape') setIsDemoPanelOpen(false); };
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isDemoPanelOpen]);

  const DEMO_DRIVER_STATES = [
    ['driver_marketplace', '1. Available Loads'],
    ['driver_pretrip', '2. DVIR (Uncompliant)'],
    ['driver_compliant', '3. DVIR (Compliant)'],
    ['driver_transit', '4. In Transit (50%)'],
    ['driver_arrived', '5. Arrived (100%)'],
  ];
  const DEMO_CLIENT_STATES = [
    ['client_dashboard', '1. Client Overview HUD'],
    ['client_loadboards', '2. Load Boards Hub (DAT/Truckstop)'],
    ['client_vetting', '3. Carrier Vetting (MC Check)'],
    ['client_spotrates', '4. DAT Spot Rate Benchmark'],
    ['client_apilogs', '5. API Gateway Logs'],
  ];

  const renderDemoController = () => {
    let itemIndex = 0;
    const selectAndCollapse = (action) => () => { setIsDemoPanelOpen(false); action(); };
    const item = (label, action, className = '') => (
      <button
        key={label}
        className={`demo-controller__btn ${className}`}
        style={{ '--i': itemIndex++ }}
        onClick={selectAndCollapse(action)}
      >
        {label}
      </button>
    );

    return (
      <div ref={demoControllerRef} className={`demo-controller ${isDemoPanelOpen ? 'demo-controller--open' : ''}`}>
        <div className="demo-controller__header">
          <span>Demo Controller</span>
          <button
            className="demo-controller__toggle"
            onClick={() => setIsDemoPanelOpen(!isDemoPanelOpen)}
            aria-expanded={isDemoPanelOpen}
            aria-controls="demo-controller-panel"
          >
            {isDemoPanelOpen ? t('Plegar', 'Collapse') : t('Demostración Interactiva', 'Interactive Demo Links')}
            <svg className="demo-controller__chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 9 18 15"></polyline></svg>
          </button>
        </div>
        <div id="demo-controller-panel" className="demo-controller__panel" inert={!isDemoPanelOpen}>
          <div className="demo-controller__body">
            {item(`🏠 ${t('Volver al Inicio', 'Back to Landing Page')}`, () => { setShowDriverDashboard(false); setShowClientDashboard(false); })}
            <div className="demo-controller__section-title">Driver Console States</div>
            {DEMO_DRIVER_STATES.map(([state, label]) => item(label, () => launchDemoState(state)))}
            <div className="demo-controller__section-title">Client &amp; Brokerage States</div>
            {DEMO_CLIENT_STATES.map(([state, label]) => item(label, () => launchDemoState(state), 'demo-controller__btn--client'))}
          </div>
        </div>
      </div>
    );
  };

  // Language switch component helper for headers
  const renderLangSwitcher = () => (
    <button
      className="lang-toggle-btn"
      onClick={toggleLang}
      aria-label={t('Cambiar a Inglés', 'Switch to Spanish')}
      title={t('Cambiar idioma', 'Switch language')}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
      <span>{lang === 'es' ? 'ES' : 'EN'}</span>
    </button>
  );

  if (showDriverDashboard) {
    const allDvisChecked = Object.values(dvisChecked).every(v => v);
    const driverEarnings = loadsList.length > 0 ? loadsList.reduce((acc, l) => acc + l.rate, 0) : 0;

    return (
      <>
        <TruckBackground variant="dark" />
        <div className="fos-layout">
          {/* ============ SIDEBAR ============ */}
          <aside className={`fos-sidebar ${isSidebarOpen ? 'fos-sidebar--open' : ''}`}>
            <div className="fos-sidebar__header">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="HCGA Trading LLC" className="fos-sidebar__logo" />
              <span className="fos-sidebar__badge">FleetOS</span>
              <button className="fos-sidebar__close" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="fos-sidebar__profile">
              <div className="fos-sidebar__avatar">
                <span>CM</span>
                <span className="fos-sidebar__avatar-status"></span>
              </div>
              <div className="fos-sidebar__profile-info">
                <strong>Carlos Mendoza</strong>
                <span>CDL Class A · #1042</span>
              </div>
            </div>

            <div className="fos-sidebar__eld-block">
              <div className="fos-sidebar__eld-row">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#10b981" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span className="fos-sidebar__eld-label">{t('Reloj ELD', 'ELD Clock')}</span>
                <span className="fos-sidebar__eld-value" style={{ color: '#10b981' }}>08h 45m</span>
              </div>
              <div className="fos-sidebar__eld-row">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#a5b4fc" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>
                <span className="fos-sidebar__eld-label">{t('Ciclo HOS', 'HOS Cycle')}</span>
                <span className="fos-sidebar__eld-value">{t('En Regla', 'Compliant')}</span>
              </div>
              <div className="fos-sidebar__eld-row">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#a5b4fc" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                <span className="fos-sidebar__eld-label">{t('Tractor', 'Tractor')}</span>
                <span className="fos-sidebar__eld-value">#1042 · 53' Reefer</span>
              </div>
            </div>

            <nav className="fos-sidebar__nav">
              <button
                className={`fos-sidebar__nav-item ${driverNavSection === 'loads' ? 'fos-sidebar__nav-item--active' : ''}`}
                onClick={() => { setDriverNavSection('loads'); setIsSidebarOpen(false); }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                <span>{t('Bolsa de Cargas', 'Load Board')}</span>
                {!activeLoad && loadsList.length > 0 && <span className="fos-sidebar__nav-badge">{loadsList.length}</span>}
              </button>
              <button
                className={`fos-sidebar__nav-item ${driverNavSection === 'dispatch' ? 'fos-sidebar__nav-item--active' : ''}`}
                onClick={() => { setDriverNavSection('dispatch'); setIsSidebarOpen(false); }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>{t('Despacho Activo', 'Active Dispatch')}</span>
                {activeLoad && <span className="fos-sidebar__nav-badge fos-sidebar__nav-badge--live">LIVE</span>}
              </button>
              <button
                className={`fos-sidebar__nav-item ${driverNavSection === 'safety' ? 'fos-sidebar__nav-item--active' : ''}`}
                onClick={() => { setDriverNavSection('safety'); setIsSidebarOpen(false); }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>{t('Seguridad DVIR', 'DVIR Safety')}</span>
                {activeLoad && !allDvisChecked && <span className="fos-sidebar__nav-badge fos-sidebar__nav-badge--warn">!</span>}
              </button>
              <button
                className={`fos-sidebar__nav-item ${driverNavSection === 'earnings' ? 'fos-sidebar__nav-item--active' : ''}`}
                onClick={() => { setDriverNavSection('earnings'); setIsSidebarOpen(false); }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <span>{t('Ganancias', 'Earnings')}</span>
              </button>
            </nav>

            <div className="fos-sidebar__footer">
              <button
                className="fos-sidebar__footer-btn"
                onClick={() => {
                  setShowDriverDashboard(false);
                  setTimeout(() => {
                    const el = document.querySelector('#safety');
                    if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
                  }, 250);
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                {t('Volver al Sitio Web', 'Back to Website')}
              </button>
              <button
                className="fos-sidebar__footer-btn fos-sidebar__footer-btn--signout"
                onClick={() => {
                  setIsDriverLoggedIn(false);
                  setShowDriverDashboard(false);
                  setActiveLoad(null);
                  setLoadProgress(0);
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                {t('Cerrar Sesión', 'Sign Out')}
              </button>
            </div>
          </aside>

          {isSidebarOpen && (
            <div className="fos-sidebar__overlay" onClick={() => setIsSidebarOpen(false)} />
          )}

          <main className="fos-main">
            <header className="fos-topbar">
              <div className="fos-topbar__left">
                <button className="fos-topbar__hamburger" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div>
                  <h1 className="fos-topbar__title">
                    {driverNavSection === 'loads' && t('Cargas Disponibles', 'Available Loads')}
                    {driverNavSection === 'dispatch' && t('Despacho Activo', 'Active Dispatch')}
                    {driverNavSection === 'safety' && t('Inspección DVIR', 'DVIR Safety Check')}
                    {driverNavSection === 'earnings' && t('Resumen de Ganancias', 'Earnings Overview')}
                  </h1>
                  <p className="fos-topbar__subtitle">FleetOS Driver Console · {t('Sesión', 'Session')}: Carlos Mendoza</p>
                </div>
              </div>
              <div className="fos-topbar__right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {renderLangSwitcher()}
                <button className="theme-toggle-btn" onClick={toggleTheme} title={t('Cambiar Tema', 'Toggle Theme')}>
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <div className="fos-topbar__status-pill">
                  <span className="fos-topbar__status-dot"></span>
                  ELD Online
                </div>
              </div>
            </header>

            {/* KPI Cards Row */}
            <section className="fos-kpis">
              <div className="fos-kpi-card">
                <div className="fos-kpi-card__icon fos-kpi-card__icon--red">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                </div>
                <div>
                  <span className="fos-kpi-card__label">{t('Viajes Completados', 'Trips Completed')}</span>
                  <strong className="fos-kpi-card__value">{driverStats.tripsCompleted}</strong>
                </div>
                <div className="fos-kpi-card__trend fos-kpi-card__trend--up">+3 {t('esta semana', 'this week')}</div>
              </div>

              <div className="fos-kpi-card">
                <div className="fos-kpi-card__icon fos-kpi-card__icon--green">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <span className="fos-kpi-card__label">{t('Millas Recorridas', 'Miles Logged')}</span>
                  <strong className="fos-kpi-card__value">{driverStats.milesDriven.toLocaleString()}</strong>
                </div>
                <div className="fos-kpi-card__trend fos-kpi-card__trend--up">+960 mi {t('hoy', 'today')}</div>
              </div>

              <div className="fos-kpi-card">
                <div className="fos-kpi-card__icon fos-kpi-card__icon--yellow">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div>
                  <span className="fos-kpi-card__label">{t('Score Seguridad', 'Safety Score')}</span>
                  <strong className="fos-kpi-card__value" style={{ color: '#10b981' }}>{driverStats.safetyScore}%</strong>
                </div>
                <div className="fos-kpi-card__trend fos-kpi-card__trend--up">{t('Top 5% flota', 'Top 5% fleet')}</div>
              </div>

              <div className="fos-kpi-card">
                <div className="fos-kpi-card__icon fos-kpi-card__icon--blue">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div>
                  <span className="fos-kpi-card__label">{t('Pago Pendiente', 'Pending Payout')}</span>
                  <strong className="fos-kpi-card__value">${driverEarnings.toLocaleString()}</strong>
                </div>
                <div className="fos-kpi-card__trend">3 {t('cargas en cola', 'loads queued')}</div>
              </div>
            </section>

            {/* LOAD BOARD SECTION */}
            {driverNavSection === 'loads' && (
              <section className="fos-section">
                <div className="fos-section__header">
                  <h2 className="fos-section__title">{t('Ofertas de Despacho Disponibles', 'Available Dispatch Offers')}</h2>
                  <p className="fos-section__desc">{t('Seleccione y acepte una carga para asignar capacidad al Tractor #1042. Una sola ruta activa a la vez.', 'Select and accept a load to allocate Tractor #1042 capacity. Only one active route at a time.')}</p>
                </div>

                {loadsList.length === 0 ? (
                  <div className="fos-empty-state">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                    <p>{t('No hay cargas disponibles. Todas las rutas comerciales han sido despachadas.', 'No loads available. All commercial routes have been dispatched.')}</p>
                  </div>
                ) : (
                  <div className="fos-load-grid">
                    {loadsList.map((load) => (
                      <div key={load.id} className="fos-load-card">
                        <div className="fos-load-card__header">
                          <span className="fos-load-card__id">#{load.id}</span>
                          <span className="fos-load-card__type">{load.type}</span>
                        </div>
                        <div className="fos-load-card__route">
                          <div className="fos-load-card__city">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#10b981" strokeWidth="2"><circle cx="12" cy="10" r="3"></circle><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path></svg>
                            <span>{load.origin}</span>
                          </div>
                          <div className="fos-load-card__route-line">
                            <span className="fos-load-card__dist">{load.dist} mi</span>
                          </div>
                          <div className="fos-load-card__city">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--fos-accent)" strokeWidth="2"><circle cx="12" cy="10" r="3"></circle><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path></svg>
                            <span>{load.dest}</span>
                          </div>
                        </div>
                        <div className="fos-load-card__details">
                          <span>
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                            {load.vehicle}
                          </span>
                        </div>
                        <div className="fos-load-card__footer">
                          <div className="fos-load-card__rate">${load.rate.toLocaleString()} <small>USD</small></div>
                          <button
                            className="fos-btn fos-btn--primary"
                            onClick={() => {
                              setActiveLoad(load);
                              setLoadProgress(0);
                              setDvisChecked({ tires: false, lights: false, brakes: false, coupling: false });
                              setDriverNavSection('dispatch');
                            }}
                          >
                            {t('Aceptar Carga', 'Accept Load')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ACTIVE DISPATCH SECTION */}
            {driverNavSection === 'dispatch' && (
              <section className="fos-section">
                {!activeLoad ? (
                  <div className="fos-empty-state">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <p>{t('Sin despacho activo. Acepte una carga de la bolsa para comenzar.', 'No active dispatch. Accept a load from the Load Board to begin.')}</p>
                    <button className="fos-btn fos-btn--primary" onClick={() => setDriverNavSection('loads')}>{t('Ver Cargas Disponibles', 'View Available Loads')}</button>
                  </div>
                ) : (
                  <div className="fos-dispatch-grid">
                    <div className="fos-dispatch-card fos-dispatch-card--route">
                      <div className="fos-dispatch-card__header">
                        <span className="fos-dispatch-card__label">{t('Despacho de Ruta Activa', 'Active Route Dispatch')}</span>
                        <span className={`fos-status-pill ${
                          loadProgress === 0 ? 'fos-status-pill--pending' :
                          loadProgress === 100 ? 'fos-status-pill--arrived' : 'fos-status-pill--transit'
                        }`}>
                          {loadProgress === 0 ? t('Asignado', 'Assigned') : loadProgress === 100 ? t('✓ Llegó a Destino', '✓ Arrived') : t('⚡ En Tránsito', '⚡ En Route')}
                        </span>
                      </div>
                      <h3 className="fos-dispatch-card__load-id">{t('Carga', 'Load')} #{activeLoad.id}</h3>

                      <div className="fos-route-vis">
                        <div className="fos-route-vis__node fos-route-vis__node--origin">
                          <div className="fos-route-vis__dot"></div>
                          <div>
                            <span className="fos-route-vis__label">{t('Origen', 'Origin')}</span>
                            <strong className="fos-route-vis__city">{activeLoad.origin}</strong>
                          </div>
                        </div>
                        <div className="fos-route-vis__line">
                          <div className="fos-route-vis__truck" style={{ left: `${loadProgress}%` }}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--fos-accent)" stroke="none"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                          </div>
                          <div className="fos-route-vis__progress" style={{ width: `${loadProgress}%` }}></div>
                        </div>
                        <div className="fos-route-vis__node fos-route-vis__node--dest">
                          <div className="fos-route-vis__dot fos-route-vis__dot--dest"></div>
                          <div>
                            <span className="fos-route-vis__label">{t('Destino', 'Destination')}</span>
                            <strong className="fos-route-vis__city">{activeLoad.dest}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="fos-route-details">
                        <div className="fos-route-detail-item">
                          <span>{t('Distancia', 'Distance')}</span><strong>{activeLoad.dist} miles</strong>
                        </div>
                        <div className="fos-route-detail-item">
                          <span>{t('Vehículo', 'Vehicle')}</span><strong>{activeLoad.vehicle}</strong>
                        </div>
                        <div className="fos-route-detail-item">
                          <span>{t('Equipo', 'Equipment')}</span><strong>{activeLoad.type}</strong>
                        </div>
                        <div className="fos-route-detail-item">
                          <span>{t('Pago', 'Payout')}</span><strong style={{ color: 'var(--fos-accent)' }}>${activeLoad.rate.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="fos-dispatch-card fos-dispatch-card--telemetry">
                      <div className="fos-telemetry-header">
                        <span>FLEETOS TELEMETRY v4.1</span>
                        <span className={loadProgress === 100 ? 'fos-telemetry-status fos-telemetry-status--ok' : 'fos-telemetry-status fos-telemetry-status--active'}>
                          ● {loadProgress === 0 ? t('PENDIENTE SALIDA', 'PENDING DEPARTURE') : loadProgress === 100 ? t('LLEGÓ A DESTINO', 'ARRIVED') : t('TRÁNSITO ACTIVO', 'TRANSIT ACTIVE')}
                        </span>
                      </div>

                      <div className="fos-telemetry-banner">
                        <img src={`${import.meta.env.BASE_URL}driver_control_panel.png`} alt="Control Panel" />
                      </div>

                      <div className="fos-telemetry-progress">
                        <div className="fos-telemetry-progress__header">
                          <span>{t('Progreso de Ruta', 'Route Progress')}</span><span>{loadProgress}%</span>
                        </div>
                        <div className="fos-telemetry-progress__bar">
                          <div className="fos-telemetry-progress__fill" style={{ width: `${loadProgress}%` }}></div>
                        </div>
                      </div>

                      <div className="fos-telemetry-logs">
                        <div>[18:03] {t('Carga', 'Load')} #{activeLoad.id} {t('aceptada por Carlos Mendoza.', 'accepted by Carlos Mendoza.')}</div>
                        {allDvisChecked && <div style={{ color: '#10b981' }}>[18:03] {t('Inspección DVIR aprobada. Pre-trip completo.', 'DVIR compliance pass. Pre-trip complete.')}</div>}
                        {loadProgress > 0 && <div>[18:04] {t('Motor enlazado. Velocidad: 62 MPH · Odómetro: 142,380 mi.', 'Engine linked. Speed: 62 MPH · Odometer: 142,380 mi.')}</div>}
                        {loadProgress >= 50 && <div>[18:32] {t('Punto GPS: Mitad de ruta · Temp carga: 36°F (Normal).', 'GPS checkpoint: Mid-route · Cargo temp: 36°F (Normal).')}</div>}
                        {loadProgress === 100 && <div style={{ color: '#10b981' }}>[18:55] {t('✓ Geocerca de destino cruzada. Ruta completada.', '✓ Destination geo-fence crossed. Route complete.')}</div>}
                      </div>

                      <div className="fos-telemetry-controls">
                        {!allDvisChecked ? (
                          <div className="fos-telemetry-alert">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            {t('Complete la inspección DVIR para habilitar el viaje.', 'Complete DVIR inspection to unlock dispatch.')}
                            <button className="fos-btn fos-btn--ghost" onClick={() => setDriverNavSection('safety')}>{t('Ir a Inspección →', 'Go to Safety Check →')}</button>
                          </div>
                        ) : loadProgress < 100 ? (
                          <button className="fos-btn fos-btn--primary fos-btn--full" onClick={() => setLoadProgress(prev => Math.min(prev + 50, 100))}>
                            {loadProgress === 0 ? t('🚚 Iniciar Ruta / Salir del Hub', '🚚 Start Route / Leave Hub') : t('⚡ Simular 500 Millas de Progreso', '⚡ Simulate 500 Miles Progress')}
                          </button>
                        ) : (
                          <button
                            className="fos-btn fos-btn--success fos-btn--full"
                            onClick={() => {
                              setDriverStats(p => ({ ...p, tripsCompleted: p.tripsCompleted + 1, milesDriven: p.milesDriven + activeLoad.dist }));
                              setLoadsList(prev => prev.filter(l => l.id !== activeLoad.id));
                              setActiveLoad(null);
                              setLoadProgress(0);
                              setDvisChecked({ tires: false, lights: false, brakes: false, coupling: false });
                              setDriverNavSection('loads');
                            }}
                          >
                            {t('✓ Finalizar Entrega y Desbloquear Siguiente Carga', '✓ Complete Delivery & Unlock Next Dispatch')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* DVIR SAFETY SECTION */}
            {driverNavSection === 'safety' && (
              <section className="fos-section">
                <div className="fos-section__header">
                  <h2 className="fos-section__title">{t('Inspección Mecánica Pre-Trip (DVIR)', 'Pre-Trip DVIR Compliance')}</h2>
                  <p className="fos-section__desc">{t('Las regulaciones federales HOS exigen una inspección completa antes de iniciar el viaje.', 'Federal HOS regulations require a full mechanical walk-around before starting transit. All items must be verified.')}</p>
                </div>

                {!activeLoad && (
                  <div className="fos-info-banner">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {t('Sin carga activa. Acepte una carga para iniciar la lista de comprobación DVIR.', 'No active load. Accept a load first to begin the DVIR checklist.')}
                  </div>
                )}

                <div className="fos-dvir-grid">
                  {[
                    { key: 'tires', label: t('Neumáticos y Banda de Rodamiento', 'Tires & Tread Checked'), desc: t('Presión PSI en regla · Sin daños visibles', 'PSI compliant · No visible damage'), icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z' },
                    { key: 'lights', label: t('Luces de Freno y Direccionales', 'Brake & Turn Signal Lights'), desc: t('Todas las luces operativas · Verificado', 'All signals operational · Verified'), icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
                    { key: 'brakes', label: t('Líneas de Aire y Frenos de Servicio', 'Air Lines & Service Brakes'), desc: t('Presión dentro de rango · Balatas OK', 'Air pressure within range · Pads OK'), icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
                    { key: 'coupling', label: t('Conexión Quinta Rueda', 'Fifth-Wheel Connection'), desc: t('Perno rey bloqueado y asegurado', 'Kingpin locked securely · Pin verified'), icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
                  ].map(({ key, label, desc, icon }) => (
                    <label
                      key={key}
                      className={`fos-dvir-item ${
                        dvisChecked[key] ? 'fos-dvir-item--checked' : ''
                      } ${loadProgress > 0 ? 'fos-dvir-item--locked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={dvisChecked[key]}
                        disabled={loadProgress > 0 || !activeLoad}
                        onChange={() => setDvisChecked(p => ({ ...p, [key]: !p[key] }))}
                        className="fos-dvir-item__checkbox"
                      />
                      <div className="fos-dvir-item__icon">
                        {dvisChecked[key] ? (
                          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={icon}></path></svg>
                        )}
                      </div>
                      <div className="fos-dvir-item__content">
                        <strong className="fos-dvir-item__label">{label}</strong>
                        <span className="fos-dvir-item__desc">{desc}</span>
                      </div>
                      <div className="fos-dvir-item__status">
                        {dvisChecked[key] ? <span className="fos-badge fos-badge--pass">PASS</span> : <span className="fos-badge fos-badge--pending">PENDING</span>}
                      </div>
                    </label>
                  ))}
                </div>

                {activeLoad && (
                  <div className={`fos-dvir-summary ${
                    allDvisChecked ? 'fos-dvir-summary--pass' : 'fos-dvir-summary--fail'
                  }`}>
                    {allDvisChecked ? (
                      <>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <div>
                          <strong>{t('DVIR Completo — Vehículo Aprobado', 'DVIR Complete — All Systems Go')}</strong>
                          <p>{t('El vehículo está autorizado para iniciar viaje. Proceda al Despacho Activo.', 'Vehicle is cleared for departure. Proceed to Active Dispatch.')}</p>
                        </div>
                        <button className="fos-btn fos-btn--success" onClick={() => setDriverNavSection('dispatch')}>{t('Ir a Despacho →', 'Go to Dispatch →')}</button>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <div>
                          <strong>{t('DVIR Incompleto', 'DVIR Incomplete')}</strong>
                          <p>{Object.values(dvisChecked).filter(Boolean).length} {t('de 4 puntos verificados. Verifique todos para continuar.', 'of 4 items checked. Complete all items to unlock dispatch.')}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* EARNINGS SECTION */}
            {driverNavSection === 'earnings' && (
              <section className="fos-section">
                <div className="fos-section__header">
                  <h2 className="fos-section__title">{t('Resumen de Ganancias', 'Earnings Overview')}</h2>
                  <p className="fos-section__desc">{t('Rendimiento del periodo actual de pago y saldo acumulado.', 'Your current pay period performance and pending payouts.')}</p>
                </div>

                <div className="fos-earnings-grid">
                  <div className="fos-earnings-card fos-earnings-card--highlight">
                    <span className="fos-earnings-card__label">{t('Pago Pendiente', 'Pending Payout')}</span>
                    <strong className="fos-earnings-card__amount">${driverEarnings.toLocaleString()}</strong>
                    <span className="fos-earnings-card__note">{t('De', 'From')} {loadsList.length} {t('cargas en cola', 'queued loads')}</span>
                  </div>
                  <div className="fos-earnings-card">
                    <span className="fos-earnings-card__label">{t('Millas del Periodo', 'Miles This Period')}</span>
                    <strong className="fos-earnings-card__amount">{driverStats.milesDriven.toLocaleString()}</strong>
                    <span className="fos-earnings-card__note">{t('Millas verificadas por ELD', 'Verified ELD miles')}</span>
                  </div>
                  <div className="fos-earnings-card">
                    <span className="fos-earnings-card__label">{t('Tarifa Promedio / Milla', 'Avg Rate Per Mile')}</span>
                    <strong className="fos-earnings-card__amount">$2.85</strong>
                    <span className="fos-earnings-card__note">{t('Sobre promedio de mercado', 'Above market avg')}</span>
                  </div>
                  <div className="fos-earnings-card">
                    <span className="fos-earnings-card__label">{t('Viajes Completados', 'Completed Trips')}</span>
                    <strong className="fos-earnings-card__amount">{driverStats.tripsCompleted}</strong>
                    <span className="fos-earnings-card__note">{t('En este periodo', 'This pay period')}</span>
                  </div>
                </div>

                <div className="fos-earnings-history">
                  <h3 className="fos-earnings-history__title">{t('Rutas Recientes Completadas', 'Recent Completed Routes')}</h3>
                  <div className="fos-earnings-history__list">
                    {[
                      { id: '82941', route: 'Houston, TX → Atlanta, GA', date: 'Sep 8', miles: 790, payout: 2250 },
                      { id: '74920', route: 'Seattle, WA → Salt Lake City, UT', date: 'Sep 5', miles: 820, payout: 2337 },
                      { id: '61038', route: 'Chicago, IL → Nashville, TN', date: 'Sep 2', miles: 470, payout: 1340 },
                    ].map(item => (
                      <div key={item.id} className="fos-earnings-history__item">
                        <div className="fos-earnings-history__icon">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div className="fos-earnings-history__info">
                          <strong>#{item.id}</strong>
                          <span>{item.route}</span>
                        </div>
                        <div className="fos-earnings-history__meta">
                          <span>{item.date}</span>
                          <span>{item.miles} mi</span>
                        </div>
                        <div className="fos-earnings-history__payout">${item.payout.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>

        {/* Floating Demo Controller */}
        {renderDemoController()}
      </>
    );
  }

  if (showClientDashboard) {
    return (
      <>
        <TruckBackground />
        <div className="client-dashboard" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--color-text-primary)' }}>
          <header className="header" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--color-border)' }}>
            <div className="container header__inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="HCGA Trading LLC" style={{ height: '40px' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '800', backgroundColor: '#10b981', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FleetOS Client</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {renderLangSwitcher()}
                <button className="theme-toggle-btn" onClick={toggleTheme} title={t('Cambiar Tema', 'Toggle Theme')}>
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
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
                  {t('Volver a Seguridad', 'Return to Safety')}
                </button>
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => setShowClientDashboard(false)}
                >
                  {t('Salir de Consola', 'Exit Console')}
                </button>
              </div>
            </div>
          </header>

          <div className="container" style={{ flex: 1, padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem', alignItems: 'stretch' }}>
              <div className="dashboard-sidebar" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>{t('Cuenta Activa', 'Active Account')}</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', display: 'block' }}>ACME Logistics Corp</strong>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>#AC-92841</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>{t('Gerente de Cuenta', 'Account Manager')}</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>Sarah Jenkins</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>(800) 555-0192</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>{t('Tasa de Puntualidad', 'On-Time Rate')}</span>
                    <strong style={{ fontSize: '0.95rem', color: '#10b981' }}>99.2% ({t('Excelente', 'Excellent')})</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>{t('Umbral meta: 98.0%', 'Goal threshold: 98.0%')}</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="summary-card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>{t('Despachos Activos', 'Active Dispatches')}</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{clientActiveShipments.length} {t('Rutas', 'Routes')}</strong>
                  </div>
                </div>

                <div className="summary-card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(153,0,0,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>{t('Cargas Sindicadas', 'Syndicated Loads')}</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{syndicatedLoadsList.length} {t('Activas', 'Active')}</strong>
                  </div>
                </div>

                <div className="summary-card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>{t('Índice Tarifa Spot', 'Spot Rate Index')}</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>$2.85 / mi</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="loadboard-tabs">
              <button
                className={`loadboard-tab-btn ${clientActiveTab === 'overview' ? 'loadboard-tab-btn--active' : ''}`}
                onClick={() => setClientActiveTab('overview')}
              >
                📦 {t('Despachos Activos y PODs', 'Active Dispatches & PODs')}
              </button>
              <button
                className={`loadboard-tab-btn ${clientActiveTab === 'loadboards' ? 'loadboard-tab-btn--active' : ''}`}
                onClick={() => setClientActiveTab('loadboards')}
              >
                🚚 {t('Bolsas de Carga (DAT & Truckstop)', 'Load Boards Hub (DAT/Truckstop)')}
              </button>
              <button
                className={`loadboard-tab-btn ${clientActiveTab === 'vetting' ? 'loadboard-tab-btn--active' : ''}`}
                onClick={() => setClientActiveTab('vetting')}
              >
                🛡️ {t('Verificación de Transportistas (MC)', 'Carrier Vetting (MC Check)')}
              </button>
              <button
                className={`loadboard-tab-btn ${clientActiveTab === 'spotrates' ? 'loadboard-tab-btn--active' : ''}`}
                onClick={() => setClientActiveTab('spotrates')}
              >
                📈 {t('Tarifas Spot DAT Benchmark', 'DAT Spot Rates Benchmark')}
              </button>
              <button
                className={`loadboard-tab-btn ${clientActiveTab === 'apilogs' ? 'loadboard-tab-btn--active' : ''}`}
                onClick={() => setClientActiveTab('apilogs')}
              >
                🌐 API Gateway Logs ({apiLogs.length})
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {clientActiveTab === 'overview' && (
              <>
                <div className="active-dispatch-card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{t('Despachos de Carga Activos', 'Active Cargo Dispatches')}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {clientActiveShipments.map((shipment) => (
                      <div key={shipment.id} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--color-accent)' }}>#{shipment.id}</span>
                            <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}>{shipment.status}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            <div>{t('Origen:', 'Origin:')} <strong style={{ color: 'var(--color-text-primary)' }}>{shipment.origin}</strong></div>
                            <div>{t('Destino:', 'Destination:')} <strong style={{ color: 'var(--color-text-primary)' }}>{shipment.dest}</strong></div>
                            <div>{t('Vehículo:', 'Vehicle:')} <strong style={{ color: 'var(--color-text-primary)' }}>{shipment.vehicle}</strong></div>
                            <div>{t('Tractor:', 'Tractor:')} <strong style={{ color: 'var(--color-text-primary)' }}>{shipment.tractor}</strong></div>
                            <div>{t('Temp Reefer:', 'Reefer Temp:')} <strong style={{ color: 'var(--color-text-primary)' }}>{shipment.temp}</strong></div>
                            <div style={{ gridColumn: 'span 2' }}>{t('ETA Restante:', 'ETA Remaining:')} <strong style={{ color: '#10b981' }}>{shipment.eta}</strong></div>
                          </div>
                        </div>
                        <div style={{ flex: '1.5 1 400px', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative' }}>
                          <img src={`${import.meta.env.BASE_URL}driver_control_panel.png`} alt="Transit tracking HUD" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 1rem 0' }}>{t('Entregas Archivadas y Documentos POD', 'Archived Deliveries & PODs')}</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="loads-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: '700' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>{t('ID Envío', 'Shipment ID')}</th>
                          <th style={{ padding: '0.75rem 1rem' }}>{t('Origen y Destino', 'Origin & Destination')}</th>
                          <th style={{ padding: '0.75rem 1rem' }}>{t('Fecha Entrega', 'Delivery Date')}</th>
                          <th style={{ padding: '0.75rem 1rem' }}>{t('Costo Flete', 'Freight Cost')}</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{t('Documentos', 'Documents')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientCompletedShipments.map((shipment) => (
                          <tr key={shipment.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
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
                                    alert(t(`Documento de Prueba de Entrega (POD) descargado con éxito: ${shipment.podName}`, `Successfully downloaded Proof of Delivery document: ${shipment.podName}`));
                                  }, 1500);
                                }}
                                disabled={downloadingPodId === shipment.id}
                              >
                                {downloadingPodId === shipment.id ? t('Descargando...', 'Downloading...') : t('Descargar POD', 'Download POD')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: LOAD BOARDS */}
            {clientActiveTab === 'loadboards' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{t('Sindicación Automática de Cargas (API Gateway)', 'Automated Load Syndication (API Gateway)')}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
                        {t('Configuración de canales externos para publicar automáticamente en bolsas de carga de EE. UU. (53\', 26\' y Cargo Vans).', 'Configuration of external channels to automatically publish across US load boards (53\', 26\' & Cargo Vans).')}
                      </p>
                    </div>
                    <button className="btn btn--primary btn--sm" onClick={() => setShowPostLoadModal(true)}>
                      ➕ {t('Publicar Nueva Carga', 'Post New Load')}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="platform-badge platform-badge--dat">DAT ONE</span>
                        <strong style={{ fontSize: '0.85rem' }}>DAT Freight</strong>
                      </div>
                      <label style={{ cursor: 'pointer' }}>
                        <input type="checkbox" checked={syndicationPlatforms.datOne} onChange={() => handleToggleSyndication('datOne')} />
                      </label>
                    </div>

                    <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="platform-badge platform-badge--truckstop">TRUCKSTOP</span>
                        <strong style={{ fontSize: '0.85rem' }}>Truckstop API</strong>
                      </div>
                      <label style={{ cursor: 'pointer' }}>
                        <input type="checkbox" checked={syndicationPlatforms.truckstop} onChange={() => handleToggleSyndication('truckstop')} />
                      </label>
                    </div>

                    <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="platform-badge platform-badge--123">123LOAD</span>
                        <strong style={{ fontSize: '0.85rem' }}>123Loadboard</strong>
                      </div>
                      <label style={{ cursor: 'pointer' }}>
                        <input type="checkbox" checked={syndicationPlatforms.loadboard123} onChange={() => handleToggleSyndication('loadboard123')} />
                      </label>
                    </div>

                    <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>SMARTER</span>
                        <strong style={{ fontSize: '0.85rem' }}>TruckSmarter</strong>
                      </div>
                      <label style={{ cursor: 'pointer' }}>
                        <input type="checkbox" checked={syndicationPlatforms.truckSmarter} onChange={() => handleToggleSyndication('truckSmarter')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 1rem 0' }}>{t('Cargas Publicadas y Ofertas Activas', 'Published Loads & Active Bids')}</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="loads-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: '700' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>{t('ID Carga / Fecha', 'Load ID / Date')}</th>
                          <th style={{ padding: '0.75rem 1rem' }}>{t('Carril (Origen & Destino)', 'Lane (Origin & Destination)')}</th>
                          <th style={{ padding: '0.75rem 1rem' }}>{t('Equipo / Vehículo', 'Equipment / Vehicle')}</th>
                          <th style={{ padding: '0.75rem 1rem' }}>{t('IDs Externos', 'External IDs')}</th>
                          <th style={{ padding: '0.75rem 1rem' }}>{t('Ofertas Recibidas', 'Bids Received')}</th>
                          <th style={{ padding: '0.75rem 1rem' }}>{t('Estado Sindicación', 'Syndication Status')}</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{t('Acción', 'Action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {syndicatedLoadsList.map((load) => (
                          <tr key={load.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '1rem' }}>
                              <strong style={{ color: 'var(--color-accent)', display: 'block' }}>#{load.id}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{load.postedDate}</span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <strong>{load.origin} &rarr; {load.dest}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>{t('Tarifa Objetivo:', 'Target Rate:')} ${load.targetRate} USD</span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span>{load.vehicle}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>{load.equipment} ({load.weight})</span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <span className="platform-badge platform-badge--dat">{load.datId}</span>
                                <span className="platform-badge platform-badge--truckstop">{load.truckstopId}</span>
                              </div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <strong style={{ color: '#10b981' }}>{load.bidsReceived} {t('ofertas', 'bids')}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>{load.topCarrier}</span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                backgroundColor: load.status.includes('Active') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                color: load.status.includes('Active') ? '#10b981' : '#ef4444'
                              }}>
                                {load.status}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              {load.status.includes('Active') ? (
                                <button className="btn btn--outline btn--sm" onClick={() => handleAutoDelistLoad(load.id)}>
                                  {t('Despublicar', 'Auto-Delist')}
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Delisted</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CARRIER VETTING TOOL */}
            {clientActiveTab === 'vetting' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>{t('Verificación de Transportistas (Carrier Vetting API)', 'Carrier Vetting & Compliance Check')}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 1.5rem 0' }}>
                    {t('Auditoría instantánea de licencias MC, registros de la FMCSA y cobertura de seguros antes de asignar una carga externa.', 'Instant audit of MC licenses, FMCSA records, and insurance coverage prior to assigning external loads.')}
                  </p>

                  <form onSubmit={handleRunCarrierVetting} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div style={{ flex: '1 1 250px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: '700' }}>
                        {t('Número MC de Transportista / USDOT', 'Carrier MC Number / USDOT')}
                      </label>
                      <input
                        type="text"
                        value={mcInput}
                        onChange={(e) => setMcInput(e.target.value)}
                        placeholder={t('Ej. 984012 o 999999 para prueba de rechazo', 'E.g. 984012 or 999999 to test rejection')}
                        style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button className="btn btn--primary" type="submit" disabled={isVettingLoading}>
                        {isVettingLoading ? t('Consultando FMCSA API...', 'Querying FMCSA API...') : t('Verificar Cumplimiento MC', 'Verify MC Compliance')}
                      </button>
                    </div>
                  </form>

                  {vettingResult && (
                    <div className="vetting-result-card" style={{ borderColor: vettingResult.overallStatus === 'APPROVED' ? '#10b981' : '#ef4444' }}>
                      <div className="vetting-metric">
                        <span className="vetting-metric__label">{t('Razón Social / Transportista', 'Carrier Legal Name')}</span>
                        <strong className="vetting-metric__value">{vettingResult.legalName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>DBA: {vettingResult.dbaName}</span>
                      </div>

                      <div className="vetting-metric">
                        <span className="vetting-metric__label">{t('Autoridad FMCSA', 'FMCSA Authority')}</span>
                        <strong className="vetting-metric__value" style={{ color: vettingResult.overallStatus === 'APPROVED' ? '#10b981' : '#ef4444' }}>
                          {vettingResult.fmcsaStatus}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{t('Autoridad desde:', 'Authority since:')} {vettingResult.authorityDate}</span>
                      </div>

                      <div className="vetting-metric">
                        <span className="vetting-metric__label">{t('Seguro Responsabilidad Civil', 'Auto Liability Insurance')}</span>
                        <strong className="vetting-metric__value">{vettingResult.autoLiability}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{t('Carga:', 'Cargo:')} {vettingResult.cargoInsurance}</span>
                      </div>

                      <div className="vetting-metric">
                        <span className="vetting-metric__label">{t('Score de Seguridad & Telemetría', 'Safety Score & Telemetry')}</span>
                        <strong className="vetting-metric__value">{vettingResult.safetyScore}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>{vettingResult.telemetryStatus}</span>
                      </div>

                      <div className="vetting-metric" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className="vetting-metric__label">{t('Dictamen de Auditoría', 'Audit Verdict')}</span>
                          <strong style={{ fontSize: '1.25rem', color: vettingResult.overallStatus === 'APPROVED' ? '#10b981' : '#ef4444' }}>
                            {vettingResult.overallStatus === 'APPROVED' ? t('✅ APROBADO PARA ASIGNACIÓN DE CARGA', '✅ APPROVED FOR LOAD ASSIGNMENT') : t('❌ RECHAZADO POR INCUMPLIMIENTO', '❌ REJECTED DUE TO NON-COMPLIANCE')}
                          </strong>
                        </div>
                        {vettingResult.overallStatus === 'APPROVED' && (
                          <button className="btn btn--primary btn--sm" onClick={() => alert(t(`Transportista ${vettingResult.legalName} (MC #${vettingResult.mcNumber}) asignado con éxito a la carga.`, `Carrier ${vettingResult.legalName} (MC #${vettingResult.mcNumber}) successfully assigned to load.`))}>
                            {t('Aprobar y Asignar Viaje', 'Approve & Assign Load')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: DAT SPOT RATE BENCHMARK */}
            {clientActiveTab === 'spotrates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>{t('Analítica de Tarifas Spot DAT One & Truckstop', 'DAT One & Truckstop Spot Rate Analytics')}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 1.5rem 0' }}>
                    {t('Estimación de tarifas en tiempo real basadas en el historial de transacciones de carga para camiones de 53\', 26\' y Cargo Vans.', 'Real-time rate estimates based on freight transaction history for 53\', 26\' trucks, and Cargo Vans.')}
                  </p>

                  <form onSubmit={handleCalculateSpotRate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: '700' }}>{t('Zip Code Origen', 'Origin Zip Code')}</label>
                      <input type="text" value={spotOriginZip} onChange={(e) => setSpotOriginZip(e.target.value)} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: '700' }}>{t('Zip Code Destino', 'Destination Zip Code')}</label>
                      <input type="text" value={spotDestZip} onChange={(e) => setSpotDestZip(e.target.value)} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: '700' }}>{t('Tipo de Vehículo / Equipo', 'Equipment / Vehicle Type')}</label>
                      <select value={spotEquipment} onChange={(e) => setSpotEquipment(e.target.value)} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
                        <option value="53ft Semi Truck">53ft Semi Truck (Dry Van / Reefer)</option>
                        <option value="26ft Box Truck">26ft Box Truck</option>
                        <option value="Cargo Van">Cargo Van</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button className="btn btn--primary" type="submit" style={{ width: '100%' }}>
                        {t('Consultar Tarifas DAT', 'Query DAT Rates')}
                      </button>
                    </div>
                  </form>

                  {spotResult && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '1.5rem', borderRadius: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>{t('Carril Consultado', 'Queried Lane')}</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', display: 'block' }}>{spotResult.originCity} &rarr; {spotResult.destCity}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{t('Distancia:', 'Distance:')} {spotResult.miles} miles</span>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>{t('Tarifa Contrato Promedio', 'Avg Contract Rate')}</span>
                        <strong style={{ fontSize: '1.25rem', color: '#10b981', display: 'block' }}>${spotResult.contractAvgRate} / mi</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Total: ${spotResult.contractTotal.toLocaleString()} USD</span>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>{t('Tarifa Spot Market (DAT)', 'DAT Spot Rate')}</span>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--color-accent)', display: 'block' }}>${spotResult.spotAvgRate} / mi</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{t('Rango:', 'Range:')} ${spotResult.spotRangeLow} - ${spotResult.spotRangeHigh} / mi</span>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>{t('Índice de Oferta & Confianza', 'Demand Index & Confidence')}</span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', display: 'block' }}>{spotResult.demandIndex}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>{spotResult.datOneConfidence}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: API LOGS */}
            {clientActiveTab === 'apilogs' && (
              <div className="api-terminal">
                <div className="api-terminal__header">
                  <span>MIDDLEWARE API GATEWAY - HCGA FREIGHT BRIDGE v2.4</span>
                  <span style={{ color: '#10b981' }}>● REST & WEBHOOKS ONLINE</span>
                </div>

                <div className="api-terminal__log-list">
                  {apiLogs.map((log, i) => (
                    <div key={i} className="api-terminal__log-item">
                      <span style={{ color: '#94a3b8' }}>[{log.time}]</span>
                      <strong style={{ color: log.event.includes('DELETE') ? '#ef4444' : log.event.includes('VET') ? '#f59e0b' : '#38bdf8' }}>{log.event}</strong>
                      <span>{log.payload} <code style={{ opacity: 0.6, fontSize: '0.75rem' }}>({log.endpoint})</code></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal for Posting New Load */}
          {showPostLoadModal && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '2rem', maxWidth: '540px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{t('Publicar Nueva Carga en Bolsas', 'Post New Load to Boards')}</h3>
                  <button style={{ fontSize: '1.25rem', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--color-text-primary)' }} onClick={() => setShowPostLoadModal(false)}>✕</button>
                </div>

                <form onSubmit={handlePostNewLoad} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>{t('Origen', 'Origin')}</label>
                    <input type="text" value={newLoadForm.origin} onChange={(e) => setNewLoadForm({ ...newLoadForm, origin: e.target.value })} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>{t('Destino', 'Destination')}</label>
                    <input type="text" value={newLoadForm.dest} onChange={(e) => setNewLoadForm({ ...newLoadForm, dest: e.target.value })} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>{t('Tipo Vehículo', 'Vehicle Type')}</label>
                      <select value={newLoadForm.vehicle} onChange={(e) => setNewLoadForm({ ...newLoadForm, vehicle: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)' }}>
                        <option value="53ft Semi Truck">53ft Semi Truck</option>
                        <option value="26ft Box Truck">26ft Box Truck</option>
                        <option value="Cargo Van">Cargo Van</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>{t('Tarifa Objetivo ($ USD)', 'Target Rate ($ USD)')}</label>
                      <input type="number" value={newLoadForm.targetRate} onChange={(e) => setNewLoadForm({ ...newLoadForm, targetRate: e.target.value })} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button className="btn btn--primary" type="submit" style={{ flex: 1 }}>
                      🚀 {t('Publicar en DAT y Truckstop', 'Publish to DAT & Truckstop')}
                    </button>
                    <button className="btn btn--outline" type="button" onClick={() => setShowPostLoadModal(false)}>
                      {t('Cancelar', 'Cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <footer className="footer" style={{ borderTop: '1px solid var(--color-border)', padding: '1.5rem 0', marginTop: 'auto' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              <span>HCGA FleetOS &copy; {new Date().getFullYear()}</span>
              <span>Client Session: ACME Logistics Corp</span>
              <button
                onClick={() => {
                  setIsClientLoggedIn(false);
                  setShowClientDashboard(false);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
              >
                {t('Cerrar Sesión', 'Sign Out Session')}
              </button>
            </div>
          </footer>
        </div>

        {/* Floating Demo Controller */}
        {renderDemoController()}
      </>
    );
  }

  return (
    <>
      <TruckBackground />
      <header className="header">
        <div className="container header__inner">
          <a href="#" className="header__logo">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="HCGA Trading LLC" className="header__logo-img" />
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

          <div className={`header__menu-backdrop ${isMobileMenuOpen ? 'header__menu-backdrop--open' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />

          <div className={`header__menu ${isMobileMenuOpen ? 'header__menu--open' : ''}`}>
            <nav className="nav">
              <ul className="nav__list">
                <li><a href="#services" className="nav__link" onClick={() => { setIsMobileMenuOpen(false); setSelectedServiceId(null); }}>{t('Servicios', 'Services')}</a></li>
                <li><a href="#technology" className="nav__link" onClick={() => setIsMobileMenuOpen(false)}>{t('Tecnología', 'Technology')}</a></li>
                <li><a href="#safety" className="nav__link" onClick={() => setIsMobileMenuOpen(false)}>{t('Seguridad', 'Safety')}</a></li>
                <li><a href="#client-portal" className="nav__link" onClick={() => setIsMobileMenuOpen(false)}>{t('Portal Clientes', 'Client Portal')}</a></li>
              </ul>
            </nav>

            <div className="header__actions">
              {renderLangSwitcher()}

              <button
                className="theme-toggle-btn"
                onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={t('Cambiar Tema', 'Toggle Theme')}
              >
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                )}
              </button>

              {isDriverLoggedIn ? (
                <a href="#" className="nav__link nav__link--btn-driver nav__link--dashboard" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setShowDriverDashboard(true); }}>{t('Panel Conductor', 'Driver Panel')}</a>
              ) : (
                <a href="#" className="nav__link nav__link--btn-driver" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setShowDriverLoginModal(true); }}>{t('Acceso Conductor', 'Driver Login')}</a>
              )}
              {isClientLoggedIn ? (
                <a href="#" className="nav__link nav__link--btn-client nav__link--dashboard" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setShowClientDashboard(true); }}>{t('Panel Cliente', 'Client Panel')}</a>
              ) : (
                <a href="#client-portal" className="nav__link nav__link--btn-client" onClick={() => setIsMobileMenuOpen(false)}>
                  {t('Acceso Clientes', 'Client Login')}
                </a>
              )}
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
            playsInline
            onPlay={() => { setShowContent(false); setIsPlaying(true); }}
            onPause={() => { setShowContent(true); setIsPlaying(false); }}
            onEnded={() => {
              if (videoRef.current && videoRef.current.duration) {
                videoRef.current.currentTime = videoRef.current.duration - 0.05;
              }
              setShowContent(true);
              setIsPlaying(false);
            }}
          >
            <source src={`${import.meta.env.BASE_URL}video2.mp4`} media="(max-width: 1023px)" type="video/mp4" />
            <source src={`${import.meta.env.BASE_URL}video1.mp4`} type="video/mp4" />
          </video>
          <div className="hero__video-overlay"></div>

          <div className="hero__video-controls">
            <button onClick={togglePlayStop} className="btn-play-pause" aria-label={isPlaying ? t("Pausar Video", "Pause Video") : t("Reproducir Video", "Play Video")}>
              {isPlaying ? (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="currentColor"><rect x="6" y="6" width="12" height="12"></rect></svg>
                  <span>{t('Pausar', 'Pause')}</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  <span>{t('Reproducir', 'Play')}</span>
                </>
              )}
            </button>
            <button onClick={toggleMute} className="btn-play-pause" aria-label={isMuted ? t("Activar Sonido", "Unmute Audio") : t("Silenciar Sonido", "Mute Audio")}>
              {isMuted ? (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                  <span>{t('Sin Sonido', 'Muted')}</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  <span>{t('Con Sonido', 'Sound')}</span>
                </>
              )}
            </button>
          </div>

          <div className={`container hero__content ${showContent ? 'hero__content--visible' : 'hero__content--hidden'}`}>
            <h1 className="hero__title">
              {t('Transporte comercial escalable,', 'Scalable commercial transportation,')}{' '}
              <span className="hero__title-highlight">{t('impulsado por datos.', 'powered by data.')}</span>
            </h1>

            <p className="hero__description">
              {t(
                'HCGA TRADING LLC proporciona soluciones de transporte comercial escalables con visibilidad de flota en tiempo real, operaciones disciplinadas, conductores profesionales y tecnología moderna de gestión de rutas.',
                'HCGA TRADING LLC provides scalable commercial transportation solutions supported by real-time fleet visibility, disciplined operations, professional drivers, and modern route-management technology.'
              )}
            </p>

            <div className="hero__actions">
              <a href="#services" className="btn btn--primary" onClick={() => setSelectedServiceId(null)}>
                {t('Solicitar Servicios de Transporte', 'Request Transportation Services')}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>

              <a href="#technology" className="btn btn--secondary">
                {t('Explorar Nuestra Tecnología', 'Explore Our Technology')}
              </a>
              <a href="#" className="btn btn--outline" onClick={openDevNotice}>
                {t('Asociarse con HCGA', 'Partner With HCGA')}
              </a>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <div className="stats-bar">
          <div className="container">
            <div className="stats-bar__grid reveal-group">
              <div className="stats-bar__item reveal">
                <span className="stats-bar__value">150+</span>
                <span className="stats-bar__label">{t('Unidades Dedicadas', 'Dedicated Assets')}</span>
                <span className="stats-bar__sub">{t('Camiones, remolques y vans', 'Trucks, trailers & vans')}</span>
              </div>
              <div className="stats-bar__item reveal">
                <span className="stats-bar__value">99.8%</span>
                <span className="stats-bar__label">{t('Tasa de Puntualidad', 'On-Time Rate')}</span>
                <span className="stats-bar__sub">{t('En todos los corredores dedicados', 'Across all dedicated lanes')}</span>
              </div>
              <div className="stats-bar__item reveal">
                <span className="stats-bar__value">24/7</span>
                <span className="stats-bar__label">{t('Cobertura de Despacho', 'Dispatch Coverage')}</span>
                <span className="stats-bar__sub">{t('Los 365 días del año', '365 days a year')}</span>
              </div>
              <div className="stats-bar__item reveal">
                <span className="stats-bar__value">5+</span>
                <span className="stats-bar__label">{t('Años Alianza Promedio', 'Years Avg. Partnership')}</span>
                <span className="stats-bar__sub">{t('Retención de clientes a largo plazo', 'Long-term client retention')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SERVICES SECTION */}
        <section id="services" ref={servicesRef} className="section services-section">
          <div className="container">
            <div className="section-banner-header reveal" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}services_header.png)` }}>
              <div className="section-banner-header__overlay"></div>
              <div className="section-banner-header__content">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="HCGA Trading LLC Logo" className="section-banner-header__logo" />
                <h2 className="section-title">{t('Servicios de Transporte', 'Transportation Services')}</h2>
                <p className="section-subtitle">{t('Operaciones escalables, confiables y guiadas por tecnología para clientes comerciales.', 'Scalable, reliable, and technology-driven operations tailored for commercial clients.')}</p>
              </div>
            </div>

            {selectedServiceId ? (() => {
              const service = SERVICES_DATA.find(s => s.id === selectedServiceId);
              return (
                <div className="service-detail">
                  <div className="service-detail__header">
                    <button className="service-detail__back-btn" onClick={handleBackToServices}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                      {t('Volver a Servicios', 'Back to Services')}
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
                    <div className="service-detail__info-col">
                      <div className="service-detail__description-box">
                        {service.description.map((para, i) => (
                          <p key={i} className="service-detail__description">{para}</p>
                        ))}
                      </div>

                      <div className="service-detail__features-box">
                        <h4 className="service-detail__section-title">{t('Capacidades Operativas', 'Operational Capabilities')}</h4>
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

                    <div className="service-detail__action-col">
                      <div className="service-detail__map-preview" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1rem' }}>
                        <img src={`${import.meta.env.BASE_URL}services_thumbnail_usa.png`} alt="USA Active Routes HUD" style={{ width: '100%', height: 'auto', display: 'block' }} />
                      </div>
                      <div className="service-detail__kpis-box">
                        <h4 className="service-detail__section-title">{t('Métricas de Rendimiento', 'Performance Metrics')}</h4>
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
                        <h4 className="service-detail__section-title">{t('Solicitar Cotización e Información', 'Request Quote & Info')}</h4>
                        {quoteSubmitted ? (
                          <div className="service-detail__success-msg">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            <h4>{t('¡Solicitud Recibida!', 'Request Received!')}</h4>
                            <p>{t(`Un gerente de rutas de HCGA se comunicará en menos de 15 minutos para tratar detalles de ${service.title}.`, `An HCGA route manager will contact you within 15 minutes to discuss ${service.title} details.`)}</p>
                          </div>
                        ) : (
                          <form className="service-detail__form" onSubmit={(e) => {
                            e.preventDefault();
                            setQuoteSubmitted(true);
                          }}>
                            <div className="form-group">
                              <label htmlFor="detail-company">{t('Nombre de Empresa', 'Company Name')}</label>
                              <input type="text" id="detail-company" className="form-input" placeholder="Acme Logistics" required />
                            </div>
                            <div className="form-group">
                              <label htmlFor="detail-contact">{t('Persona de Contacto', 'Contact Person')}</label>
                              <input type="text" id="detail-contact" className="form-input" placeholder="María González" required />
                            </div>
                            <div className="form-group">
                              <label htmlFor="detail-phone">{t('Teléfono de Contacto', 'Phone Number')}</label>
                              <input type="tel" id="detail-phone" className="form-input" placeholder="(555) 000-0000" required />
                            </div>
                            <div className="form-group">
                              <label htmlFor="detail-email">{t('Correo Corporativo', 'Work Email')}</label>
                              <input type="email" id="detail-email" className="form-input" placeholder="contacto@empresa.com" required />
                            </div>
                            <div className="form-group">
                              <label htmlFor="detail-notes">{t('Detalles Adicionales / Rutas Requeridas', 'Additional Details / Route Lanes')}</label>
                              <textarea id="detail-notes" className="form-input form-input--textarea" placeholder={t('Describa el volumen o requerimientos de su corredor...', 'Describe your lane volume or specific requirements...')} rows="3"></textarea>
                            </div>
                            <button type="submit" className="btn btn--primary btn--full">{t('Enviar Solicitud', 'Get Started')}</button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="services-grid reveal-group">
                {SERVICES_DATA.map((service) => (
                  <div
                    key={service.id}
                    className="service-card reveal"
                    onClick={() => handleSelectService(service.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="service-icon">
                      {service.icon}
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.subtitle}</p>
                    <span className="service-card__learn-more">
                      {t('Ver Detalles', 'Learn More')}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="section-cta-box" style={{ marginTop: '3rem', textAlign: 'center' }}>
              <button className="btn btn--secondary" onClick={() => launchDemoState('driver_marketplace')}>
                {t('Probar Consola de Despacho para Conductores', 'Launch Live Driver Dispatch Console Demo')}
              </button>
            </div>
          </div>
        </section>

        {/* TECHNOLOGY SECTION */}
        <section id="technology" className="section tech-section">
          <div className="container">
            <div className="section-banner-header reveal" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}tech_header.png)` }}>
              <div className="section-banner-header__overlay"></div>
              <div className="section-banner-header__content">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="HCGA Trading LLC Logo" className="section-banner-header__logo" />
                <h2 className="section-title">{t('Control Inteligente de Flota', 'Intelligent Fleet Control')}</h2>
                <p className="section-subtitle">{t('HCGA FleetOS le brinda total visibilidad y control operativo. Nuestra tecnología propia garantiza seguridad, eficiencia y cumplimiento.', 'HCGA FleetOS gives you total operational visibility and control. Our custom-built technology stack ensures safety, efficiency, and compliance.')}</p>
              </div>
            </div>

            <div className="tech-container">
              <div className="tech-content reveal reveal--from-left">
                <ul className="tech-feature-list">
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{t('Visibilidad de flota en vivo', 'Live fleet visibility')}</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{t('Sistema de tablet en cabina para conductores', 'Driver tablet system')}</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{t('Monitoreo dinámico de ruta', 'Route monitoring')}</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{t('Control y rastreo de combustible', 'Fuel control & tracking')}</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{t('Alertas predictivas de mantenimiento', 'Maintenance alerts')}</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{t('Inspecciones digitales DVIR', 'Digital driver inspections')}</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{t('Prueba digital de entrega (POD)', 'Digital proof of delivery')}</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{t('Reportes automatizados al cliente', 'Automated customer reporting')}</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{t('Análisis de costos y rutas asistido por IA', 'AI-assisted route & cost analysis')}</span>
                  </li>
                </ul>
                <button className="btn btn--secondary" style={{ marginTop: '2rem' }} onClick={() => launchDemoState('driver_transit')}>
                  {t('Probar Simulador de Ruta Satelital', 'Launch Live Route Simulator Demo')}
                </button>
              </div>

              <div className="tech-visual reveal reveal--from-right">
                <div className="dashboard-mockup" style={{ padding: '0', display: 'block', height: 'auto', aspectRatio: '16/10' }}>
                  <img src={`${import.meta.env.BASE_URL}tech_thumbnail.png`} alt="HCGA FleetOS Client Dashboard Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SAFETY SECTION */}
        <section id="safety" className="section safety-section">
          <div className="container">
            <div className="section-banner-header reveal" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}safety_header.png)` }}>
              <div className="section-banner-header__overlay"></div>
              <div className="section-banner-header__content">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="HCGA Trading LLC Logo" className="section-banner-header__logo" />
                <h2 className="section-title">{t('Seguridad y Cumplimiento', 'Safety & Compliance')}</h2>
                <p className="section-subtitle">{t('Una cultura de seguridad integrada en cada ruta, respaldada por registros digitales y monitoreo constante.', 'A culture of safety built into every route, backed by digital records and constant monitoring.')}</p>
              </div>
            </div>

            <div className={selectedSafetyId ? "" : "safety-container-layout"}>
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
                            {t('Volver', 'Return')}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginBottom: '2rem', lineHeight: '1.6' }}>{item.desc}</p>
                          <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)' }}>{t('Estándares Clave de Cumplimiento', 'Key Features & Compliance Standards')}</h4>
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
                  <div className="safety-grid reveal-group">
                    {SAFETY_DATA.map((item) => (
                      <div
                        key={item.id}
                        className="safety-item reveal"
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
                  {t('Probar Consola de Seguridad y Cumplimiento', 'Launch Safety Compliance Console Demo')}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CLIENT PORTAL SECTION */}
        <section id="client-portal" className="section portal-section">
          <div className="container">
            <div className="section-banner-header reveal" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}portal_header.png)` }}>
              <div className="section-banner-header__overlay"></div>
              <div className="section-banner-header__content">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="HCGA Trading LLC Logo" className="section-banner-header__logo" />
                <h2 className="section-title">{t('Portal de Clientes', 'Client Portal')}</h2>
                <p className="section-subtitle">{t('Acceda a su panel de flota dedicado. Monitoree rutas activas, descargue pruebas de entrega y analice el rendimiento.', 'Access your dedicated fleet dashboard. Monitor live routes, download delivery proofs, and analyze performance data.')}</p>
              </div>
            </div>

            <div className="portal-container">
              <div className="portal-content">
                <form className="portal-form" onSubmit={handleClientLogin}>
                  <div className="form-group">
                    <label htmlFor="email">{t('Correo Corporativo', 'Work Email')}</label>
                    <input
                      type="email"
                      id="email"
                      className="form-input"
                      placeholder="nombre@empresa.com"
                      value={clientWorkEmail}
                      onChange={(e) => setClientWorkEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">{t('Contraseña', 'Password')}</label>
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
                    <a href="#" className="forgot-password" onClick={openDevNotice}>{t('¿Olvidó su contraseña?', 'Forgot password?')}</a>
                    <button type="submit" className="btn btn--primary btn--full">{t('Iniciar Sesión en FleetOS', 'Sign In to FleetOS')}</button>
                  </div>
                </form>

                <div className="portal-footer">
                  <p>{t('¿Aún no es cliente?', 'Not a client yet?')} <a href="#" onClick={openDevNotice}>{t('Solicitar Alianza Comercial', 'Request Partnership')}</a></p>
                </div>
              </div>

              <div className="portal-visual">
                <div className="portal-graphics">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="portal-lock-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <h3>{t('Acceso Seguro', 'Secure Access')}</h3>
                  <p>{t('Encriptación de nivel empresarial para sus datos operativos.', 'Enterprise-grade encryption for your operational data.')}</p>
                  <button className="btn btn--secondary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => launchDemoState('client_dashboard')}>
                    {t('Probar HUD Interactivo para Clientes', 'Instant Client HUD Demo')}
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
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="HCGA TRADING LLC Logo" className="footer-logo-img" />
            <p>{t('Transporte comercial escalable, impulsado por datos.', 'Scalable commercial transportation, powered by data.')}</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>{t('Empresa', 'Company')}</h4>
              <a href="#" onClick={openDevNotice}>{t('Nosotros', 'About Us')}</a>
              <a href="#" onClick={openDevNotice}>{t('Carreras', 'Careers')}</a>
              <a href="#" onClick={openDevNotice}>{t('Contacto', 'Contact')}</a>
            </div>
            <div className="footer-col">
              <h4>{t('Servicios', 'Services')}</h4>
              <a href="#services" onClick={() => handleSelectService('dedicated-routes')}>{t('Rutas Dedicadas', 'Dedicated Routes')}</a>
              <a href="#services" onClick={() => handleSelectService('contract-transportation')}>{t('Transporte por Contrato', 'Contract Transportation')}</a>
              <a href="#services" onClick={() => handleSelectService('facility-to-facility')}>{t('Entre Instalaciones', 'Facility-to-Facility')}</a>
            </div>

            <div className="footer-col">
              <h4>{t('Legal', 'Legal')}</h4>
              <a href="#" onClick={openDevNotice}>{t('Política de Privacidad', 'Privacy Policy')}</a>
              <a href="#" onClick={openDevNotice}>{t('Términos de Servicio', 'Terms of Service')}</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} HCGA TRADING LLC. {t('Todos los derechos reservados.', 'All rights reserved.')}</p>
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
            <h3 id="dev-modal-title">{t('Sección en Desarrollo', 'Feature Coming Soon')}</h3>
            <p>{t('Esta sección está actualmente en desarrollo. Estará disponible próximamente — gracias por su paciencia.', 'This section is still under development. We\'re working on it and it will be available soon — thanks for your patience.')}</p>
            <button className="btn btn--primary" onClick={() => setShowDevNotice(false)}>{t('Entendido', 'Got it')}</button>
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
            <h3 id="driver-modal-title" style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>{t('Acceso Portal de Conductores', 'Driver Portal Login')}</h3>

            <form onSubmit={handleDriverLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
              <div className="form-group">
                <label htmlFor="driver-id" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>{t('ID de Conductor', 'Driver ID')}</label>
                <input
                  type="text"
                  id="driver-id"
                  className="form-input"
                  placeholder="ej. carlos"
                  value={driverUsername}
                  onChange={(e) => setDriverUsername(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="driver-pin" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>{t('PIN / Contraseña', 'PIN / Password')}</label>
                <input
                  type="password"
                  id="driver-pin"
                  className="form-input"
                  placeholder="ej. 1042"
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
                <button type="submit" className="btn btn--primary" style={{ flex: 1 }}>{t('Iniciar Sesión', 'Sign In')}</button>
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
                  {t('Acceso Demo', 'Demo Bypass')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Demo Controller */}
      {renderDemoController()}
    </>
  );
}

export default App;
