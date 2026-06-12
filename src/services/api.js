const BASE_URL = import.meta.env.VITE_API_URL;

let _onUnauthorized = null;

export function setUnauthorizedHandler(fn) {
    _onUnauthorized = fn;
}

async function request(path, options = {}) {
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

    if (response.status === 401) {
        if (_onUnauthorized) _onUnauthorized();
        throw new Error('Sessão expirada. Faça login novamente.');
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

    delete: (path, options = {}) =>
        request(path, { ...options, method: 'DELETE' }),

    blob: (path, options = {}) =>
        request(path, { ...options, method: 'GET' }),
};
