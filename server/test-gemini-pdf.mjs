import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Minimal valid PDF structure (%PDF-1.4 ...)
const samplePdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 73 >>
stream
BT
/F1 24 Tf
100 700 Td
(EduFlow Test PDF: CAP Theorem and ACID transactions) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000366 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
445
%%EOF`;

const base64Pdf = Buffer.from(samplePdf).toString('base64');

async function testPdf() {
  try {
    console.log("Testing native PDF input with gemini-3.6-flash...");
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Pdf,
                mimeType: 'application/pdf',
              },
            },
            {
              text: 'Summarize this document in 1 sentence.',
            },
          ],
        },
      ],
    });
    console.log("PDF MULTIMODAL SUCCESS:", response.text);
  } catch (err) {
    console.error("PDF MULTIMODAL ERROR:", err);
  }
}

testPdf();
