import { QuestionItem } from '../types';

export const QUESTIONS_SEED: QuestionItem[] = [
  // ===================== CSE STREAM =====================
  {
    id: 'cse-1',
    streamId: 'cse',
    category: 'DSA & Problem Solving',
    difficulty: 'Medium',
    frequency: 'Very common',
    question: 'How would you detect a cycle in a singly linked list, and how do you find the exact node where the cycle begins?',
    idealOutline: [
      'Mention Floyd’s Tortoise and Hare (Cycle-Finding) algorithm with O(N) time and O(1) space.',
      'Explain two pointers (slow moving 1 step, fast moving 2 steps). If they meet, a cycle exists.',
      'Derive mathematically why resetting one pointer to head and moving both at 1 step brings them together at cycle start.',
      'Mention the alternative HashSet approach (O(N) space) and why the two-pointer approach is superior.'
    ],
    keyPoints: [
      'Floyd’s Cycle Detection has O(1) auxiliary space.',
      'Fast pointer moves 2x the speed of slow.',
      'Distance formula: L1 + k*C + d = 2*(L1 + d).'
    ],
    commonMistakes: [
      'Forgetting null checks on fast and fast.next.',
      'Not knowing the mathematical justification for finding the cycle entry point.'
    ],
    sampleAnswer: 'To detect a cycle with optimal memory, I would use Floyd’s Cycle Detection algorithm. We initialize two pointers, slow and fast, at the head. Slow advances by 1 node while fast advances by 2. If fast or fast.next reaches null, the list is acyclic. If slow and fast meet, a cycle is confirmed. To find the origin node of the loop, we leave slow at the meeting point and reset fast to head. Then, we advance both at a pace of 1 node per iteration. The exact node where they collide again is the start of the cycle, which takes O(N) time and strictly O(1) auxiliary space.'
  },
  {
    id: 'cse-2',
    streamId: 'cse',
    category: 'System Design (HLD & LLD)',
    difficulty: 'Hard',
    frequency: 'Very common',
    question: 'Design a scalable URL shortening service like TinyURL capable of handling 500 million links per month.',
    idealOutline: [
      'Clarify functional & non-functional requirements (read vs write ratios, latency, 7-character hash, 99.99% availability).',
      'Capacity estimation: write QPS (~200 writes/sec), read QPS (~2,000 reads/sec), 5-year storage estimates.',
      'API signatures: createShortUrl(longUrl, customAlias, expiry) & getLongUrl(shortUrl).',
      'Encoding strategy: Base62 encoding on 64-bit auto-incrementing ID vs MD5/SHA256 truncation with collision resolution.',
      'Architecture: Load Balancer, Web/API servers, Distributed Key Generation Service (KGS) via ZooKeeper, Redis Cache, NoSQL/Cassandra or Partitioned Relational DB.'
    ],
    keyPoints: [
      'Base62 encoding (a-z, A-Z, 0-9) yields 62^7 = 3.5 trillion unique combinations.',
      'Read-heavy system: 10:1 or 100:1 read-to-write ratio requires distributed caching (Redis/Memcached).',
      'Pre-generating keys using a Key Generation Service eliminates runtime collisions.'
    ],
    commonMistakes: [
      'Using pure MD5/SHA-256 and running into hashing collisions without an avoidance strategy.',
      'Neglecting caching or failing to explain how redirects (301 Permanent vs 302 Temporary for analytics) work.'
    ],
    sampleAnswer: 'TinyURL is inherently a read-heavy system with roughly a 10:1 or 20:1 read-to-write ratio. For 500M writes/month, we require ~200 writes/sec and ~2,000 reads/sec. I would design the short link using 7 characters of Base62 encoding, giving over 3.5 trillion unique combinations. Rather than hashing long URLs on the fly which risks collisions, I would use a standalone Key Generation Service (KGS) backed by Apache ZooKeeper to pre-generate and vend unique sequential IDs in batches to app servers. We store mapping records in DynamoDB or Cassandra due to high key-value read throughput, fronted by a Redis distributed cache with an LRU eviction policy to serve hot URLs with sub-10ms latency. For HTTP responses, we return a 302 Found redirect to capture click analytics.'
  },
  {
    id: 'cse-3',
    streamId: 'cse',
    category: 'DBMS & SQL Optimization',
    difficulty: 'Medium',
    frequency: 'Very common',
    question: 'What is database indexing, how do B+ Trees work under the hood, and when can an index actually degrade performance?',
    idealOutline: [
      'Define an index as an auxiliary data structure that reduces disk I/O operations from full table scans to logarithmic lookups.',
      'Explain B+ Tree architecture: balanced tree, all data records/pointers stored solely in leaf nodes, internal nodes contain only routing keys.',
      'Highlight leaf node linked-list pointers enabling rapid sequential range scans.',
      'Explain trade-offs: write amplification (INSERT/UPDATE/DELETE overhead), storage costs, and index fragmentation.'
    ],
    keyPoints: [
      'B+ Trees guarantee O(log N) depth and minimize disk page reads.',
      'Leaves are linked horizontally for efficient BETWEEN / range queries.',
      'Indexes slow down write operations because every insertion requires index tree rebalancing and page splits.'
    ],
    commonMistakes: [
      'Thinking B-trees and B+ trees are identical (B-trees store values in internal nodes too).',
      'Over-indexing write-heavy tables.'
    ],
    sampleAnswer: 'An index is an auxiliary data structure that acts as a lookup directory to prevent sequential disk scans. Most relational databases like PostgreSQL and MySQL InnoDB use B+ Trees for indexing. In a B+ Tree, internal nodes only store navigation keys and child page pointers, while actual row pointers and data reside exclusively in the leaf nodes. Furthermore, all leaf nodes are linked sequentially in a doubly-linked list, which makes range queries like BETWEEN or ORDER BY extremely fast. However, indexes degrade performance in write-heavy systems: every INSERT, UPDATE, or DELETE operation incurs write amplification, forcing the engine to traverse, rebalance, and potentially split index pages, while also consuming substantial disk and RAM buffer pool space.'
  },
  {
    id: 'cse-4',
    streamId: 'cse',
    category: 'Operating Systems & Concurrency',
    difficulty: 'Hard',
    frequency: 'Common',
    question: 'Explain the difference between a Process and a Thread, and describe what happens during a CPU Context Switch.',
    idealOutline: [
      'Process: independent execution unit with its own virtual address space (code, data, heap, stack, file descriptors).',
      'Thread: lightweight execution unit inside a process, sharing memory address space, heap, and open files, but having its own PC, registers, and stack.',
      'Context Switch: OS halts one process/thread, saves its execution state (Registers, Program Counter, PCB/TCB), and restores another.',
      'Cost: TLB (Translation Lookaside Buffer) flush for inter-process switch, CPU cache misses, kernel mode transitions.'
    ],
    keyPoints: [
      'Threads share memory; processes are isolated for fault tolerance.',
      'Thread context switch is faster because virtual memory mapping and TLB do not need invalidation.'
    ],
    commonMistakes: [
      'Claiming threads have completely separate memory spaces.',
      'Failing to mention TLB invalidation and cache invalidation as the true performance penalty of process switching.'
    ],
    sampleAnswer: 'A process is an isolated instance of an executing program with its own dedicated virtual address space, containing its code, heap, data segments, and file descriptors. A thread is the smallest schedulable execution entity within that process; multiple threads in the same process share the same heap and code segment, but retain their own program counter, CPU registers, and call stack. During a context switch, the OS preempts the running thread, saves its state into its Process Control Block (PCB) or Thread Control Block (TCB), updates scheduler queues, and loads the target context. A process switch is considerably more expensive than a thread switch because switching between processes necessitates flushing the Translation Lookaside Buffer (TLB), leading to significant CPU cache misses upon resumption.'
  },
  {
    id: 'cse-5',
    streamId: 'cse',
    category: 'Frontend & React Ecosystem',
    difficulty: 'Medium',
    frequency: 'Very common',
    question: 'How does React’s reconciliation algorithm and Virtual DOM work, and what is the role of the "key" prop?',
    idealOutline: [
      'Virtual DOM as an in-memory lightweight representation of the actual DOM.',
      'Reconciliation process (Diffing): React Fiber tree comparison in O(N) heuristic time instead of O(N^3).',
      'Heuristics: two elements of different types produce different trees; keys identify stable items across re-renders.',
      'Key prop role: allows React to track elements during array mutations (insert, reorder, delete) without unnecessary DOM destruction and recreation.'
    ],
    keyPoints: [
      'Fiber engine enables cooperative, interruptible chunk rendering.',
      'Keys must be unique and persistent among siblings; never use index when arrays can be reordered.'
    ],
    commonMistakes: [
      'Using Math.random() or array index for dynamic list keys, causing state loss and uncontrolled re-renders.'
    ],
    sampleAnswer: 'React maintains a Virtual DOM, which is a lightweight JavaScript tree representing the intended UI state. When state or props change, React generates a new Virtual DOM tree and runs a diffing algorithm called reconciliation to compute the minimal set of real DOM mutations. With the React Fiber architecture, this diffing operates heuristically in O(N) time based on assumptions like distinct element types producing distinct subtrees. The "key" prop is crucial here: it provides a stable identity for array items across render passes. Without unique keys—or when using array indices on mutable lists—React cannot reliably determine if an item was merely shifted or altered, resulting in redundant re-mounts, loss of local component state, and degraded UI responsiveness.'
  },
  {
    id: 'cse-6',
    streamId: 'cse',
    category: 'Computer Networks & Protocols',
    difficulty: 'Medium',
    frequency: 'Common',
    question: 'Describe what happens end-to-end when a user types "https://www.google.com" into the browser and presses Enter.',
    idealOutline: [
      'Browser URL parsing & HSTS check.',
      'DNS Resolution: Browser cache -> OS cache -> Router -> ISP Resolver -> Root -> TLD (.com) -> Authoritative Nameserver.',
      'TCP 3-way Handshake (SYN, SYN-ACK, ACK).',
      'TLS 1.3 Handshake (Client Hello, Server Certificate, Key Exchange via Diffie-Hellman, Session Keys).',
      'HTTP/2 or HTTP/3 GET Request sent over encrypted tunnel.',
      'Server processing: Reverse proxy (Nginx/Envoy) -> Application server -> Response 200 OK.',
      'Browser Rendering: HTML parse -> DOM tree, CSS parse -> CSSOM, Render tree creation, Layout (Reflow), Paint.'
    ],
    keyPoints: [
      'DNS caching at multiple layers reduces latency.',
      'TLS 1.3 completes in 1-RTT (or 0-RTT for resumed connections).',
      'Critical Rendering Path: DOM + CSSOM = Render Tree -> Layout -> Paint.'
    ],
    commonMistakes: [
      'Jumping straight to HTTP without mentioning DNS resolution or the TCP/TLS handshakes.',
      'Skipping the browser rendering engine stages.'
    ],
    sampleAnswer: 'First, the browser checks its local cache and HSTS policy, then initiates DNS resolution traversing the browser cache, OS resolver, local router, and ISP recursive resolver down to the root, TLD, and authoritative nameserver to resolve the IP address. Next, a TCP 3-way handshake (SYN, SYN-ACK, ACK) is established. Immediately following, a TLS 1.3 handshake negotiates cryptographic ciphers and establishes symmetric session keys via Elliptic Curve Diffie-Hellman. The browser then transmits an encrypted HTTP GET request. The server-side load balancer and reverse proxy route this to the application service, which responds with HTML. The browser engine parses the HTML to construct the DOM tree and parses CSS to build the CSSOM. Combining these forms the Render Tree, followed by the Layout phase (calculating exact pixel coordinates) and the Paint phase, which composites pixels onto the GPU display buffer.'
  },

  // ===================== ARCHITECTURE STREAM =====================
  {
    id: 'arch-1',
    streamId: 'architecture',
    category: 'Sustainable & Bioclimatic Architecture',
    difficulty: 'Medium',
    frequency: 'Very common',
    question: 'How do you design a passive solar building for a composite climate like New Delhi or Central India?',
    idealOutline: [
      'Analyze climate characteristics: extreme hot dry summers, cold winters, and brief humid monsoon.',
      'Orientation and Form: Orient primary facade along the North-South axis to minimize harsh East-West radiation.',
      'Fenestration and Shading: Deep overhangs (chhajjas), louvers, double glazing with low-e coatings, courtyards for stack ventilation.',
      'Thermal mass: Thick fly-ash brick or rammed earth walls to delay peak heat transfer until cooler evening hours.',
      'Water and vegetation: Evaporative cooling through water bodies and strategic deciduous trees providing winter sun and summer shade.'
    ],
    keyPoints: [
      'North-South solar orientation reduces solar heat gain by up to 40%.',
      'Courtyard effect creates natural thermal buoyancy (stack effect).',
      'High thermal mass stabilizes indoor diurnal temperature swings.'
    ],
    commonMistakes: [
      'Proposing extensive glass curtain walls facing West without shading.',
      'Focusing purely on active HVAC rather than envelope-first passive strategies.'
    ],
    sampleAnswer: 'In a composite Indian climate like New Delhi with scorching summers and chilly winters, passive solar design must balance seasonal extremes. First, I would orient the longest axis East-West, ensuring that the primary facades face North and South. South-facing windows receive high-angle summer sun that can be blocked with calculated horizontal overhangs (chhajjas), while admitting low-angle winter sunlight for passive heating. West and East facades should have minimal glazing or be protected by vertical solar louvers. To address summer heat, I would integrate a central courtyard, leveraging the stack effect where hot air rises and escapes through upper clerestory vents, pulling cooler air across shaded ground-floor water bodies or courtyards. High thermal mass materials like compressed earth blocks or cavity brick walls retard heat transfer, keeping the indoor environment temperate.'
  },
  {
    id: 'arch-2',
    streamId: 'architecture',
    category: 'Design Philosophy & Ideation',
    difficulty: 'Hard',
    frequency: 'Very common',
    question: 'How do you interpret B.V. Doshi or Charles Correa’s approach to modernism in the Indian context in your own portfolio?',
    idealOutline: [
      'Define the essence of Indian modernism: contextualism, open-to-sky spaces, transition spaces (verandahs, otlas, jaalis).',
      'Cite Charles Correa’s "Incremental Housing" (Belapur) or Bharat Bhavan, and B.V. Doshi’s Aranya Low Cost Housing or Sangath.',
      'Connect to your own project: explain how you handled circulation, climate, and community interaction without merely mimicking Western glass-box modernism.'
    ],
    keyPoints: [
      'Correa’s concept of "Open to Sky space" as a fundamental resource.',
      'Doshi’s Sangath: vaulted forms, mosaic broken chinaware for solar reflectivity, subterranean cooling.',
      'Architecture as community catalyst rather than an isolated sculptural object.'
    ],
    commonMistakes: [
      'Treating Indian vernacular as merely decorative motifs (like superficial arches) instead of spatial and climatic wisdom.'
    ],
    sampleAnswer: 'Both B.V. Doshi and Charles Correa taught us that authentic modernism in India must be rooted in climatic realism and social democracy, rather than copying Western glass idioms. Correa championed the "open-to-sky space" and the threshold—the verandah and otla—as living extensions of the home, as demonstrated in his Belapur housing. Doshi, in Sangath and Aranya, demonstrated how architecture can breathe with the earth using vaulted forms, subterranean massing, and broken ceramic tile mosaics for solar reflectance. In my own portfolio project, a community cultural center, I incorporated these principles by avoiding continuous centralized air-conditioning. Instead, I structured the scheme around an interconnected series of semi-covered shaded courtyards with perforated brick jaalis that induce the Venturi effect, allowing natural breezes to cool gathering spaces.'
  },
  {
    id: 'arch-3',
    streamId: 'architecture',
    category: 'Building Materials & Vernacular Tech',
    difficulty: 'Medium',
    frequency: 'Common',
    question: 'Explain the structural and ecological differences between Reinforced Cement Concrete (RCC) and Mass Timber / Bamboo construction.',
    idealOutline: [
      'Embodied carbon: RCC is responsible for ~8% of global CO2 emissions; Mass Timber / Bamboo acts as a carbon sink.',
      'Strength-to-weight ratio: Bamboo has higher tensile strength than mild steel by weight; timber provides excellent seismic resilience.',
      'Thermal performance: Wood and bamboo have significantly lower thermal conductivity than dense concrete.',
      'Durability and treatment: Concrete resists moisture and rot natively; timber/bamboo requires borax-boric acid seasoning and termite protection.'
    ],
    keyPoints: [
      'Concrete: high compressive strength, high embodied energy, recyclable as aggregate.',
      'Bamboo: rapid harvest cycle (3-4 years), tensile elasticity, high renewable quotient.',
      'Hybrid composite construction as a pragmatic Indian compromise.'
    ],
    commonMistakes: [
      'Ignoring structural codes or fireproofing requirements when advocating for timber or bamboo.'
    ],
    sampleAnswer: 'The core divergence lies in embodied carbon and thermal properties. RCC is extremely capable in compression and affords monolithic structural continuity, but the production of Portland cement generates massive carbon emissions, and concrete retains high thermal mass that radiates heat long into the night. In contrast, Mass Timber and engineered Bamboo are net-negative carbon sinks that store atmospheric carbon throughout the building lifecycle. Structurally, bamboo possesses a tensile strength comparable to mild steel relative to its weight, making it phenomenally resilient in seismic zones. However, while RCC offers predictable fire resistance and long-term weathering with minimal treatment, bamboo and timber require vacuum pressure impregnation with borax salts to prevent fungal decay and termite attacks.'
  },
  {
    id: 'arch-4',
    streamId: 'architecture',
    category: 'Urban Planning & Transit Design',
    difficulty: 'Hard',
    frequency: 'Common',
    question: 'What is Transit-Oriented Development (TOD), and how can it resolve urban congestion in rapidly expanding Indian Tier-1 cities?',
    idealOutline: [
      'Define TOD: high-density, mixed-use, pedestrian-friendly urban fabric concentrated within a 500-800m catchment of high-capacity transit stations (Metro/BRTS).',
      'Principles: Density, Diversity (mixed residential/commercial/civic), and Design (walkability, last-mile multimodal integration).',
      'Indian contextual challenges: encroached sidewalks, private auto-centric road widening, lack of last-mile e-rickshaw or bicycle docking.',
      'Solutions: Form-based zoning, transferable development rights (TDR), traffic-calmed pedestrian plazas, and unified metropolitan transit authorities.'
    ],
    keyPoints: [
      'TOD shifts urban mobility from private car dependence to public mass transit.',
      'High FAR (Floor Area Ratio) incentives around transit nodes.',
      'Pedestrian-first non-motorized transport (NMT) infrastructure.'
    ],
    commonMistakes: [
      'Focusing solely on increasing road widths for cars rather than pedestrianization and mass transit.'
    ],
    sampleAnswer: 'Transit-Oriented Development (TOD) creates compact, walkable, high-density, mixed-use communities centered within a 5 to 10-minute walk (around 800 meters) of high-capacity transit nodes like Metro stations. In congested Indian metropolises like Bengaluru and Delhi, conventional road-widening simply induces more vehicular traffic. Implementing TOD reverses this by zoning for high Floor Area Ratio (FAR) alongside ground-floor retail, offices, and mid-income housing directly above or adjacent to stations. This ensures residents can commute, shop, and live without depending on personal motor vehicles. Essential components include dedicated, tree-shaded pedestrian pathways, protected bicycle tracks, and organized feeder hubs for electric autos, creating seamless last-mile connectivity.'
  },

  // ===================== UPSC & NDA (SSB) STREAM =====================
  {
    id: 'upsc-1',
    streamId: 'upsc_nda',
    category: 'Ethics, Integrity & Dilemmas (GS-IV)',
    difficulty: 'Hard',
    frequency: 'Very common',
    question: 'As a District Magistrate, you face political pressure to award a major flood-relief contract to a substandard local contractor backed by the ruling party. How do you respond?',
    idealOutline: [
      'Acknowledge the core dilemma: Duty to public welfare vs administrative pressure / insubordination risks.',
      'Identify key stakeholders: Vulnerable disaster-affected citizens, the administration, taxpayers, and political representatives.',
      'Course of Action: Maintain absolute adherence to the General Financial Rules (GFR) and transparent e-procurement guidelines.',
      'Communication: Politely and firmly brief the political leadership in writing explaining the legal liabilities, quality audits, and safety risks.',
      'Mitigation: Institute a multi-member technical evaluation committee with video-recorded tenders to remove unilateral discretion.'
    ],
    keyPoints: [
      'Uphold constitutional ethics: Objectivity, Empathy for the poor, Integrity, Accountability.',
      'Put official communication in writing and follow procedural safeguards.',
      'Disaster relief leaves zero margin for corruption because human lives are immediately on the line.'
    ],
    commonMistakes: [
      'Responding aggressively or threatening the minister.',
      'Succumbing to pressure and compromising relief material quality.'
    ],
    sampleAnswer: 'As District Magistrate, my paramount constitutional duty during a disaster is the safety and welfare of vulnerable citizens. Flood relief is life-critical, meaning compromised materials directly endanger lives. I would firmly reject any deviation from transparent public procurement. Procedurally, I would ensure the tendering process is conducted through the state e-procurement portal evaluated by an objective, multi-member committee comprising the Chief Medical Officer and PWD Executive Engineer. If pressured informally by political leaders, I would respectfully present the stringent statutory guidelines under the Disaster Management Act 2005 in writing, illustrating how any compromise would trigger mandatory CAG audits and judicial scrutiny. Transparency and procedural rigor protect both public funds and the integrity of the administration.'
  },
  {
    id: 'upsc-2',
    streamId: 'upsc_nda',
    category: 'DAF (Detailed Application Form) & Hometown',
    difficulty: 'Medium',
    frequency: 'Very common',
    question: 'Tell us about your hometown: what is one major socio-economic problem it faces, and if posted there, what innovative administrative solution would you implement?',
    idealOutline: [
      'Concise description of hometown (geography, cultural significance, economic base).',
      'Identify a genuine, well-researched socio-economic bottleneck (e.g. ground-water depletion, youth unemployment, municipal waste management).',
      'Provide a pragmatic, multi-phase administrative intervention using technology, community ownership (Jan Bhagidari), and convergence of existing schemes.'
    ],
    keyPoints: [
      'Demonstrate deep local awareness and pride without defensiveness.',
      'Propose solutions based on scheme convergence (e.g. Jal Jeevan Mission, NRLM, PM Kaushal Vikas Yojana).',
      'Emphasize community participation for long-term sustainability.'
    ],
    commonMistakes: [
      'Giving generic praise without identifying real problems.',
      'Suggesting unrealistic solutions that require impossible budgets.'
    ],
    sampleAnswer: 'I hail from Jaipur, Rajasthan. While renowned globally for its heritage tourism and artisanal crafts, a critical socio-economic crisis is acute groundwater depletion and unorganized artisan exploitation. Water tables have fallen over 100 meters due to unregulated extraction, while traditional block-printers and gem-cutters lose profits to middlemen. If posted as District Collector, I would launch a twin-track initiative: First, a massive urban rainwater recharge mission reviving historic stepwells (baoris) in public-private partnership with local hotel associations under CSR. Second, establishing an "Artisan Export Facilitation Cell" converging with ONDC (Open Network for Digital Commerce) and PM Vishwakarma Yojana to directly connect local artisans with global e-marketplaces, eliminating exploitative intermediaries.'
  },
  {
    id: 'upsc-3',
    streamId: 'upsc_nda',
    category: 'SSB Personal Interview & Motivation',
    difficulty: 'Hard',
    frequency: 'Very common',
    question: 'Why do you want to join the Armed Forces as an Officer instead of pursuing a lucrative private corporate career or civil services?',
    idealOutline: [
      'Express genuine passion for uniform and national defence grounded in personal experiences rather than cliché movie rhetoric.',
      'Highlight specific attractions: camaraderie, leading men and women under fire, dynamic operational lifestyle, institutional ethos, and honor.',
      'Show respect for other careers (corporate, civil services) while distinguishing the unique calling of military leadership.'
    ],
    keyPoints: [
      'Avoid clichéd "I want to sacrifice my life" replies; focus on living effectively for the nation.',
      'Embody Officer-Like Qualities: clarity of thought, determination, organizational loyalty.',
      'Demonstrate knowledge of the chosen service branch (Infantry, Armoured, Aviation, Navy, Air Force).'
    ],
    commonMistakes: [
      'Belittling the corporate sector or civil services.',
      'Sounding overly dramatic or insincere.'
    ],
    sampleAnswer: 'Sir, while corporate careers offer financial prosperity and the civil services provide immense administrative reach, the Armed Forces offer an incomparable way of life centered on leadership, honor, and selfless service. In the military, you are entrusted with the lives of troops at a very young age, where leadership is tested not on spreadsheets, but in demanding physical terrains and operational crises. The camaraderie, regimented discipline, and the profound honor of standing between the nation and any external threat is a purpose that no corporate compensation can match. I want a career that tests my physical resilience, mental fortitude, and character every single day.'
  },
  {
    id: 'upsc-4',
    streamId: 'upsc_nda',
    category: 'Officer-Like Qualities (OLQ) Assessment',
    difficulty: 'Medium',
    frequency: 'Common',
    question: 'In your college sports team or college project, describe a situation where a teammate refused to cooperate. How did you handle it?',
    idealOutline: [
      'Context: briefly set up the situation without blaming or disparaging the teammate.',
      'Root cause analysis: approached the individual privately to understand the underlying issue (burnout, feeling unvalued, personal stress).',
      'Action taken: redefined roles to leverage their specific strengths, aligned project goals, and led by personal example.',
      'Outcome & Learning: successfully completed the milestone and reinforced long-term mutual trust.'
    ],
    keyPoints: [
      'Evaluates Factor II (Social Adaptability, Cooperation) & Factor III (Social Effectiveness).',
      'Shows emotional maturity: no anger, no complaining to superiors as first resort.',
      'Focuses on problem resolution and team unity.'
    ],
    commonMistakes: [
      'Boasting about how you did everything alone or kicked the person out of the team.',
      'Blaming the other person entirely.'
    ],
    sampleAnswer: 'During our final-year engineering capstone project, our team lead for backend integration became unresponsive and skipped multiple sprint deadlines, which jeopardized our university submission. Rather than confronting him aggressively in group chat or reporting him to the professor, I met him in person over coffee. I discovered that he was coping with severe personal family illness and felt overwhelmed by the database schema complexity. I listened empathically and offered to take over the database migration while assigning him the API documentation and test harness where he was most comfortable. By reorganizing our sprint workload and checking in daily with positive reinforcement, we submitted on schedule and secured top honors. This reinforced to me that cooperation is built on empathy, clear communication, and adaptable role distribution.'
  },
  {
    id: 'upsc-5',
    streamId: 'upsc_nda',
    category: 'National Policy & Geopolitics',
    difficulty: 'Hard',
    frequency: 'Very common',
    question: 'How should India balance its strategic partnership with the United States while preserving its time-tested historic ties with Russia?',
    idealOutline: [
      'Define India’s diplomatic compass: "Strategic Autonomy" and Multi-alignment.',
      'Relationship with the US: critical for Indo-Pacific security (QUAD), high-tech transfers (iCET), AI, semiconductors, and counterbalancing regional expansionism.',
      'Relationship with Russia: 60%+ defence inventory legacy, affordable hydrocarbon supplies, geopolitical Eurasian balance.',
      'Pragmatic diplomacy: India serves as a vital bridge between the Global South and the Western world, advancing national interest over bloc politics.'
    ],
    keyPoints: [
      'Strategic autonomy is not neutrality; it is issue-based independent decision making.',
      'Defence indigenization (Atmanirbhar Bharat) reduces single-source vulnerability over time.',
      'India’s voice in the Global South.'
    ],
    commonMistakes: [
      'Taking a dogmatic anti-Western or anti-Russian stance.',
      'Ignoring India’s immediate energy and defence security realities.'
    ],
    sampleAnswer: 'India exercises what External Affairs Minister Dr. S. Jaishankar terms "Strategic Autonomy"—navigating a multipolar world by making decisions solely dictated by Indian national interest. With the United States, our relationship is vital for 21st-century technology sharing under iCET, Indo-Pacific maritime security through the Quad, and robust trade ties. Concurrently, Russia remains a crucial Eurasian power and a reliable historical defence supplier whose logistical cooperation and energy exports shield the Indian economy from inflationary shocks. India does not subscribe to zero-sum binary alliances. By diversifying our defence procurement through domestic manufacturing (Make in India) and engaging constructively with both Washington and Moscow, India preserves its sovereignty while acting as a trusted stabilizing voice for the Global South.'
  }
];
