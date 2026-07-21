//mobile/src/services/apiClient.ts
import ENV from '../config/env';
import { getToken } from './tokenStorage';

//thrown for any non-2xx response; carries the status code and whatever
//message the backend returned so screens can surface it
export class ApiError extends Error {
    status: number;
    body: any;

    constructor(status: number, message: string, body?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

type QueryParams = Record<string, string | number | boolean | undefined>;

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    params?: QueryParams;
    body?: any;
    //pass a token to override, or null to send the request unauthenticated;
    //omit to use the token in secure storage
    token?: string | null;
}

//single entry point for every backend request: joins the base URL, attaches
//the auth token, serializes JSON, and throws ApiError on non-2xx responses
export async function api<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', params, body } = options;

    let url = ENV.apiUrl + path;
    if (params != undefined) {
        const query = Object.entries(params)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(String(value)))
            .join('&');
        if (query.length > 0) {
            url += '?' + query;
        }
    }

    const token = options.token !== undefined ? options.token : await getToken();

    const headers: Record<string, string> = {};
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    //tolerate empty or non-JSON bodies (e.g. proxy error pages)
    const text = await response.text();
    let json: any = undefined;
    if (text.length > 0) {
        try {
            json = JSON.parse(text);
        } catch {
            json = undefined;
        }
    }

    if (!response.ok) {
        throw new ApiError(
            response.status,
            json?.message ?? json?.error ?? `Request failed (${response.status})`,
            json
        );
    }

    return json as T;
}
