import * as pdfjsLib from 'pdfjs-dist';

// Set up pdf.js worker
try {
  // Using unpkg or workerSrc
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
} catch (e) {
  console.warn('PDF.js worker initialization notice', e);
}

export interface ParsedFileResult {
  fileName: string;
  fileType: 'text' | 'markdown' | 'pdf';
  text: string;
  charCount: number;
  wordCount: number;
}

export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const fileName = file.name;
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  if (extension === 'pdf') {
    return parsePdfFile(file);
  } else if (extension === 'md' || extension === 'markdown') {
    const text = await readTextFile(file);
    return {
      fileName,
      fileType: 'markdown',
      text,
      charCount: text.length,
      wordCount: countWords(text),
    };
  } else {
    // Default plain text (.txt or other text files)
    const text = await readTextFile(file);
    return {
      fileName,
      fileType: 'text',
      text,
      charCount: text.length,
      wordCount: countWords(text),
    };
  }
}

function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string || '');
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

async function parsePdfFile(file: File): Promise<ParsedFileResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const numPages = Math.min(pdf.numPages, 50); // limit to first 50 pages for safety

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += `\n--- Page ${pageNum} ---\n` + pageText;
    }

    const cleanedText = fullText.trim();

    return {
      fileName: file.name,
      fileType: 'pdf',
      text: cleanedText,
      charCount: cleanedText.length,
      wordCount: countWords(cleanedText),
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    // Fallback if worker or buffer fails
    throw new Error(`Failed to parse PDF "${file.name}". Please ensure the PDF is not password-protected or encrypted.`);
  }
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
