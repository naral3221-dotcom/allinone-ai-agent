export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

const SEPARATORS = ['\n\n', '\n', '. ', '! ', '? ', ' ', ''];

export function splitText(text: string, options?: ChunkOptions): string[] {
  const chunkSize = options?.chunkSize ?? 1000;
  const chunkOverlap = Math.min(
    options?.chunkOverlap ?? 200,
    Math.floor(chunkSize / 2)
  );

  if (!text || text.length === 0) return [];
  if (text.length <= chunkSize) return [text];

  return recursiveSplit(text, SEPARATORS, chunkSize, chunkOverlap);
}

function recursiveSplit(
  text: string,
  separators: string[],
  chunkSize: number,
  chunkOverlap: number
): string[] {
  if (text.length <= chunkSize) {
    return text.length > 0 ? [text] : [];
  }

  // Find the best separator that actually splits this text
  let bestSeparator = '';
  for (const sep of separators) {
    if (sep === '') {
      bestSeparator = sep;
      break;
    }
    if (text.includes(sep)) {
      bestSeparator = sep;
      break;
    }
  }

  // Split text by the chosen separator
  const pieces =
    bestSeparator === ''
      ? forceSplit(text, chunkSize)
      : splitBySeparator(text, bestSeparator);

  // Remaining separators for recursion (everything after the current one)
  const remainingSeparators =
    bestSeparator === ''
      ? ['']
      : separators.slice(separators.indexOf(bestSeparator) + 1);

  // Merge small pieces together, recurse on large ones
  return mergePieces(
    pieces,
    bestSeparator,
    remainingSeparators,
    chunkSize,
    chunkOverlap
  );
}

function splitBySeparator(text: string, separator: string): string[] {
  const parts = text.split(separator);
  const result: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (i < parts.length - 1) {
      // Re-attach the separator to the piece (except for the last one)
      result.push(parts[i] + separator);
    } else {
      result.push(parts[i]);
    }
  }

  return result.filter((p) => p.length > 0);
}

function forceSplit(text: string, chunkSize: number): string[] {
  const pieces: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    pieces.push(text.slice(i, i + chunkSize));
  }
  return pieces;
}

function mergePieces(
  pieces: string[],
  separator: string,
  remainingSeparators: string[],
  chunkSize: number,
  chunkOverlap: number
): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  let overlapBuffer = '';

  for (const piece of pieces) {
    // If a single piece is larger than chunkSize, recurse with finer separators
    if (piece.length > chunkSize) {
      // First, flush the current chunk if non-empty
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        overlapBuffer = getOverlapText(currentChunk, chunkOverlap);
        currentChunk = '';
      }

      // Recurse on the large piece
      const subChunks = recursiveSplit(
        piece,
        remainingSeparators,
        chunkSize,
        chunkOverlap
      );

      if (subChunks.length > 0) {
        // Prepend overlap to first sub-chunk if it fits
        if (overlapBuffer.length > 0) {
          const first = overlapBuffer + subChunks[0];
          if (first.length <= chunkSize) {
            subChunks[0] = first;
          } else {
            // The overlap + first sub-chunk is too large; just push overlap as separate consideration
            // We'll let the sub-chunks handle themselves
          }
        }

        for (const sc of subChunks) {
          chunks.push(sc);
        }

        // Set overlap from the last sub-chunk
        overlapBuffer = getOverlapText(
          subChunks[subChunks.length - 1],
          chunkOverlap
        );
      }
      continue;
    }

    // Try to add piece to current chunk
    const candidate = currentChunk + piece;

    if (candidate.length <= chunkSize) {
      currentChunk = candidate;
    } else {
      // Current chunk is full, push it
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        overlapBuffer = getOverlapText(currentChunk, chunkOverlap);
      }

      // Start new chunk with overlap + piece
      if (chunkOverlap > 0 && overlapBuffer.length > 0) {
        const withOverlap = overlapBuffer + piece;
        if (withOverlap.length <= chunkSize) {
          currentChunk = withOverlap;
        } else {
          // Overlap + piece is too large, just start with the piece
          currentChunk = piece;
        }
      } else {
        currentChunk = piece;
      }
    }
  }

  // Push remaining chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks.filter((c) => c.length > 0);
}

function getOverlapText(chunk: string, overlapSize: number): string {
  if (overlapSize <= 0 || chunk.length === 0) return '';
  return chunk.slice(-overlapSize);
}
