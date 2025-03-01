/**
 * Wallet Dashboard Component
 * Handles loading and displaying wallet dashboard data
 */
import { fetchDashboardData } from '../services/api.js';
import { showLoading, hideLoading, showError } from '../utils/ui.js';
import { formatNumber, formatTokenAmount, formatAddress } from '../utils/formatting.js';
import { initPortfolioChart, updatePortfolioChart } from '../charts/portfolio-chart.js';
import { initFeesChart, updateFeesChart } from '../charts/fees-chart.js';
import { 
    initFeesByNetworkChart, 
    updateFeesByNetworkChart,
    initFeesByTypeChart,
    updateFeesByTypeChart
} from '../charts/distribution-charts.js';

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

// Chart instances
let portfolioChart;
let feesChart;
let feesByNetworkChart;
let feesByTypeChart;

/**
 * Initialize the dashboard
 */
export function initDashboard() {
    // Initialize charts
    portfolioChart = initPortfolioChart('portfolioChart');
    feesChart = initFeesChart('feesChart');
    feesByNetworkChart = initFeesByNetworkChart('feesByNetworkChart');
    feesByTypeChart = initFeesByTypeChart('feesByTypeChart');
    
    // Set up wallet connection
    setupWalletConnection();
    
    // Set up network selector event
    const networkSelector = document.getElementById('networkSelector');
    if (networkSelector) {
        networkSelector.addEventListener('change', (e) => {
            // Get address from dataset or use the one from URL or default
            let address = walletAddressDisplay?.dataset?.address;
            
            // If address is undefined or empty, get it from URL or use default
            if (!address) {
                const urlParams = new URLSearchParams(window.location.search);
                address = urlParams.get('address') || '0x28C6c06298d514Db089934071355E5743bf21d60';
            }
            
            const networks = e.target.value;
            loadDashboardData(address, networks);
        });
    }
    
    // Set up period selector for fees
    const feePeriodSelector = document.getElementById('feePeriodSelector');
    if (feePeriodSelector) {
        feePeriodSelector.addEventListener('change', (e) => {
            const period = e.target.value;
            // Update display based on period
            // This would typically trigger a new API call with that period
        });
    }
    
    // First check for a previously connected wallet in localStorage
    const savedWalletAddress = localStorage.getItem('connectedWalletAddress');
    if (savedWalletAddress && savedWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        // Update UI to show connected state
        const connectWalletBtn = document.getElementById('connectWalletBtn');
        if (connectWalletBtn) {
            connectWalletBtn.textContent = 'Wallet Connected';
            connectWalletBtn.classList.add('connected');
        }
        
        loadDashboardData(savedWalletAddress);
        return;
    }
    
    // Then check for wallet address from URL
    const urlParams = new URLSearchParams(window.location.search);
    const walletAddress = urlParams.get('address');
    
    if (walletAddress && walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        loadDashboardData(walletAddress);
    } else {
        // If no wallet address in URL, use a default wallet address for demonstration
        const defaultWalletAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Example address (Vitalik's wallet)
        loadDashboardData(defaultWalletAddress);
    }
}

/**
 * Setup wallet connection handlers
 */
function setupWalletConnection() {
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletDropdown = document.getElementById('walletDropdown');
    const connectMetamaskBtn = document.getElementById('connectMetamask');
    const connectWalletConnectBtn = document.getElementById('connectWalletConnect');
    const submitWalletAddressBtn = document.getElementById('submitWalletAddress');
    const manualWalletAddressInput = document.getElementById('manualWalletAddress');
    
    // Toggle wallet dropdown
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (walletDropdown.style.display === 'none') {
                walletDropdown.style.display = 'block';
            } else {
                walletDropdown.style.display = 'none';
            }
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.wallet-dropdown') && walletDropdown && walletDropdown.style.display === 'block') {
            walletDropdown.style.display = 'none';
        }
    });
    
    // Handle Metamask connection
    if (connectMetamaskBtn) {
        connectMetamaskBtn.addEventListener('click', (e) => {
            e.preventDefault();
            connectMetamask();
        });
    }
    
    // Handle WalletConnect connection
    if (connectWalletConnectBtn) {
        connectWalletConnectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            connectWalletConnect();
        });
    }
    
    // Handle manual wallet address entry
    if (submitWalletAddressBtn) {
        submitWalletAddressBtn.addEventListener('click', () => {
            const address = manualWalletAddressInput.value.trim();
            if (address && address.length >= 42) { // Basic check for Ethereum address length
                const networks = document.getElementById('networkSelector').value;
                loadDashboardData(address, networks);
                walletDropdown.style.display = 'none'; // Hide dropdown after submission
            } else {
                showError('Please enter a valid wallet address');
            }
        });
    }
    
    // Allow pressing Enter in the input field
    if (manualWalletAddressInput) {
        manualWalletAddressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitWalletAddressBtn.click();
            }
        });
    }
}

/**
 * Connect using Metamask
 * Note: This is a stub function - real implementation would use Web3/Ethers.js
 */
async function connectMetamask() {
    try {
        showLoading();
        
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
        }
        
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        
        if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
            throw new Error('Invalid wallet address received from MetaMask');
        }
        
        // Load dashboard data with the connected address
        const networks = document.getElementById('networkSelector').value;
        await loadDashboardData(address, networks);
        
        // Update UI to show connected state
        const connectWalletBtn = document.getElementById('connectWalletBtn');
        if (connectWalletBtn) {
            connectWalletBtn.textContent = 'Wallet Connected';
            connectWalletBtn.classList.add('connected');
        }
        
        // Store the address in localStorage for persistence
        localStorage.setItem('connectedWalletAddress', address);
        
        hideLoading();
    } catch (error) {
        hideLoading();
        
        if (error.code === 4001) {
            // User rejected the request
            showError('You rejected the connection request. Please connect your wallet to use this feature.');
        } else {
            showError(`Failed to connect wallet: ${error.message}`);
        }
        console.error('Error connecting to MetaMask:', error);
    }
}

/**
 * Connect using WalletConnect
 * Note: This is a stub function - real implementation would use WalletConnect library
 */
async function connectWalletConnect() {
    showError('WalletConnect integration is coming soon!');
}

/**
 * Load dashboard data
 * @param {string} address - Wallet address
 * @param {string} networks - Comma-separated list of networks
 */
export async function loadDashboardData(address, networks = 'ethereum,polygon,bsc,optimism,arbitrum') {
    try {
        // Make sure we have a valid address
        if (!address || address === 'undefined') {
            // Get address from UI or use default if not available
            address = getWalletAddressFromUI();
            
            // If still no valid address, show error and return
            if (!address || address === 'undefined') {
                showError('Please enter a valid wallet address');
                return;
            }
        }
        
        // Update UI to show wallet address immediately
        if (walletAddressDisplay) {
            walletAddressDisplay.textContent = formatAddress(address);
            walletAddressDisplay.dataset.address = address;
        }
        
        showLoading();
        
        const data = await fetchDashboardData(address, networks);
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

/**
 * Update dashboard with data
 * @param {Object} data - Dashboard data from API
 */
function updateDashboard(data) {
    // Store wallet address for future use
    if (walletAddressDisplay) {
        // Set the visible address format
        walletAddressDisplay.textContent = formatAddress(data.address || getWalletAddressFromUI());
        // Store the full address in the dataset for future use
        walletAddressDisplay.dataset.address = data.address || getWalletAddressFromUI();
    }
    
    // Update overview metrics
    updateOverviewCards(data.overview);
    
    // Update wallet balances
    if (data.walletBalances && data.walletBalances.length > 0) {
        updateWalletBalances({tokens: data.walletBalances});
    }
    
    // Update DeFi positions
    if (data.defiPositions && data.defiPositions.length > 0) {
        updateDefiPositions(data.defiPositions);
    }
    
    // Update transaction history
    if (data.transactions && data.transactions.length > 0) {
        updateTransactions(data.transactions);
    }
    
    // Update charts
    if (data.charts) {
        updateCharts(data.charts);
    }
}

/**
 * Get wallet address from URL or input field
 * @returns {string} Wallet address
 */
function getWalletAddressFromUI() {
    // First try to get from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlAddress = urlParams.get('address');
    if (urlAddress && urlAddress.match(/^0x[a-fA-F0-9]{40}$/)) return urlAddress;
    
    // Then try to get from input field if visible
    const manualWalletAddressInput = document.getElementById('manualWalletAddress');
    if (manualWalletAddressInput && manualWalletAddressInput.value) {
        const inputAddress = manualWalletAddressInput.value.trim();
        if (inputAddress.match(/^0x[a-fA-F0-9]{40}$/)) return inputAddress;
    }
    
    // Check if connected via MetaMask
    if (window.ethereum && window.ethereum.selectedAddress) {
        return window.ethereum.selectedAddress;
    }
    
    // If we're on the dashboard page, use a default address for demo purposes
    const isWalletDashboardPage = window.location.pathname.includes('wallet_dashboard');
    if (isWalletDashboardPage) {
        return '0x28C6c06298d514Db089934071355E5743bf21d60'; // Default demo address
    }
    
    // If no valid address found, return null
    return null;
}

/**
 * Update overview card metrics
 * @param {Object} overview - Overview metrics
 */
function updateOverviewCards(overview) {
    if (!overview) {
        console.warn("No overview data available");
        return;
    }
    
    if (totalBalanceDisplay) {
        totalBalanceDisplay.textContent = `$${formatNumber(overview.totalBalance || 0)}`;
    }
    
    if (totalBalanceChangeDisplay) {
        const balanceChange = overview.totalBalanceChange || 0;
        const changeClass = balanceChange >= 0 ? 'positive' : 'negative';
        const changeSign = balanceChange >= 0 ? '+' : '';
        totalBalanceChangeDisplay.textContent = `${changeSign}${balanceChange}%`;
        totalBalanceChangeDisplay.className = `card-change ${changeClass}`;
    }
    
    if (cryptoAssetsDisplay) {
        cryptoAssetsDisplay.textContent = `$${formatNumber(overview.cryptoAssets || 0)}`;
    }
    
    if (cryptoAssetsChangeDisplay) {
        const assetsChange = overview.cryptoAssetsChange || 0;
        const changeClass = assetsChange >= 0 ? 'positive' : 'negative';
        const changeSign = assetsChange >= 0 ? '+' : '';
        cryptoAssetsChangeDisplay.textContent = `${changeSign}${assetsChange}%`;
        cryptoAssetsChangeDisplay.className = `card-change ${changeClass}`;
    }
    
    if (defiPositionsDisplay) {
        defiPositionsDisplay.textContent = `$${formatNumber(overview.defiPositions || 0)}`;
    }
    
    if (defiPositionsChangeDisplay) {
        const positionsChange = overview.defiPositionsChange || 0;
        const changeClass = positionsChange >= 0 ? 'positive' : 'negative';
        const changeSign = positionsChange >= 0 ? '+' : '';
        defiPositionsChangeDisplay.textContent = `${changeSign}${positionsChange}%`;
        defiPositionsChangeDisplay.className = `card-change ${changeClass}`;
    }
    
    if (totalFeesDisplay) {
        totalFeesDisplay.textContent = `$${formatNumber(overview.totalFees || overview.totalFeesPaid || 0)}`;
    }
    
    if (totalFeesChangeDisplay) {
        const feesChange = overview.totalFeesChange || 0;
        const changeClass = feesChange <= 0 ? 'positive' : 'negative';
        const changeSign = feesChange <= 0 ? '-' : '+';
        totalFeesChangeDisplay.textContent = `${changeSign}${Math.abs(feesChange)}%`;
        totalFeesChangeDisplay.className = `card-change ${changeClass}`;
    }
}

/**
 * Update wallet balances section
 * @param {Object} balances - Wallet balances data
 */
function updateWalletBalances(balances) {
    const balancesContainer = document.getElementById('tokenBalances');
    if (!balancesContainer) return;
    
    balancesContainer.innerHTML = '';
    
    balances.tokens.forEach(token => {
        const tokenRow = document.createElement('div');
        tokenRow.className = 'token-row';
        
        const changeClass = token.priceChange24h >= 0 ? 'positive' : 'negative';
        const changeSign = token.priceChange24h >= 0 ? '+' : '';
        
        tokenRow.innerHTML = `
            <div class="token-icon">
                <img src="${token.icon}" alt="${token.symbol}">
            </div>
            <div class="token-info">
                <div class="token-name">${token.name}</div>
                <div class="token-amount">${formatNumber(token.balance)} ${token.symbol}</div>
            </div>
            <div class="token-price">
                <div class="current-price">$${formatNumber(token.price)}</div>
                <div class="price-change ${changeClass}">${changeSign}${token.priceChange24h}%</div>
            </div>
            <div class="token-value">$${formatNumber(token.value)}</div>
        `;
        
        balancesContainer.appendChild(tokenRow);
    });
}

/**
 * Update DeFi positions section
 * @param {Object} positions - DeFi positions data
 */
function updateDefiPositions(positions) {
    const positionsContainer = document.getElementById('defiPositionsList');
    if (!positionsContainer) return;
    
    positionsContainer.innerHTML = '';
    
    positions.forEach(position => {
        const positionCard = document.createElement('div');
        positionCard.className = 'defi-position-card glass';
        
        const changeClass = position.valueChange >= 0 ? 'positive' : 'negative';
        const changeSign = position.valueChange >= 0 ? '+' : '';
        
        positionCard.innerHTML = `
            <div class="position-header">
                <div class="protocol-info">
                    <img src="${position.protocolIcon}" alt="${position.protocol}" class="protocol-icon">
                    <div class="protocol-name">${position.protocol}</div>
                </div>
                <div class="position-network">
                    <span class="network-badge">${position.network}</span>
                </div>
            </div>
            <div class="position-details">
                <div class="position-type">${position.type}</div>
                <div class="position-assets">
                    ${position.assets.map(asset => `
                        <div class="position-asset">
                            <img src="${asset.icon}" alt="${asset.symbol}" class="asset-icon">
                            <span>${formatNumber(asset.amount)} ${asset.symbol}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="position-value">
                    <div class="value-amount">$${formatNumber(position.value)}</div>
                    <div class="value-change ${changeClass}">${changeSign}${position.valueChange}%</div>
                </div>
            </div>
        `;
        
        positionsContainer.appendChild(positionCard);
    });
}

/**
 * Update transactions section
 * @param {Object} transactions - Transaction data
 */
function updateTransactions(transactions) {
    const transactionsContainer = document.getElementById('recentTransactions');
    if (!transactionsContainer) return;
    
    transactionsContainer.innerHTML = '';
    
    transactions.forEach(tx => {
        const txRow = document.createElement('div');
        txRow.className = 'transaction-row';
        
        const txTypeClass = getTxTypeClass(tx.type);
        
        txRow.innerHTML = `
            <div class="tx-icon ${txTypeClass}">
                <i class="fas ${getTxTypeIcon(tx.type)}"></i>
            </div>
            <div class="tx-details">
                <div class="tx-title">${tx.description}</div>
                <div class="tx-date">${tx.date} · ${tx.network}</div>
            </div>
            <div class="tx-amount">
                <div class="tx-value">${formatTokenAmount(tx.amount, tx.symbol)}</div>
                <div class="tx-fiat">$${formatNumber(tx.value)}</div>
            </div>
            <div class="tx-status">
                <span class="status-badge ${tx.status.toLowerCase()}">${tx.status}</span>
                <a href="${tx.explorerUrl}" target="_blank" class="tx-link">
                    <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;
        
        transactionsContainer.appendChild(txRow);
    });
}

/**
 * Get CSS class for transaction type
 * @param {string} type - Transaction type
 * @returns {string} CSS class
 */
function getTxTypeClass(type) {
    const typeMap = {
        'swap': 'tx-swap',
        'transfer': 'tx-transfer',
        'deposit': 'tx-deposit',
        'withdraw': 'tx-withdraw',
        'approve': 'tx-approve',
        'nft': 'tx-nft'
    };
    
    return typeMap[type.toLowerCase()] || 'tx-default';
}

/**
 * Get icon for transaction type
 * @param {string} type - Transaction type
 * @returns {string} Icon class
 */
function getTxTypeIcon(type) {
    const iconMap = {
        'swap': 'fa-exchange-alt',
        'transfer': 'fa-arrow-right',
        'deposit': 'fa-arrow-down',
        'withdraw': 'fa-arrow-up',
        'approve': 'fa-check-circle',
        'nft': 'fa-image'
    };
    
    return iconMap[type.toLowerCase()] || 'fa-circle';
}

/**
 * Update charts with data
 * @param {Object} chartData - Chart data
 */
function updateCharts(chartData) {
    if (chartData.portfolioHistory) {
        updatePortfolioChart(chartData.portfolioHistory);
    }
    
    if (chartData.dailyFees) {
        updateFeesChart(chartData.dailyFees);
    }
    
    if (chartData.feesByNetwork) {
        // Ensure data is in the correct format expected by the chart
        const formattedNetworkData = {
            labels: chartData.feesByNetwork.map(item => item.name || item.network),
            values: chartData.feesByNetwork.map(item => item.value || item.amount || 0)
        };
        updateFeesByNetworkChart(formattedNetworkData);
    }
    
    if (chartData.feesByType) {
        // Ensure data is in the correct format expected by the chart
        const formattedTypeData = {
            labels: chartData.feesByType.map(item => item.name || item.type),
            values: chartData.feesByType.map(item => item.value || item.amount || 0)
        };
        updateFeesByTypeChart(formattedTypeData);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard); 