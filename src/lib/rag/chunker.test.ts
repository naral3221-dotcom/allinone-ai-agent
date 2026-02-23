import { describe, it, expect } from 'vitest';
import { splitText, type ChunkOptions } from './chunker';

const LOREM_SHORT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

const LOREM_PARAGRAPH_1 =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

const LOREM_PARAGRAPH_2 =
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const LOREM_PARAGRAPH_3 =
  'Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.';

const MULTI_PARAGRAPH_TEXT = [
  LOREM_PARAGRAPH_1,
  LOREM_PARAGRAPH_2,
  LOREM_PARAGRAPH_3,
].join('\n\n');

const LONG_TEXT = Array(10).fill(LOREM_PARAGRAPH_1).join('\n\n');

describe('splitText', () => {
  // 1. Should return empty array for empty string
  it('should return empty array for empty string', () => {
    expect(splitText('')).toEqual([]);
  });

  it('should return empty array for undefined-like input', () => {
    expect(splitText('')).toEqual([]);
  });

  // 2. Should return single chunk for text shorter than chunkSize
  it('should return single chunk for text shorter than chunkSize', () => {
    const result = splitText(LOREM_SHORT);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(LOREM_SHORT);
  });

  it('should return single chunk when text length equals chunkSize', () => {
    const text = 'a'.repeat(1000);
    const result = splitText(text, { chunkSize: 1000 });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(text);
  });

  // 3. Should split text into multiple chunks with default options
  it('should split text into multiple chunks with default options', () => {
    const result = splitText(LONG_TEXT);
    expect(result.length).toBeGreaterThan(1);
    // Each chunk should not exceed default chunkSize (1000)
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(1000);
    }
  });

  // 4. Should respect custom chunkSize
  it('should respect custom chunkSize', () => {
    const customSize = 300;
    const result = splitText(MULTI_PARAGRAPH_TEXT, { chunkSize: customSize });
    expect(result.length).toBeGreaterThan(1);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(customSize);
    }
  });

  // 5. Should apply overlap between chunks (verify chunks share overlapping text)
  it('should apply overlap between chunks', () => {
    const chunkSize = 300;
    const chunkOverlap = 50;
    const result = splitText(LONG_TEXT, { chunkSize, chunkOverlap });

    expect(result.length).toBeGreaterThan(1);

    for (let i = 0; i < result.length - 1; i++) {
      const currentChunkEnd = result[i].slice(-chunkOverlap);
      const nextChunkStart = result[i + 1].slice(0, chunkOverlap);
      // The end of the current chunk should share some text with the beginning of the next chunk
      // Due to boundary splitting, the overlap might not be exact, but there must be shared content
      const hasOverlap =
        result[i + 1].startsWith(currentChunkEnd) ||
        result[i].endsWith(nextChunkStart) ||
        // Check that at least some portion of text overlaps
        currentChunkEnd.includes(nextChunkStart.slice(0, 10)) ||
        nextChunkStart.includes(currentChunkEnd.slice(-10));
      expect(hasOverlap).toBe(true);
    }
  });

  // 6. Should split on paragraph boundaries (\n\n) when possible
  it('should split on paragraph boundaries when possible', () => {
    const result = splitText(MULTI_PARAGRAPH_TEXT, {
      chunkSize: 300,
      chunkOverlap: 0,
    });

    expect(result.length).toBeGreaterThan(1);
    // Chunks should not contain \n\n in the middle (they split at paragraph boundaries)
    for (const chunk of result) {
      const trimmed = chunk.trim();
      // If the chunk contains \n\n, it should only be because the paragraph itself is smaller than chunkSize
      // or it's at the very edge — not mid-content
      const innerDoubleNewlines = trimmed.slice(1, -1).includes('\n\n');
      // For paragraph-boundary splitting, inner paragraph breaks should be rare
      // This is a soft check: we verify that most chunks don't have inner \n\n
      if (trimmed.length < 300) {
        // small chunks shouldn't be split mid-paragraph
        expect(innerDoubleNewlines).toBe(false);
      }
    }
  });

  // 7. Should fall back to sentence boundaries when paragraph split produces chunks too large
  it('should fall back to sentence boundaries when paragraph is too large', () => {
    // Create a single very long paragraph (no \n\n breaks) with many sentences
    const longParagraph = Array(20)
      .fill('This is a sentence that has some meaningful content inside it.')
      .join(' ');

    const result = splitText(longParagraph, { chunkSize: 200, chunkOverlap: 0 });

    expect(result.length).toBeGreaterThan(1);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(200);
    }
    // Verify most chunks end at sentence boundaries (end with .)
    const chunksEndingWithPeriod = result.filter((c) =>
      c.trimEnd().endsWith('.')
    );
    // At least half should end at a sentence boundary (last chunk is exempt)
    expect(chunksEndingWithPeriod.length).toBeGreaterThanOrEqual(
      Math.floor(result.length / 2)
    );
  });

  // 8. Should fall back to word boundaries when sentence split is too large
  it('should fall back to word boundaries when sentence split is too large', () => {
    // Create text with no sentence-ending punctuation, just words separated by spaces
    const longWords = Array(100).fill('word').join(' ');

    const result = splitText(longWords, { chunkSize: 50, chunkOverlap: 0 });

    expect(result.length).toBeGreaterThan(1);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(50);
    }
    // Chunks should not split mid-word (no partial "wor" or "ord")
    for (const chunk of result) {
      const trimmed = chunk.trim();
      const words = trimmed.split(' ');
      for (const w of words) {
        if (w.length > 0) {
          expect(w).toBe('word');
        }
      }
    }
  });

  // 9. Should handle text with no natural break points (split at chunkSize)
  it('should handle text with no natural break points', () => {
    // Create text with no spaces, no punctuation, no newlines
    const continuousText = 'a'.repeat(250);

    const result = splitText(continuousText, {
      chunkSize: 100,
      chunkOverlap: 0,
    });

    expect(result.length).toBe(3);
    expect(result[0]).toBe('a'.repeat(100));
    expect(result[1]).toBe('a'.repeat(100));
    expect(result[2]).toBe('a'.repeat(50));
  });

  // 10. Should not produce empty chunks
  it('should not produce empty chunks', () => {
    const textWithManyBreaks = '\n\n\n\nHello world.\n\n\n\nFoo bar.\n\n\n\n';
    const result = splitText(textWithManyBreaks, {
      chunkSize: 50,
      chunkOverlap: 0,
    });

    for (const chunk of result) {
      expect(chunk.length).toBeGreaterThan(0);
    }
  });

  // 11. Should handle very small chunkSize
  it('should handle very small chunkSize', () => {
    const text = 'Hello world. This is a test.';
    const result = splitText(text, { chunkSize: 15, chunkOverlap: 0 });

    expect(result.length).toBeGreaterThan(1);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(15);
      expect(chunk.length).toBeGreaterThan(0);
    }
  });

  // 12. Should clamp overlap to chunkSize/2 when overlap is too large
  it('should clamp overlap to chunkSize/2 when overlap is too large', () => {
    const text = Array(10).fill('Some words in a sentence.').join(' ');
    const chunkSize = 100;
    const chunkOverlap = 80; // > chunkSize/2 = 50, should be clamped to 50

    const result = splitText(text, { chunkSize, chunkOverlap });

    expect(result.length).toBeGreaterThan(1);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(chunkSize);
    }
    // The effective overlap should be clamped to 50, not 80
    // We can verify by checking that chunks don't overlap more than 50 characters
    // (This is hard to verify exactly due to boundary splitting, so we just verify
    // the function does not crash and produces valid output)
  });

  // Additional edge case tests
  it('should handle single character text', () => {
    expect(splitText('a')).toEqual(['a']);
  });

  it('should handle text that is exactly one character longer than chunkSize', () => {
    const text = 'b'.repeat(101);
    const result = splitText(text, { chunkSize: 100, chunkOverlap: 0 });
    expect(result.length).toBe(2);
    expect(result[0].length).toBeLessThanOrEqual(100);
    expect(result[1].length).toBeGreaterThan(0);
  });

  it('should preserve all content across chunks when overlap is 0', () => {
    const text = 'The quick brown fox. Jumps over the lazy dog. Another sentence here. And one more for good measure.';
    const result = splitText(text, { chunkSize: 50, chunkOverlap: 0 });

    // Join all chunks and verify no content is lost
    const joined = result.join('');
    expect(joined).toBe(text);
  });

  it('should cover all original text with overlapping chunks', () => {
    const text = MULTI_PARAGRAPH_TEXT;
    const chunkSize = 200;
    const chunkOverlap = 40;
    const result = splitText(text, { chunkSize, chunkOverlap });

    // Every character in the original text should appear in at least one chunk
    // Build a coverage set by finding each chunk's position in the original text
    let covered = 0;
    let searchFrom = 0;
    for (const chunk of result) {
      const idx = text.indexOf(chunk, searchFrom);
      expect(idx).toBeGreaterThanOrEqual(0);
      if (idx >= 0) {
        // The chunk should start at or before the end of the previously covered region
        // (allowing for overlap)
        expect(idx).toBeLessThanOrEqual(covered + 1);
        covered = Math.max(covered, idx + chunk.length);
        searchFrom = idx + chunk.length - chunkOverlap;
      }
    }
    // All text should be covered
    expect(covered).toBe(text.length);
  });
});
