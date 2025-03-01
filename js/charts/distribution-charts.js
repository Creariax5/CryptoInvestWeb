/**
 * Distribution charts functionality for network and type breakdowns
 */
import { formatNumber } from '../utils/formatting.js';

let feesByNetworkChart;
let feesByTypeChart;

/**
 * Network colors for consistent usage
 */
const NETWORK_COLORS = {
    ethereum: '#627EEA',
    polygon: '#8247E5',
    bsc: '#F3BA2F',
    optimism: '#FF0420',
    arbitrum: '#28A0F0',
    avalanche: '#E84142',
    fantom: '#1969FF',
    default: '#6366f1'
};

/**
 * Initialize fees by network chart
 * @param {string} canvasId - Canvas element ID
 * @returns {Object} Chart instance
 */
export function initFeesByNetworkChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    feesByNetworkChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderWidth: 2,
                borderColor: 'rgba(17, 25, 40, 0.7)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgba(226, 232, 240, 0.8)',
                        font: {
                            size: 12
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 25, 40, 0.9)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `$${formatNumber(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    return feesByNetworkChart;
}

/**
 * Initialize fees by type chart
 * @param {string} canvasId - Canvas element ID
 * @returns {Object} Chart instance
 */
export function initFeesByTypeChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    feesByTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4ade80', // swaps
                    '#f97316', // transfers
                    '#8b5cf6', // defi
                    '#a78bfa', // nft
                    '#38bdf8', // other
                ],
                borderWidth: 2,
                borderColor: 'rgba(17, 25, 40, 0.7)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgba(226, 232, 240, 0.8)',
                        font: {
                            size: 12
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 25, 40, 0.9)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `$${formatNumber(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    return feesByTypeChart;
}

/**
 * Update fees by network chart with new data
 * @param {Object} data - Network distribution data
 */
export function updateFeesByNetworkChart(data) {
    if (!feesByNetworkChart) {
        console.error('Fees by network chart not initialized');
        return;
    }
    
    const colors = data.labels.map(network => NETWORK_COLORS[network.toLowerCase()] || NETWORK_COLORS.default);
    
    feesByNetworkChart.data.labels = data.labels;
    feesByNetworkChart.data.datasets[0].data = data.values;
    feesByNetworkChart.data.datasets[0].backgroundColor = colors;
    feesByNetworkChart.update();
}

/**
 * Update fees by type chart with new data
 * @param {Object} data - Type distribution data
 */
export function updateFeesByTypeChart(data) {
    if (!feesByTypeChart) {
        console.error('Fees by type chart not initialized');
        return;
    }
    
    feesByTypeChart.data.labels = data.labels;
    feesByTypeChart.data.datasets[0].data = data.values;
    feesByTypeChart.update();
} 