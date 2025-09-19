function initializeCampaigns() {
    const campaignsList = document.getElementById('campaigns-list');
    const addCampaignBtn = document.getElementById('add-campaign-btn');
    const campaignModal = document.getElementById('campaign-modal');
    const cancelCampaignBtn = document.getElementById('cancel-campaign-btn');
    const campaignForm = document.getElementById('campaign-form');
    const modalTitle = document.getElementById('modal-title');

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
            campaignCard.className = 'bg-white rounded-lg shadow-md p-6';
            campaignCard.innerHTML = `
                <h2 class="text-xl font-bold mb-2">${campaign.name}</h2>
                <p class="text-gray-600 mb-4">${campaign.description}</p>
                <div class="flex justify-between items-center">
                    <div>
                        <span class="text-sm font-semibold text-gray-700">Channel:</span>
                        <span class="text-sm text-gray-900">${campaign.channel}</span>
                    </div>
                    <div>
                        <span class="text-sm font-semibold text-gray-700">Audience:</span>
                        <span class="text-sm text-gray-900">${campaign.target_audience}</span>
                    </div>
                </div>
                <div class="mt-4 flex justify-end">
                    <button class="text-sm text-blue-500 hover:underline mr-4" onclick="editCampaign(${campaign.id})">Edit</button>
                    <button class="text-sm text-red-500 hover:underline mr-4" onclick="deleteCampaign(${campaign.id})">Delete</button>
                    <button class="text-sm text-green-500 hover:underline" onclick="sendCampaign(${campaign.id})">Send Now</button>
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
