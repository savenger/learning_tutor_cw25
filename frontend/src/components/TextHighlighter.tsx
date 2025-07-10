import React, { useState, useRef, useCallback } from 'react';
import Button from './Button';

interface Highlight {
  start: number;
  end: number;
}

const extractExistingHighlights = (text: string): { cleanText: string; highlights: Highlight[] } => {
  const highlights: Highlight[] = [];
  let cleanText = text;
  let offset = 0;
  
  const importantRegex = /<important>(.*?)<\/important>/g;
  let match;
  
  while ((match = importantRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const content = match[1];
    const startInOriginal = match.index;
    
    const startInClean = startInOriginal - offset;
    const endInClean = startInClean + content.length;
    
    highlights.push({
      start: startInClean,
      end: endInClean
    });
    
    const beforeMatch = cleanText.substring(0, startInOriginal - offset);
    const afterMatch = cleanText.substring(startInOriginal - offset + fullMatch.length);
    cleanText = beforeMatch + content + afterMatch;
    
    offset += fullMatch.length - content.length;
  }
  
  return { cleanText, highlights };
};

const getSelectionCharOffsetsWithin = (element: HTMLElement): { start: number; end: number } => {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) {
    return { start: 0, end: 0 };
  }

  const range = selection.getRangeAt(0);

  const preCaretRangeStart = document.createRange();
  preCaretRangeStart.selectNodeContents(element);
  preCaretRangeStart.setEnd(range.startContainer, range.startOffset);
  const start = preCaretRangeStart.toString().length;

  const preCaretRangeEnd = document.createRange();
  preCaretRangeEnd.selectNodeContents(element);
  preCaretRangeEnd.setEnd(range.endContainer, range.endOffset);
  const end = preCaretRangeEnd.toString().length;

  if (start > end) {
    return { start: end, end: start };
  }

  return { start, end };
};

const getWordBoundaries = (text: string, index: number): { wordStart: number; wordEnd: number } => {
  if (text.length === 0) return { wordStart: 0, wordEnd: 0 };

  if (index < 0) index = 0;
  if (index > text.length) index = text.length;

  if (index === text.length || !/\p{L}|\p{N}/u.test(text[index])) {
    if (index > 0 && /\p{L}|\p{N}/u.test(text[index - 1])) {
      index--;
    } else {
      return { wordStart: index, wordEnd: index };
    }
  }

  let wordStart = index;
  while (wordStart > 0 && /\p{L}|\p{N}/u.test(text[wordStart - 1])) {
    wordStart--;
  }

  let wordEnd = index;
  while (wordEnd < text.length && /\p{L}|\p{N}/u.test(text[wordEnd])) {
    wordEnd++;
  }

  return { wordStart, wordEnd };
};

const getWordBoundariesForRange = (text: string, selectionStart: number, selectionEnd: number): { wordStart: number; wordEnd: number } => {
  if (text.length === 0) return { wordStart: 0, wordEnd: 0 };

  if (selectionStart === selectionEnd) {
    return getWordBoundaries(text, selectionStart);
  }

  let adjustedStart = selectionStart;
  while (adjustedStart > 0 && /\p{L}|\p{N}/u.test(text[adjustedStart - 1])) {
    adjustedStart--;
  }

  let adjustedEnd = selectionEnd;
  while (adjustedEnd < text.length && /\p{L}|\p{N}/u.test(text[adjustedEnd])) {
    adjustedEnd++;
  }

  if (adjustedStart >= adjustedEnd || text.substring(adjustedStart, adjustedEnd).trim().length === 0) {
      const { wordStart, wordEnd } = getWordBoundaries(text, selectionStart);
      if (wordStart < wordEnd) {
          return { wordStart, wordEnd };
      }
      return { wordStart: selectionStart, wordEnd: selectionEnd };
  }

  return { wordStart: adjustedStart, wordEnd: adjustedEnd };
};

const mergeHighlights = (highlights: Highlight[]): Highlight[] => {
  if (highlights.length <= 1) {
    return highlights;
  }

  const sorted = [...highlights].sort((a, b) => a.start - b.start);

  const merged: Highlight[] = [];
  let currentMerge = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
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

interface TextHighlighterProps {
  onSendToWebhook?: (text: string, highlights: Highlight[]) => Promise<void>;
  onSendToTestWebhook?: (text: string, highlights: Highlight[]) => Promise<void>;
  webhookLoading?: boolean;
  testWebhookLoading?: boolean;
  webhookStatus?: string;
  testWebhookStatus?: string;
}

const TextHighlighter: React.FC<TextHighlighterProps> = ({
  onSendToWebhook,
  onSendToTestWebhook,
  webhookLoading = false,
  testWebhookLoading = false,
  webhookStatus = '',
  testWebhookStatus = ''
}) => {
  const [text, setText] = useState<string>(
    "Paste your text here to start highlighting..."
  );
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isPlaceholderText, setIsPlaceholderText] = useState<boolean>(true);
  const textDisplayRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const { cleanText, highlights: existingHighlights } = extractExistingHighlights(text);
    if (existingHighlights.length > 0) {
      setText(cleanText);
      setHighlights(mergeHighlights(existingHighlights));
    }
  }, []);

  const handleMouseUp = () => {
    if (isPlaceholderText) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || !textDisplayRef.current || !textDisplayRef.current.contains(selection.anchorNode) || !textDisplayRef.current.contains(selection.focusNode)) {
        return;
    }

    let { start, end } = getSelectionCharOffsetsWithin(textDisplayRef.current);

    const { wordStart: adjustedStart, wordEnd: adjustedEnd } = getWordBoundariesForRange(text, start, end);

    if (adjustedStart >= adjustedEnd || text.substring(adjustedStart, adjustedEnd).trim().length === 0) {
        selection.removeAllRanges();
        return;
    }

    const newHighlight: Highlight = { start: adjustedStart, end: adjustedEnd };

    setHighlights(prev => mergeHighlights([...prev, newHighlight]));
    selection.removeAllRanges();
  };

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || '';
    
    // Store cursor position before updating state
    const selection = window.getSelection();
    let cursorPosition = 0;
    if (selection && selection.rangeCount > 0 && textDisplayRef.current) {
      const range = selection.getRangeAt(0);
      const preCaretRange = document.createRange();
      preCaretRange.selectNodeContents(textDisplayRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      cursorPosition = preCaretRange.toString().length;
    }
    
    setText(newText);
    
    if (isPlaceholderText && newText !== "Paste your text here to start highlighting...") {
      setIsPlaceholderText(false);
    }
    
    // Restore cursor position after state update
    setTimeout(() => {
      if (textDisplayRef.current && selection) {
        const textNode = textDisplayRef.current.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          const range = document.createRange();
          const adjustedPosition = Math.min(cursorPosition, textNode.textContent?.length || 0);
          range.setStart(textNode, adjustedPosition);
          range.setEnd(textNode, adjustedPosition);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 0);
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

  const generateHighlightedText = () => {
    if (!text) return '';

    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

    let outputParts: string[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach(h => {
      if (h.start > lastIndex) {
        outputParts.push(text.substring(lastIndex, h.start));
      }
      outputParts.push(`<important>${text.substring(h.start, h.end)}</important>`);
      lastIndex = h.end;
    });

    if (lastIndex < text.length) {
      outputParts.push(text.substring(lastIndex));
    }
    
    return outputParts.join('');
  };

  const generateAndDownloadText = () => {
    const outputText = generateHighlightedText();
    if (!outputText) return;

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

  const handleSendToWebhook = async () => {
    if (!text || isPlaceholderText || !onSendToWebhook) return;
    await onSendToWebhook(generateHighlightedText(), highlights);
  };

  const handleSendToTestWebhook = async () => {
    if (!text || isPlaceholderText || !onSendToTestWebhook) return;
    await onSendToTestWebhook(generateHighlightedText(), highlights);
  };

  const renderHighlightedText = useCallback(() => {
    if (highlights.length === 0) {
      return text;
    }

    let lastIndex = 0;
    const parts = [];

    highlights.forEach((h, index) => {
      if (h.start > lastIndex) {
        parts.push(text.substring(lastIndex, h.start));
      }
      parts.push(
        <span
          key={`${h.start}-${h.end}-${index}`}
          className="relative group bg-yellow-300 rounded-sm px-1 py-0.5 cursor-pointer"
        >
          {text.substring(h.start, h.end)}
          <button
            onClick={(e) => {
              e.stopPropagation();
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

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  }, [text, highlights]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Text Highlighter</h2>
        <p className="text-gray-500">Select text with your mouse to highlight it. Click the 'X' on a highlight to remove it.</p>
      </div>

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

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            <span className="font-semibold">{highlights.length}</span> highlight(s) created.
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={handleSendToWebhook}
              disabled={!text || isPlaceholderText || webhookLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {webhookLoading ? 'Sending...' : 'Send to Webhook'}
            </Button>
            <Button
              onClick={handleSendToTestWebhook}
              disabled={!text || isPlaceholderText || testWebhookLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400"
            >
              {testWebhookLoading ? 'Sending...' : 'Send to Test Webhook'}
            </Button>
            <Button
              onClick={generateAndDownloadText}
              disabled={highlights.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              Download Text
            </Button>
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
  );
};

export default TextHighlighter;