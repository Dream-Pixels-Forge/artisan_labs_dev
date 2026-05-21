// =============================================================================
// Artisan Labs — IndexedDB Manager
// =============================================================================
// Provides raw binary Blob storage for extracted sequences, ensuring persistence
// across reloads and eliminating memory/localStorage quota limits.
// =============================================================================

import type { Sequence, FrameData } from '@/types';

const DB_NAME = 'artisan-labs-db';
const DB_VERSION = 1;
const STORE_NAME = 'sequences';

/**
 * Open or initialize the IndexedDB connection
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in the browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Convert a base64 Data URL to a Blob
 */
export function dataURLToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Convert a Blob to a base64 Data URL (if needed for fallback)
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Interface for DB sequence record
 */
interface DBSequenceRecord {
  id: string;
  name: string;
  timestamp: string;
  videoName: string;
  format: Sequence['format'];
  frameCount: number;
  width: number;
  height: number;
  fileSize: number;
  // Store frames in raw Blob format for space & CPU efficiency
  frames: Array<{
    blob: Blob;
    timestamp: number;
    frameNumber: number;
  }>;
}

/**
 * Save a sequence persistently in IndexedDB
 */
export async function saveSequenceToDB(sequence: Sequence): Promise<void> {
  const db = await openDB();

  // Convert Base64 frame data to binary Blobs
  const dbFrames = sequence.frames.map((frame) => {
    let blob: Blob;
    if (frame.dataUrl.startsWith('data:')) {
      blob = dataURLToBlob(frame.dataUrl);
    } else if (frame.dataUrl.startsWith('blob:')) {
      // If it is already an object URL, we need to fetch the blob (should rarely happen on saving new sequences)
      throw new Error('Attempting to save an already hydrated object URL');
    } else {
      blob = new Blob([frame.dataUrl], { type: 'image/png' });
    }

    return {
      blob,
      timestamp: frame.timestamp,
      frameNumber: frame.frameNumber,
    };
  });

  const record: DBSequenceRecord = {
    id: sequence.id,
    name: sequence.name,
    timestamp: sequence.timestamp,
    videoName: sequence.videoName,
    format: sequence.format,
    frameCount: sequence.frameCount,
    width: sequence.width,
    height: sequence.height,
    fileSize: sequence.fileSize,
    frames: dbFrames,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load a sequence and hydrate frame Blobs to Object URLs
 */
export async function loadSequenceFromDB(id: string): Promise<Sequence | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const record = request.result as DBSequenceRecord | undefined;
      if (!record) {
        resolve(null);
        return;
      }

      // Convert Blobs to Object URLs
      const frames: FrameData[] = record.frames.map((f) => ({
        dataUrl: URL.createObjectURL(f.blob),
        timestamp: f.timestamp,
        frameNumber: f.frameNumber,
      }));

      resolve({
        id: record.id,
        name: record.name,
        timestamp: record.timestamp,
        videoName: record.videoName,
        format: record.format,
        frameCount: record.frameCount,
        width: record.width,
        height: record.height,
        fileSize: record.fileSize,
        frames,
      });
    };
  });
}

/**
 * Load all sequences from IndexedDB and hydrate them
 */
export async function loadAllSequencesFromDB(): Promise<Sequence[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const records = request.result as DBSequenceRecord[];
      const sequences: Sequence[] = records.map((record) => {
        const frames: FrameData[] = record.frames.map((f) => ({
          dataUrl: URL.createObjectURL(f.blob),
          timestamp: f.timestamp,
          frameNumber: f.frameNumber,
        }));

        return {
          id: record.id,
          name: record.name,
          timestamp: record.timestamp,
          videoName: record.videoName,
          format: record.format,
          frameCount: record.frameCount,
          width: record.width,
          height: record.height,
          fileSize: record.fileSize,
          frames,
        };
      });

      resolve(sequences);
    };
  });
}

/**
 * Delete a sequence from IndexedDB.
 * Also revokes any Object URLs for the frames being removed to prevent memory leaks.
 */
export async function deleteSequenceFromDB(id: string, framesToCleanup?: { dataUrl: string }[]): Promise<void> {
  // Revoke Object URLs before deleting
  if (framesToCleanup) {
    for (const frame of framesToCleanup) {
      if (frame.dataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(frame.dataUrl);
      }
    }
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all sequences from IndexedDB.
 * Also revokes any Object URLs for loaded sequences to prevent memory leaks.
 */
export async function clearAllSequencesFromDB(sequencesToCleanup?: { frames: { dataUrl: string }[] }[]): Promise<void> {
  // Revoke Object URLs before clearing
  if (sequencesToCleanup) {
    for (const seq of sequencesToCleanup) {
      for (const frame of seq.frames) {
        if (frame.dataUrl.startsWith('blob:')) {
          URL.revokeObjectURL(frame.dataUrl);
        }
      }
    }
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
