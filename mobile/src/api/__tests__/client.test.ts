// mobile/src/api/__tests__/client.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, NetworkError, apiFetch, setUnauthorizedHandler } from '../client';

const BASE_URL = 'http://10.0.0.5:3000/api';

vi.mock('../../config/env', () => ({
    getApiBaseUrl: () => BASE_URL,
}));

const { getToken } = vi.hoisted(() => ({ getToken: vi.fn() }));
vi.mock('../../services/tokenStorage', () => ({ getToken }));

/** Builds a Response-alike; `fetch` is mocked, so only what apiFetch reads matters. */
function jsonResponse(body: unknown, status = 200): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        text: async () => (body === undefined ? '' : JSON.stringify(body)),
    } as Response;
}

function textResponse(text: string, status: number): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        text: async () => text,
    } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    getToken.mockReset();
    getToken.mockResolvedValue('stored-token');
    setUnauthorizedHandler(null);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

/** Awaits a rejection and hands back the thrown value, failing if it resolves. */
async function rejection(promise: Promise<unknown>): Promise<any> {
    try {
        await promise;
    } catch (error) {
        return error;
    }
    throw new Error('Expected the request to reject, but it resolved');
}

/** The (url, init) pair the single fetch call received. */
function lastCall(): [string, RequestInit] {
    expect(fetchMock).toHaveBeenCalledTimes(1);
    return fetchMock.mock.calls[0] as [string, RequestInit];
}

describe('url construction', () => {
    it('joins the base URL with a path that has no leading slash', async () => {
        await apiFetch('issues/nearby');
        expect(lastCall()[0]).toBe(`${BASE_URL}/issues/nearby`);
    });

    it('does not double the slash when the path has one', async () => {
        await apiFetch('/issues/nearby');
        expect(lastCall()[0]).toBe(`${BASE_URL}/issues/nearby`);
    });

    it('encodes query values', async () => {
        await apiFetch('/issues/user', { query: { id: 'a b&c' } });
        expect(lastCall()[0]).toBe(`${BASE_URL}/issues/user?id=a%20b%26c`);
    });

    it('omits undefined, null, and empty query params', async () => {
        await apiFetch('/issues/nearby', {
            query: { lat: 38.6, limit: undefined, radius: null, q: '' },
        });
        expect(lastCall()[0]).toBe(`${BASE_URL}/issues/nearby?lat=38.6`);
    });

    it('keeps a zero-valued query param', async () => {
        await apiFetch('/issues/nearby', { query: { lat: 0 } });
        expect(lastCall()[0]).toBe(`${BASE_URL}/issues/nearby?lat=0`);
    });

    it('appends no question mark when every param is dropped', async () => {
        await apiFetch('/issues/nearby', { query: { limit: undefined } });
        expect(lastCall()[0]).toBe(`${BASE_URL}/issues/nearby`);
    });
});

describe('request shape', () => {
    it('sends no body or Content-Type for a plain GET', async () => {
        await apiFetch('/issues/nearby');
        const [, init] = lastCall();
        expect(init.method).toBe('GET');
        expect(init.body).toBeUndefined();
        expect(init.headers).not.toHaveProperty('Content-Type');
    });

    it('serializes a body as JSON and sets Content-Type', async () => {
        await apiFetch('/issues/', { method: 'POST', body: { title: 'Pothole' } });
        const [, init] = lastCall();
        expect(init.method).toBe('POST');
        expect(init.body).toBe('{"title":"Pothole"}');
        expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
    });
});

describe('auth', () => {
    it('does not read stored credentials for unauthenticated calls', async () => {
        await apiFetch('/issues/nearby');
        expect(getToken).not.toHaveBeenCalled();
        expect(lastCall()[1].headers).not.toHaveProperty('Authorization');
    });

    it('attaches the stored token when auth is requested', async () => {
        await apiFetch('/issues/', { auth: true });
        expect(lastCall()[1].headers).toMatchObject({ Authorization: 'Bearer stored-token' });
    });

    it('prefers an explicitly passed token over storage', async () => {
        await apiFetch('/auth/user', { auth: true, token: 'explicit-token' });
        expect(getToken).not.toHaveBeenCalled();
        expect(lastCall()[1].headers).toMatchObject({ Authorization: 'Bearer explicit-token' });
    });

    it('fails without issuing a request when no token exists', async () => {
        getToken.mockResolvedValue(null);
        await expect(apiFetch('/issues/', { auth: true })).rejects.toMatchObject({
            name: 'ApiError',
            status: 401,
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('does not log the user out over a locally missing token', async () => {
        // Only the server gets to invalidate a session; firing here would risk a
        // logout loop during startup, before the token has been read.
        const onUnauthorized = vi.fn();
        setUnauthorizedHandler(onUnauthorized);
        getToken.mockResolvedValue(null);

        await expect(apiFetch('/issues/', { auth: true })).rejects.toBeInstanceOf(ApiError);
        expect(onUnauthorized).not.toHaveBeenCalled();
    });
});

describe('error responses', () => {
    it("reads the global error handler's { success, message } shape", async () => {
        fetchMock.mockResolvedValue(jsonResponse({ success: false, message: 'Issue not found' }, 404));
        await expect(apiFetch('/issues/x')).rejects.toMatchObject({
            message: 'Issue not found',
            status: 404,
        });
    });

    it("reads the auth middleware's { error } shape", async () => {
        fetchMock.mockResolvedValue(jsonResponse({ error: 'Invalid or expired token' }, 401));
        await expect(apiFetch('/issues/')).rejects.toMatchObject({
            message: 'Invalid or expired token',
        });
    });

    it('falls back to a non-JSON body', async () => {
        fetchMock.mockResolvedValue(textResponse('Bad Gateway', 502));
        await expect(apiFetch('/issues/')).rejects.toMatchObject({ message: 'Bad Gateway' });
    });

    it('falls back to the status when the body is empty', async () => {
        fetchMock.mockResolvedValue(textResponse('', 500));
        await expect(apiFetch('/issues/')).rejects.toMatchObject({
            message: 'Request failed with status 500',
        });
    });

    it('exposes the parsed body for callers that need detail', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ message: 'Nope', errors: ['title'] }, 400));
        const error = await rejection(apiFetch('/issues/'));
        expect(error).toBeInstanceOf(ApiError);
        expect(error.body).toEqual({ message: 'Nope', errors: ['title'] });
    });
});

describe('unauthorized handling', () => {
    it('notifies the handler on a server 401', async () => {
        const onUnauthorized = vi.fn();
        setUnauthorizedHandler(onUnauthorized);
        fetchMock.mockResolvedValue(jsonResponse({ error: 'Invalid or expired token' }, 401));

        await expect(apiFetch('/issues/')).rejects.toBeInstanceOf(ApiError);
        expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('leaves the session alone for other failures', async () => {
        const onUnauthorized = vi.fn();
        setUnauthorizedHandler(onUnauthorized);

        for (const status of [400, 403, 404, 500]) {
            fetchMock.mockResolvedValue(jsonResponse({ message: 'nope' }, status));
            await expect(apiFetch('/issues/')).rejects.toBeInstanceOf(ApiError);
        }
        expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('stops notifying once the handler is cleared', async () => {
        const onUnauthorized = vi.fn();
        setUnauthorizedHandler(onUnauthorized);
        setUnauthorizedHandler(null);
        fetchMock.mockResolvedValue(jsonResponse({ error: 'nope' }, 401));

        await expect(apiFetch('/issues/')).rejects.toBeInstanceOf(ApiError);
        expect(onUnauthorized).not.toHaveBeenCalled();
    });
});

describe('transport failures', () => {
    it('reports an unreachable server as a NetworkError', async () => {
        fetchMock.mockRejectedValue(new TypeError('Network request failed'));
        const error = await rejection(apiFetch('/issues/'));
        expect(error).toBeInstanceOf(NetworkError);
        expect(error.message).toMatch(/could not reach the server/i);
    });

    it('reports a timeout distinctly from an unreachable server', async () => {
        fetchMock.mockImplementation(
            (_url: string, init: RequestInit) =>
                new Promise((_resolve, reject) => {
                    init.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
                }),
        );

        const error = await rejection(apiFetch('/issues/', { timeoutMs: 50 }));
        expect(error).toBeInstanceOf(NetworkError);
        expect(error.message).toMatch(/timed out/i);
    });

    it('propagates a caller-initiated abort so React Query treats it as a cancellation', async () => {
        const controller = new AbortController();
        fetchMock.mockImplementation(
            (_url: string, init: RequestInit) =>
                new Promise((_resolve, reject) => {
                    init.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
                }),
        );

        const promise = rejection(apiFetch('/issues/', { signal: controller.signal }));
        controller.abort();
        const error = await promise;

        // Must not be reshaped into a NetworkError — a cancelled query is not a failure.
        expect(error).not.toBeInstanceOf(NetworkError);
        expect(error.message).toBe('Aborted');
    });
});

describe('success responses', () => {
    it('returns the parsed JSON payload', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ issues: [{ id: '1' }] }));
        await expect(apiFetch('/issues/nearby')).resolves.toEqual({ issues: [{ id: '1' }] });
    });

    it('returns null for an empty body', async () => {
        fetchMock.mockResolvedValue(textResponse('', 204));
        await expect(apiFetch('/issues/x/upvote', { method: 'DELETE' })).resolves.toBeNull();
    });
});
