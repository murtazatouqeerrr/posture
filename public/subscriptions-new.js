// Subscription Management - NEW VERSION
console.log('🚀 NEW SUBSCRIPTIONS FILE LOADED!');
alert('NEW SUBSCRIPTIONS FILE LOADED!');
let subscriptionsData = [];
let subscriptionPlansData = [];
let subscriptionContactsData = [];

async function loadSubscriptionsView() {
    console.log('🔄 Loading subscriptions view... [NEW FILE]');
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
                    <h3 class="text-lg font-medium text-red-800">Error Loading Subscriptions</h3>
                    <p class="text-red-600 mt-2">${error.message}</p>
                    <button onclick="loadSubscriptionsView()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function renderSubscriptionsView() {
    console.log('🎨 Rendering subscriptions view with data:', subscriptionPlansData);
    
    document.getElementById('app').innerHTML = `
        <div class="p-6">
            <!-- Header -->
            <div class="flex justify-between items-center mb-8">
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
                            <p class="text-gray-600 mt-2">${plan.description || 'No description'}</p>
                            <div class="mt-4">
                                <span class="text-2xl font-bold text-primary">$${plan.price}</span>
                                <span class="text-gray-500">/${plan.billing_interval || 'month'}</span>
                            </div>
                            <div class="mt-4 text-sm text-gray-500">
                                Active subscriptions: ${subscriptionsData.filter(s => s.plan_id === plan.id && s.status === 'active').length}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Active Subscriptions Section -->
            <div class="mb-8">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Active Subscriptions</h3>
                </div>
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PATIENT</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PLAN</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NEXT BILLING</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${subscriptionsData.length > 0 ? subscriptionsData.map(subscription => {
                                const plan = subscriptionPlansData.find(p => p.id === subscription.plan_id);
                                const contact = subscriptionContactsData.find(c => c.id === subscription.contact_id);
                                return `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm font-medium text-gray-900">${contact ? contact.name : 'Unknown'}</div>
                                            <div class="text-sm text-gray-500">${contact ? contact.email : ''}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">${plan ? plan.name : 'Unknown Plan'}</div>
                                            <div class="text-sm text-gray-500">$${plan ? plan.price : '0'}/${plan ? plan.billing_interval : 'month'}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                                subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }">
                                                ${subscription.status}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${subscription.next_billing_date || 'N/A'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onclick="editSubscription(${subscription.id})" class="text-primary hover:text-primary-dark mr-3">Edit</button>
                                            <button onclick="cancelSubscription(${subscription.id})" class="text-red-600 hover:text-red-900">Cancel</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('') : `
                                <tr>
                                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">No subscriptions found</td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Modal functions (stubs for now)
function showCreatePlanModal() {
    alert('Create Plan modal - Coming soon!');
}

function showCreateSubscriptionModal() {
    alert('Create Subscription modal - Coming soon!');
}

function editSubscription(id) {
    alert(`Edit subscription ${id} - Coming soon!`);
}

function cancelSubscription(id) {
    if (confirm('Are you sure you want to cancel this subscription?')) {
        alert(`Cancel subscription ${id} - Coming soon!`);
    }
}