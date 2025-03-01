/**
 * Fees chart functionality
 */
import { formatNumber } from '../utils/formatting.js';

let feesChart;

/**
 * Initialize fees chart
 * @param {string} canvasId - Canvas element ID
 * @returns {Object} Chart instance
 */
export function initFeesChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
    
    feesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Gas Fees (USD)',
                data: [],
                backgroundColor: '#ef4444',
                borderRadius: 4,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        color: 'rgba(226, 232, 240, 0.6)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(226, 232, 240, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        color: 'rgba(226, 232, 240, 0.6)',
                        callback: function(value) {
                            return '$' + formatNumber(value);
                        }
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
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
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '$' + formatNumber(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
    
    return feesChart;
}

/**
 * Update fees chart with new data
 * @param {Object} data - Fees chart data
 */
export function updateFeesChart(data) {
    if (!feesChart) {
        console.error('Fees chart not initialized');
        return;
    }
    
    feesChart.data.labels = data.labels;
    feesChart.data.datasets[0].data = data.values;
    feesChart.update();
} 