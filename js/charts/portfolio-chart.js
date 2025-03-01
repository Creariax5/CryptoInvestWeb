/**
 * Portfolio chart functionality
 */
import { formatNumber } from '../utils/formatting.js';

let portfolioChart;

/**
 * Initialize portfolio chart
 * @param {string} canvasId - Canvas element ID 
 * @returns {Object} Chart instance
 */
export function initPortfolioChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
    
    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Portfolio Value (USD)',
                data: [],
                borderColor: '#6366f1',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                backgroundColor: gradient
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
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
    
    return portfolioChart;
}

/**
 * Update portfolio chart with new data
 * @param {Object} data - Portfolio chart data 
 */
export function updatePortfolioChart(data) {
    if (!portfolioChart) {
        console.error('Portfolio chart not initialized');
        return;
    }
    
    portfolioChart.data.labels = data.labels;
    portfolioChart.data.datasets[0].data = data.values;
    portfolioChart.update();
} 