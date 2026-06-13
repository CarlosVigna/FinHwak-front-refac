const BASE_URL = import.meta.env.VITE_API_URL;

let _onUnauthorized = null;
let _isRefreshing = false;
let _refreshQueue = [];

export function setUnauthorizedHandler(fn) {
    _onUnauthorized = fn;
}

function processQueue(error, token = null) {
    _refreshQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    _refreshQueue = [];
}

async function tryRefresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error('Refresh failed');

    const data = await res.json();
    localStorage.setItem('token', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    return data.token;
}

async function request(path, options = {}, _retry = false) {
    const token = localStorage.getItem('token');

    const headers = { ...options.headers };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (response.status === 401 && !_retry) {
        if (_isRefreshing) {
            return new Promise((resolve, reject) => {
                _refreshQueue.push({ resolve, reject });
            }).then(newToken => {
                headers['Authorization'] = `Bearer ${newToken}`;
                return fetch(`${BASE_URL}${path}`, { ...options, headers });
            });
        }

        _isRefreshing = true;
        try {
            const newToken = await tryRefresh();
            processQueue(null, newToken);
            return request(path, options, true);
        } catch {
            processQueue(new Error('Session expired'));
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            if (_onUnauthorized) _onUnauthorized();
            throw new Error('Sessão expirada. Faça login novamente.');
        } finally {
            _isRefreshing = false;
        }
    }

    if (response.status === 402) {
        const body = await response.json().catch(() => ({}));
        window.dispatchEvent(new CustomEvent('plan-limit', { detail: body }));
        throw new Error(body.message || 'Limite do plano gratuito atingido.');
    }

    return response;
}

export const api = {
    get: (path, options = {}) =>
        request(path, { ...options, method: 'GET' }),

    post: (path, body, options = {}) =>
        request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),

    put: (path, body, options = {}) =>
        request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),

    patch: (path, body, options = {}) =>
        request(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

    delete: (path, options = {}) =>
        request(path, { ...options, method: 'DELETE' }),

    blob: (path, options = {}) =>
        request(path, { ...options, method: 'GET' }),
};
