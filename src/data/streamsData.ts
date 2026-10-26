import { StreamDefinition } from '../types';

export const STREAMS_DATA: StreamDefinition[] = [
  {
    id: 'cse',
    name: 'Computer Science & Software Engineering',
    tagline: 'FAANG, Product, High-growth Startups & Service MNCs',
    iconName: 'Code2',
    description: 'Master core computer science fundamentals, DSA problem solving, system design architectures, live code walkthroughs, and HR behavioral fit.',
    categories: [
      'DSA & Problem Solving',
      'System Design (HLD & LLD)',
      'OOP & Design Patterns',
      'Operating Systems & Concurrency',
      'DBMS & SQL Optimization',
      'Computer Networks & Protocols',
      'Frontend & React Ecosystem',
      'Backend & Microservices',
      'AI/ML & Data Engineering',
      'DevOps, Docker & Cloud',
      'Resume Projects & Architectural Decisions',
      'HR Behavioral & STAR Situations'
    ],
    roles: [
      'Software Engineer (SDE I/II)',
      'Frontend Developer (React/Next)',
      'Backend Developer (Node/Python/Go)',
      'Full-Stack Developer',
      'Data Analyst',
      'AI/ML Engineer',
      'Cybersecurity Analyst',
      'Cloud / DevOps Engineer',
      'Mobile App Developer (Flutter/Android)',
      'Product Manager (Tech)'
    ],
    levels: ['Fresher / Campus (0-1 yr)', 'Early Career (1-3 yrs)', 'Mid-Senior (3+ yrs)'],
    bannerGradient: 'from-blue-600 via-indigo-600 to-purple-700',
    primaryMetric: 'Live Code & System Architecture Depth',
    overviewTips: [
      'Always clarify requirements and state time/space complexity before coding.',
      'Explain your thought process out loud rather than staying silent.',
      'For system design, start with estimates, high-level API design, database schema, and then bottle-neck mitigations.'
    ]
  },
  {
    id: 'architecture',
    name: 'Architecture & Spatial Design',
    tagline: 'B.Arch Admissions, NATA, Design Firms & Urban Planning',
    iconName: 'Compass',
    description: 'Prepare your architectural narrative, portfolio defense, sustainability rationale, structural mechanics, and design philosophies.',
    categories: [
      'Design Philosophy & Ideation',
      'Portfolio Defense & Critique',
      'B.Arch & NATA Entrance Logic',
      'Building Materials & Vernacular Tech',
      'Sustainable & Bioclimatic Architecture',
      'Structural Systems & Loads',
      'Architectural History & Movements',
      'Urban Planning & Transit Design',
      'Landscape Architecture & Site Ecology',
      'CAD, BIM, Revit & Parametric Rhino'
    ],
    roles: [
      'B.Arch Admission Candidate',
      'Architecture Portfolio Candidate',
      'Junior Architect (Firm Hire)',
      'Landscape Architecture Aspirant',
      'Interior Design Aspirant',
      'Urban Planning Aspirant',
      'NATA / JEE Main Paper 2A Candidate'
    ],
    levels: ['Admission Aspirant', 'Undergrad / Fresher Intern', 'Practicing Architect (2+ yrs)'],
    bannerGradient: 'from-amber-600 via-orange-600 to-rose-700',
    primaryMetric: 'Spatial Reasoning & Sustainable Material Logic',
    overviewTips: [
      'Be ready to sketch and justify design choices from climate, orientation, and user ergonomics.',
      'Know the tectonic and material specifications of at least two of your signature portfolio projects.',
      'Understand vernacular Indian architecture principles (e.g. Laurie Baker, Charles Correa, B.V. Doshi).'
    ]
  },
  {
    id: 'upsc_nda',
    name: 'UPSC Civil Services & NDA (SSB)',
    tagline: 'Personality Test Board, DAF, Current Affairs & SSB OLQ Interview',
    iconName: 'ShieldCheck',
    description: 'Excel in high-stakes personality evaluations. Defend your DAF, handle controversial national policies with neutrality, and demonstrate Officer-Like Qualities (OLQ).',
    categories: [
      'DAF (Detailed Application Form) & Hometown',
      'Ethics, Integrity & Dilemmas (GS-IV)',
      'National Policy & Geopolitics',
      'Law & Order Crisis Management (IPS/IAS)',
      'SSB Personal Interview & Motivation',
      'SSB Psychological Battery (TAT/WAT/SRT)',
      'Officer-Like Qualities (OLQ) Assessment',
      'Defence Tech & Strategic Affairs (NDA/CDS)',
      'Indian Economy & Socio-economic Welfare',
      'Handling Controversial & Stress Questions'
    ],
    roles: [
      'UPSC Personality Test Candidate (Civil Services)',
      'IAS Preparation Path (District Governance)',
      'IPS Preparation Path (Police & Internal Security)',
      'IFS Preparation Path (Diplomacy & Foreign Affairs)',
      'NDA Written & SSB Candidate',
      'SSB Interview Candidate (Army/Navy/Air Force)'
    ],
    levels: ['UPSC Mains Cleared', 'NDA/CDS SSB Call-letter Holder', 'Civil Services Aspirant'],
    bannerGradient: 'from-emerald-600 via-teal-700 to-indigo-900',
    primaryMetric: 'Balanced Judgment, Integrity & Officer Demeanor',
    overviewTips: [
      'Never argue with the Board or Interviewing Officer; hold balanced views and acknowledge multiple perspectives.',
      'If you do not know a factual data point, politely admit it with "Sir, I am unable to recall right now" rather than bluffing.',
      'For SSB, embody the 15 OLQs: Effective Intelligence, Initiative, Courage, Stamina, and Cooperation.'
    ]
  }
];
