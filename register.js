document.addEventListener('DOMContentLoaded', function() {
    // Form sections and navigation
    const form = document.getElementById('register-form');
    const sections = document.querySelectorAll('.form-section');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    let currentStep = 0;

    // Password strength indicator
    const passwordInput = document.getElementById('register-password');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Form validation
    const emailInput = document.getElementById('register-email');
    const passwordConfirm = document.getElementById('confirm-password');

    // Navigation functions
    function showStep(step) {
        sections.forEach((section, index) => {
            section.classList.toggle('active', index === step);
        });
        
        progressSteps.forEach((step, index) => {
            step.classList.toggle('active', index <= step);
        });
        
        currentStep = step;
    }

    // Password strength checker
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength++;
        // Contains number check
        if (/\d/.test(password)) strength++;
        // Special character check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        
        // Update UI
        strengthBars.forEach((bar, index) => {
            bar.style.backgroundColor = index < strength ? 
                (strength === 1 ? '#E63946' : strength === 2 ? '#457B9D' : '#28a745') : '#e2e8f0';
        });
        
        strengthText.textContent = 
            strength === 0 ? 'Weak' : 
            strength === 1 ? 'Fair' : 
            strength === 2 ? 'Good' : 'Strong';
    });

    // Email validation
    emailInput.addEventListener('blur', function() {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) {
            this.style.borderColor = '#E63946';
        } else {
            this.style.borderColor = '#A8DADC';
        }
    });

    // Password confirmation
    passwordConfirm.addEventListener('input', function() {
        if (this.value !== passwordInput.value) {
            this.style.borderColor = '#E63946';
        } else {
            this.style.borderColor = '#A8DADC';
        }
    });

    // Navigation buttons
    nextBtn.addEventListener('click', function() {
        // Validate first step before proceeding
        const requiredFields = document.querySelectorAll('#account-section [required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value) {
                field.style.borderColor = '#E63946';
                isValid = false;
            }
        });
        
        if (isValid && passwordInput.value === passwordConfirm.value) {
            showStep(1);
        }
    });

    backBtn.addEventListener('click', function() {
        showStep(0);
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Create user object
        const user = {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            email: document.getElementById('register-email').value,
            password: document.getElementById('register-password').value,
            shipping: {
                address: document.getElementById('shipping-address').value,
                city: document.getElementById('shipping-city').value,
                postalCode: document.getElementById('shipping-postal').value,
                country: document.getElementById('shipping-country').value,
                phone: document.getElementById('shipping-phone').value
            },
            newsletter: document.getElementById('newsletter').checked,
            joined: new Date().toISOString(),
            rewardPoints: 100 // Initial reward points
        };
        
        // Save to localStorage (in a real app, this would be an API call)
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userEmail', user.email);
        
        // Show completion step
        showStep(2);
        
        // Update account page with new user
        if (typeof updateAccountDashboard === 'function') {
            updateAccountDashboard(user);
        }
    });

    // Initialize
    showStep(0);
});

// Function to be called from account page
function updateAccountDashboard(user) {
    document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profile-first-name').value = user.firstName;
    document.getElementById('profile-last-name').value = user.lastName;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-phone').value = user.shipping.phone;
    
    // Add shipping address
    const addressList = document.getElementById('address-list');
    if (addressList) {
        addressList.innerHTML = `
            <div class="address-card default">
                <h4>Primary Address</h4>
                <p>${user.shipping.address}</p>
                <p>${user.shipping.city}, ${user.shipping.postalCode}</p>
                <p>${user.shipping.country}</p>
                <p>Phone: ${user.shipping.phone}</p>
                <div class="address-actions">
                    <button class="btn btn-secondary">Edit</button>
                </div>
            </div>
        `;
    }
    
    // Update reward points
    const rewardPoints = document.getElementById('reward-points');
    if (rewardPoints) {
        rewardPoints.textContent = user.rewardPoints || 100;
    }
}