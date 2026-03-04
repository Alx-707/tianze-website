/**
 * Idempotency Store — Interface and In-Memory Implementation
 *
 * Provides atomic set-if-not-exists (SETNX) semantics for idempotency
 * protection. The state machine (PENDING → COMPLETED) is implemented in
 * src/lib/idempotency.ts on top of this interface.
 *
 * Storage backend decision (Task 025):
 * - D1 adapter is planned (INSERT … ON CONFLICT DO NOTHING) but not yet implemented
 * - Fallback: In-memory (local development / current behavior)
 *
 * State model:
 * - PENDING: Request is being processed (set by SETNX)
 * - COMPLETED: Request finished successfully (set by complete())
 */

export type IdempotencyStatus = "PENDING" | "COMPLETED";

export interface IdempotencyEntry {
  status: IdempotencyStatus;
  result?: unknown;
  statusCode?: number;
  fingerprint?: string;
  createdAt: number;
  expiresAt: number;
}

export interface IdempotencyStore {
  /**
   * Atomically set a key only if it does not exist (SETNX semantics).
   * Returns true if the key was set, false if it already existed.
   */
  setIfNotExists(
    key: string,
    entry: IdempotencyEntry,
    ttlMs: number,
  ): Promise<boolean>;

  /**
   * Get an existing idempotency entry.
   * Returns null if the key does not exist or has expired.
   */
  get(key: string): Promise<IdempotencyEntry | null>;

  /**
   * Transition a PENDING entry to COMPLETED, storing the handler result.
   * Narrowed to only the legal PENDING → COMPLETED transition; prevents callers
   * from making arbitrary field mutations that would corrupt the state machine.
   */
  complete(key: string, result: unknown, statusCode: number): Promise<void>;

  /**
   * Delete a key (e.g., on handler failure to allow retry).
   */
  delete(key: string): Promise<void>;
}

// ==================== In-Memory Implementation ====================

const CLEANUP_INTERVAL_MS = 60_000;

export class MemoryIdempotencyStore implements IdempotencyStore {
  private store = new Map<string, IdempotencyEntry>();
  private lastCleanupAt = 0;

  private maybeCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanupAt < CLEANUP_INTERVAL_MS) return;
    this.lastCleanupAt = now;
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  // eslint-disable-next-line require-await -- Interface requires async for distributed store compatibility
  async setIfNotExists(
    key: string,
    entry: IdempotencyEntry,
    _ttlMs: number,
  ): Promise<boolean> {
    this.maybeCleanup();

    const existing = this.store.get(key);
    if (existing && Date.now() < existing.expiresAt) {
      return false;
    }

    this.store.set(key, entry);
    return true;
  }

  // eslint-disable-next-line require-await -- Interface requires async for distributed store compatibility
  async get(key: string): Promise<IdempotencyEntry | null> {
    this.maybeCleanup();

    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  // eslint-disable-next-line require-await -- Interface requires async for distributed store compatibility
  async complete(
    key: string,
    result: unknown,
    statusCode: number,
  ): Promise<void> {
    const existing = this.store.get(key);
    if (!existing) return;

    this.store.set(key, {
      ...existing,
      status: "COMPLETED",
      result,
      statusCode,
    });
  }

  // eslint-disable-next-line require-await -- Interface requires async for distributed store compatibility
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  /** Clear all entries (for testing) */
  clear(): void {
    this.store.clear();
  }
}

// ==================== Store Factory ====================

/**
 * Create the appropriate idempotency store based on available configuration.
 * D1 adapter is planned (Task 025) but not yet implemented.
 */
export function createIdempotencyStore(): IdempotencyStore {
  return new MemoryIdempotencyStore();
}
