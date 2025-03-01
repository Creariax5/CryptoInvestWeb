/**
 * Formatting utility functions
 */

/**
 * Format a number with commas and specified decimal places
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number
 */
export function formatNumber(value, decimals = 2) {
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: decimals });
}

/**
 * Format token amount with symbol
 * @param {number} amount - Token amount
 * @param {string} symbol - Token symbol
 * @returns {string} Formatted token amount
 */
export function formatTokenAmount(amount, symbol) {
    return `${formatNumber(amount)} ${symbol}`;
}

/**
 * Capitalize first letter of a string
 * @param {string} string - Input string
 * @returns {string} String with first letter capitalized
 */
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Format a date from ISO string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Format a date with time
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date with time
 */
export function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format address for display (shortens and adds ellipsis)
 * @param {string} address - Blockchain address
 * @returns {string} Shortened address
 */
export function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
} 