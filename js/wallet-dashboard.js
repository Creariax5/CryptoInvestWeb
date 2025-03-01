// wallet-dashboard.js - Fetch and display wallet dashboard data

// API URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const walletAddressDisplay = document.getElementById('walletAddress');
const totalBalanceDisplay = document.getElementById('totalBalance');
const totalBalanceChangeDisplay = document.getElementById('totalBalanceChange');
const cryptoAssetsDisplay = document.getElementById('cryptoAssets');
const cryptoAssetsChangeDisplay = document.getElementById('cryptoAssetsChange');
const defiPositionsDisplay = document.getElementById('defiPositions');
const defiPositionsChangeDisplay = document.getElementById('defiPositionsChange');
const totalFeesDisplay = document.getElementById('totalFees');
const totalFeesChangeDisplay = document.getElementById('totalFeesChange');

// Charts
let portfolioChart;
let feesChart;
let feesByNetworkChart;
let feesByTypeChart;

// Load dashboard data
async function loadDashboardData(address, networks = 'ethereum,polygon,bsc,optimism,arbitrum') {
  try {
    showLoading();
    
    const response = await fetch(`${API_URL}/dashboard/wallet?address=${address}&networks=${networks}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Dashboard data loaded:', data);
    
    // Update the UI with the data
    updateDashboard(data);
    
    hideLoading();
    
    return data;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showError(error.message);
    hideLoading();
  }
}

// Update dashboard UI with data
function updateDashboard(data) {
  // Update overview cards
  updateOverviewCards(data.overview);
  
  // Update wallet balances table
  updateWalletBalances(data.walletBalances);
  
  // Update DeFi positions
  updateDefiPositions(data.defiPositions);
  
  // Update transactions
  updateTransactions(data.transactions);
  
  // Update charts
  updateCharts(data.charts);
}

// Update overview cards
function updateOverviewCards(overview) {
  // Update total balance
  totalBalanceDisplay.textContent = `$${formatNumber(overview.totalBalance)}`;
  totalBalanceChangeDisplay.textContent = `${overview.dailyChange.totalBalance}%`;
  totalBalanceChangeDisplay.className = overview.dailyChange.totalBalance >= 0 ? 'card-change positive' : 'card-change negative';
  
  // Update crypto assets
  cryptoAssetsDisplay.textContent = `$${formatNumber(overview.cryptoAssets)}`;
  cryptoAssetsChangeDisplay.textContent = `${overview.dailyChange.cryptoAssets}%`;
  cryptoAssetsChangeDisplay.className = overview.dailyChange.cryptoAssets >= 0 ? 'card-change positive' : 'card-change negative';
  
  // Update DeFi positions
  defiPositionsDisplay.textContent = `$${formatNumber(overview.defiPositions)}`;
  defiPositionsChangeDisplay.textContent = `${overview.dailyChange.defiPositions}%`;
  defiPositionsChangeDisplay.className = overview.dailyChange.defiPositions >= 0 ? 'card-change positive' : 'card-change negative';
  
  // Update fees paid
  totalFeesDisplay.textContent = `$${formatNumber(overview.totalFeesPaid)}`;
  totalFeesChangeDisplay.textContent = `${overview.dailyChange.totalFeesPaid}%`;
  totalFeesChangeDisplay.className = overview.dailyChange.totalFeesPaid >= 0 ? 'card-change positive' : 'card-change negative';
}

// Update wallet balances table
function updateWalletBalances(balances) {
  const tableBody = document.querySelector('#assets-table tbody');
  
  if (!tableBody) {
    console.warn('Assets table body not found');
    return;
  }
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  if (balances.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="5" style="text-align: center;">No assets found</td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }
  
  // Add rows for each balance
  balances.forEach(token => {
    const row = document.createElement('tr');
    
    // Format balance
    const balance = parseFloat(token.balance) / Math.pow(10, token.decimals);
    const formattedBalance = balance.toLocaleString(undefined, {
      minimumFractionDigits: balance < 0.01 ? 6 : 2,
      maximumFractionDigits: balance < 0.01 ? 6 : 2
    });
    
    // Calculate percentage of total portfolio
    const totalBalance = balances.reduce((sum, t) => sum + (t.usdValue || 0), 0);
    const percentage = totalBalance > 0 ? ((token.usdValue || 0) / totalBalance * 100) : 0;
    
    row.innerHTML = `
      <td>
        <div class="asset-info">
          <div class="asset-icon"><i class="fas fa-coins"></i></div>
          <div>
            <div class="asset-name">${token.symbol}</div>
            <span class="asset-network">${token.network}</span>
          </div>
        </div>
      </td>
      <td>
        <div class="asset-balance">${formattedBalance} ${token.symbol}</div>
        <div class="asset-value">$${formatNumber(token.usdValue || 0)}</div>
      </td>
      <td class="asset-percentage">
        <div class="progress-bar">
          <div class="progress" style="width: ${percentage}%"></div>
        </div>
        <div class="percentage-text">${percentage.toFixed(1)}%</div>
      </td>
      <td>
        <button class="action-button send">Send</button>
      </td>
      <td>
        <button class="action-button swap">Swap</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Update DeFi positions
function updateDefiPositions(positions) {
  const container = document.getElementById('defi-positions-container');
  
  if (!container) {
    console.warn('DeFi positions container not found');
    return;
  }
  
  // Clear existing cards
  container.innerHTML = '';
  
  if (positions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-cube"></i></div>
        <div class="empty-message">No DeFi positions found</div>
        <p>Your active DeFi positions will appear here.</p>
      </div>
    `;
    return;
  }
  
  // Add card for each position
  positions.forEach(position => {
    const card = document.createElement('div');
    card.className = 'position-card';
    
    card.innerHTML = `
      <div class="position-header">
        <div class="position-title">
          <div class="position-icon"><i class="fas fa-cube"></i></div>
          <div>
            <div class="position-name">${position.name || 'Unknown Position'}</div>
            <div class="position-platform">${position.protocol || 'Unknown Protocol'}</div>
          </div>
        </div>
        <div class="position-value">
          <div class="position-amount">$${formatNumber(position.usdValue || 0)}</div>
          <div class="position-type">${position.type || 'Deposit'}</div>
        </div>
      </div>
      <div class="position-details">
        <div class="position-detail">
          <div class="detail-label">APY</div>
          <div class="detail-value">${position.apy || '0.00'}%</div>
        </div>
        <div class="position-detail">
          <div class="detail-label">Network</div>
          <div class="detail-value">${position.network || 'Unknown'}</div>
        </div>
        <div class="position-detail">
          <div class="detail-label">Asset</div>
          <div class="detail-value">${position.asset || 'Unknown'}</div>
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Update transactions table
function updateTransactions(transactions) {
  const tableBody = document.querySelector('#transactions-table tbody');
  
  if (!tableBody) {
    console.warn('Transactions table body not found');
    return;
  }
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  if (transactions.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="5" style="text-align: center;">No transactions found</td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }
  
  // Add rows for each transaction
  transactions.forEach(tx => {
    const row = document.createElement('tr');
    
    // Set row class based on transaction type
    let typeClass = '';
    if (tx.type === 'Receive') {
      typeClass = 'positive';
    } else if (tx.type === 'Send') {
      typeClass = 'negative';
    }
    
    row.innerHTML = `
      <td>
        <div class="tx-date">
          <div class="tx-day">${tx.date}</div>
          <div class="tx-time">${tx.time}</div>
        </div>
      </td>
      <td>
        <div class="tx-type ${typeClass}">${tx.type}</div>
      </td>
      <td>
        <div class="tx-amount ${typeClass}">${tx.type === 'Send' ? '-' : tx.type === 'Receive' ? '+' : ''}${formatTokenAmount(tx.amount, tx.asset)}</div>
      </td>
      <td>
        <div class="tx-status-badge ${tx.status.toLowerCase()}">${tx.status}</div>
      </td>
      <td>
        <a href="#" class="tx-link">View <i class="fas fa-external-link-alt"></i></a>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Update charts with data
function updateCharts(chartData) {
  // Update portfolio chart
  updatePortfolioChart(chartData.portfolioHistory);
  
  // Update fees chart
  updateFeesChart(chartData.dailyFees);
  
  // Update fees by network chart
  updateFeesByNetworkChart(chartData.feesByNetwork);
  
  // Update fees by type chart
  updateFeesByTypeChart(chartData.feesByType);
}

// Update portfolio chart
function updatePortfolioChart(data) {
  const ctx = document.getElementById('portfolioChart')?.getContext('2d');
  if (!ctx) return;
  
  const dates = data.map(item => item.date);
  const values = data.map(item => item.value);
  
  if (portfolioChart) {
    portfolioChart.destroy();
  }
  
  portfolioChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Portfolio Value',
        data: values,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: '#6366f1',
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17, 25, 40, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          bodyFont: {
            family: "'Inter', sans-serif",
            size: 14
          },
          titleFont: {
            family: "'Inter', sans-serif",
            size: 16,
            weight: 'bold'
          },
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            callback: function(value) {
              return '$' + value;
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        }
      }
    }
  });
}

// Update fees chart
function updateFeesChart(data) {
  const ctx = document.getElementById('feesChart')?.getContext('2d');
  if (!ctx) return;
  
  const dates = data.map(item => item.date);
  const values = data.map(item => item.value);
  
  if (feesChart) {
    feesChart.destroy();
  }
  
  feesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Fees Collected',
        data: values,
        backgroundColor: '#6366f1',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17, 25, 40, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          bodyFont: {
            family: "'Inter', sans-serif",
            size: 14
          },
          titleFont: {
            family: "'Inter', sans-serif",
            size: 16,
            weight: 'bold'
          },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += '$' + context.parsed.y.toFixed(2);
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            callback: function(value) {
              return '$' + value.toFixed(2);
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        }
      }
    }
  });
}

// Update fees by network chart
function updateFeesByNetworkChart(data) {
  const ctx = document.getElementById('feesByNetworkChart')?.getContext('2d');
  if (!ctx) return;
  
  const networks = data.map(item => capitalizeFirstLetter(item.network));
  const values = data.map(item => item.fee);
  
  if (feesByNetworkChart) {
    feesByNetworkChart.destroy();
  }
  
  feesByNetworkChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: networks,
      datasets: [{
        data: values,
        backgroundColor: [
          '#6366f1',
          '#8b5cf6',
          '#ec4899',
          '#14b8a6',
          '#f59e0b',
          '#ef4444'
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
            color: 'rgba(255, 255, 255, 0.7)',
            padding: 20,
            font: {
              size: 12
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 25, 40, 0.8)',
          bodyFont: {
            family: "'Inter', sans-serif",
            size: 14
          },
          titleFont: {
            family: "'Inter', sans-serif",
            size: 16,
            weight: 'bold'
          },
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: $${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Update fees by type chart
function updateFeesByTypeChart(data) {
  const ctx = document.getElementById('feesByTypeChart')?.getContext('2d');
  if (!ctx) return;
  
  const types = data.map(item => item.type);
  const values = data.map(item => item.fee);
  
  if (feesByTypeChart) {
    feesByTypeChart.destroy();
  }
  
  feesByTypeChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: types,
      datasets: [{
        data: values,
        backgroundColor: [
          '#6366f1',
          '#8b5cf6',
          '#ec4899',
          '#14b8a6',
          '#f59e0b'
        ],
        borderWidth: 2,
        borderColor: 'rgba(17, 25, 40, 0.7)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: 'rgba(255, 255, 255, 0.7)',
            padding: 20,
            font: {
              size: 12
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 25, 40, 0.8)',
          bodyFont: {
            family: "'Inter', sans-serif",
            size: 14
          },
          titleFont: {
            family: "'Inter', sans-serif",
            size: 16,
            weight: 'bold'
          },
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: $${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Helper functions
function formatNumber(value) {
  return parseFloat(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatTokenAmount(amount, symbol) {
  const value = parseFloat(amount) / 1e18; // Assuming 18 decimals
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: value < 0.01 ? 6 : 2,
    maximumFractionDigits: value < 0.01 ? 6 : 2
  })} ${symbol}`;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function showLoading() {
  // TODO: Implement loading indicator
  console.log('Loading...');
}

function hideLoading() {
  // TODO: Hide loading indicator
  console.log('Loading complete');
}

function showError(message) {
  // TODO: Implement error display
  console.error('Error:', message);
  alert(`Error: ${message}`);
}

// Event listeners

// Initialize demo with a test address
document.addEventListener('DOMContentLoaded', () => {
  // Sample Ethereum address (Vitalik's address)
  const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
  
  // Update wallet address display
  if (walletAddressDisplay) {
    walletAddressDisplay.textContent = `${testAddress.substring(0, 6)}...${testAddress.substring(testAddress.length - 4)}`;
  }
  
  // Load wallet data
  loadDashboardData(testAddress);
  
  // Setup network dropdown if exists
  const networkSelector = document.querySelector('.select-button');
  if (networkSelector) {
    networkSelector.addEventListener('click', () => {
      // Toggle network dropdown
      const dropdown = document.querySelector('.network-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('show');
      }
    });
  }
  
  // Setup tab navigation if exists
  const tabs = document.querySelectorAll('.tab');
  if (tabs.length > 0) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding content
        const tabId = tab.getAttribute('data-tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabContents.forEach(content => {
          content.style.display = 'none';
        });
        
        const activeContent = document.getElementById(tabId);
        if (activeContent) {
          activeContent.style.display = 'block';
        }
      });
    });
    
    // Activate first tab by default
    tabs[0].click();
  }
}); 