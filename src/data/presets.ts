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

export const TRANSFORM_PRESETS: {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  userRequest: string;
  imageSvg: string;
  suggestedRefinements: string[];
}[] = [
  {
    id: 'transform-tv-credenza',
    title: 'Living Room TV & Credenza Display',
    category: 'Living Room & Decor',
    shortDesc: 'TV credenza with overlapping souvenirs, medals, tangled cables, and mismatched plants.',
    userRequest: 'Rearrange the decorations to make it cleaner, more balanced, and reduce the visual clutter.',
    suggestedRefinements: [
      'Make it more minimal with only 1 plant and no awards.',
      'Group the small items on a decorative tray on the left.',
      'Keep the flowers where they are but rearrange everything else.',
    ],
    imageSvg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="wallBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2a2e39"/>
            <stop offset="100%" stop-color="#181b22"/>
          </linearGradient>
          <linearGradient id="woodCredenza" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#8d5b36"/>
            <stop offset="50%" stop-color="#a4693f"/>
            <stop offset="100%" stop-color="#734727"/>
          </linearGradient>
        </defs>
        <!-- Room Wall & Baseboard -->
        <rect width="800" height="600" fill="url(#wallBg)"/>
        <rect x="0" y="520" width="800" height="80" fill="#111317"/>
        <line x1="0" y1="520" x2="800" y2="520" stroke="#373d4d" stroke-width="4"/>

        <!-- Wall TV Display in center -->
        <rect x="220" y="70" width="360" height="210" rx="6" fill="#090a0d" stroke="#4a5568" stroke-width="6"/>
        <rect x="235" y="85" width="330" height="180" fill="#1a202c"/>
        <text x="320" y="180" fill="#4a5568" font-family="sans-serif" font-size="14" font-weight="bold">OLED TV (WALL MOUNTED)</text>

        <!-- Wooden Credenza Furniture -->
        <rect x="100" y="340" width="600" height="170" rx="8" fill="url(#woodCredenza)" stroke="#523218" stroke-width="3"/>
        <line x1="300" y1="350" x2="300" y2="500" stroke="#523218" stroke-width="2"/>
        <line x1="500" y1="350" x2="500" y2="500" stroke="#523218" stroke-width="2"/>
        <!-- Credenza legs -->
        <rect x="130" y="510" width="16" height="30" fill="#2d1b0c"/>
        <rect x="654" y="510" width="16" height="30" fill="#2d1b0c"/>

        <!-- Cluttered decorations ON the credenza surface (Y: 270-340) -->
        <!-- Tangled wires under TV -->
        <path d="M 400 280 Q 370 330 380 340 T 420 345 T 450 338" fill="none" stroke="#2d3748" stroke-width="4"/>
        <path d="M 390 280 Q 420 320 405 342" fill="none" stroke="#4a5568" stroke-width="3"/>

        <!-- Left side clutter: 3 mismatched trophies & stacked books -->
        <polygon points="130,340 145,280 160,340" fill="#d97706" stroke="#b45309" stroke-width="2"/>
        <circle cx="145" cy="275" r="12" fill="#fbbf24"/>
        <polygon points="170,340 182,295 194,340" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
        <rect x="210" y="315" width="65" height="25" rx="3" fill="#3b82f6" transform="rotate(-6 210 315)"/>
        <rect x="205" y="300" width="60" height="20" rx="3" fill="#ef4444" transform="rotate(4 205 300)"/>

        <!-- Center: flower vase blocking TV bottom edge -->
        <rect x="365" y="270" width="35" height="70" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
        <circle cx="370" cy="250" r="16" fill="#f43f5e"/>
        <circle cx="395" cy="245" r="18" fill="#fb7185"/>
        <circle cx="382" cy="230" r="14" fill="#fda4af"/>
        <text x="310" y="260" fill="#f87171" font-family="sans-serif" font-size="10" font-weight="bold">⚠️ BLOCKS SCREEN</text>

        <!-- Right side clutter: 2 plants overlapping, random gaming controller & mug -->
        <ellipse cx="560" cy="335" rx="28" ry="10" fill="#92400e"/>
        <path d="M 545 330 Q 520 280 500 290 Q 535 310 545 330" fill="#15803d"/>
        <path d="M 565 330 Q 575 270 595 285 Q 575 310 565 330" fill="#16a34a"/>
        <!-- Second plant overlapping -->
        <rect x="610" y="290" width="40" height="50" rx="4" fill="#e2e8f0"/>
        <circle cx="630" cy="275" r="22" fill="#22c55e"/>
        <!-- Loose coffee mug & loose game controller -->
        <rect x="470" y="320" width="22" height="20" rx="3" fill="#ffffff"/>
        <rect x="500" y="325" width="35" height="15" rx="4" fill="#1e293b"/>
      </svg>
    `),
  },
  {
    id: 'transform-cluttered-desk',
    title: 'Cluttered Work & Study Desk',
    category: 'Home Office & Study',
    shortDesc: 'Desk surface crowded with scattered papers, loose cables, mugs, stationery, and off-center screen.',
    userRequest: 'Organize the desk into a clean, minimalist setup with tucked cables and maximized work surface.',
    suggestedRefinements: [
      'Create a minimalist arrangement with only the laptop and a warm lamp.',
      'Keep the mechanical keyboard and mouse, but tuck all cables.',
      'Make the desk look more spacious and open.',
    ],
    imageSvg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <rect width="800" height="600" fill="#1e222a"/>
        <!-- Window on left -->
        <rect x="40" y="40" width="160" height="240" rx="6" fill="#2d3748" stroke="#4a5568" stroke-width="4"/>
        <line x1="120" y1="40" x2="120" y2="280" stroke="#4a5568" stroke-width="3"/>
        <line x1="40" y1="160" x2="200" y2="160" stroke="#4a5568" stroke-width="3"/>

        <!-- Desk Surface -->
        <polygon points="60,320 740,320 780,540 20,540" fill="#cbd5e1" stroke="#94a3b8" stroke-width="3"/>

        <!-- Monitor placed crookedly to the right -->
        <rect x="420" y="110" width="280" height="180" rx="8" fill="#0f172a" stroke="#334155" stroke-width="4" transform="rotate(-3 560 200)"/>
        <rect x="545" y="285" width="30" height="45" fill="#475569"/>
        <ellipse cx="560" cy="330" rx="45" ry="12" fill="#334155"/>

        <!-- Desk Clutter: Loose papers, tangled wires, pen holder knocked over, mugs -->
        <!-- Tangled cables across center -->
        <path d="M 540 310 C 450 380, 480 440, 360 410 C 260 380, 290 460, 200 480" fill="none" stroke="#eab308" stroke-width="5"/>
        <path d="M 560 320 C 500 400, 380 430, 420 500" fill="none" stroke="#ef4444" stroke-width="3"/>

        <!-- Scattered documents -->
        <rect x="180" y="360" width="110" height="130" fill="#ffffff" stroke="#cbd5e1" transform="rotate(-15 180 360)"/>
        <rect x="230" y="380" width="100" height="120" fill="#f8fafc" stroke="#cbd5e1" transform="rotate(8 230 380)"/>
        <rect x="280" y="370" width="120" height="90" fill="#fef08a" stroke="#eab308" transform="rotate(22 280 370)"/>

        <!-- Knocked pens & sticky notes -->
        <line x1="130" y1="440" x2="175" y2="470" stroke="#3b82f6" stroke-width="5" stroke-linecap="round"/>
        <line x1="140" y1="470" x2="190" y2="455" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>

        <!-- Two coffee mugs with stains -->
        <circle cx="390" cy="460" r="18" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
        <circle cx="390" cy="460" r="14" fill="#78350f"/>
        <circle cx="430" cy="445" r="16" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
        
        <!-- Laptop pushed to the left edge awkwardly -->
        <rect x="80" y="330" width="140" height="95" rx="4" fill="#64748b" transform="rotate(12 80 330)"/>
      </svg>
    `),
  },
  {
    id: 'transform-bookshelf',
    title: 'Overcrowded Bookshelf & Library Unit',
    category: 'Storage & Bookshelves',
    shortDesc: 'Shelves jammed with slanting book piles, stuffed documents, fallen frames, and visual imbalance.',
    userRequest: 'Make the bookshelf more organized, group items with breathing room, and create an aesthetic rhythm.',
    suggestedRefinements: [
      'Organize books by vertical color groups.',
      'Dedicate the middle shelf to art objects and plants with negative space.',
      'Remove all paper clutter and folders to lower storage boxes.',
    ],
    imageSvg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <rect width="800" height="600" fill="#18181b"/>
        <!-- Main wooden bookshelf frame -->
        <rect x="120" y="40" width="560" height="520" rx="8" fill="#27272a" stroke="#52525b" stroke-width="6"/>
        <!-- Shelf 1, 2, 3 dividers -->
        <line x1="120" y1="180" x2="680" y2="180" stroke="#52525b" stroke-width="8"/>
        <line x1="120" y1="330" x2="680" y2="330" stroke="#52525b" stroke-width="8"/>
        <line x1="120" y1="460" x2="680" y2="460" stroke="#52525b" stroke-width="8"/>

        <!-- Shelf 1 (Top): Overstuffed books leaning dangerously -->
        <rect x="150" y="70" width="22" height="106" fill="#dc2626"/>
        <rect x="174" y="65" width="24" height="111" fill="#ea580c"/>
        <rect x="200" y="75" width="20" height="101" fill="#ca8a04"/>
        <rect x="222" y="80" width="30" height="96" fill="#16a34a" transform="rotate(14 222 176)"/>
        <rect x="260" y="90" width="25" height="86" fill="#2563eb" transform="rotate(22 260 176)"/>
        <text x="320" y="110" fill="#f87171" font-family="sans-serif" font-size="11" font-weight="bold">⚠️ DANGEROUS LEAN</text>

        <!-- Shelf 1 Right: Piles of horizontal books shoved in -->
        <rect x="480" y="145" width="160" height="30" rx="3" fill="#3b82f6"/>
        <rect x="490" y="118" width="140" height="25" rx="3" fill="#8b5cf6"/>
        <rect x="505" y="95" width="120" height="22" rx="3" fill="#ec4899"/>
        <rect x="520" y="75" width="90" height="18" rx="3" fill="#10b981"/>

        <!-- Shelf 2 (Middle): Crooked photo frame & tangled power cord -->
        <rect x="180" y="210" width="90" height="110" rx="4" fill="#3f3f46" stroke="#fbbf24" stroke-width="3" transform="rotate(-18 180 210)"/>
        <path d="M 320 326 C 360 270, 420 340, 480 280 C 510 250, 560 330, 620 326" fill="none" stroke="#f59e0b" stroke-width="4"/>

        <!-- Shelf 3: Scattered folders & magazines hanging off edge -->
        <rect x="160" y="360" width="70" height="95" fill="#f43f5e" transform="rotate(8 160 360)"/>
        <rect x="240" y="355" width="80" height="100" fill="#0284c7" transform="rotate(-6 240 355)"/>
        <rect x="440" y="390" width="200" height="65" rx="4" fill="#a1a1aa"/>
        <rect x="420" y="420" width="140" height="55" rx="3" fill="#e4e4e7" transform="rotate(5 420 420)"/>
      </svg>
    `),
  },
  {
    id: 'transform-kitchen-island',
    title: 'Kitchen Prep Island & Counter',
    category: 'Kitchen & Dining',
    shortDesc: 'Kitchen island crowded with bulky appliances, unorganized condiments, open cereal boxes, and cutting boards.',
    userRequest: 'Clear the main prep counter, group cooking oils onto a tray, and create a clean spacious aesthetic.',
    suggestedRefinements: [
      'Store bulky blender into cabinetry to clear counter space.',
      'Create a dedicated fruit and condiment focal point on the left.',
      'Make the kitchen look more spacious and inviting.',
    ],
    imageSvg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <rect width="800" height="600" fill="#1c1917"/>
        <!-- Kitchen tiled backsplash -->
        <rect x="0" y="0" width="800" height="300" fill="#292524"/>
        <line x1="0" y1="100" x2="800" y2="100" stroke="#44403c" stroke-width="2"/>
        <line x1="0" y1="200" x2="800" y2="200" stroke="#44403c" stroke-width="2"/>

        <!-- Marble Countertop Surface -->
        <polygon points="40,290 760,290 800,530 0,530" fill="#e7e5e4" stroke="#a8a29e" stroke-width="3"/>
        <rect x="0" y="530" width="800" height="70" fill="#0c0a09"/>

        <!-- Counter clutter -->
        <!-- Giant blender right in center -->
        <rect x="360" y="160" width="70" height="110" rx="8" fill="#44403c" stroke="#78716c" stroke-width="2"/>
        <rect x="345" y="270" width="100" height="60" rx="10" fill="#1c1917" stroke="#78716c" stroke-width="3"/>

        <!-- Multiple cutting boards lying flat eating space -->
        <rect x="180" y="330" width="160" height="110" rx="6" fill="#b45309" stroke="#78350f" stroke-width="2" transform="rotate(-12 180 330)"/>
        
        <!-- Random jars & bottles scattered -->
        <rect x="100" y="320" width="30" height="70" rx="4" fill="#15803d"/>
        <rect x="135" y="340" width="25" height="55" rx="4" fill="#b91c1c"/>
        <rect x="480" y="320" width="35" height="75" rx="5" fill="#ca8a04"/>
        <rect x="525" y="335" width="28" height="65" rx="4" fill="#0284c7"/>
        <circle cx="580" cy="355" r="22" fill="#f59e0b"/>
        <circle cx="615" cy="370" r="18" fill="#ea580c"/>
        <!-- Open bread bag & toaster with cord hanging -->
        <rect x="620" y="220" width="110" height="85" rx="6" fill="#78716c"/>
        <path d="M 640 305 Q 610 380 670 410" fill="none" stroke="#000000" stroke-width="4"/>
      </svg>
    `),
  },
];

