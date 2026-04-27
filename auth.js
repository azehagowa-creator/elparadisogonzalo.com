// ─── auth.js ──────────────────────────────────────────────────────────────────
// Authentication & Authorization Module for El Paradiso Gonzalo
// Supports: Web3 Wallet Auth (MetaMask/WalletConnect), JWT Sessions, Role-Based Access
// Version: 1.0.0
// Author: Koagonzalo

(function(global) {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────────────────────
    const CONFIG = {
        // API Endpoints
        API_BASE: '/api/v1',
        AUTH_ENDPOINT: '/auth',

        // Token Settings
        JWT_STORAGE_KEY: 'epg_auth_token',
        REFRESH_STORAGE_KEY: 'epg_refresh_token',
        WALLET_NONCE_KEY: 'epg_wallet_nonce',
        SESSION_KEY: 'epg_session',

        // Timing
        TOKEN_REFRESH_BUFFER: 5 * 60 * 1000,  // Refresh 5 min before expiry
        SESSION_TIMEOUT: 30 * 60 * 1000,       // 30 min idle timeout
        NONCE_EXPIRY: 5 * 60 * 1000,           // 5 min nonce validity

        // Security
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION: 15 * 60 * 1000,    // 15 min lockout

        // Supported Chains
        SUPPORTED_CHAINS: {
            1: { name: 'Ethereum Mainnet', symbol: 'ETH', rpc: 'https://eth-mainnet.g.alchemy.com/v2/' },
            56: { name: 'BSC Mainnet', symbol: 'BNB', rpc: 'https://bsc-dataseed.binance.org/' },
            137: { name: 'Polygon', symbol: 'MATIC', rpc: 'https://polygon-rpc.com/' },
            42161: { name: 'Arbitrum', symbol: 'ETH', rpc: 'https://arb1.arbitrum.io/rpc' },
            10: { name: 'Optimism', symbol: 'ETH', rpc: 'https://mainnet.optimism.io/' },
            1337: { name: 'Localhost', symbol: 'ETH', rpc: 'http://localhost:8545' },
            31337: { name: 'Hardhat', symbol: 'ETH', rpc: 'http://localhost:8545' }
        },

        // Contract Addresses (replace with actual deployed addresses)
        CONTRACTS: {
            1: { auth: '0x0000000000000000000000000000000000000000' },
            56: { auth: '0x0000000000000000000000000000000000000000' },
            1337: { auth: '0x0000000000000000000000000000000000000000' }
        }
    };

    // ─── State Management ─────────────────────────────────────────────────────
    const state = {
        isAuthenticated: false,
        user: null,
        wallet: {
            address: null,
            chainId: null,
            provider: null,
            signer: null
        },
        session: {
            token: null,
            refreshToken: null,
            expiresAt: null,
            lastActivity: Date.now()
        },
        loginAttempts: new Map(),  // IP/address -> { count, lockedUntil }
        listeners: new Map()
    };

    // ─── Event System ─────────────────────────────────────────────────────────
    class AuthEventEmitter {
        constructor() {
            this.events = new Map();
        }

        on(event, callback) {
            if (!this.events.has(event)) this.events.set(event, []);
            this.events.get(event).push(callback);
            return () => this.off(event, callback);
        }

        off(event, callback) {
            if (!this.events.has(event)) return;
            const callbacks = this.events.get(event).filter(cb => cb !== callback);
            this.events.set(event, callbacks);
        }

        emit(event, data) {
            if (!this.events.has(event)) return;
            this.events.get(event).forEach(cb => {
                try { cb(data); } catch (err) { console.error('Auth event error:', err); }
            });
        }
    }

    const events = new AuthEventEmitter();

    // ─── Utility Functions ────────────────────────────────────────────────────
    const utils = {
        // Generate cryptographically secure random string
        generateNonce(length = 32) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            const randomValues = new Uint8Array(length);
            if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
                crypto.getRandomValues(randomValues);
                for (let i = 0; i < length; i++) {
                    result += chars[randomValues[i] % chars.length];
                }
            } else {
                for (let i = 0; i < length; i++) {
                    result += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            return result;
        },

        // SHA-256 hash
        async sha256(message) {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        },

        // Base64 URL-safe encoding
        base64UrlEncode(str) {
            return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        },

        // Parse JWT without verification (for expiry checks)
        parseJwt(token) {
            try {
                const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
                const json = atob(base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '='));
                return JSON.parse(json);
            } catch (e) {
                return null;
            }
        },

        // Check if token is expired
        isTokenExpired(token) {
            const decoded = this.parseJwt(token);
            if (!decoded || !decoded.exp) return true;
            return (decoded.exp * 1000) < (Date.now() + CONFIG.TOKEN_REFRESH_BUFFER);
        },

        // Format wallet address
        formatAddress(address, chars = 4) {
            if (!address || address.length < chars * 2 + 2) return address;
            return address.slice(0, chars + 2) + '...' + address.slice(-chars);
        },

        // Local storage with expiry
        storage: {
            set(key, value, ttlMs = null) {
                const item = { value, timestamp: Date.now(), ttl: ttlMs };
                localStorage.setItem(key, JSON.stringify(item));
            },

            get(key) {
                const raw = localStorage.getItem(key);
                if (!raw) return null;
                try {
                    const item = JSON.parse(raw);
                    if (item.ttl && (Date.now() - item.timestamp) > item.ttl) {
                        localStorage.removeItem(key);
                        return null;
                    }
                    return item.value;
                } catch (e) {
                    return raw; // Legacy fallback
                }
            },

            remove(key) {
                localStorage.removeItem(key);
            },

            clear() {
                localStorage.clear();
            }
        },

        // Debounce function
        debounce(fn, ms) {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn(...args), ms);
            };
        },

        // Rate limiter for login attempts
        checkRateLimit(identifier) {
            const now = Date.now();
            const record = state.loginAttempts.get(identifier);

            if (!record) {
                state.loginAttempts.set(identifier, { count: 1, lockedUntil: 0, lastAttempt: now });
                return { allowed: true, remaining: CONFIG.MAX_LOGIN_ATTEMPTS - 1 };
            }

            // Check if lockout expired
            if (record.lockedUntil > now) {
                return { 
                    allowed: false, 
                    lockedUntil: record.lockedUntil,
                    remaining: 0 
                };
            }

            // Reset if lockout period passed
            if (record.lockedUntil > 0 && now > record.lockedUntil) {
                state.loginAttempts.set(identifier, { count: 1, lockedUntil: 0, lastAttempt: now });
                return { allowed: true, remaining: CONFIG.MAX_LOGIN_ATTEMPTS - 1 };
            }

            // Check max attempts
            if (record.count >= CONFIG.MAX_LOGIN_ATTEMPTS) {
                const lockedUntil = now + CONFIG.LOCKOUT_DURATION;
                record.lockedUntil = lockedUntil;
                state.loginAttempts.set(identifier, record);
                return { allowed: false, lockedUntil, remaining: 0 };
            }

            record.count++;
            record.lastAttempt = now;
            state.loginAttempts.set(identifier, record);

            return { allowed: true, remaining: CONFIG.MAX_LOGIN_ATTEMPTS - record.count };
        }
    };

    // ─── Web3 Provider Detection ────────────────────────────────────────────
    const web3Provider = {
        // Detect available providers
        detect() {
            const providers = [];

            // MetaMask / injected
            if (window.ethereum) {
                if (window.ethereum.isMetaMask) providers.push({ name: 'MetaMask', provider: window.ethereum });
                else if (window.ethereum.isCoinbaseWallet) providers.push({ name: 'Coinbase Wallet', provider: window.ethereum });
                else providers.push({ name: 'Injected Wallet', provider: window.ethereum });
            }

            // WalletConnect v2 would be initialized here
            // if (window.WalletConnectProvider) providers.push({ name: 'WalletConnect', provider: ... });

            return providers;
        },

        // Request account access
        async requestAccounts(provider = window.ethereum) {
            if (!provider) throw new Error('No Web3 provider available');

            try {
                const accounts = await provider.request({ method: 'eth_requestAccounts' });
                return accounts;
            } catch (err) {
                if (err.code === 4001) throw new Error('User rejected connection');
                throw err;
            }
        },

        // Get current chain ID
        async getChainId(provider = window.ethereum) {
            if (!provider) return null;
            const chainId = await provider.request({ method: 'eth_chainId' });
            return parseInt(chainId, 16);
        },

        // Switch chain
        async switchChain(chainId, provider = window.ethereum) {
            if (!provider) throw new Error('No provider');

            const hexChainId = '0x' + chainId.toString(16);

            try {
                await provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: hexChainId }]
                });
            } catch (switchError) {
                // Chain not added, try to add it
                if (switchError.code === 4902) {
                    await this.addChain(chainId, provider);
                } else {
                    throw switchError;
                }
            }
        },

        // Add chain to wallet
        async addChain(chainId, provider = window.ethereum) {
            const chain = CONFIG.SUPPORTED_CHAINS[chainId];
            if (!chain) throw new Error('Unsupported chain');

            // Chain config for MetaMask
            const chainConfig = {
                chainId: '0x' + chainId.toString(16),
                chainName: chain.name,
                nativeCurrency: { name: chain.symbol, symbol: chain.symbol, decimals: 18 },
                rpcUrls: [chain.rpc],
                blockExplorerUrls: [] // Add explorer URLs as needed
            };

            await provider.request({
                method: 'wallet_addEthereumChain',
                params: [chainConfig]
            });
        },

        // Sign message (for wallet authentication)
        async signMessage(message, account, provider = window.ethereum) {
            if (!provider) throw new Error('No provider');

            try {
                const signature = await provider.request({
                    method: 'personal_sign',
                    params: [message, account]
                });
                return signature;
            } catch (err) {
                if (err.code === 4001) throw new Error('User rejected signature');
                throw err;
            }
        },

        // Get balance
        async getBalance(address, provider = window.ethereum) {
            if (!provider) return '0';
            const balance = await provider.request({
                method: 'eth_getBalance',
                params: [address, 'latest']
            });
            return (parseInt(balance, 16) / 1e18).toFixed(4);
        },

        // Listen for account changes
        onAccountsChanged(callback, provider = window.ethereum) {
            if (!provider) return () => {};
            const handler = (accounts) => callback(accounts);
            provider.on('accountsChanged', handler);
            return () => provider.removeListener('accountsChanged', handler);
        },

        // Listen for chain changes
        onChainChanged(callback, provider = window.ethereum) {
            if (!provider) return () => {};
            const handler = (chainId) => callback(parseInt(chainId, 16));
            provider.on('chainChanged', handler);
            return () => provider.removeListener('chainChanged', handler);
        },

        // Listen for disconnect
        onDisconnect(callback, provider = window.ethereum) {
            if (!provider) return () => {};
            provider.on('disconnect', callback);
            return () => provider.removeListener('disconnect', callback);
        }
    };

    // ─── API Client ───────────────────────────────────────────────────────────
    const api = {
        async request(endpoint, options = {}) {
            const url = CONFIG.API_BASE + endpoint;
            const token = state.session.token;

            const defaults = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            };

            const response = await fetch(url, { ...defaults, ...options });

            if (response.status === 401) {
                // Try to refresh token
                const refreshed = await auth.refreshToken();
                if (refreshed) {
                    // Retry request
                    return this.request(endpoint, options);
                }
                // Refresh failed, logout
                await auth.logout();
                throw new Error('Session expired');
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return response.json();
        },

        // Get nonce for wallet authentication
        async getNonce(address) {
            return this.request(`${CONFIG.AUTH_ENDPOINT}/nonce`, {
                method: 'POST',
                body: JSON.stringify({ address })
            });
        },

        // Verify wallet signature
        async verifyWallet(address, signature, nonce) {
            return this.request(`${CONFIG.AUTH_ENDPOINT}/wallet`, {
                method: 'POST',
                body: JSON.stringify({ address, signature, nonce })
            });
        },

        // Traditional login
        async login(email, password) {
            return this.request(`${CONFIG.AUTH_ENDPOINT}/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
        },

        // Register
        async register(userData) {
            return this.request(`${CONFIG.AUTH_ENDPOINT}/register`, {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },

        // Refresh token
        async refresh(refreshToken) {
            return this.request(`${CONFIG.AUTH_ENDPOINT}/refresh`, {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            });
        },

        // Logout
        async logoutServer() {
            return this.request(`${CONFIG.AUTH_ENDPOINT}/logout`, {
                method: 'POST'
            });
        },

        // Get current user
        async getMe() {
            return this.request(`${CONFIG.AUTH_ENDPOINT}/me`);
        }
    };

    // ─── Main Auth Module ─────────────────────────────────────────────────────
    const auth = {
        // Initialize auth system
        async init() {
            // Restore session from storage
            const token = utils.storage.get(CONFIG.JWT_STORAGE_KEY);
            const refreshToken = utils.storage.get(CONFIG.REFRESH_STORAGE_KEY);

            if (token && !utils.isTokenExpired(token)) {
                state.session.token = token;
                state.session.refreshToken = refreshToken;

                try {
                    const user = await api.getMe();
                    state.user = user;
                    state.isAuthenticated = true;
                    this._startSessionTimer();
                    events.emit('auth:ready', { user, authenticated: true });
                } catch (err) {
                    // Token invalid, try refresh
                    if (refreshToken) {
                        const refreshed = await this.refreshToken();
                        if (!refreshed) {
                            this._clearSession();
                            events.emit('auth:ready', { authenticated: false });
                        }
                    } else {
                        this._clearSession();
                        events.emit('auth:ready', { authenticated: false });
                    }
                }
            } else if (refreshToken) {
                const refreshed = await this.refreshToken();
                events.emit('auth:ready', { authenticated: refreshed });
            } else {
                events.emit('auth:ready', { authenticated: false });
            }

            // Setup activity tracking
            this._setupActivityTracking();

            // Setup Web3 listeners if wallet was connected
            const walletAddress = utils.storage.get('epg_wallet_address');
            if (walletAddress && window.ethereum) {
                this._setupWeb3Listeners();
            }

            return state.isAuthenticated;
        },

        // ─── Web3 Authentication ────────────────────────────────────────────────

        // Step 1: Connect wallet and get nonce
        async connectWallet(preferredChainId = 1) {
            try {
                // Check rate limit
                const clientId = await this._getClientId();
                const rateLimit = utils.checkRateLimit(clientId);
                if (!rateLimit.allowed) {
                    throw new Error(`Too many attempts. Try again in ${Math.ceil((rateLimit.lockedUntil - Date.now()) / 60000)} minutes.`);
                }

                // Detect provider
                const providers = web3Provider.detect();
                if (providers.length === 0) {
                    throw new Error('No Web3 wallet detected. Please install MetaMask.');
                }

                const provider = providers[0].provider;

                // Request accounts
                const accounts = await web3Provider.requestAccounts(provider);
                if (!accounts || accounts.length === 0) {
                    throw new Error('No accounts found');
                }

                const address = accounts[0];

                // Check/switch chain
                const currentChainId = await web3Provider.getChainId(provider);
                if (currentChainId !== preferredChainId) {
                    try {
                        await web3Provider.switchChain(preferredChainId, provider);
                    } catch (err) {
                        console.warn('Could not switch chain:', err.message);
                    }
                }

                // Store wallet info
                state.wallet.address = address;
                state.wallet.chainId = currentChainId;
                state.wallet.provider = provider;
                utils.storage.set('epg_wallet_address', address);

                // Setup listeners
                this._setupWeb3Listeners();

                events.emit('wallet:connected', { address, chainId: currentChainId });

                return { address, chainId: currentChainId };

            } catch (err) {
                events.emit('wallet:error', err);
                throw err;
            }
        },

        // Step 2: Sign message to authenticate
        async authenticateWallet() {
            if (!state.wallet.address) {
                throw new Error('Wallet not connected. Call connectWallet() first.');
            }

            try {
                // Get nonce from server
                const { nonce, message } = await api.getNonce(state.wallet.address);

                // Store nonce with expiry
                utils.storage.set(CONFIG.WALLET_NONCE_KEY, nonce, CONFIG.NONCE_EXPIRY);

                // Sign message
                const signature = await web3Provider.signMessage(
                    message, 
                    state.wallet.address, 
                    state.wallet.provider
                );

                // Verify with server
                const authData = await api.verifyWallet(state.wallet.address, signature, nonce);

                // Store session
                this._setSession(authData);

                // Get user data
                const user = await api.getMe();
                state.user = user;
                state.isAuthenticated = true;

                events.emit('auth:login', { user, method: 'wallet' });

                return { user, token: authData.token };

            } catch (err) {
                events.emit('auth:error', err);
                throw err;
            }
        },

        // Full wallet auth flow (connect + authenticate)
        async loginWithWallet(chainId = 1) {
            await this.connectWallet(chainId);
            return await this.authenticateWallet();
        },

        // ─── Traditional Authentication ───────────────────────────────────────

        async loginWithEmail(email, password) {
            const clientId = await this._getClientId();
            const rateLimit = utils.checkRateLimit(clientId);
            if (!rateLimit.allowed) {
                throw new Error(`Account locked. Try again in ${Math.ceil((rateLimit.lockedUntil - Date.now()) / 60000)} minutes.`);
            }

            try {
                const authData = await api.login(email, password);
                this._setSession(authData);

                const user = await api.getMe();
                state.user = user;
                state.isAuthenticated = true;

                this._startSessionTimer();
                events.emit('auth:login', { user, method: 'email' });

                return { user, token: authData.token };

            } catch (err) {
                events.emit('auth:error', err);
                throw err;
            }
        },

        async register(userData) {
            const result = await api.register(userData);
            events.emit('auth:registered', result);
            return result;
        },

        // ─── Session Management ───────────────────────────────────────────────

        async refreshToken() {
            const refreshToken = state.session.refreshToken || utils.storage.get(CONFIG.REFRESH_STORAGE_KEY);
            if (!refreshToken) return false;

            try {
                const authData = await api.refresh(refreshToken);
                this._setSession(authData);

                // Update user data
                const user = await api.getMe();
                state.user = user;

                events.emit('auth:refresh', { user });
                return true;

            } catch (err) {
                console.error('Token refresh failed:', err);
                return false;
            }
        },

        async logout() {
            try {
                // Notify server
                if (state.session.token) {
                    await api.logoutServer().catch(() => {});
                }
            } finally {
                this._clearSession();
                events.emit('auth:logout', {});
            }
        },

        // ─── Authorization ────────────────────────────────────────────────────

        hasRole(role) {
            if (!state.user || !state.user.roles) return false;
            return state.user.roles.includes(role);
        },

        hasPermission(permission) {
            if (!state.user || !state.user.permissions) return false;
            return state.user.permissions.includes(permission);
        },

        isAdmin() {
            return this.hasRole('admin') || this.hasRole('superadmin');
        },

        // ─── Getters ────────────────────────────────────────────────────────────

        getUser() {
            return state.user;
        },

        getWallet() {
            return state.wallet;
        },

        isLoggedIn() {
            return state.isAuthenticated;
        },

        getToken() {
            return state.session.token;
        },

        // ─── Event Subscription ───────────────────────────────────────────────

        on(event, callback) {
            return events.on(event, callback);
        },

        off(event, callback) {
            events.off(event, callback);
        },

        // ─── Internal Methods ───────────────────────────────────────────────────

        _setSession(authData) {
            state.session.token = authData.token;
            state.session.refreshToken = authData.refreshToken;
            state.session.expiresAt = authData.expiresAt;

            utils.storage.set(CONFIG.JWT_STORAGE_KEY, authData.token);
            utils.storage.set(CONFIG.REFRESH_STORAGE_KEY, authData.refreshToken);

            this._startSessionTimer();
        },

        _clearSession() {
            state.isAuthenticated = false;
            state.user = null;
            state.session = { token: null, refreshToken: null, expiresAt: null, lastActivity: Date.now() };

            utils.storage.remove(CONFIG.JWT_STORAGE_KEY);
            utils.storage.remove(CONFIG.REFRESH_STORAGE_KEY);
            utils.storage.remove(CONFIG.WALLET_NONCE_KEY);
            utils.storage.remove('epg_wallet_address');

            this._stopSessionTimer();
        },

        _startSessionTimer() {
            this._stopSessionTimer();

            // Auto-refresh before expiry
            if (state.session.expiresAt) {
                const refreshTime = state.session.expiresAt - Date.now() - CONFIG.TOKEN_REFRESH_BUFFER;
                if (refreshTime > 0) {
                    state.refreshTimer = setTimeout(() => this.refreshToken(), refreshTime);
                }
            }
        },

        _stopSessionTimer() {
            if (state.refreshTimer) {
                clearTimeout(state.refreshTimer);
                state.refreshTimer = null;
            }
        },

        _setupActivityTracking() {
            const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
            const updateActivity = utils.debounce(() => {
                state.session.lastActivity = Date.now();
                utils.storage.set(CONFIG.SESSION_KEY, { lastActivity: Date.now() });
            }, 1000);

            events.forEach(event => {
                document.addEventListener(event, updateActivity, { passive: true });
            });

            // Check for idle timeout
            setInterval(() => {
                if (state.isAuthenticated && (Date.now() - state.session.lastActivity) > CONFIG.SESSION_TIMEOUT) {
                    this.logout();
                    events.emit('auth:timeout', {});
                }
            }, 60000);
        },

        _setupWeb3Listeners() {
            if (!state.wallet.provider) return;

            // Account changed
            web3Provider.onAccountsChanged((accounts) => {
                if (accounts.length === 0) {
                    // User disconnected
                    this._clearWallet();
                    events.emit('wallet:disconnected', {});
                } else if (accounts[0] !== state.wallet.address) {
                    // Account switched
                    state.wallet.address = accounts[0];
                    utils.storage.set('epg_wallet_address', accounts[0]);
                    events.emit('wallet:accountChanged', { address: accounts[0] });

                    // Re-authenticate if needed
                    if (state.isAuthenticated) {
                        this.logout();
                        events.emit('auth:accountChanged', { address: accounts[0] });
                    }
                }
            }, state.wallet.provider);

            // Chain changed
            web3Provider.onChainChanged((chainId) => {
                state.wallet.chainId = chainId;
                events.emit('wallet:chainChanged', { chainId });
            }, state.wallet.provider);

            // Disconnect
            web3Provider.onDisconnect((error) => {
                this._clearWallet();
                events.emit('wallet:disconnected', { error });
            }, state.wallet.provider);
        },

        _clearWallet() {
            state.wallet = { address: null, chainId: null, provider: null, signer: null };
            utils.storage.remove('epg_wallet_address');
        },

        async _getClientId() {
            // Generate a semi-stable client identifier
            let clientId = utils.storage.get('epg_client_id');
            if (!clientId) {
                clientId = await utils.sha256(utils.generateNonce(16) + navigator.userAgent);
                utils.storage.set('epg_client_id', clientId);
            }
            return clientId;
        }
    };

    // ─── Permission Guard (for route protection) ──────────────────────────────
    const guard = {
        // Check if user can access route
        canAccess(requirements = {}) {
            const { authenticated, roles, permissions, wallet } = requirements;

            if (authenticated && !auth.isLoggedIn()) {
                return { allowed: false, reason: 'AUTH_REQUIRED' };
            }

            if (roles && !roles.some(role => auth.hasRole(role))) {
                return { allowed: false, reason: 'ROLE_REQUIRED' };
            }

            if (permissions && !permissions.some(p => auth.hasPermission(p))) {
                return { allowed: false, reason: 'PERMISSION_REQUIRED' };
            }

            if (wallet && !state.wallet.address) {
                return { allowed: false, reason: 'WALLET_REQUIRED' };
            }

            return { allowed: true };
        },

        // Middleware for route protection
        middleware(requirements) {
            return (next) => {
                const result = this.canAccess(requirements);
                if (result.allowed) {
                    return next();
                }

                events.emit('guard:denied', result);

                // Redirect based on reason
                switch (result.reason) {
                    case 'AUTH_REQUIRED':
                        window.location.href = '/login';
                        break;
                    case 'WALLET_REQUIRED':
                        events.emit('wallet:prompt', {});
                        break;
                    default:
                        window.location.href = '/403';
                }
            };
        },

        // React/Vue compatible hook
        useAuth() {
            return {
                user: () => auth.getUser(),
                isAuthenticated: () => auth.isLoggedIn(),
                isAdmin: () => auth.isAdmin(),
                hasRole: (role) => auth.hasRole(role),
                hasPermission: (p) => auth.hasPermission(p),
                wallet: () => auth.getWallet(),
                login: (email, pass) => auth.loginWithEmail(email, pass),
                loginWallet: () => auth.loginWithWallet(),
                logout: () => auth.logout()
            };
        }
    };

    // ─── Export ───────────────────────────────────────────────────────────────
    const EPGAuth = {
        auth,
        guard,
        utils,
        web3Provider,
        api,
        events,
        CONFIG,
        version: '1.0.0'
    };

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('epg-auth', [], () => EPGAuth);
    }
    // CommonJS
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = EPGAuth;
    }
    // Browser global
    else {
        global.EPGAuth = EPGAuth;
    }

})(typeof window !== 'undefined' ? window : this);
