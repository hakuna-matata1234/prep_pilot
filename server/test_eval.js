// Quick smoke test for the evaluation engine
import http from 'http';

function evaluate(question, userTranscript, streamId, label) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ question, userTranscript, streamId });
    const req = http.request({
      hostname: 'localhost', port: 5000,
      path: '/api/interview/evaluate', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const j = JSON.parse(data);
        const e = j.evaluation;
        console.log(`\n=== ${label} ===`);
        console.log(`  Overall: ${e.overallScore}/10 | Accuracy: ${e.contentAccuracy} | Relevance: ${e.relevance}`);
        console.log(`  Debug:   words=${e._debug.wordCount} overlap=${e._debug.overlapRatio} penalty=${e._debug.parrotPenalty} domainHits=${e._debug.domainHits}`);
        console.log(`  Improvements: ${e.improvements[0] ? e.improvements[0].slice(0, 90) + '...' : 'none'}`);
        resolve();
      });
    });
    req.write(body);
    req.end();
  });
}

(async () => {
  const Q = 'What is polymorphism in object-oriented programming?';

  // Test 1: Repeating the question verbatim — should score LOW
  await evaluate(Q, Q, 'cse', 'TEST 1: Repeat question verbatim (should score LOW ~2-4)');

  // Test 2: Empty / silent — should score very LOW
  await evaluate(Q, '', 'cse', 'TEST 2: Empty answer (should score VERY LOW)');

  // Test 3: Short, vague answer — should score moderately low
  await evaluate(Q, 'Polymorphism means many forms in programming.', 'cse', 'TEST 3: Short vague answer (should score ~3-5)');

  // Test 4: Good answer with example, STAR, domain terms — should score HIGH
  await evaluate(
    Q,
    `Polymorphism allows objects of different classes to be treated through a shared interface. 
     For example, in Java we can have an Animal base class with a speak method, and Dog and Cat 
     subclasses each override it differently using method overriding. The result is that we can 
     iterate over a list of Animals and call speak without knowing the concrete type at runtime. 
     This reduces coupling and makes the code easier to extend without modification — following 
     the Open/Closed Principle. I used this pattern in a microservice project where we had 
     multiple payment gateways implementing a common PaymentProcessor interface, which reduced 
     our integration code by about 40 percent.`,
    'cse',
    'TEST 4: Full STAR answer with domain terms (should score HIGH ~7-9)'
  );

  console.log('\n✅ Smoke tests complete.\n');
})();
