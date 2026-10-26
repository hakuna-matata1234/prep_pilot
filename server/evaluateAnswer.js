/**
 * Quality-based interview answer scoring.
 * Scores reflect substance vs the question's expected key points / sample answer,
 * not length or parroting the question.
 */

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'shall','can','need','dare','ought','used','how','what','when','where',
  'who','which','that','this','these','those','and','but','or','nor','for',
  'yet','so','in','on','at','to','of','by','with','as','from','into',
  'through','during','before','after','above','below','between','about',
  'against','along','among','around','without','within','it','its','i',
  'we','you','they','them','their','our','my','me','your','also','very',
  'just','than','then','there','here','more','most','some','any','each'
]);

const FILLERS = ['um','uh','like','actually','basically','you know','sort of','kind of'];

const DOMAIN_KEYWORDS = {
  cse: [
    'algorithm','complexity','cache','latency','throughput','database','queue',
    'thread','async','concurrent','distributed','node','microservice','api',
    'index','binary','recursion','pointer','memory','stack','heap','graph',
    'hash','tree','sort','search','tcp','http','rest','sql','nosql','docker',
    'kubernetes','test','deploy','scale','partition','replication','polymorphism',
    'inheritance','encapsulation','interface','override','class','object'
  ],
  upsc_nda: [
    'policy','governance','constitution','article','fundamental','directive',
    'committee','parliament','judiciary','executive','federal','state','district',
    'collector','ias','ips','upsc','civil','service','ethics','integrity',
    'accountability','transparency','welfare','development','citizen','vote',
    'legislature','ordinance','amendment','tribunal','bench','writ'
  ],
  architecture: [
    'elevation','plan','section','massing','fenestration','material','structure',
    'load','beam','column','foundation','thermal','ventilation','daylighting',
    'passive','bioclimatic','vernacular','facade','spatial','form','function',
    'circulation','courtyard','orientation','site','climate','sustainability',
    'nata','portfolio','sketch','perspective','render','detail','drawing'
  ]
};

const STRUCTURE_SIGNALS = [
  /\bfor example\b|\bfor instance\b|\bsuch as\b/,
  /\bfirst(ly)?\b.*\bsecond(ly)?\b/,
  /\bbecause\b|\bsince\b|\btherefore\b|\bthus\b|\bhence\b/,
  /\bhowever\b|\bwhereas\b|\balthough\b|\bon the other hand\b/,
  /\bi (used|built|designed|implemented|worked|solved|helped|led)\b/,
  /\bthe result(s)?\b|\bthis (reduced|improved|increased|decreased|enabled)\b/,
  /\b\d[\d,.]*\s*(ms|sec|minute|hour|percent|%|kb|mb|gb|tps|rps|users|requests)\b/,
  /\bsituation\b|\btask\b|\baction\b|\bresult\b/,
  /\bdefined as\b|\bwe define\b|\bby (this|which) i mean\b/,
  /\bcompared to\b|\bas opposed to\b|\bvs\.?\b/
];

function tokenise(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function meaningfulTokens(text) {
  return tokenise(text).filter((w) => !STOP_WORDS.has(w));
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, Number(v.toFixed(1))));
}

function keyPointCoverage(answerTokens, keyPoints) {
  if (!keyPoints || keyPoints.length === 0) return null;
  const ansSet = new Set(answerTokens);
  let covered = 0;
  keyPoints.forEach((kp) => {
    const kpTokens = meaningfulTokens(kp);
    if (kpTokens.length === 0) return;
    const matched = kpTokens.filter((t) => ansSet.has(t)).length;
    if (matched / kpTokens.length >= 0.35) covered += 1;
  });
  return covered / keyPoints.length;
}

function vocabOverlap(answerTokens, referenceText) {
  const ref = new Set(meaningfulTokens(referenceText));
  if (ref.size === 0 || answerTokens.length === 0) return 0;
  const hits = answerTokens.filter((w) => ref.has(w)).length;
  return hits / Math.max(8, Math.min(ref.size, 50));
}

export function evaluateAnswer({
  question,
  userTranscript,
  streamId = 'cse',
  keyPoints = [],
  sampleAnswer = '',
  idealOutline = []
}) {
  const answer = String(userTranscript || '').trim();
  const questionText = String(question || '').trim();
  const lower = answer.toLowerCase();
  const ansTokens = meaningfulTokens(answer);
  const qTokens = new Set(meaningfulTokens(questionText));
  const wordCount = answer.split(/\s+/).filter(Boolean).length;

  const emptyEval = (improvements) => ({
    overallScore: 1.0,
    contentAccuracy: 1.0,
    communicationClarity: 1.0,
    confidence: 1.0,
    structure: 1.0,
    relevance: 1.0,
    positivePoints: ['No substantive answer was recorded for this question.'],
    improvements,
    modelAnswer: sampleAnswer || 'A high-impact answer opens with a precise definition or claim, supports it with a concrete example and measurable outcome, then addresses trade-offs.',
    wpm: 0,
    fillerWordsCount: 0,
    fillerWordsDetected: [],
    _debug: { wordCount: 0, overlapRatio: '1.00', parrotPenalty: 3.5, structureBonus: 0, domainHits: 0, keyCoverage: 0 }
  });

  if (!answer) {
    return emptyEval([
      'No spoken or typed answer was captured. Speak into the microphone or type a complete answer covering the definition, an example, and a result.'
    ]);
  }

  const overlappingWords = ansTokens.filter((w) => qTokens.has(w));
  const overlapRatio = ansTokens.length > 0 ? overlappingWords.length / ansTokens.length : 1;
  const parrotPenalty = overlapRatio > 0.70 ? 3.5
    : overlapRatio > 0.55 ? 2.5
    : overlapRatio > 0.40 ? 1.2
    : 0;

  const uniqueAnsTokens = new Set(ansTokens);
  const uniqueRatio = ansTokens.length > 0 ? uniqueAnsTokens.size / ansTokens.length : 0;
  const uniquenessBonus = uniqueRatio > 0.75 ? 0.6
    : uniqueRatio > 0.60 ? 0.3
    : uniqueRatio > 0.45 ? 0
    : -0.4;

  let structureBonus = 0;
  STRUCTURE_SIGNALS.forEach((sig) => {
    if (sig.test(lower)) structureBonus += 0.25;
  });
  structureBonus = Math.min(1.5, structureBonus);

  const streamKeys = DOMAIN_KEYWORDS[streamId] || DOMAIN_KEYWORDS.cse;
  const domainHits = ansTokens.filter((w) => streamKeys.includes(w)).length;
  const domainBonus = Math.min(1.5, domainHits * 0.25);

  let fillerCount = 0;
  FILLERS.forEach((f) => {
    const m = lower.match(new RegExp('\\b' + f.replace(' ', '\\s+') + '\\b', 'g'));
    if (m) fillerCount += m.length;
  });
  const fillerPenalty = Math.min(2.0, fillerCount * 0.35);

  const coverage = keyPointCoverage(ansTokens, keyPoints);
  const referenceText = [sampleAnswer, ...(idealOutline || []), ...(keyPoints || [])].join(' ');
  const sampleOverlap = vocabOverlap(ansTokens, referenceText);

  // Content quality: expected knowledge coverage, not word count.
  let knowledgeScore;
  if (coverage !== null) {
    knowledgeScore = coverage * 9.2;
  } else if (referenceText.trim()) {
    knowledgeScore = Math.min(9.2, sampleOverlap * 12);
  } else {
    knowledgeScore = Math.min(5.5, wordCount / 20);
  }

  const lengthFactor = wordCount < 8 ? 0.35
    : wordCount < 20 ? 0.55
    : wordCount < 40 ? 0.75
    : wordCount < 80 ? 0.92
    : wordCount < 220 ? 1.0
    : 0.9; // rambling without extra knowledge slightly hurts

  const accuracy = clamp(
    (knowledgeScore * 0.72 + domainBonus + structureBonus * 0.4 + uniquenessBonus) * lengthFactor - parrotPenalty * 0.9,
    1.0,
    9.8
  );

  const clarityBase = parrotPenalty >= 3.5 ? 1.5
    : parrotPenalty >= 2.5 ? 2.5
    : parrotPenalty >= 1.2 ? 4.5
    : wordCount < 12 ? 3.5
    : 7.0;
  const clarity = clamp(clarityBase + uniquenessBonus * 0.8 - fillerPenalty, 1.0, 9.8);

  const confBase = parrotPenalty >= 3.5 ? 1.5
    : parrotPenalty >= 2.5 ? 2.5
    : wordCount < 12 ? 3.0
    : wordCount < 20 ? 4.5
    : wordCount < 50 ? 6.2
    : 7.5;
  const confidence = clamp(confBase - fillerPenalty * 0.5 - parrotPenalty * 0.2, 1.0, 9.5);

  const structBase = parrotPenalty >= 2.5 ? 1.5 : wordCount < 20 ? 3.5 : 5.5;
  const structure = clamp(structBase + structureBonus * 2.5, 1.0, 9.5);

  const relBase = parrotPenalty >= 3.5 ? 1.0
    : parrotPenalty >= 2.5 ? 2.0
    : parrotPenalty >= 1.2 ? 4.0
    : coverage !== null ? 4.5 + coverage * 4.5
    : 6.0;
  const relevance = clamp(relBase + domainBonus * 0.4 + sampleOverlap * 2, 1.0, 9.8);

  const rawOverall = accuracy * 0.34 + clarity * 0.16 + confidence * 0.12 + structure * 0.18 + relevance * 0.20;
  const overallCap = !answer ? 1.0
    : overlapRatio >= 0.70 ? 3.5
    : overlapRatio >= 0.55 ? 5.0
    : coverage !== null && coverage < 0.2 && wordCount < 40 ? 4.5
    : 9.8;
  const overall = clamp(Math.min(rawOverall, overallCap), 1.0, 9.8);

  const isParroting = overlapRatio > 0.55;
  const isTooShort = wordCount < 25;
  const isLowKnowledge = coverage !== null && coverage < 0.35;

  const positivePoints = [];
  const improvements = [];

  if (!isParroting && domainHits >= 2) {
    positivePoints.push(`Used ${domainHits} relevant domain-specific terms, showing conceptual familiarity.`);
  }
  if (!isParroting && structureBonus >= 0.5) {
    positivePoints.push('Response showed structured reasoning with examples or causal logic.');
  }
  if (!isParroting && coverage !== null && coverage >= 0.5) {
    positivePoints.push(`Covered ${Math.round(coverage * 100)}% of the expected key points for this question.`);
  }
  if (!isParroting && !isTooShort && fillerCount === 0) {
    positivePoints.push('Clean verbal delivery with no filler words detected.');
  }
  if (positivePoints.length === 0) {
    positivePoints.push('Attempted to engage with the question topic.');
  }

  if (isParroting) {
    improvements.push(
      `Your answer contains ${Math.round(overlapRatio * 100)}% words from the question itself. State a direct definition or claim, then support it with an example.`
    );
  }
  if (isLowKnowledge) {
    improvements.push(
      'The answer missed most expected key points. Include the core definition, one concrete example, and the practical implication or trade-off.'
    );
  }
  if (isTooShort && !isParroting) {
    improvements.push(
      `At only ${wordCount} words, the response was too brief. A strong interview answer typically spans 50–150 words.`
    );
  }
  if (fillerCount > 0) {
    improvements.push(
      `${fillerCount} filler word${fillerCount > 1 ? 's' : ''} detected. Pause silently instead of using fillers.`
    );
  }
  if (domainHits === 0 && !isParroting) {
    improvements.push('No domain-specific vocabulary was detected. Use precise technical or domain terms.');
  }
  if (structureBonus < 0.5 && !isParroting && !isTooShort) {
    improvements.push('Structure your answer using STAR (Situation → Task → Action → Result) or definition → example → trade-off.');
  }

  const wpm = wordCount > 0 ? Math.round(wordCount / 0.45) : 0;

  return {
    overallScore: overall,
    contentAccuracy: accuracy,
    communicationClarity: clarity,
    confidence,
    structure,
    relevance,
    positivePoints: positivePoints.slice(0, 3),
    improvements: improvements.slice(0, 3),
    modelAnswer: sampleAnswer || 'A high-impact answer opens with a precise definition or claim, supports it with a concrete real-world example including measurable outcomes, then addresses trade-offs or edge cases.',
    wpm,
    fillerWordsCount: fillerCount,
    fillerWordsDetected: FILLERS.filter((f) => lower.includes(f)),
    _debug: {
      wordCount,
      overlapRatio: overlapRatio.toFixed(2),
      parrotPenalty,
      structureBonus,
      domainHits,
      keyCoverage: coverage === null ? null : Number(coverage.toFixed(2))
    }
  };
}
