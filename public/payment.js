// Payment Processing with Stripe Integration
class PaymentManager {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.cardElement = null;
        this.initializeStripe();
    }

    async initializeStripe() {
        try {
            // Initialize Stripe (replace with your publishable key)
            this.stripe = Stripe('pk_test_your_publishable_key_here');
            this.elements = this.stripe.elements();
            
            // Create card element
            this.cardElement = this.elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                },
            });
        } catch (error) {
            console.error('Stripe initialization error:', error);
        }
    }

    mountCardElement(containerId) {
        if (this.cardElement) {
            this.cardElement.mount(`#${containerId}`);
        }
    }

    async createPaymentIntent(amount, customerId, invoiceId) {
        try {
            const response = await fetch('/api/stripe/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    customerId,
                    invoiceId
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            return data.clientSecret;
        } catch (error) {
            console.error('Payment intent creation error:', error);
            throw error;
        }
    }

    async confirmPayment(clientSecret) {
        try {
            const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: this.cardElement,
                }
            });

            if (error) {
                throw new Error(error.message);
            }

            return paymentIntent;
        } catch (error) {
            console.error('Payment confirmation error:', error);
            throw error;
        }
    }

    async savePaymentMethod(customerId, contactId) {
        try {
            const { error, paymentMethod } = await this.stripe.createPaymentMethod({
                type: 'card',
                card: this.cardElement,
            });

            if (error) {
                throw new Error(error.message);
            }

            const response = await fetch('/api/stripe/save-payment-method', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod.id,
                    customerId,
                    contactId
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            return data;
        } catch (error) {
            console.error('Save payment method error:', error);
            throw error;
        }
    }
}

// Payment Modal Component
function createPaymentModal(invoice, onSuccess) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Process Payment</h3>
                <button id="closePaymentModal" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="mb-4">
                <p class="text-sm text-gray-600">Invoice: ${invoice.service_description}</p>
                <p class="text-lg font-semibold text-gray-900">Amount: $${invoice.amount}</p>
            </div>
            
            <form id="paymentForm">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
                    <div id="card-element" class="p-3 border border-gray-300 rounded-md">
                        <!-- Stripe Elements will create form elements here -->
                    </div>
                    <div id="card-errors" class="text-red-600 text-sm mt-2"></div>
                </div>
                
                <div class="flex space-x-3">
                    <button type="submit" id="paymentSubmitBtn" class="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <span id="paymentBtnText">Pay $${invoice.amount}</span>
                        <div id="paymentSpinner" class="hidden inline-block ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </button>
                    <button type="button" id="cancelPaymentBtn" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const paymentManager = new PaymentManager();
    
    // Wait for Stripe to initialize then mount card element
    setTimeout(() => {
        paymentManager.mountCardElement('card-element');
    }, 100);

    // Handle form submission
    const form = modal.querySelector('#paymentForm');
    const submitBtn = modal.querySelector('#paymentSubmitBtn');
    const btnText = modal.querySelector('#paymentBtnText');
    const spinner = modal.querySelector('#paymentSpinner');
    const cardErrors = modal.querySelector('#card-errors');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitBtn.disabled = true;
        btnText.textContent = 'Processing...';
        spinner.classList.remove('hidden');
        cardErrors.textContent = '';

        try {
            // Create payment intent
            const clientSecret = await paymentManager.createPaymentIntent(
                invoice.amount,
                invoice.stripe_customer_id,
                invoice.id
            );

            // Confirm payment
            const paymentIntent = await paymentManager.confirmPayment(clientSecret);

            if (paymentIntent.status === 'succeeded') {
                // Confirm payment on server
                await fetch('/api/stripe/confirm-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id
                    }),
                });

                showNotification('Payment processed successfully!', 'success');
                modal.remove();
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            cardErrors.textContent = error.message;
            submitBtn.disabled = false;
            btnText.textContent = `Pay $${invoice.amount}`;
            spinner.classList.add('hidden');
        }
    });

    // Handle card element errors
    if (paymentManager.cardElement) {
        paymentManager.cardElement.on('change', ({ error }) => {
            cardErrors.textContent = error ? error.message : '';
        });
    }

    // Close modal handlers
    modal.querySelector('#closePaymentModal').addEventListener('click', () => modal.remove());
    modal.querySelector('#cancelPaymentBtn').addEventListener('click', () => modal.remove());
    
    return modal;
}

// Subscription Management
class SubscriptionManager {
    async getPlans() {
        try {
            const response = await fetch('/api/subscription-plans');
            if (!response.ok) throw new Error('Failed to fetch plans');
            return await response.json();
        } catch (error) {
            console.error('Error fetching plans:', error);
            return [];
        }
    }

    async createSubscription(contactId, planId, paymentMethodId) {
        try {
            const response = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contactId,
                    planId,
                    paymentMethodId
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            return data;
        } catch (error) {
            console.error('Subscription creation error:', error);
            throw error;
        }
    }
}

// Billing Tab Component for Patient Profile
function createBillingTab(contactId) {
    return `
        <div class="space-y-6">
            <!-- Payment Methods Section -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Payment Methods</h3>
                    <button id="addPaymentMethodBtn" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                        Add Payment Method
                    </button>
                </div>
                <div id="paymentMethodsList" class="space-y-3">
                    <!-- Payment methods will be loaded here -->
                </div>
            </div>

            <!-- Invoice History Section -->
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Invoice History</h3>
                <div id="invoiceHistoryList" class="space-y-3">
                    <!-- Invoice history will be loaded here -->
                </div>
            </div>

            <!-- Subscription Section -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Subscriptions</h3>
                    <button id="manageSubscriptionBtn" class="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark">
                        Manage Subscription
                    </button>
                </div>
                <div id="subscriptionsList" class="space-y-3">
                    <!-- Subscriptions will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

// Initialize payment functionality
function initializePaymentFeatures() {
    // Add event listeners for payment-related actions
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="process-payment"]')) {
            const invoiceId = e.target.dataset.invoiceId;
            // Load invoice data and show payment modal
            loadInvoiceForPayment(invoiceId);
        }
        
        if (e.target.matches('[data-action="add-payment-method"]')) {
            const contactId = e.target.dataset.contactId;
            showAddPaymentMethodModal(contactId);
        }
    });
}

async function loadInvoiceForPayment(invoiceId) {
    try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        const invoice = await response.json();
        
        if (response.ok) {
            createPaymentModal(invoice, () => {
                // Refresh invoice list after successful payment
                if (window.currentView === 'invoices') {
                    loadInvoices();
                }
            });
        }
    } catch (error) {
        showNotification('Error loading invoice', 'error');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializePaymentFeatures);
