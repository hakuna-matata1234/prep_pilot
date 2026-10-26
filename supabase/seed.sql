-- ==============================================================================
-- PREP PILOT - SUPABASE DATABASE SEED DATA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor after running schema.sql.
-- It populates vetted mentors, foundational interview questions across CSE,
-- Architecture, and UPSC/SSB streams, plus initial sample data.
-- ==============================================================================

-- 1. SEED MENTOR PROFILES
INSERT INTO public.mentor_profiles (
  id, name, avatar, title, stream_id, experience_years, organization,
  languages, rating, reviews_count, bio, price_per_session, is_approved, available_days, slots
) VALUES
(
  'mentor-1',
  'Col. Rajesh Verma (Retd.)',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'Ex-Senior Interviewing Officer (19 SSB Allahabad)',
  'upsc_nda',
  24,
  'Indian Army / SSB Mentorship Council',
  ARRAY['English', 'Hindi']::TEXT[],
  4.96,
  382,
  'Guided over 750+ recommended candidates into NDA, IMA, OTA & AFA. Specializes in Personal Interview psychology, identifying OLQs, handling stress questions, and DAF cross-examination.',
  'Free (Demo Pass)',
  true,
  ARRAY['Monday', 'Wednesday', 'Saturday', 'Sunday']::TEXT[],
  ARRAY['10:00 AM - 10:45 AM', '03:00 PM - 03:45 PM', '06:00 PM - 06:45 PM']::TEXT[]
),
(
  'mentor-2',
  'Ar. Ananya Sen',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'Principal Architect & CEPT University Visiting Faculty',
  'architecture',
  12,
  'Studio Vistara / CEPT Alum',
  ARRAY['English', 'Hindi', 'Bengali']::TEXT[],
  4.92,
  194,
  'NATA & B.Arch portfolio specialist. Trained candidates accepted into SPA Delhi, CEPT, and Bartlett UK. Expert in bioclimatic critique, concept sketches, and building material rationale.',
  'Free (Demo Pass)',
  true,
  ARRAY['Tuesday', 'Thursday', 'Saturday']::TEXT[],
  ARRAY['11:30 AM - 12:15 PM', '04:00 PM - 04:45 PM', '07:00 PM - 07:45 PM']::TEXT[]
),
(
  'mentor-3',
  'Vikramaditya Roy',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'Staff Software Engineer @ Google (Ex-Uber, IIT Delhi)',
  'cse',
  9,
  'Google Mountain View & Bangalore',
  ARRAY['English', 'Hindi']::TEXT[],
  4.98,
  520,
  'Conducted 300+ technical interviews at Google and Uber. Specializes in distributed systems design, high-concurrency architecture, and DSA problem-solving communication.',
  'Free (Demo Pass)',
  true,
  ARRAY['Friday', 'Saturday', 'Sunday']::TEXT[],
  ARRAY['09:00 AM - 09:45 AM', '02:00 PM - 02:45 PM', '08:00 PM - 08:45 PM']::TEXT[]
),
(
  'mentor-4',
  'Dr. Smriti Kulkarni, IAS (Retd.)',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  'Former Additional Chief Secretary & UPSC Interview Board Member',
  'upsc_nda',
  32,
  'National Governance Institute',
  ARRAY['English', 'Hindi', 'Marathi']::TEXT[],
  4.99,
  290,
  'Served as UPSC Personality Test Board member. Mentors civil services aspirants on ethical decision making, state policy articulation, and handling controversial board inquiries.',
  'Free (Demo Pass)',
  true,
  ARRAY['Wednesday', 'Friday', 'Sunday']::TEXT[],
  ARRAY['04:00 PM - 04:45 PM', '05:30 PM - 06:15 PM']::TEXT[]
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  avatar = EXCLUDED.avatar,
  title = EXCLUDED.title,
  rating = EXCLUDED.rating;

-- 2. SEED CORE QUESTIONS
INSERT INTO public.questions (
  id, stream_id, category, difficulty, frequency, question,
  ideal_outline, key_points, common_mistakes, sample_answer
) VALUES
(
  'cse-1',
  'cse',
  'DSA & Problem Solving',
  'Medium',
  'Very common',
  'How would you detect a cycle in a singly linked list, and how do you find the exact node where the cycle begins?',
  ARRAY[
    'Mention Floyd’s Tortoise and Hare algorithm with O(N) time and O(1) space.',
    'Explain two pointers (slow moving 1 step, fast moving 2 steps). If they meet, a cycle exists.',
    'Derive mathematically why resetting one pointer to head and moving both at 1 step brings them together at cycle start.',
    'Mention alternative HashSet approach and why two-pointer approach is memory superior.'
  ]::TEXT[],
  ARRAY[
    'Floyd’s Cycle Detection has O(1) auxiliary space.',
    'Fast pointer moves 2x the speed of slow.',
    'Distance formula: L1 + k*C + d = 2*(L1 + d).'
  ]::TEXT[],
  ARRAY[
    'Forgetting null checks on fast and fast.next.',
    'Not knowing the mathematical justification for finding the cycle entry point.'
  ]::TEXT[],
  'To detect a cycle with optimal memory, I would use Floyd’s Cycle Detection algorithm. We initialize two pointers, slow and fast, at the head. Slow advances by 1 node while fast advances by 2. If fast or fast.next reaches null, the list is acyclic. If slow and fast meet, a cycle is confirmed. To find the origin node of the loop, we leave slow at the meeting point and reset fast to head. Then, we advance both at a pace of 1 node per iteration. The exact node where they collide again is the start of the cycle, which takes O(N) time and strictly O(1) auxiliary space.'
),
(
  'cse-2',
  'cse',
  'System Design (HLD & LLD)',
  'Hard',
  'Very common',
  'Design a scalable URL shortening service like TinyURL capable of handling 500 million links per month.',
  ARRAY[
    'Clarify functional & non-functional requirements (read vs write ratios, latency, 7-character hash, 99.99% availability).',
    'Capacity estimation: write QPS (~200 writes/sec), read QPS (~2,000 reads/sec), 5-year storage estimates.',
    'API signatures: createShortUrl and getLongUrl.',
    'Encoding strategy: Base62 encoding on 64-bit auto-incrementing ID.',
    'Architecture: Load Balancer, Web/API servers, Distributed Key Generation Service (KGS), Redis Cache, NoSQL DB.'
  ]::TEXT[],
  ARRAY[
    'Base62 encoding (a-z, A-Z, 0-9) yields 62^7 = 3.5 trillion unique combinations.',
    'Read-heavy system: 10:1 or 100:1 read-to-write ratio requires distributed caching.',
    'Pre-generating keys using a Key Generation Service eliminates runtime collisions.'
  ]::TEXT[],
  ARRAY[
    'Using pure MD5/SHA-256 and running into hashing collisions without an avoidance strategy.',
    'Neglecting caching or failing to explain how redirects (301 Permanent vs 302 Temporary) work.'
  ]::TEXT[],
  'TinyURL is inherently a read-heavy system with roughly a 10:1 or 20:1 read-to-write ratio. For 500M writes/month, we require ~200 writes/sec and ~2,000 reads/sec. I would design the short link using 7 characters of Base62 encoding, giving over 3.5 trillion unique combinations. Rather than hashing long URLs on the fly which risks collisions, I would use a standalone Key Generation Service (KGS) backed by Apache ZooKeeper to pre-generate and vend unique sequential IDs in batches to app servers. We store mapping records in DynamoDB or Cassandra due to high key-value read throughput, fronted by a Redis distributed cache with an LRU eviction policy to serve hot URLs with sub-10ms latency. For HTTP responses, we return a 302 Found redirect to capture click analytics.'
),
(
  'cse-3',
  'cse',
  'DBMS & SQL Optimization',
  'Medium',
  'Very common',
  'What is database indexing, how do B+ Trees work under the hood, and when can an index actually degrade performance?',
  ARRAY[
    'Define an index as an auxiliary data structure that trades storage and write overhead for logarithmic lookups.',
    'Explain B+ Tree characteristics: balanced m-way search tree where all data/pointers reside in leaf nodes connected as a doubly linked list.',
    'Point out sequential scan advantages and range query efficiency over B-trees.',
    'Clarify trade-offs: writes (INSERT/UPDATE/DELETE) incur tree rebalancing, node splits, and disk write amplification.'
  ]::TEXT[],
  ARRAY[
    'All record pointers in a B+ Tree are stored strictly in leaf nodes.',
    'Leaf nodes are linked in a sequential doubly linked list for range queries.',
    'High write throughput scenarios suffer when excessive indexes are maintained.'
  ]::TEXT[],
  ARRAY[
    'Confusing B-Trees (data in internal nodes) with B+ Trees (data exclusively in leaf nodes).',
    'Claiming indexes speed up writes.'
  ]::TEXT[],
  'A database index is an auxiliary data structure designed to accelerate data retrieval from O(N) table scans to O(log N) tree traversals. Most relational databases like PostgreSQL and MySQL use B+ Trees because all leaf nodes are located at the exact same depth and are linked horizontally in a doubly linked list. This makes both equality searches and range scans extremely cache-friendly and performant with minimal disk I/O. However, an index degrades performance when a table experiences high-frequency INSERT, UPDATE, or DELETE operations, because every write requires updating the tree, potentially triggering costly node splits, merges, and index bloat. Therefore, indexes should be applied selectively on high-cardinality query filter columns.'
),
(
  'upsc-1',
  'upsc_nda',
  'Civil Services (IAS/IPS)',
  'Hard',
  'Very common',
  'If appointed as District Magistrate (DM) of a communal hotspot during a major festive procession, how will you prevent violence and ensure public order while respecting constitutional rights?',
  ARRAY[
    'Immediate preventive intelligence: Peace committee meetings with community elders, drone surveillance, route mapping.',
    'Regulatory legal tools: Section 144 CrPC, sound limits under Noise Pollution Rules, licensed routes only.',
    'Emergency response setup: Deployment of RAF/police reserves, rapid medical & fire teams, CCTVs along sensitive choke points.',
    'Real-time communication: Counter rumors via official social handles; avoid blunt internet shutdowns unless lives are at stake.'
  ]::TEXT[],
  ARRAY[
    'Constitutionally balance Article 25 (Freedom of Religion) with Article 19(2) (Public Order).',
    'Proactive community engagement rather than reactive baton charge.',
    'Clear chain of command between police (SP) and civil administration (DM).'
  ]::TEXT[],
  ARRAY[
    'Suggesting immediate aggressive curfews without trying peaceful dialogue.',
    'Focusing exclusively on policing while ignoring medical and fire safety.'
  ]::TEXT[],
  'As District Magistrate, my priority would be deterrence, proactive community diplomacy, and swift surgical enforcement. Days before the procession, I would convene joint Peace Committee meetings comprising respected religious elders, youth leaders, and local ward councilors to sign off on designated routes and strict timelines. Legally, we issue conditional permissions mandating no unauthorized weapons, adherence to decibel limits, and drone mapping of the route. On the ground, I would establish a Unified Command Center with the Superintendent of Police, prepositioning Rapid Action Force units, ambulances, and fire tenders at identified flashpoints. If provocations occur, we use proportionate graduated force—video documentation, tear gas, and immediate detentions—while keeping administrative social channels active to squash rumors.'
),
(
  'arch-1',
  'architecture',
  'Passive Solar & Bioclimatic',
  'Medium',
  'Common',
  'How do you design a high-density residential building in a hot and dry composite climate (like North-West India) to minimize air-conditioning load using passive principles?',
  ARRAY[
    'Orientation & Massing: Long facades facing North-South, minimal exposure on East-West; compact form factor (low S/V ratio).',
    'Thermal Mass & Envelope: Cavity walls, fly-ash bricks, high thermal inertia to delay peak indoor temperatures until cool night.',
    'Fenestration & Shading: Deep overhangs (chajjas), jaalis for diffused glare-free day-lighting, low-E glazing.',
    'Courtyard & Venturi effect: Microclimate moderation via central courtyards, water bodies, and induced stack ventilation.'
  ]::TEXT[],
  ARRAY[
    'Hot-dry climate demands high thermal mass and nighttime cross ventilation.',
    'North-South building orientation minimizes direct summer solar insolation.',
    'Courtyard effect facilitates nocturnal convective cooling.'
  ]::TEXT[],
  ARRAY[
    'Recommending lightweight glass curtain walls in extreme hot-dry zones.',
    'Ignoring the diurnal temperature variation that makes thermal mass effective.'
  ]::TEXT[],
  'In a hot and dry climate like Rajasthan or Delhi, passive design centers around solar protection, high thermal inertia, and nocturnal radiative cooling. First, I orient the building with its longer axis East-West, ensuring primary glazing faces North (for glare-free daylight) and South (shielded by horizontal overhangs), while East and West facades have minimal fenestrations and buffer services like staircases. Second, I specify high thermal mass building envelopes—such as aerated autoclaved concrete or cavity walls—to create a 7-to-9 hour thermal lag, delaying daytime peak heat until night. Third, incorporating the traditional Indian courtyard typography coupled with evaporative water features creates a stack effect, drawing cooler air through shaded perimeter jaalis and exhausting hot air upwards, cutting active HVAC cooling demands by up to 35%.'
)
ON CONFLICT (id) DO UPDATE
SET
  question = EXCLUDED.question,
  ideal_outline = EXCLUDED.ideal_outline,
  sample_answer = EXCLUDED.sample_answer;

-- 3. SEED INITIAL SAMPLE APPEAL FOR ADMIN PANEL
INSERT INTO public.appeals (id, student_name, session_date, reason, status, stream)
VALUES 
  ('apl_1', 'Aarav Sharma', 'Oct 26, 2026', 'Technical glitch: Dual monitor caused false gaze deflection warning #2', 'pending', 'CSE Tech'),
  ('apl_2', 'Pooja Verma', 'Oct 25, 2026', 'Involuntary eye twitching medical condition during UPSC board mock', 'approved', 'UPSC Civil Services')
ON CONFLICT (id) DO NOTHING;
