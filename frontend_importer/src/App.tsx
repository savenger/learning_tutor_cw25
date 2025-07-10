import React, { useState, useRef, useCallback } from 'react';

// Typdefinition für ein Highlight
interface Highlight {
  start: number;
  end: number;
}

// Hilfsfunktion zum Extrahieren von vorhandenen <important>-Tags aus Text
const extractExistingHighlights = (text: string): { cleanText: string; highlights: Highlight[] } => {
  const highlights: Highlight[] = [];
  let cleanText = text;
  let offset = 0;
  
  // Regex zum Finden von <important>...</important> Tags
  const importantRegex = /<important>(.*?)<\/important>/g;
  let match;
  
  while ((match = importantRegex.exec(text)) !== null) {
    const fullMatch = match[0]; // Das komplette <important>...</important>
    const content = match[1]; // Der Inhalt zwischen den Tags
    const startInOriginal = match.index;
    
    // Position im bereinigten Text berechnen
    const startInClean = startInOriginal - offset;
    const endInClean = startInClean + content.length;
    
    highlights.push({
      start: startInClean,
      end: endInClean
    });
    
    // Tags aus dem Text entfernen
    const beforeMatch = cleanText.substring(0, startInOriginal - offset);
    const afterMatch = cleanText.substring(startInOriginal - offset + fullMatch.length);
    cleanText = beforeMatch + content + afterMatch;
    
    // Offset für nachfolgende Matches anpassen
    offset += fullMatch.length - content.length;
  }
  
  return { cleanText, highlights };
};


// Helper function to get the character offset of a selection within a container,
// accurately mapping DOM selection to plaintext string indices.
const getSelectionCharOffsetsWithin = (element: HTMLElement): { start: number; end: number } => {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) {
    return { start: 0, end: 0 };
  }

  const range = selection.getRangeAt(0);

  // Create a range from the beginning of the contentEditable element to the start of the selection
  const preCaretRangeStart = document.createRange();
  preCaretRangeStart.selectNodeContents(element);
  preCaretRangeStart.setEnd(range.startContainer, range.startOffset);
  const start = preCaretRangeStart.toString().length;

  // Create a range from the beginning of the contentEditable element to the end of the selection
  const preCaretRangeEnd = document.createRange();
  preCaretRangeEnd.selectNodeContents(element);
  preCaretRangeEnd.setEnd(range.endContainer, range.endOffset);
  const end = preCaretRangeEnd.toString().length;

  // Ensure start is always less than or equal to end (for selections made backwards)
  if (start > end) {
    return { start: end, end: start };
  }

  return { start, end };
};

// Helper function to find the start and end of a single word given a character index
// A "word" is defined as a sequence of Unicode letters or numbers.
const getWordBoundaries = (text: string, index: number): { wordStart: number; wordEnd: number } => {
  if (text.length === 0) return { wordStart: 0, wordEnd: 0 };

  // Ensure index is within bounds
  if (index < 0) index = 0;
  if (index > text.length) index = text.length;

  // If the click is at the end of the text or on a non-word character,
  // try to look at the character before it.
  if (index === text.length || !/\p{L}|\p{N}/u.test(text[index])) {
    if (index > 0 && /\p{L}|\p{N}/u.test(text[index - 1])) {
      index--; // Move to the last character of the preceding word
    } else {
      // Not on or next to a word, so don't create a highlight
      return { wordStart: index, wordEnd: index };
    }
  }

  // Find start of the word (alphanumeric sequence)
  let wordStart = index;
  while (wordStart > 0 && /\p{L}|\p{N}/u.test(text[wordStart - 1])) {
    wordStart--;
  }

  // Find end of the word (alphanumeric sequence)
  let wordEnd = index;
  while (wordEnd < text.length && /\p{L}|\p{N}/u.test(text[wordEnd])) {
    wordEnd++;
  }

  return { wordStart, wordEnd };
};

// Helper function to find the start and end of words encompassing a given range
const getWordBoundariesForRange = (text: string, selectionStart: number, selectionEnd: number): { wordStart: number; wordEnd: number } => {
  if (text.length === 0) return { wordStart: 0, wordEnd: 0 };

  // If selection is collapsed (single click), find the word at that point
  if (selectionStart === selectionEnd) {
    return getWordBoundaries(text, selectionStart); // Use the single-point word boundary function
  }

  // For a range selection, expand both ends to full words
  let adjustedStart = selectionStart;
  // Move start backward to the beginning of the word
  while (adjustedStart > 0 && /\p{L}|\p{N}/u.test(text[adjustedStart - 1])) {
    adjustedStart--;
  }

  let adjustedEnd = selectionEnd;
  // Move end forward to the end of the word
  // Note: selectionEnd is exclusive, so we check the character at selectionEnd
  while (adjustedEnd < text.length && /\p{L}|\p{N}/u.test(text[adjustedEnd])) {
    adjustedEnd++;
  }

  // Fallback: if the adjusted range is invalid or empty (e.g., selected only whitespace),
  // try to find a single word around the original start point.
  if (adjustedStart >= adjustedEnd || text.substring(adjustedStart, adjustedEnd).trim().length === 0) {
      const { wordStart, wordEnd } = getWordBoundaries(text, selectionStart);
      if (wordStart < wordEnd) {
          return { wordStart, wordEnd };
      }
      return { wordStart: selectionStart, wordEnd: selectionEnd }; // Return original if no word found
  }

  return { wordStart: adjustedStart, wordEnd: adjustedEnd };
};

// Neue Hilfsfunktion zum Zusammenführen überlappender Highlights
const mergeHighlights = (highlights: Highlight[]): Highlight[] => {
  if (highlights.length <= 1) {
    return highlights;
  }

  // Nach Start-Index sortieren, um das Zusammenführen zu vereinfachen
  const sorted = [...highlights].sort((a, b) => a.start - b.start);

  const merged: Highlight[] = [];
  let currentMerge = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    // Wenn sich Intervalle überlappen oder benachbart sind, führe sie zusammen
    if (next.start <= currentMerge.end) {
      currentMerge.end = Math.max(currentMerge.end, next.end);
    } else {
      merged.push(currentMerge);
      currentMerge = { ...next };
    }
  }
  merged.push(currentMerge);

  return merged;
};

export default function App() {
  const [text, setText] = useState<string>(
    "Paste your text here to start highlighting..."
  );
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isPlaceholderText, setIsPlaceholderText] = useState<boolean>(true);
  const textDisplayRef = useRef<HTMLDivElement>(null);

  // Extrahiere beim ersten Laden vorhandene Highlights aus dem initialen Text
  React.useEffect(() => {
    const { cleanText, highlights: existingHighlights } = extractExistingHighlights(text);
    if (existingHighlights.length > 0) {
      setText(cleanText);
      setHighlights(mergeHighlights(existingHighlights));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Event Handlers ---

  const handleMouseUp = () => {
    // Don't allow highlighting if placeholder text is active
    if (isPlaceholderText) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || !textDisplayRef.current || !textDisplayRef.current.contains(selection.anchorNode) || !textDisplayRef.current.contains(selection.focusNode)) {
        return;
    }

    let { start, end } = getSelectionCharOffsetsWithin(textDisplayRef.current);

    // Wortgrenzen für die Auswahl bestimmen
    const { wordStart: adjustedStart, wordEnd: adjustedEnd } = getWordBoundariesForRange(text, start, end);

    if (adjustedStart >= adjustedEnd || text.substring(adjustedStart, adjustedEnd).trim().length === 0) {
        selection.removeAllRanges();
        return;
    }

    const newHighlight: Highlight = { start: adjustedStart, end: adjustedEnd };

    // Highlights direkt nach dem Erstellen zusammenführen
    setHighlights(prev => mergeHighlights([...prev, newHighlight]));
    selection.removeAllRanges();
  };

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.innerText;
    setText(newText);
    
    // Clear placeholder state when user starts typing
    if (isPlaceholderText && newText !== "Paste your text here to start highlighting...") {
      setIsPlaceholderText(false);
    }
    
    // Extrahiere vorhandene Highlights aus dem neuen Text
    const { cleanText, highlights: existingHighlights } = extractExistingHighlights(newText);
    setText(cleanText);
    setHighlights(mergeHighlights(existingHighlights));
  };

  const removeHighlight = (indexToRemove: number) => {
    setHighlights((prev: Highlight[]) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleClick = () => {
    if (isPlaceholderText) {
      setText('');
      setIsPlaceholderText(false);
      if (textDisplayRef.current) {
        textDisplayRef.current.innerText = '';
        textDisplayRef.current.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    const { cleanText, highlights: pastedHighlights } = extractExistingHighlights(pastedText);
    
    setText(cleanText);
    setHighlights(mergeHighlights(pastedHighlights));
    setIsPlaceholderText(false);
    
    if (textDisplayRef.current) {
      textDisplayRef.current.innerText = cleanText;
    }
  };

  // --- Text File Generation ---

  const generateHighlightedText = () => {
    if (!text) return '';

    // Highlights sind bereits zusammengeführt, nur noch sortieren
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

    let outputParts: string[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach(h => {
      // Text vor dem Highlight hinzufügen
      if (h.start > lastIndex) {
        outputParts.push(text.substring(lastIndex, h.start));
      }
      // Markierten Text mit Tags hinzufügen
      outputParts.push(`<important>${text.substring(h.start, h.end)}</important>`);
      lastIndex = h.end;
    });

    // Restlichen Text nach dem letzten Highlight hinzufügen
    if (lastIndex < text.length) {
      outputParts.push(text.substring(lastIndex));
    }
    
    return outputParts.join('');
  };

  const generateAndDownloadText = () => {
    const outputText = generateHighlightedText();
    if (!outputText) return;

    // Blob erstellen und Download auslösen
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'highlighted.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Webhook Functionality ---

  const [isWebhookLoading, setIsWebhookLoading] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string>('');
  const [isTestWebhookLoading, setIsTestWebhookLoading] = useState(false);
  const [testWebhookStatus, setTestWebhookStatus] = useState<string>('');

  const sendToWebhook = async () => {
    if (!text || isPlaceholderText) return;

    setIsWebhookLoading(true);
    setWebhookStatus('');

    try {
      const payload = {
        text: generateHighlightedText(),
        highlights: highlights,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('http://localhost:5678/webhook/create-deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setWebhookStatus('✅ Successfully sent to webhook');
      } else {
        setWebhookStatus(`❌ Webhook error: ${response.status}`);
      }
    } catch (error) {
      setWebhookStatus(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsWebhookLoading(false);
      // Clear status after 3 seconds
      setTimeout(() => setWebhookStatus(''), 3000);
    }
  };

  const sendToTestWebhook = async () => {
    if (!text || isPlaceholderText) return;

    setIsTestWebhookLoading(true);
    setTestWebhookStatus('');

    try {
      const payload = {
        text: generateHighlightedText(),
        highlights: highlights,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('http://localhost:5678/webhook-test/create-deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setTestWebhookStatus('✅ Successfully sent to test webhook');
      } else {
        setTestWebhookStatus(`❌ Test webhook error: ${response.status}`);
      }
    } catch (error) {
      setTestWebhookStatus(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestWebhookLoading(false);
      // Clear status after 3 seconds
      setTimeout(() => setTestWebhookStatus(''), 3000);
    }
  };

  // --- Rendering Logic ---

  const renderHighlightedText = useCallback(() => {
    if (highlights.length === 0) {
      return text;
    }

    let lastIndex = 0;
    const parts = [];

    highlights.forEach((h, index) => {
      // Add the text before the highlight
      if (h.start > lastIndex) {
        parts.push(text.substring(lastIndex, h.start));
      }
      // Add the highlighted text
      parts.push(
        <span
          key={`${h.start}-${h.end}-${index}`} // Use a more unique key
          className="relative group bg-yellow-300 rounded-sm px-1 py-0.5 cursor-pointer"
        >
          {text.substring(h.start, h.end)}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Verhindert, dass der Klick eine neue Markierung auslöst
              removeHighlight(index);
            }}
            className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove highlight"
          >
            &times;
          </button>
        </span>
      );
      lastIndex = h.end;
    });

    // Add any remaining text after the last highlight
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  }, [text, highlights]);


  return (
    <div className="min-h-screen bg-gray-100 font-sans flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Text Highlighter</h1>
          <p className="text-gray-500 mt-2">Select text with your mouse to highlight it. Click the 'X' on a highlight to remove it.</p>
        </div>

        {/* Text Display Area */}
        <div
          ref={textDisplayRef}
          onMouseUp={handleMouseUp}
          onInput={handleTextChange}
          onPaste={handlePaste}
          onClick={handleClick}
          contentEditable={true}
          suppressContentEditableWarning={true}
          className={`w-full h-80 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-y-auto whitespace-pre-wrap leading-relaxed ${isPlaceholderText ? 'text-gray-400 italic' : ''}`}
          style={{ lineHeight: '1.75' }}
        >
          {renderHighlightedText()}
        </div>

        {/* Controls */}
        <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                    <span className="font-semibold">{highlights.length}</span> highlight(s) created.
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={sendToWebhook}
                        disabled={!text || isPlaceholderText || isWebhookLoading}
                        className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isWebhookLoading ? 'Sending...' : 'Send to Webhook'}
                    </button>
                    <button
                        onClick={sendToTestWebhook}
                        disabled={!text || isPlaceholderText || isTestWebhookLoading}
                        className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isTestWebhookLoading ? 'Sending...' : 'Send to Test Webhook'}
                    </button>
                    <button
                        onClick={generateAndDownloadText}
                        disabled={highlights.length === 0}
                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        Download Text
                    </button>
                </div>
            </div>
            {webhookStatus && (
                <div className="text-sm text-center py-2 px-4 rounded-lg bg-gray-100">
                    {webhookStatus}
                </div>
            )}
            {testWebhookStatus && (
                <div className="text-sm text-center py-2 px-4 rounded-lg bg-gray-100">
                    {testWebhookStatus}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
