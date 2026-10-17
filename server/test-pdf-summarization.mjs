import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:4000';

// 1. Text-based PDF
const textPdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 120 >> stream
BT /F1 16 Tf 50 720 Td (Advanced Distributed Systems: Paxos, Raft, and Byzantine Fault Tolerance) Tj ET
BT /F1 12 Tf 50 680 Td (Raft breaks consensus into leader election, log replication, and safety guarantees.) Tj ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref 0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000414 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
493
%%EOF`;

// 2. Scanned Image PDF representation (image stream)
const scannedPdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /XObject /Subtype /Image /Width 2 /Height 2 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length 12 >> stream
\xFF\x00\x00\x00\xFF\x00\x00\x00\xFF\xFF\xFF\xFF
endstream endobj
5 0 obj << /Length 25 >> stream
q 612 0 0 792 0 0 cm /Im1 Do Q
endstream endobj
xref 0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000405 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
480
%%EOF`;

// 3. Corrupt PDF
const corruptPdfContent = `THIS IS NOT A VALID PDF FILE. Missing percent PDF header.`;

// 4. Encrypted PDF marker
const encryptedPdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [] /Count 0 >> endobj
trailer << /Size 3 /Root 1 0 R /Encrypt << /Filter /Standard /V 2 /R 3 >> >>
startxref
120
%%EOF`;

async function testPdfUpload() {
  console.log('\n======================================================');
  console.log('PART 2: TESTING MULTIMODAL PDF UPLOAD & SUMMARIZATION');
  console.log('======================================================\n');

  // Register a test user to test database persistence of ResearchSummary
  const testEmail = `pdf_tester_${Date.now()}@university.edu`;
  const regRes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Password123!', name: 'Prof. Ada Lovelace' }),
  });
  const rawCookie = regRes.headers.get('set-cookie') || '';
  const cookie = rawCookie.split(';')[0];
  console.log(`[AUTH] Created test user: ${testEmail}, token: ${cookie.substring(0, 25)}...`);

  // Test 1: Corrupt PDF validation
  console.log('\n--- Test 1: Corrupt PDF validation (Magic Bytes) ---');
  const corruptForm = new FormData();
  corruptForm.append('file', new Blob([corruptPdfContent], { type: 'application/pdf' }), 'corrupt.pdf');
  corruptForm.append('title', 'Corrupt Document');

  const corruptRes = await fetch(`${API_URL}/api/ai/summarize`, {
    method: 'POST',
    headers: { Cookie: cookie },
    body: corruptForm,
  });
  const corruptData = await corruptRes.json();
  console.log('Corrupt PDF status:', corruptRes.status, 'Message:', corruptData.message);
  if (corruptRes.status !== 400 || !corruptData.message.includes('%PDF-')) {
    throw new Error('Corrupt PDF validation failed');
  }

  // Test 2: Encrypted PDF validation
  console.log('\n--- Test 2: Password-Protected / Encrypted PDF validation ---');
  const encForm = new FormData();
  encForm.append('file', new Blob([encryptedPdfContent], { type: 'application/pdf' }), 'locked.pdf');
  encForm.append('title', 'Encrypted Document');

  const encRes = await fetch(`${API_URL}/api/ai/summarize`, {
    method: 'POST',
    headers: { Cookie: cookie },
    body: encForm,
  });
  const encData = await encRes.json();
  console.log('Encrypted PDF status:', encRes.status, 'Message:', encData.message);
  if (encRes.status !== 400 || !encData.message.toLowerCase().includes('password')) {
    throw new Error('Encrypted PDF validation failed');
  }

  // Test 3: Real Text-based PDF
  console.log('\n--- Test 3: Valid Text PDF Summarization via Native Gemini ---');
  const textForm = new FormData();
  textForm.append('file', new Blob([textPdfContent], { type: 'application/pdf' }), 'distributed_systems.pdf');
  textForm.append('title', 'Distributed Systems Consensus');
  textForm.append('customPromptFocus', 'High-Yield Exam Concepts');

  const textRes = await fetch(`${API_URL}/api/ai/summarize`, {
    method: 'POST',
    headers: { Cookie: cookie },
    body: textForm,
  });
  const textData = await textRes.json();
  console.log('Text PDF HTTP status:', textRes.status);
  console.log('Title:', textData.summary?.title);
  console.log('Overview:', textData.summary?.overview);
  console.log('Key Concepts:', textData.summary?.keyConcepts);
  console.log('High-Yield Takeaways:', textData.summary?.examHighYield);
  console.log('AI Disclosure:', textData.aiDisclosure);

  if (textRes.status !== 200 || !textData.summary?.overview) {
    throw new Error(`Text PDF summarization failed: ${JSON.stringify(textData)}`);
  }

  // Test 4: Scanned-image PDF (multimodal test)
  console.log('\n--- Test 4: Scanned Image PDF Summarization via Native Gemini ---');
  const scanForm = new FormData();
  scanForm.append('file', new Blob([scannedPdfContent], { type: 'application/pdf' }), 'scanned_notes.pdf');
  scanForm.append('title', 'Scanned Lecture Diagram');

  const scanRes = await fetch(`${API_URL}/api/ai/summarize`, {
    method: 'POST',
    headers: { Cookie: cookie },
    body: scanForm,
  });
  const scanData = await scanRes.json();
  console.log('Scanned PDF HTTP status:', scanRes.status);
  console.log('Scanned PDF Summary Title:', scanData.summary?.title);
  console.log('Scanned PDF Overview:', scanData.summary?.overview);
  if (scanRes.status !== 200 || !scanData.summary?.overview) {
    throw new Error(`Scanned PDF summarization failed: ${JSON.stringify(scanData)}`);
  }

  // Test 5: Verify Saved History in Database (GET /api/summaries)
  console.log('\n--- Test 5: Verify Summaries Persisted to Database ---');
  const historyRes = await fetch(`${API_URL}/api/summaries`, {
    headers: { Cookie: cookie },
  });
  const historyData = await historyRes.json();
  console.log('GET /api/summaries HTTP status:', historyRes.status, 'Response:', JSON.stringify(historyData));
  console.log('GET /api/summaries count:', historyData.summaries?.length);
  historyData.summaries?.forEach((s) => console.log(`  - [${s.fileType}] ${s.title} (${s.fileName})`));
  if (!historyData.summaries || historyData.summaries.length < 2) {
    throw new Error('Database persistence check failed');
  }

  console.log('\n✅ ALL PART 2 TESTS PASSED! PDF Upload, magic-bytes, scanned-page handling, and database persistence are fully operational.');
}

testPdfUpload().catch((err) => {
  console.error('\n❌ PDF TEST FAILED:', err);
  process.exit(1);
});
