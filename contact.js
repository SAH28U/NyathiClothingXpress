// contact.js - NYATHI X CLOTHING Contact Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    initMap();
    
    // Handle contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactForm();
        });
    }
    
    // FAQ accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            // Toggle the answer
            answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
            
            // Toggle the icon
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
            
            // Toggle active class on question
            this.parentElement.classList.toggle('active');
        });
    });
    
    // Initialize the map
    function initMap() {
        const mapElement = document.getElementById('store-map');
        if (!mapElement) return;
        
        // Coordinates for Brakpan North (approximate)
        const storeLocation = [-26.2365, 28.3698];
        const map = L.map('store-map').setView(storeLocation, 15);
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add custom marker
        const customIcon = L.icon({
            iconUrl: 'img/map-marker.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
        
        L.marker(storeLocation, {icon: customIcon}).addTo(map)
            .bindPopup("<b>NYATHI X CLOTHING</b><br>153 Brakpan North, Wardans City")
            .openPopup();
    }
    
    // Handle contact form submission
    function handleContactForm() {
        const form = document.getElementById('contact-form');
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // In a real application, this would be an AJAX call to your server
        setTimeout(() => {
            // Simulate successful submission
            showToast('Your message has been sent successfully!', 'success');
            form.reset();
            
            // Reset button
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            submitBtn.disabled = false;
        }, 1500);
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});