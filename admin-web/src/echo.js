import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const initEcho = () => {
    // Only init if we actually have token and Reverb is explicitly enabled
    const token = localStorage.getItem('token');
    const isEnabled = import.meta.env.VITE_REVERB_ENABLED === 'true';

    if (!isEnabled) {
        console.log("Real-time Echo disabled (set VITE_REVERB_ENABLED=true in .env to enable)");
        return null;
    }
    
    return new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY || 'campusfix_key',
        wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
        wsPort: import.meta.env.VITE_REVERB_PORT || 8081,
        wssPort: import.meta.env.VITE_REVERB_PORT || 8081,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
        auth: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};

let echoInstance = null;

export const getEcho = () => {
    if (!echoInstance && localStorage.getItem('token')) {
        echoInstance = initEcho();
    }
    return echoInstance;
};

export const clearEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
};
