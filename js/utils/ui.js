/**
 * UI utility functions
 */

/**
 * Show loading state
 */
export function showLoading() {
    const loadingElement = document.getElementById('loadingOverlay');
    if (loadingElement) {
        loadingElement.style.display = 'flex';
    }
}

/**
 * Hide loading state
 */
export function hideLoading() {
    const loadingElement = document.getElementById('loadingOverlay');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
export function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.parentElement.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.parentElement.style.display = 'none';
        }, 5000);
    }
}

/**
 * Show success message
 * @param {string} message - Success message to display
 */
export function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    if (successElement) {
        successElement.textContent = message;
        successElement.parentElement.style.display = 'flex';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            successElement.parentElement.style.display = 'none';
        }, 3000);
    }
}

/**
 * Toggle element visibility
 * @param {string} elementId - Element ID to toggle
 * @param {boolean} show - Whether to show (true) or hide (false)
 */
export function toggleElementVisibility(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

/**
 * Handle scroll effects for navigation bar
 */
export function initScrollEffects() {
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    });
} 