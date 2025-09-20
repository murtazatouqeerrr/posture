// Subscription Management
let subscriptionsData = [];
let subscriptionPlansData = [];
let subscriptionContactsData = [];

async function loadSubscriptionsView() {
    console.log('🔄 Loading subscriptions view... [UPDATED v3]');
    console.log('🔄 About to make API calls...');
    
    try {
        console.log('🔄 Making fetch calls...');
        const [subscriptionsResponse, plansResponse, contactsResponse] = await Promise.all([
            fetch('/api/subscriptions'),
            fetch('/api/subscription-plans'),
            fetch('/api/contacts')
        ]);
        console.log('🔄 Fetch calls completed');

        if (!subscriptionsResponse.ok || !plansResponse.ok || !contactsResponse.ok) {
            throw new Error('Failed to fetch subscription data');
        }

        subscriptionsData = await subscriptionsResponse.json();
        subscriptionPlansData = await plansResponse.json();
        subscriptionContactsData = await contactsResponse.json();
        
        console.log('✅ Subscriptions data loaded successfully');
        console.log('📊 Plans data:', subscriptionPlansData);
        console.log('📊 Subscriptions data:', subscriptionsData);
        renderSubscriptionsView();
    } catch (error) {
        console.error('❌ Subscriptions loading error:', error);
        document.getElementById('app').innerHTML = `
            <div class="p-6">
                <div class="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 class="text-red-800 font-medium">Error Loading Subscriptions</h3>
                    <p class="text-red-700 mt-2">${error.message}</p>
                    <button onclick="loadSubscriptionsView()" class="mt-3 bg-red-100 px-3 py-2 rounded text-red-800 hover:bg-red-200">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function renderSubscriptionsView() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">Subscription Management</h2>
                    <p class="text-gray-600">Manage recurring billing and subscription plans</p>
                </div>
                <div class="space-x-3">
                    <button onclick="showCreatePlanModal()" class="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark">
                        Create Plan
                    </button>
                    <button onclick="showCreateSubscriptionModal()" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                        New Subscription
                    </button>
                </div>
            </div>

            <!-- Subscription Plans Section -->
            <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Subscription Plans</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${subscriptionPlansData.map(plan => `
                        <div class="bg-white rounded-lg shadow p-6">
                            <h4 class="text-lg font-medium text-gray-900">${plan.name}</h4>
                            <p class="text-gray-600 mt-2">${plan.description}</p>
                            <div class="mt-4">
                                <span class="text-2xl font-bold text-primary">$${plan.price}</span>
                                <span class="text-gray-500">/${plan.billing_interval}</span>
                            </div>
                            <div class="mt-4 text-sm text-gray-500">
                                Active subscriptions: ${subscriptionsData.filter(s => s.plan_id === plan.id && s.status === 'active').length}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Active Subscriptions -->
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">Active Subscriptions</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Billing</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${subscriptionsData.length > 0 ? subscriptionsData.map(subscription => {
                                const contact = subscriptionContactsData.find(c => c.id === subscription.contact_id);
                                const plan = subscriptionPlansData.find(p => p.id === subscription.plan_id);
                                return `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm font-medium text-gray-900">${contact ? contact.first_name + ' ' + contact.last_name : 'Unknown'}</div>
                                            <div class="text-sm text-gray-500">${contact ? contact.email : ''}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">${plan ? plan.name : 'Unknown Plan'}</div>
                                            <div class="text-sm text-gray-500">$${plan ? plan.price : '0'}/${plan ? plan.billing_interval : ''}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                                ${subscription.status}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${formatDate(subscription.next_billing_date)}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onclick="cancelSubscription(${subscription.id})" class="text-red-600 hover:text-red-900">Cancel</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('') : `
                                <tr>
                                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                                        No subscriptions found
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function showCreatePlanModal() {
    const modalHTML = `
        <div id="createPlanModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">Create Subscription Plan</h3>
                        <button onclick="closeCreatePlanModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="createPlanForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Plan Name</label>
                            <input type="text" name="name" required 
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" rows="3" 
                                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"></textarea>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Price ($)</label>
                                <input type="number" name="price" step="0.01" required 
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Billing Interval</label>
                                <select name="interval" required 
                                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                    <option value="week">Weekly</option>
                                    <option value="month">Monthly</option>
                                    <option value="year">Yearly</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" onclick="closeCreatePlanModal()" 
                                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark">
                                Create Plan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('createPlanForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createSubscriptionPlan(new FormData(e.target));
    });
}

function showCreateSubscriptionModal() {
    const modalHTML = `
        <div id="createSubscriptionModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">Create New Subscription</h3>
                        <button onclick="closeCreateSubscriptionModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="createSubscriptionForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Patient</label>
                            <select name="contact_id" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                <option value="">Select Patient</option>
                                ${subscriptionContactsData.map(contact => `
                                    <option value="${contact.id}">${contact.first_name} ${contact.last_name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Subscription Plan</label>
                            <select name="plan_id" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                <option value="">Select Plan</option>
                                ${subscriptionPlansData.map(plan => `
                                    <option value="${plan.id}">${plan.name} - $${plan.price}/${plan.interval}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" onclick="closeCreateSubscriptionModal()" 
                                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark">
                                Create Subscription
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('createSubscriptionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createSubscription(new FormData(e.target));
    });
}

async function createSubscriptionPlan(formData) {
    try {
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: formData.get('price'),
            interval: formData.get('interval')
        };
        
        const response = await fetch('/api/subscription-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        showNotification('Subscription plan created successfully', 'success');
        closeCreatePlanModal();
        loadSubscriptionsView();
    } catch (error) {
        console.error('❌ Error creating plan:', error);
        showNotification('Error creating subscription plan', 'error');
    }
}

async function createSubscription(formData) {
    try {
        const data = {
            contact_id: formData.get('contact_id'),
            plan_id: formData.get('plan_id')
        };
        
        const response = await fetch('/api/subscriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        showNotification('Subscription created successfully', 'success');
        closeCreateSubscriptionModal();
        loadSubscriptionsView();
    } catch (error) {
        console.error('❌ Error creating subscription:', error);
        showNotification('Error creating subscription', 'error');
    }
}

async function cancelSubscription(subscriptionId) {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    
    try {
        const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' })
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        showNotification('Subscription cancelled successfully', 'success');
        loadSubscriptionsView();
    } catch (error) {
        console.error('❌ Error cancelling subscription:', error);
        showNotification('Error cancelling subscription', 'error');
    }
}

function closeCreatePlanModal() {
    const modal = document.getElementById('createPlanModal');
    if (modal) modal.remove();
}

function closeCreateSubscriptionModal() {
    const modal = document.getElementById('createSubscriptionModal');
    if (modal) modal.remove();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}
