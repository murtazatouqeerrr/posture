function initializeCampaigns() {
    const campaignsList = document.getElementById('campaigns-list');
    const addCampaignBtn = document.getElementById('add-campaign-btn');
    const campaignModal = document.getElementById('campaign-modal');
    const cancelCampaignBtn = document.getElementById('cancel-campaign-btn');
    const campaignForm = document.getElementById('campaign-form');
    const modalTitle = document.getElementById('modal-title');

    // Check if all elements exist
    if (!campaignsList || !addCampaignBtn || !campaignModal || !cancelCampaignBtn || !campaignForm || !modalTitle) {
        console.error('Required campaign elements not found');
        return;
    }

    let editingCampaignId = null;

    const openModal = () => campaignModal.classList.remove('hidden');
    const closeModal = () => {
        campaignModal.classList.add('hidden');
        campaignForm.reset();
        modalTitle.textContent = 'Add New Campaign';
        editingCampaignId = null;
    };

    addCampaignBtn.addEventListener('click', openModal);
    cancelCampaignBtn.addEventListener('click', closeModal);

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('/api/campaigns');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const campaigns = await response.json();
            renderCampaigns(Array.isArray(campaigns) ? campaigns : []);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            renderCampaigns([]);
        }
    };

    const renderCampaigns = (campaigns) => {
        campaignsList.innerHTML = '';
        if (!Array.isArray(campaigns) || campaigns.length === 0) {
            campaignsList.innerHTML = '<p class="text-gray-500">No campaigns found.</p>';
            return;
        }
        campaigns.forEach(campaign => {
            const campaignCard = document.createElement('div');
            campaignCard.className = 'bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500';
            campaignCard.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <h2 class="text-xl font-bold text-gray-800">${campaign.name}</h2>
                    <span class="px-2 py-1 text-xs rounded-full ${campaign.status === 'Sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${campaign.status || 'Draft'}
                    </span>
                </div>
                <p class="text-gray-600 mb-3">${campaign.description || 'No description'}</p>
                <div class="text-sm text-gray-500 mb-4">
                    <p><strong>Subject:</strong> ${campaign.subject || 'No subject'}</p>
                    <p><strong>Channel:</strong> ${campaign.channel || 'email'}</p>
                    <p><strong>Audience:</strong> ${campaign.target_audience || 'all'}</p>
                </div>
                <div class="flex justify-between items-center pt-3 border-t">
                    <div class="text-xs text-gray-400">
                        Created: ${campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'Unknown'}
                    </div>
                    <div class="flex space-x-2">
                        <button class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200" onclick="editCampaign(${campaign.id})">
                            Edit
                        </button>
                        <button class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200" onclick="deleteCampaign(${campaign.id})">
                            Delete
                        </button>
                        ${campaign.status !== 'Sent' ? `<button class="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200" onclick="sendCampaign(${campaign.id})">Send</button>` : ''}
                    </div>
                </div>
            `;
            campaignsList.appendChild(campaignCard);
        });
    };

    campaignForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(campaignForm);
        const campaignData = Object.fromEntries(formData.entries());

        try {
            const url = editingCampaignId ? `/api/campaigns/${editingCampaignId}` : '/api/campaigns';
            const method = editingCampaignId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaignData),
            });

            if (response.ok) {
                closeModal();
                fetchCampaigns();
            } else {
                console.error('Error saving campaign:', await response.json());
            }
        } catch (error) {
            console.error('Error saving campaign:', error);
        }
    });

    window.editCampaign = async (id) => {
        try {
            const response = await fetch(`/api/campaigns/${id}`);
            const campaign = await response.json();
            modalTitle.textContent = 'Edit Campaign';
            editingCampaignId = id;
            for (const key in campaign) {
                if (campaignForm.elements[key]) {
                    campaignForm.elements[key].value = campaign[key];
                }
            }
            openModal();
        } catch (error) {
            console.error('Error fetching campaign for editing:', error);
        }
    };

    window.deleteCampaign = async (id) => {
        if (confirm('Are you sure you want to delete this campaign?')) {
            try {
                const response = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchCampaigns();
                } else {
                    console.error('Error deleting campaign:', await response.json());
                }
            } catch (error) {
                console.error('Error deleting campaign:', error);
            }
        }
    };

    window.sendCampaign = async (id) => {
        if (confirm('Are you sure you want to send this campaign immediately?')) {
            try {
                const response = await fetch(`/api/campaigns/${id}/send`, { method: 'POST' });
                if (response.ok) {
                    const result = await response.json();
                    alert(result.message);
                } else {
                    const error = await response.json();
                    alert(`Error sending campaign: ${error.error}`);
                }
            } catch (error) {
                console.error('Error sending campaign:', error);
                alert('An unexpected error occurred. Please try again.');
            }
        }
    };

    fetchCampaigns();
}

// Initialize campaigns when page loads
document.addEventListener('DOMContentLoaded', initializeCampaigns);
