document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id');
    
    if (!patientId) {
        alert('No patient ID provided');
        window.location.href = 'index.html';
        return;
    }

    const assessmentModal = document.getElementById('assessmentModal');
    const sessionModal = document.getElementById('sessionModal');
    const addAssessmentBtn = document.getElementById('addAssessmentBtn');
    const logSessionBtn = document.getElementById('logSessionBtn');
    const closeAssessment = document.querySelector('.close-assessment');
    const closeSession = document.querySelector('.close-session');
    const assessmentForm = document.getElementById('assessmentForm');
    const sessionForm = document.getElementById('sessionForm');

    // Load patient data
    loadPatientInfo();
    loadTimeline();

    // Modal controls
    addAssessmentBtn.onclick = () => assessmentModal.style.display = 'block';
    logSessionBtn.onclick = () => sessionModal.style.display = 'block';
    closeAssessment.onclick = () => assessmentModal.style.display = 'none';
    closeSession.onclick = () => sessionModal.style.display = 'none';

    window.onclick = (event) => {
        if (event.target === assessmentModal) assessmentModal.style.display = 'none';
        if (event.target === sessionModal) sessionModal.style.display = 'none';
    };

    // Form submissions
    assessmentForm.onsubmit = function(e) {
        e.preventDefault();
        addAssessment();
    };

    sessionForm.onsubmit = function(e) {
        e.preventDefault();
        logSession();
    };

    function loadPatientInfo() {
        fetch(`/api/contacts/${patientId}`)
            .then(response => response.json())
            .then(patient => {
                document.getElementById('patientName').textContent = `${patient.first_name} ${patient.last_name}`;
                document.getElementById('patientEmail').textContent = patient.email || 'N/A';
                document.getElementById('patientPhone').textContent = patient.phone || 'N/A';
                document.getElementById('patientStatus').textContent = patient.status || 'N/A';
                document.getElementById('patientComplaint').textContent = patient.primary_complaint || 'N/A';
            })
            .catch(error => {
                console.error('Error loading patient info:', error);
            });
    }

    function loadTimeline() {
        fetch(`/api/patients/${patientId}/timeline`)
            .then(response => response.json())
            .then(timeline => {
                displayTimeline(timeline);
            })
            .catch(error => {
                console.error('Error loading timeline:', error);
            });
    }

    function displayTimeline(timeline) {
        const timelineContainer = document.getElementById('timeline');
        timelineContainer.innerHTML = '';

        if (timeline.length === 0) {
            timelineContainer.innerHTML = '<p>No timeline entries yet.</p>';
            return;
        }

        timeline.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = `timeline-item ${item.type}`;
            
            const date = new Date(item.date).toLocaleString();
            const typeLabel = item.type === 'assessment' ? 'Assessment' : 'Session';
            
            timelineItem.innerHTML = `
                <div class="timeline-date">${date}</div>
                <div class="timeline-type">${typeLabel}</div>
                <div class="timeline-notes">${item.notes || 'No notes'}</div>
            `;
            
            timelineContainer.appendChild(timelineItem);
        });
    }

    function addAssessment() {
        const assessmentData = {
            assessment_date: document.getElementById('assessmentDate').value,
            therapist_notes: document.getElementById('therapistNotes').value,
            observed_posture: document.getElementById('observedPosture').value,
            recommendations: document.getElementById('recommendations').value
        };

        fetch(`/api/patients/${patientId}/assessment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assessmentData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                assessmentModal.style.display = 'none';
                assessmentForm.reset();
                loadTimeline();
            }
        })
        .catch(error => {
            console.error('Error adding assessment:', error);
        });
    }

    function logSession() {
        const sessionData = {
            session_date: document.getElementById('sessionDate').value,
            type: document.getElementById('sessionType').value,
            notes: document.getElementById('sessionNotes').value,
            pain_level_pre: document.getElementById('painLevelPre').value,
            pain_level_post: document.getElementById('painLevelPost').value,
            homework_assigned: document.getElementById('homeworkAssigned').value
        };

        fetch(`/api/patients/${patientId}/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                sessionModal.style.display = 'none';
                sessionForm.reset();
                loadTimeline();
            }
        })
        .catch(error => {
            console.error('Error logging session:', error);
        });
    }
});
