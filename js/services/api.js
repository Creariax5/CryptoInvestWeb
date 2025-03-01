/**
 * API service for interacting with backend services
 */

// API base URL
const API_URL = 'http://crypto-invest-dashboard-api.vercel.app/api';

/**
 * Fetch dashboard data for a specific wallet
 * @param {string} address - Wallet address
 * @param {string} networks - Comma-separated list of networks
 * @returns {Promise<Object>} Dashboard data
 */
export async function fetchDashboardData(address, networks = 'ethereum,polygon,bsc,optimism,arbitrum') {
    try {
        // Validate address before making the request
        if (!address || address === 'undefined' || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
            throw new Error('Invalid wallet address. Please provide a valid Ethereum address.');
        }
        
        const response = await fetch(`${API_URL}/dashboard/wallet?address=${address}&networks=${networks}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Failed to fetch dashboard data: ${response.status}`;
            throw new Error(errorMessage);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
}

/**
 * Fetch wallet balances
 * @param {string} address - Wallet address
 * @param {string} networks - Comma-separated list of networks
 * @returns {Promise<Object>} Wallet balances
 */
export async function fetchWalletBalances(address, networks) {
    try {
        const response = await fetch(`${API_URL}/balances?address=${address}&networks=${networks}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch wallet balances: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching wallet balances:', error);
        throw error;
    }
}

/**
 * Fetch DeFi positions
 * @param {string} address - Wallet address
 * @param {string} networks - Comma-separated list of networks
 * @returns {Promise<Object>} DeFi positions
 */
export async function fetchDefiPositions(address, networks) {
    try {
        const response = await fetch(`${API_URL}/defi/positions?address=${address}&networks=${networks}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch DeFi positions: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching DeFi positions:', error);
        throw error;
    }
}

/**
 * Fetch transaction history
 * @param {string} address - Wallet address
 * @param {string} networks - Comma-separated list of networks
 * @param {number} limit - Number of transactions to fetch
 * @returns {Promise<Object>} Transaction history
 */
export async function fetchTransactions(address, networks, limit = 50) {
    try {
        const response = await fetch(`${API_URL}/transactions?address=${address}&networks=${networks}&limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch transaction history: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        throw error;
    }
}

/**
 * Fetch gas fees spent
 * @param {string} address - Wallet address
 * @param {string} networks - Comma-separated list of networks
 * @param {string} period - Time period (e.g., '7d', '30d', '90d', 'all')
 * @returns {Promise<Object>} Gas fees data
 */
export async function fetchGasFees(address, networks, period = '30d') {
    try {
        const response = await fetch(`${API_URL}/fees?address=${address}&networks=${networks}&period=${period}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch gas fees: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching gas fees:', error);
        throw error;
    }
} 