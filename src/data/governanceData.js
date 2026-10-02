// Data for Code of Conduct & Platform Governance (Código de Conducta y Estándares de la Plataforma)
// Work draft & legal preparation for HCGA Trading LLC

export const getGovernanceData = (lang) => {
  const isEs = lang === 'es';

  return {
    meta: {
      title: isEs ? 'Código de Conducta y Estándares de la Plataforma' : 'Platform Code of Conduct & Standards',
      subtitle: isEs
        ? 'Borrador de trabajo para revisión legal y gobernanza operativa de HCGA Trading LLC'
        : 'Work draft for legal review and operational governance of HCGA Trading LLC',
      status: isEs ? 'Borrador de Revisión Legal' : 'Legal Review Draft',
      version: 'v1.0 (Junio 2026)',
      principleText: isEs
        ? 'El chofer es el actor más vulnerable de la cadena. Las reglas están diseñadas primero para protegerlo a él, manteniendo criterios justos y objetivos con brokers y shippers de buena fe.'
        : 'The driver is the most vulnerable actor in the chain. Rules are designed first to protect them, while maintaining fair and objective standards for good-faith brokers and shippers.'
    },

    // 1. Separation: Rating vs Verified Violation
    separation: {
      title: isEs ? 'Separación Clave: Opinión vs. Violación Verificada' : 'Key Distinction: Opinion Rating vs. Verified Violation',
      desc: isEs
        ? 'Este es el principio de diseño fundamental: la permanencia en la plataforma depende de hechos verificables y evidencia objetiva, no de opiniones sueltas ni disputas de volumen.'
        : 'This is the core design principle: platform membership depends on verifiable facts and objective evidence, not raw opinions or volume leverage.',
      opinion: {
        title: isEs ? 'Calificación de Opinión (Estrellas / Reseñas)' : 'Opinion Rating (Stars / Reviews)',
        whatIs: isEs ? 'Una opinión subjetiva de un actor sobre otro.' : 'A subjective opinion of one participant about another.',
        examples: isEs
          ? ['"El broker fue grosero"', '"Tardó en responder al chat"', '"La carga estuvo lista un poco más tarde"']
          : ['"Broker was rude"', '"Slow to reply on chat"', '"Load ready slightly late"'],
        effect: isEs
          ? 'Se muestra como reputación pública. NO dispara sanciones automáticas ni suspensiones.'
          : 'Displayed as public reputation. Does NOT trigger automatic sanctions or account suspensions.',
        rationale: isEs
          ? 'Evita que una mala reseña aislada o maliciosa afecte el sustento de un chofer o broker sin debido proceso.'
          : 'Prevents an isolated or malicious bad review from harming a driver or broker without due process.'
      },
      verified: {
        title: isEs ? 'Violación Verificada (Evidencia Objetiva)' : 'Verified Violation (Objective Evidence)',
        whatIs: isEs ? 'Un hecho respaldado por evidencia objetiva capturada directamente por la plataforma.' : 'A fact backed by objective evidence captured directly by the platform.',
        examples: isEs
          ? [
              'Tarifa bloqueada cambiada sin firma del chofer',
              'Detention documentado por GPS satelital y no pagado',
              'DVIR falsificado (marcado conforme sin inspección)',
              'Pago de flete no recibido tras el plazo comprometido en Rate Confirmation'
            ]
          : [
              'Locked rate altered without driver signature',
              'GPS-documented detention unpaid after grace period',
              'Falsified DVIR (marked compliant without inspection)',
              'Freight payment unreceived past Rate Confirmation deadline'
            ],
        effect: isEs
          ? 'Dispara directamente la Escalera de Consecuencias operativas o comerciales.'
          : 'Directly triggers the Operational or Commercial Consequences Escalator.',
        rationale: isEs
          ? 'Proporciona a HCGA una base legal sólida y defendible ante cualquier reclamo de suspensión injusta.'
          : 'Provides HCGA with a solid, defensible legal foundation against any unfair suspension claim.'
      },
      legalFlag: {
        id: 'flag-1',
        title: isEs ? '🔶 Revisar con Abogado (Estándar de Evidencia)' : '🔶 Legal Review (Evidence Standard)',
        question: isEs
          ? 'Confirmar que este estándar de "evidencia objetiva" es suficientemente claro para sostenerse si una suspensión es disputada ante un árbitro (AAA/JAMS) o tribunal.'
          : 'Confirm that this "objective evidence" standard is legally sound to withstand challenges in AAA/JAMS arbitration or court.'
      }
    },

    // 2. Violation Categories Matrix
    violations: {
      title: isEs ? 'Matriz de Faltas por Actor' : 'Violations Matrix by Actor',
      drivers: {
        actorName: isEs ? 'Choferes (Owner Operators y Flotillas)' : 'Drivers (Owner Operators & Fleets)',
        items: [
          {
            level: 'Leve',
            fault: isEs ? 'DVIR incompleto al iniciar viaje' : 'Incomplete DVIR upon trip start',
            evidence: isEs ? 'Registro del checklist en la app' : 'App checklist log timestamp'
          },
          {
            level: 'Leve',
            fault: isEs ? 'Retraso no informado en recogida o entrega' : 'Unnotified delay at pickup or delivery',
            evidence: isEs ? 'Trazado GPS + ausencia de mensaje en chat' : 'GPS breadcrumbs + missing chat alert'
          },
          {
            level: 'Grave',
            fault: isEs ? 'Falsificar el DVIR (marcar sin inspeccionar)' : 'DVIR falsification (check without inspecting)',
            evidence: isEs ? 'Patrón detectado por fallas posteriores + declaración' : 'Pattern detected via subsequent failures + statement'
          },
          {
            level: 'Grave',
            fault: isEs ? 'Exceder límites de Horas de Servicio (HOS) reiteradamente' : 'Repeatedly exceeding Hours of Service (HOS)',
            evidence: isEs ? 'Reloj ELD / bitácora digital de la plataforma' : 'Platform ELD / digital log clock'
          },
          {
            level: 'Muy Grave',
            fault: isEs ? 'Abandonar carga en tránsito sin causa justificada' : 'Abandoning cargo in transit without cause',
            evidence: isEs ? 'Telemetría GPS + interrupción total de comunicación' : 'GPS telemetry + total comms blackout'
          },
          {
            level: 'Muy Grave',
            fault: isEs ? 'Documentos de identidad o empresa falsificados' : 'Falsified identity or company credentials',
            evidence: isEs ? 'Verificación cruzada FMCSA / Registro estatal' : 'Cross-check FMCSA / State business registry'
          }
        ]
      },
      shippersBrokers: {
        actorName: isEs ? 'Shippers & Brokers' : 'Shippers & Brokers',
        items: [
          {
            level: 'Leve',
            fault: isEs ? 'Retraso en confirmar carga o responder al chofer' : 'Delay confirming load or replying to driver',
            evidence: isEs ? 'Registros de chat + timestamps de respuesta' : 'Chat logs + response timestamps'
          },
          {
            level: 'Grave',
            fault: isEs ? 'Cambiar tarifa tras aceptación sin firma del chofer' : 'Changing rate after acceptance without driver signature',
            evidence: isEs ? 'Tarifa bloqueada (lockedRate) vs. cobrada en invoice' : 'Locked rate record vs. billed invoice'
          },
          {
            level: 'Grave',
            fault: isEs ? 'No pagar detention documentado por GPS en el plazo' : 'Unpaid GPS-documented detention past deadline',
            evidence: isEs ? 'Reloj de detention por geocerca + reclamo registrado' : 'Geofenced detention timer + claim log'
          },
          {
            level: 'Muy Grave',
            fault: isEs ? 'Pago no recibido tras plazo en Rate Confirmation' : 'Payment unreceived past Rate Confirmation terms',
            evidence: isEs ? 'Rate Confirmation firmada + falta de transferencia verificada' : 'Signed Rate Confirmation + missing bank audit'
          },
          {
            level: 'Muy Grave',
            fault: isEs ? 'Operar con autoridad MC revocada o sin seguro' : 'Operating with revoked MC authority or expired insurance',
            evidence: isEs ? 'Verificación directa API FMCSA / Certificado COI' : 'Direct FMCSA API check / COI Certificate'
          }
        ]
      },
      legalFlag: {
        id: 'flag-2',
        title: isEs ? '🔶 Revisar con Abogado (Cláusulas Contractuales)' : '🔶 Legal Review (Contractual Breach Terms)',
        question: isEs
          ? 'Validar que "cambiar la tarifa sin firma" y "no pagar el detention" se redacten como incumplimiento contractual claro en el Acuerdo de Adhesión que firma cada broker/shipper.'
          : 'Validate that "rate changes without signature" and "unpaid detention" are framed as explicit breach of contract in the Terms of Service signed upon registration.'
      }
    },

    // 3. Consequence Ladder
    ladder: {
      title: isEs ? 'Escalera de Consecuencias Progresivas' : 'Progressive Consequences Ladder',
      driverRules: {
        title: isEs ? 'Para Choferes (Consecuencias Exclusivamente Operativas)' : 'For Drivers (Strictly Operational Consequences)',
        note: isEs
          ? 'Se usan SOLO medidas operativas, nunca multas en efectivo, para evitar generar una relación de control propia de un empleador sobre un contratista independiente.'
          : 'Uses ONLY operational measures, never monetary fines, specifically to protect independent contractor status and avoid employer reclassification risks.',
        steps: [
          {
            step: '1',
            name: isEs ? 'Aviso Formal' : 'Formal Warning',
            trigger: isEs ? 'Falta leve, 1ª vez' : 'Minor violation, 1st time',
            effect: isEs ? 'Registro en historial de la cuenta, sin impacto operativo.' : 'Recorded in account history, no immediate operational impact.'
          },
          {
            step: '2',
            name: isEs ? 'Pérdida Temporal de Prioridad' : 'Temporary Priority Drop',
            trigger: isEs ? 'Falta leve repetida o falta grave 1ª vez' : 'Repeated minor violation or 1st major violation',
            effect: isEs ? 'Sigue operando, pero ve ofertas en el tablero 15 min después.' : 'Continues operating, but sees load postings 15 min delayed.'
          },
          {
            step: '3',
            name: isEs ? 'Suspensión Temporal' : 'Temporary Suspension',
            trigger: isEs ? 'Falta grave repetida o muy grave 1ª vez' : 'Repeated major violation or 1st critical violation',
            effect: isEs ? 'Cuenta inactiva por período definido (7-30 días) con derecho a apelación.' : 'Account deactivated for set period (7-30 days) with right to appeal.'
          },
          {
            step: '4',
            name: isEs ? 'Baja Permanente' : 'Permanent Removal',
            trigger: isEs ? 'Falta muy grave repetida, fraude o abandono' : 'Repeated critical violation, fraud, or cargo abandonment',
            effect: isEs ? 'Expulsión definitiva del ecosistema HCGA.' : 'Permanent ban from the HCGA ecosystem.'
          }
        ]
      },
      brokerRules: {
        title: isEs ? 'Para Brokers / Shippers (Operativo + Liquidación de Daños)' : 'For Brokers / Shippers (Operational + Liquidated Damages)',
        note: isEs
          ? 'La relación entre HCGA y el Broker es comercial (B2B), por lo que sí se incluye recuperación cuantificable de daños contractuales.'
          : 'The relationship is commercial B2B, allowing enforceable liquidated damages for quantified breach of contract.',
        steps: [
          {
            step: '1',
            name: isEs ? 'Aviso Formal' : 'Formal Warning',
            trigger: isEs ? 'Falta leve, 1ª vez' : 'Minor violation, 1st time',
            effect: isEs ? 'Registro privado en cuenta.' : 'Private account record.'
          },
          {
            step: '2',
            name: isEs ? 'Perfil "En Revisión"' : '"In Review" Badge',
            trigger: isEs ? 'Falta leve repetida o falta grave 1ª vez' : 'Repeated minor or 1st major violation',
            effect: isEs ? 'Aparece marcado como "En Revisión" ante los choferes.' : 'Publicly flagged as "Under Review" to all carriers.'
          },
          {
            step: '3',
            name: isEs ? 'Retención Cautelar' : 'Precautionary Payment Hold',
            trigger: isEs ? 'Falta grave repetida o disputa activa' : 'Repeated major violation or active dispute',
            effect: isEs ? 'Congelamiento cautelar de pagos pendientes mientras se resuelve el reclamo.' : 'Temporary hold on pending disbursements pending claim resolution.'
          },
          {
            step: '4',
            name: isEs ? 'Suspensión & Liquidación de Daños' : 'Suspension & Liquidated Damages',
            trigger: isEs ? 'Falta muy grave o impago contractual' : 'Critical violation or payment default',
            effect: isEs ? 'Suspensión + Cobro del monto adeudado más recargo fijo de daños pactado.' : 'Suspension + Collection of debt plus pre-agreed fixed liquidated damages fee.'
          }
        ]
      },
      legalFlag: {
        id: 'flag-3',
        title: isEs ? '🔶 Revisar con Abogado (Liquidated Damages)' : '🔶 Legal Review (Liquidated Damages Clause)',
        question: isEs
          ? 'El "recargo fijo pactado" debe redactarse como una estimación razonable del daño (liquidated damages), no como castigo punitivo, para ser exigible en EE. UU. Pedir fórmula defendible.'
          : 'The "fixed fee" must be framed as a reasonable estimation of damages (liquidated damages), not a penalty, to be enforceable across US state courts.'
      }
    },

    // 4. Due Process & Dispute Resolution
    dueProcess: {
      title: isEs ? 'Debido Proceso y Tiempos de Resolución' : 'Due Process & Dispute Timelines',
      steps: [
        {
          num: '01',
          name: isEs ? 'Notificación Formal' : 'Formal Notice',
          desc: isEs ? 'Se informa a la cuenta señalada la regla violada y la evidencia en < 48 Horas.' : 'Flagged account notified with exact rule and evidence within 48 Hours.'
        },
        {
          num: '02',
          name: isEs ? 'Respuesta y Evidencia' : 'Response Window',
          desc: isEs ? 'Plazo de 5 Días Hábiles para presentar descargos y contra-evidencia.' : '5 Business Days for account to submit counter-evidence and statement.'
        },
        {
          num: '03',
          name: isEs ? 'Resolución 1ª Instancia' : '1st Instance Ruling',
          desc: isEs ? 'Equipo interno de Confianza y Seguridad decide en no más de 10 Días Hábiles.' : 'Internal Trust & Safety team issues ruling in under 10 Business Days.'
        },
        {
          num: '04',
          name: isEs ? 'Apelación Única' : 'Single Appeal',
          desc: isEs ? 'Cualquiera de las partes puede solicitar una segunda revisión una sola vez.' : 'Either party may request a secondary review exactly once.'
        },
        {
          num: '05',
          name: isEs ? 'Arbitraje Vinculante' : 'Binding Arbitration',
          desc: isEs ? 'Si supera el umbral monetario, se remite a arbitraje (AAA o JAMS).' : 'Disputes over defined threshold escalate to AAA or JAMS binding arbitration.'
        }
      ],
      legalFlag: {
        id: 'flag-4',
        title: isEs ? '🔶 Revisar con Abogado (Umbral de Arbitraje)' : '🔶 Legal Review (Arbitration Threshold)',
        question: isEs
          ? 'Definir el umbral exacto de monto/daño que activa la escalación externa a arbitraje (AAA vs JAMS).'
          : 'Define the exact dollar threshold that triggers external binding arbitration (AAA vs JAMS).'
      }
    },

    // 5. Carrier Verification & Supreme Court Precedent (Montgomery v. Caribe 2026)
    mcVerification: {
      title: isEs ? 'Verificación MC/FMCSA: Escudo Legal ante Negligencia' : 'MC/FMCSA Vetting: Legal Defense Against Negligence',
      caseName: 'Montgomery v. Caribe Transport II, LLC (U.S. Supreme Court, May 14, 2026)',
      rulingSummary: isEs
        ? 'La Corte Suprema EE. UU. resolvió (9-0) que los brokers PUEDEN ser demandados bajo ley estatal por seleccionar negligentemente a un transportista inseguro — la defensa de preempción FAAAA ya no los protege automáticamente.'
        : 'The U.S. Supreme Court ruled unanimously (9-0) that brokers CAN be sued under state law for negligent selection of an unsafe carrier — FAAAA federal preemption no longer provides automatic immunity.',
      kavanaughConcurrence: isEs
        ? 'La opinión concurrente del Juez Kavanaugh destacó que un broker que utiliza un proceso de selección razonable y documentado permanece protegido.'
        : 'Justice Kavanaugh’s concurring opinion noted that a broker utilizing a documented, reasonable carrier vetting process remains protected.',
      hcgaValue: isEs
        ? 'La función "Verificar Transportista" de HCGA registra automáticamente un expediente auditable de debida diligencia razonable. Es una protección legal real frente a demandas por millones de dólares.'
        : 'HCGA’s "Carrier Vetting" module automatically records an auditable timestamped file of reasonable due diligence, providing real legal protection against multi-million dollar lawsuits.',
      legalFlag: {
        id: 'flag-5',
        title: isEs ? '🔶 Revisar con Abogado (Deslinde de Responsabilidad)' : '🔶 Legal Review (Disclaimer Clause)',
        question: isEs
          ? 'Confirmar si HCGA debe incluir una cláusula de deslinde indicando que la verificación MC es una herramienta de apoyo y no sustituye la debida diligencia final del broker.'
          : 'Confirm whether HCGA must include a disclaimer stating that MC verification is a decision-support tool and does not replace final broker due diligence.'
      }
    },

    // 6. Strategic Analysis: DAT & Truckstop Integration
    datTruckstopStrategy: {
      title: isEs ? 'Análisis Estratégico: Integración DAT & Truckstop' : 'Strategic Analysis: DAT & Truckstop Integration',
      verdict: isEs
        ? 'Recomendación: Registrarse en la capa gratuita ahora, pero NO firmar acuerdos de pago ni compromisos de integración todavía.'
        : 'Recommendation: Register for free developer tiers now, but DO NOT sign paid integration agreements yet.',
      findings: [
        {
          source: 'DAT One',
          detail: isEs
            ? 'DAT lanzó su "Carrier Management Suite" (junio 2026) para vetting por MC y seguro. El portal de desarrollador tiene capa previa gratis, pero la producción requiere cuota de setup ($500-$1,000 EST).'
            : 'DAT launched its "Carrier Management Suite" (June 2026) for MC & insurance vetting. Developer portal has a free tier, but production requires setup fees ($500-$1,000 est).'
        },
        {
          source: 'Truckstop',
          detail: isEs
            ? 'Truckstop exige firmar un "Systems Integration Agreement" formal en su programa de partners antes de otorgar credenciales de producción.'
            : 'Truckstop requires a signed "Systems Integration Agreement" within their Partner Program before production access.'
        },
        {
          source: 'Suscripciones',
          detail: isEs
            ? 'La integración NO reemplaza la suscripción: cada chofer o broker necesita tener su propia cuenta paga de DAT Power o Truckstop Pro para ver datos en nuestra app.'
            : 'Integration does NOT replace user subscriptions: each driver/broker must hold their own paid DAT Power or Truckstop Pro subscription to view live external loads.'
        }
      ],
      strategyPoints: [
        isEs
          ? 'Resuelve el problema "huevo y gallina" al ofrecer cargas desde el Día 1 en la app.'
          : 'Solves the "chicken and egg" cold-start by populating live loads from Day 1.',
        isEs
          ? 'Usar como puente temporal mientras HCGA construye su propia liquidez directa de 2 lados.'
          : 'Use as a temporary bridge while building HCGA’s proprietary 2-sided liquidity.',
        isEs
          ? 'Acción inmediata sin costo: Crear cuenta en el Developer Portal gratuito de DAT y contactar al equipo de alianzas de Truckstop para evaluar schemas de API.'
          : 'Immediate zero-cost action: Register on DAT Developer Portal free tier & request Truckstop API documentation.'
      ]
    },

    // 7. Legal Review Docket (Sumario de 🔶 Puntos para el Bufete)
    legalDocket: {
      title: isEs ? 'Expediente para la Reunión con el Bufete de Abogados' : 'Law Firm Consultation Docket',
      desc: isEs
        ? 'Este sumario consolida todas las decisiones marcadas con 🔶 para la primera sesión con los abogados de transporte:'
        : 'This docket consolidates all 🔶 decisions for the initial consultation with transportation legal counsel:',
      items: [
        {
          id: '1',
          code: '🔶 [Sección 2]',
          topic: isEs ? 'Estándar de Evidencia Objetiva' : 'Objective Evidence Standard',
          task: isEs
            ? 'Validar que el estándar de evidencia tecnológica (GPS, timestamps, firmas digitales) sea jurídicamente defendible ante arbitraje (AAA/JAMS).'
            : 'Validate that tech evidence standards (GPS, timestamps, digital sigs) stand up in binding arbitration.'
        },
        {
          id: '2',
          code: '🔶 [Sección 3]',
          topic: isEs ? 'Redacción de Incumplimiento Contractual' : 'Contractual Breach Terms',
          task: isEs
            ? 'Redactar el cambio de tarifa no firmada y el impago de detention como incumplimiento del Acuerdo de Adhesión B2B.'
            : 'Draft rate alterations without signature and unpaid detention as explicit contractual breach.'
        },
        {
          id: '3',
          code: '🔶 [Sección 4]',
          topic: isEs ? 'Cláusula de Liquidated Damages' : 'Liquidated Damages Clause',
          task: isEs
            ? 'Definir monto o fórmula defendible del recargo fijo como estimación previa de daño y no multa punitiva.'
            : 'Establish defensible liquidated damages fee structure avoiding punitive penalty status.'
        },
        {
          id: '4',
          code: '🔶 [Sección 5]',
          topic: isEs ? 'Umbral Monetario de Arbitraje' : 'Arbitration Dollar Threshold',
          task: isEs
            ? 'Establecer el monto en dólares que activa la escalación a arbitraje vinculante (AAA o JAMS).'
            : 'Set dollar threshold triggering mandatory external binding arbitration (AAA or JAMS).'
        },
        {
          id: '5',
          code: '🔶 [Sección 6]',
          topic: isEs ? 'Deslinde en Verificación MC' : 'MC Verification Disclaimer',
          task: isEs
            ? 'Diseñar la cláusula de exención de responsabilidad para la función de debida diligencia de transportistas.'
            : 'Draft liability disclaimer clarifying MC vetting as decision-support tool for brokers.'
        },
        {
          id: '6',
          code: '🔶 [Sección 8]',
          topic: isEs ? 'Estatus de Contratista Independiente' : 'Independent Contractor Shield',
          task: isEs
            ? 'Confirmar que la escalera de consecuencias para choferes no genera riesgo de reclasificación como empleados.'
            : 'Confirm that driver consequence ladder avoids creating employment relationship risks.'
        }
      ]
    }
  };
};
