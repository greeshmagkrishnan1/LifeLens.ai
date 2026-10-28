import { PresetScenario } from '../types/analysis';

// Generator function for rich, visual scenario SVGs
function createSvgDataUri(svgContent: string): string {
  const encoded = encodeURIComponent(svgContent.trim());
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'analyze-situation',
    category: 'Analyze a Situation',
    title: 'Overheating Sub-Panel & Tripped Breakers',
    shortDesc: 'Discolored circuit breaker, loose conduit coupling, and warning indicator light active.',
    promptHint: 'Assess the safety condition of this electrical breaker box and identify any fire hazard indications.',
    suggestedQuestions: [
      'Is there an immediate fire risk with the discolored breaker?',
      'What do the tripped switches and amber LED indicate?',
      'What should I tell a licensed electrician when calling them?',
    ],
    imageSvg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="heatGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#f97316" stop-opacity="0.2"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="800" height="600" fill="#090d16"/>
        <rect x="50" y="40" width="700" height="520" rx="16" fill="url(#panelGrad)" stroke="#334155" stroke-width="4"/>
        <text x="80" y="85" fill="#94a3b8" font-family="monospace" font-size="20" font-weight="bold">INDUSTRIAL POWER DISTRIBUTION PANEL - 240V / 100A</text>
        <circle cx="710" cy="80" r="10" fill="#f59e0b" filter="url(#glow)"/>
        <text x="640" y="85" fill="#f59e0b" font-family="sans-serif" font-size="12" font-weight="bold">FAULT: ON</text>

        <!-- Breaker Row 1 -->
        <g transform="translate(100, 130)">
          <rect width="280" height="70" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
          <text x="15" y="30" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="14">MAIN FEEDER 1 [ON]</text>
          <rect x="210" y="15" width="50" height="40" rx="4" fill="#10b981"/>
          <text x="220" y="40" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">ON</text>

          <rect x="320" width="280" height="70" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
          <text x="335" y="30" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="14">AC UNIT 1 [ON]</text>
          <rect x="530" y="15" width="50" height="40" rx="4" fill="#10b981"/>
          <text x="540" y="40" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">ON</text>
        </g>

        <!-- Breaker Row 2 (With Heat and Tripped switch) -->
        <g transform="translate(100, 220)">
          <!-- Heat glow effect on breaker 3 -->
          <rect x="-10" y="-10" width="300" height="90" rx="12" fill="url(#heatGlow)" filter="url(#glow)"/>
          <rect width="280" height="70" rx="6" fill="#2d1b1f" stroke="#ef4444" stroke-width="3"/>
          <text x="15" y="30" fill="#fca5a5" font-family="sans-serif" font-weight="bold" font-size="14">HEAVY MOTOR FEED [TRIPPED / HOT]</text>
          <text x="15" y="52" fill="#ef4444" font-family="monospace" font-size="11">⚠️ THERMAL DISCOLORATION DETECTED</text>
          <rect x="210" y="15" width="50" height="40" rx="4" fill="#ef4444"/>
          <text x="218" y="40" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">TRIP</text>

          <rect x="320" width="280" height="70" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
          <text x="335" y="30" fill="#94a3b8" font-family="sans-serif" font-weight="bold" font-size="14">LIGHTING BAY [OFF]</text>
          <rect x="530" y="15" width="50" height="40" rx="4" fill="#64748b"/>
          <text x="540" y="40" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">OFF</text>
        </g>

        <!-- Breaker Row 3 -->
        <g transform="translate(100, 310)">
          <rect width="280" height="70" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
          <text x="15" y="40" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="14">PUMP STATION [ON]</text>
          <rect x="210" y="15" width="50" height="40" rx="4" fill="#10b981"/>
          <text x="220" y="40" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">ON</text>

          <rect x="320" width="280" height="70" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
          <text x="335" y="40" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="14">OUTLETS B [ON]</text>
          <rect x="530" y="15" width="50" height="40" rx="4" fill="#10b981"/>
          <text x="540" y="40" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">ON</text>
        </g>

        <!-- Conduit & Loose grounding wire at bottom -->
        <path d="M 120 400 L 120 500 Q 150 520 250 510 L 400 510" fill="none" stroke="#64748b" stroke-width="12" stroke-linecap="round"/>
        <!-- Loose wire fraying -->
        <path d="M 400 510 C 430 500, 470 540, 520 515" fill="none" stroke="#eab308" stroke-width="6" stroke-dasharray="8 4"/>
        <circle cx="520" cy="515" r="5" fill="#eab308" filter="url(#glow)"/>
        <text x="440" y="550" fill="#eab308" font-family="monospace" font-size="12" font-weight="bold">⚠️ EXPOSED GROUND WIRE</text>
      </svg>
    `),
  },
  {
    id: 'understand-object',
    category: 'Understand an Object',
    title: 'High-Pressure Cryogenic Regulating Valve',
    shortDesc: 'Dual-port flange valve with analog pressure gauge at 4.8 bar and warning seal.',
    promptHint: 'Identify this industrial valve assembly, analyze the gauge reading, and explain its operating state.',
    suggestedQuestions: [
      'What specific type of valve mechanism is this?',
      'Is 4.8 bar in the normal operating range or overpressure?',
      'How does the manual bypass handle work in an emergency?',
    ],
    imageSvg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="50%" stop-color="#334155"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <linearGradient id="gaugeFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="#0b1120"/>
        
        <!-- Pipe Flanges Left and Right -->
        <rect x="60" y="320" width="220" height="90" rx="8" fill="url(#metalGrad)" stroke="#94a3b8" stroke-width="3"/>
        <rect x="520" y="320" width="220" height="90" rx="8" fill="url(#metalGrad)" stroke="#94a3b8" stroke-width="3"/>
        <!-- Central Valve Body -->
        <rect x="280" y="270" width="240" height="190" rx="20" fill="url(#metalGrad)" stroke="#38bdf8" stroke-width="4"/>

        <!-- Flow arrows -->
        <path d="M 120 365 L 200 365 M 180 350 L 200 365 L 180 380" stroke="#38bdf8" stroke-width="4" fill="none"/>
        <text x="110" y="340" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">INLET FLOW →</text>

        <!-- Valve Stem and Handwheel -->
        <rect x="375" y="160" width="50" height="110" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
        <ellipse cx="400" cy="150" rx="110" ry="24" fill="#dc2626" stroke="#991b1b" stroke-width="4"/>
        <text x="350" y="155" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="13">SHUT OFF ↺</text>

        <!-- Pressure Gauge Assembly -->
        <rect x="500" y="130" width="16" height="70" fill="#94a3b8"/>
        <circle cx="508" cy="110" r="65" fill="url(#gaugeFace)" stroke="#0284c7" stroke-width="6"/>
        <circle cx="508" cy="110" r="4" fill="#0f172a"/>
        <!-- Gauge markings -->
        <path d="M 460 110 A 48 48 0 0 1 556 110" fill="none" stroke="#94a3b8" stroke-width="4" stroke-dasharray="3 6"/>
        <path d="M 508 110 L 535 85" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        <text x="475" y="135" fill="#0f172a" font-family="sans-serif" font-size="12" font-weight="bold">4.8 BAR</text>
        <text x="475" y="150" fill="#64748b" font-family="sans-serif" font-size="9">HIGH ZONE</text>

        <!-- Tag / Calibration label -->
        <rect x="330" y="370" width="140" height="50" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
        <text x="340" y="390" fill="#854d0e" font-family="monospace" font-size="10" font-weight="bold">MODEL: CRYO-VL-90</text>
        <text x="340" y="408" fill="#854d0e" font-family="monospace" font-size="9">CAL: 2026-03 | MAX 6BAR</text>
      </svg>
    `),
  },
  {
    id: 'safety-observation',
    category: 'Safety Observation',
    title: 'Wet Stairwell with Damaged Ladder & Trailing Cord',
    shortDesc: 'Worksite walkway with water pooling near electrical cabling and unsecured ladder angle.',
    promptHint: 'Identify physical safety hazards, fall risks, and electrical hazards visible in this worksite image.',
    suggestedQuestions: [
      'What are the primary safety violations visible here?',
      'What could happen if someone stepped on the pooling water near the cable?',
      'What immediate actions should the safety officer order?',
    ],
    imageSvg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="stairGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#334155"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <linearGradient id="puddleGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0.3"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="#090d16"/>
        
        <!-- Stairs -->
        <polygon points="100,500 300,500 300,420 500,420 500,340 700,340 700,560 100,560" fill="url(#stairGrad)" stroke="#475569" stroke-width="2"/>

        <!-- Water puddle on landing -->
        <ellipse cx="260" cy="490" rx="140" ry="25" fill="url(#puddleGrad)"/>
        <text x="200" y="495" fill="#7dd3fc" font-family="sans-serif" font-size="12" font-style="italic">⚠️ Standing Water Puddle</text>

        <!-- Electric Extension Cord running across stairs and through water -->
        <path d="M 680 320 C 560 360, 480 390, 400 450 C 320 510, 240 480, 80 530" fill="none" stroke="#eab308" stroke-width="8" stroke-linecap="round"/>
        <text x="370" y="470" fill="#eab308" font-family="monospace" font-size="11" font-weight="bold">ACTIVE 120V CORD SUBMERGED IN PUDDLE</text>

        <!-- Propped, bent aluminum ladder -->
        <line x1="560" y1="120" x2="480" y2="420" stroke="#94a3b8" stroke-width="12" stroke-linecap="round"/>
        <line x1="620" y1="130" x2="540" y2="430" stroke="#94a3b8" stroke-width="12" stroke-linecap="round"/>
        <!-- Rungs (one bent) -->
        <line x1="550" y1="170" x2="605" y2="180" stroke="#94a3b8" stroke-width="6"/>
        <line x1="535" y1="220" x2="590" y2="230" stroke="#94a3b8" stroke-width="6"/>
        <!-- Bent rung -->
        <path d="M 520 270 Q 550 295 575 280" fill="none" stroke="#ef4444" stroke-width="8"/>
        <text x="590" y="285" fill="#ef4444" font-family="sans-serif" font-size="11" font-weight="bold">BENT RUNG</text>

        <line x1="505" y1="320" x2="560" y2="330" stroke="#94a3b8" stroke-width="6"/>
        <line x1="490" y1="370" x2="545" y2="380" stroke="#94a3b8" stroke-width="6"/>

        <!-- Caution tape torn on railing -->
        <rect x="80" y="240" width="180" height="20" fill="#facc15" transform="rotate(-25 150 240)"/>
        <text x="90" y="255" fill="#000000" font-family="sans-serif" font-size="10" font-weight="bold" transform="rotate(-25 150 240)">CAUTION / TORN TAPE</text>
      </svg>
    `),
  },
  {
    id: 'understand-diagram',
    category: 'Understand a Diagram',
    title: 'Distributed Cloud Architecture & Cache Flow',
    shortDesc: 'System topology showing edge CDN, API gateway, microservices, and Postgres replication.',
    promptHint: 'Analyze this system architecture diagram: identify data flow bottlenecks and single points of failure.',
    suggestedQuestions: [
      'Where is the potential bottleneck or single point of failure in this architecture?',
      'How does cache invalidation travel between Redis and the DB replicas?',
      'Explain this architecture simply for a non-technical executive.',
    ],
    imageSvg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <rect width="800" height="600" fill="#0f172a"/>
        <text x="40" y="50" fill="#38bdf8" font-family="sans-serif" font-size="20" font-weight="bold">CLOUD INFRASTRUCTURE: MULTI-REGION READ/WRITE</text>

        <!-- User Layer -->
        <rect x="50" y="100" width="130" height="60" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="75" y="135" fill="#f8fafc" font-family="sans-serif" font-weight="bold">Client Apps</text>

        <!-- CDN Layer -->
        <rect x="250" y="100" width="140" height="60" rx="8" fill="#1e293b" stroke="#818cf8" stroke-width="2"/>
        <text x="270" y="135" fill="#c7d2fe" font-family="sans-serif" font-weight="bold">Cloudflare CDN</text>

        <!-- Gateway -->
        <rect x="460" y="100" width="150" height="60" rx="8" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
        <text x="480" y="135" fill="#e9d5ff" font-family="sans-serif" font-weight="bold">API Gateway (k8s)</text>

        <!-- Microservices Layer -->
        <rect x="180" y="240" width="130" height="70" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
        <text x="200" y="275" fill="#a7f3d0" font-family="sans-serif" font-size="13" font-weight="bold">Auth Service</text>

        <rect x="350" y="240" width="130" height="70" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
        <text x="365" y="275" fill="#a7f3d0" font-family="sans-serif" font-size="13" font-weight="bold">Order Service</text>

        <rect x="520" y="240" width="130" height="70" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
        <text x="535" y="275" fill="#a7f3d0" font-family="sans-serif" font-size="13" font-weight="bold">Inventory Svc</text>

        <!-- Cache Layer -->
        <rect x="260" y="380" width="150" height="60" rx="8" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
        <text x="285" y="415" fill="#fca5a5" font-family="sans-serif" font-weight="bold">Redis Cluster</text>

        <!-- Database Primary & Replica -->
        <rect x="470" y="380" width="160" height="60" rx="8" fill="#1e293b" stroke="#0ea5e9" stroke-width="2"/>
        <text x="485" y="415" fill="#bae6fd" font-family="sans-serif" font-weight="bold">Postgres Primary (W)</text>

        <rect x="470" y="480" width="160" height="60" rx="8" fill="#1e293b" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="4 4"/>
        <text x="485" y="515" fill="#bae6fd" font-family="sans-serif" font-weight="bold">Postgres Read-Replica</text>

        <!-- Arrows connecting nodes -->
        <path d="M 180 130 L 250 130" stroke="#94a3b8" stroke-width="3" fill="none"/>
        <path d="M 390 130 L 460 130" stroke="#94a3b8" stroke-width="3" fill="none"/>
        <path d="M 535 160 L 535 200 L 245 200 L 245 240" stroke="#94a3b8" stroke-width="2" fill="none"/>
        <path d="M 535 160 L 535 240" stroke="#94a3b8" stroke-width="2" fill="none"/>
        <path d="M 535 160 L 535 200 L 585 200 L 585 240" stroke="#94a3b8" stroke-width="2" fill="none"/>
        <path d="M 415 310 L 335 380" stroke="#94a3b8" stroke-width="2" fill="none"/>
        <path d="M 415 310 L 550 380" stroke="#94a3b8" stroke-width="2" fill="none"/>
        <path d="M 550 440 L 550 480" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4 4" fill="none"/>
      </svg>
    `),
  },
  {
    id: 'explain-what-seeing',
    category: 'Explain What I’m Seeing',
    title: 'Smart Appliance Control Panel Displaying Error E-04',
    shortDesc: 'Digital washing appliance showing amber blinking code E-04 with drain pipe icon.',
    promptHint: 'Diagnose the appliance error code E-04 and tell the user what mechanical component needs checking.',
    suggestedQuestions: [
      'What does error code E-04 typically signify on modern dishwashers or washing machines?',
      'Can I fix this myself by clearing the filter trap, or is a pump replacement required?',
      'What should I inspect first before opening the machine?',
    ],
    imageSvg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <filter id="screenGlow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="800" height="600" fill="#18181b"/>
        
        <!-- Brushed steel appliance fascia -->
        <rect x="40" y="60" width="720" height="480" rx="16" fill="#27272a" stroke="#52525b" stroke-width="4"/>

        <!-- Digital LCD Screen -->
        <rect x="120" y="130" width="420" height="240" rx="12" fill="#09090b" stroke="#3f3f46" stroke-width="3"/>

        <!-- Glowing digital text -->
        <text x="160" y="240" fill="#f59e0b" font-family="monospace" font-size="64" font-weight="bold" filter="url(#screenGlow)">ERR: E-04</text>
        <text x="165" y="290" fill="#e4e4e7" font-family="sans-serif" font-size="18">DRAIN TIMEOUT / OVERFILL SENSOR</text>

        <!-- Blinking Water Drop & Pump Icon -->
        <g transform="translate(430, 160)">
          <path d="M 25 10 C 25 10, 45 40, 45 60 C 45 75, 35 85, 25 85 C 15 85, 5 75, 5 60 C 5 40, 25 10, 25 10 Z" fill="#ef4444" filter="url(#screenGlow)"/>
          <line x1="0" y1="95" x2="50" y2="95" stroke="#ef4444" stroke-width="4"/>
          <text x="-10" y="115" fill="#ef4444" font-family="monospace" font-size="12" font-weight="bold">CHECK DRAIN</text>
        </g>

        <!-- Power & Start Buttons on right -->
        <circle cx="640" cy="200" r="38" fill="#3f3f46" stroke="#71717a" stroke-width="3"/>
        <text x="618" y="206" fill="#f43f5e" font-family="sans-serif" font-size="18" font-weight="bold">START</text>

        <circle cx="640" cy="310" r="38" fill="#3f3f46" stroke="#71717a" stroke-width="3"/>
        <text x="615" y="316" fill="#10b981" font-family="sans-serif" font-size="18" font-weight="bold">POWER</text>

        <!-- Brand badge -->
        <text x="120" y="440" fill="#a1a1aa" font-family="sans-serif" font-size="16" font-weight="bold" letter-spacing="4">HYDROTECH PRO - SERIES 900</text>
        <text x="120" y="465" fill="#71717a" font-family="monospace" font-size="13">SERIAL NO. HT-982-EU-2025</text>
      </svg>
    `),
  },
];
