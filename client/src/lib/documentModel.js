const DEFAULT_CHUNK_SIZE = 200;

/**
 * Split plain text into line-based chunks
 */
export function splitIntoChunks(
    text = "",
    chunkSize = DEFAULT_CHUNK_SIZE
) {
    const lines = text.split("\n");

    const chunks = [];

    for (let i = 0; i < lines.length; i += chunkSize) {
        chunks.push({
            id: chunks.length,
            text: lines
                .slice(i, i + chunkSize)
                .join("\n"),
            dirty: false
        });
    }

    if (chunks.length === 0) {
        chunks.push({
            id: 0,
            text: "",
            dirty: false
        });
    }

    return chunks;
}

/**
 * Join chunks back into a single string
 */
export function joinChunks(chunks = []) {
    return chunks
        .map(c => c.text || "")
        .join("\n");
}

/**
 * Update a specific chunk safely
 */
export function updateChunk(
    chunks,
    index,
    newText
) {
    const next = [...chunks];

    next[index] = {
        ...next[index],
        text: newText,
        dirty: true
    };

    return next;
}

/**
 * Optional safety helper:
 * ensures chunk array is always valid
 */
export function normalizeChunks(chunks = []) {
    if (!Array.isArray(chunks) || chunks.length === 0) {
        return [
            {
                id: 0,
                text: "",
                dirty: false
            }
        ];
    }

    return chunks.map((c, i) => ({
        id: c.id ?? i,
        text: c.text ?? "",
        dirty: !!c.dirty
    }));
}