document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000';

    // --- Sticky Header on Scroll ---
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // --- Form Handling ---
    const issueForm = document.getElementById('issue-form');
    const getLocationBtn = document.getElementById('get-location');
    const locationDisplay = document.getElementById('location-display');

    // Geolocation
    getLocationBtn.addEventListener('click', () => {
        locationDisplay.textContent = 'Fetching location...';
        locationDisplay.classList.remove('text-red-500');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    locationDisplay.textContent = `Location Acquired: Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
                    locationDisplay.dataset.location = JSON.stringify({ latitude, longitude });
                },
                (error) => {
                    locationDisplay.textContent = 'Error: Unable to retrieve location.';
                    locationDisplay.classList.add('text-red-500');
                }
            );
        } else {
            locationDisplay.textContent = 'Geolocation is not supported by this browser.';
            locationDisplay.classList.add('text-red-500');
        }
    });

    // Issue Form Submission
    issueForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = issueForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('issueType', document.getElementById('issue-type').value);
        formData.append('severity', document.getElementById('severity').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('address', document.getElementById('address').value);
        formData.append('issueImage', document.getElementById('issue-image').files[0]);
        
        if (locationDisplay.dataset.location) {
            formData.append('location', locationDisplay.dataset.location);
        }

        try {
            const response = await fetch(`${API_URL}/api/report`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Report Submitted!\nYour Complaint ID is: ${result.complaintId}`);
                issueForm.reset();
                locationDisplay.textContent = '';
                delete locationDisplay.dataset.location;
            } else {
                throw new Error(result.message || 'Failed to submit report.');
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = `<span>Submit Securely</span>
                                      <svg class="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>`;
        }
    });

    // --- Status Tracking ---
    const statusForm = document.getElementById('status-form');
    const statusResults = document.getElementById('status-results');

    statusForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const complaintId = document.getElementById('complaint-id').value;
        if (!complaintId) return;

        // Start with a loading message inside a styled card
        statusResults.innerHTML = `
            <div class="status-card visible">
                <p class="text-center text-gray-400">Fetching status...</p>
            </div>
        `;

        try {
            const response = await fetch(`${API_URL}/api/track/${complaintId}`);
            const result = await response.json();

            if (response.ok) {
                const statusClass = result.status.toLowerCase().replace(' ', '-');
                statusResults.innerHTML = `
                    <div class="status-card visible">
                        <div class="status-card-header">
                            <h3>Complaint Status</h3>
                            <p>ID: ${result.id}</p>
                        </div>
                        <div class="status-card-body">
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>Current Status</strong>
                                    <span class="status-badge ${statusClass}">${result.status}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Reported On</strong>
                                    <span>${new Date(result.timestamp).toLocaleString()}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Issue Type</strong>
                                    <span>${result.issueType}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Severity</strong>
                                    <span>${result.severity}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Address / Landmark</strong>
                                    <span>${result.address}</span>
                                </div>
                                ${result.imagePath ? `
                                <div class="detail-item">
                                    <strong>Uploaded Image</strong>
                                    <a href="${API_URL}${result.imagePath}" target="_blank" class="text-primary hover:underline">View Image</a>
                                </div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                throw new Error(result.message || 'Failed to fetch status.');
            }
        } catch (error) {
            statusResults.innerHTML = `
                <div class="status-card visible">
                    <p class="text-red-500 text-center">Error: ${error.message}</p>
                </div>
            `;
        }
    });

    // --- Scroll Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });
});