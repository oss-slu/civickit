// mobile/src/api/client.ts
import { getApiBaseUrl } from '../config/env';
import { getToken } from '../services/tokenStorage';

const DEFAULT_TIMEOUT_MS = 15_000;

/** The server responded, but with a non-2xx status. */
export class ApiError extends Error {
    readonly status: number;
    readonly body: unknown;

    constructor(message: string, status: number, body: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }

    get isUnauthorized(): boolean {
        return this.status === 401;
    }
}

/** The request never got a response — offline, DNS failure, or timeout. */
export class NetworkError extends Error {
    readonly cause?: unknown;

    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = 'NetworkError';
        this.cause = cause;
    }
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/**
 * Registered once by AuthProvider so that a token rejected mid-session tears
 * down auth state instead of leaving the app stuck in a signed-in shell.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
    unauthorizedHandler = handler;
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: QueryParams;
    /** Serialized as JSON. Omit for requests without a body. */
    body?: unknown;
    /** Attach a bearer token. Reads from SecureStore unless `token` is given. */
    auth?: boolean;
    /** Explicit token, for callers that already hold one (e.g. AuthProvider). */
    token?: string | null;
    timeoutMs?: number;
    signal?: AbortSignal;
}

function buildUrl(path: string, query?: QueryParams): string {
    const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
    if (!query) return url;

    const pairs = Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

    return pairs.length > 0 ? `${url}?${pairs.join('&')}` : url;
}

async function parseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

/**
 * The backend is not consistent about error shapes: the global error handler
 * emits `{ success, message }`, while auth middleware and a few controllers
 * emit `{ error }`. Accept both so the UI always has something to show.
 */
function extractErrorMessage(body: unknown, status: number): string {
    if (body !== null && typeof body === 'object') {
        for (const key of ['message', 'error'] as const) {
            const value = (body as Record<string, unknown>)[key];
            if (typeof value === 'string' && value.length > 0) return value;
        }
    }
    if (typeof body === 'string' && body.trim().length > 0) return body;
    return `Request failed with status ${status}`;
}

/**
 * Single entry point for every backend call: resolves the base URL, attaches
 * auth, enforces a timeout, and normalizes failures into ApiError/NetworkError.
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
        method = 'GET',
        query,
        body,
        auth = false,
        token,
        timeoutMs = DEFAULT_TIMEOUT_MS,
        signal,
    } = options;

    // Resolved before the request so a misconfigured base URL surfaces its own
    // error rather than being reported as an unreachable server.
    const url = buildUrl(path, query);

    const headers: Record<string, string> = { Accept: 'application/json' };

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    if (auth) {
        // `token: null` is an explicit "no token"; omitting it reads SecureStore.
        const bearer = token !== undefined ? token : await getToken();
        if (!bearer) {
            throw new ApiError('You are not signed in.', 401, null);
        }
        headers.Authorization = `Bearer ${bearer}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const forwardAbort = () => controller.abort();
    signal?.addEventListener('abort', forwardAbort);

    let response: Response;
    try {
        response = await fetch(url, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: controller.signal,
        });
    } catch (error) {
        // A caller-initiated abort must stay an abort so React Query treats it
        // as a cancellation rather than a failure.
        if (signal?.aborted) throw error;
        if (controller.signal.aborted) {
            throw new NetworkError('The request timed out. Check your connection and try again.', error);
        }
        throw new NetworkError('Could not reach the server. Check your connection and try again.', error);
    } finally {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', forwardAbort);
    }

    const payload = await parseBody(response);

    if (!response.ok) {
        if (response.status === 401) {
            unauthorizedHandler?.();
        }
        throw new ApiError(extractErrorMessage(payload, response.status), response.status, payload);
    }

    return payload as T;
}
