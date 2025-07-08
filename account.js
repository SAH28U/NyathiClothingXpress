// account.js - NYATHI X CLOTHING Account Management
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const addressForm = document.getElementById('address-form');
    const addAddressBtn = document.getElementById('add-address-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const addressList = document.getElementById('address-list');
    const orderHistory = document.getElementById('order-history');
    const dashboardTab = document.querySelector('.tab-btn[data-tab="dashboard"]');
    
    // Current user data
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    // Initialize the account page
    initAccountPage();

    // Tab switching functionality
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            handleLogin(email, password);
        });
    }

    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            
            handleRegistration(email, password, firstName, lastName);
        });
    }

    // Profile form submission
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const firstName = document.getElementById('profile-first-name').value;
            const lastName = document.getElementById('profile-last-name').value;
            const email = document.getElementById('profile-email').value;
            const phone = document.getElementById('profile-phone').value;
            
            updateProfile(firstName, lastName, email, phone);
        });
    }

    // Password form submission
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-new-password').value;
            
            changePassword(currentPassword, newPassword, confirmPassword);
        });
    }

    // Address form submission
    if (addressForm) {
        addressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const addressName = document.getElementById('address-name').value;
            const fullName = document.getElementById('address-full-name').value;
            const street = document.getElementById('address-street').value;
            const city = document.getElementById('address-city').value;
            const postal = document.getElementById('address-postal').value;
            const country = document.getElementById('address-country').value;
            const phone = document.getElementById('address-phone').value;
            const isDefault = document.getElementById('default-address').checked;
            
            saveAddress(addressName, fullName, street, city, postal, country, phone, isDefault);
        });
    }

    // Add address button click
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            openAddressModal();
        });
    }

    // Logout button click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            handleLogout();
        });
    }

    // Password strength indicator
    const passwordInput = document.getElementById('register-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }

    // Initialize the page based on user login status
    function initAccountPage() {
        if (currentUser) {
            // User is logged in - show dashboard
            showDashboard();
            switchTab('dashboard');
            dashboardTab.style.display = 'block';
        } else {
            // User is not logged in - show login/register
            switchTab('login');
            dashboardTab.style.display = 'none';
        }
    }

    // Switch between tabs
    function switchTab(tabId) {
        // Hide all tab contents
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Deactivate all tab buttons
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show the selected tab content
        document.getElementById(tabId).classList.add('active');
        
        // Activate the selected tab button
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    }

    // Handle user login
    function handleLogin(email, password) {
        // In a real app, this would be an API call
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Successful login
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Show success message
            showToast('Login successful!', 'success');
            
            // Update UI
            showDashboard();
            switchTab('dashboard');
            dashboardTab.style.display = 'block';
            
            // Close any open modals
            closeModal();
        } else {
            // Failed login
            showToast('Invalid email or password', 'error');
        }
    }

    // Handle user registration
    function handleRegistration(email, password, firstName, lastName) {
        // In a real app, this would be an API call
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if user already exists
        if (users.some(u => u.email === email)) {
            showToast('Email already registered', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            firstName,
            lastName,
            email,
            password,
            phone: '',
            addresses: [],
            orders: [],
            rewardPoints: 100, // Starting reward points
            joined: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        currentUser = newUser;
        
        // Show success message
        showToast('Account created successfully!', 'success');
        
        // Update UI
        showDashboard();
        switchTab('dashboard');
        dashboardTab.style.display = 'block';
    }

    // Update user profile
    function updateProfile(firstName, lastName, email, phone) {
        if (!currentUser) return;
        
        // Update user data
        currentUser.firstName = firstName;
        currentUser.lastName = lastName;
        currentUser.email = email;
        currentUser.phone = phone;
        
        // Save to localStorage
        updateUserData(currentUser);
        
        // Update UI
        document.getElementById('user-name').textContent = `${firstName} ${lastName}`;
        
        // Show success message
        showToast('Profile updated successfully', 'success');
    }

    // Change password
    function changePassword(currentPassword, newPassword, confirmPassword) {
        if (!currentUser) return;
        
        // Verify current password
        if (currentUser.password !== currentPassword) {
            showToast('Current password is incorrect', 'error');
            return;
        }
        
        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        
        // Update password
        currentUser.password = newPassword;
        updateUserData(currentUser);
        
        // Clear form
        passwordForm.reset();
        
        // Show success message
        showToast('Password changed successfully', 'success');
    }

    // Save address
    function saveAddress(name, fullName, street, city, postal, country, phone, isDefault) {
        if (!currentUser) return;
        
        const newAddress = {
            id: Date.now().toString(),
            name,
            fullName,
            street,
            city,
            postal,
            country,
            phone,
            isDefault
        };
        
        // If this is the first address or marked as default, make it default
        if (isDefault || currentUser.addresses.length === 0) {
            currentUser.addresses.forEach(addr => addr.isDefault = false);
            newAddress.isDefault = true;
        }
        
        // Add to user's addresses
        currentUser.addresses.push(newAddress);
        updateUserData(currentUser);
        
        // Update UI
        renderAddresses();
        closeModal();
        
        // Show success message
        showToast('Address saved successfully', 'success');
    }

    // Delete address
    function deleteAddress(addressId) {
        if (!currentUser) return;
        
        currentUser.addresses = currentUser.addresses.filter(addr => addr.id !== addressId);
        
        // If we deleted the default address and there are others, make the first one default
        if (currentUser.addresses.length > 0 && !currentUser.addresses.some(addr => addr.isDefault)) {
            currentUser.addresses[0].isDefault = true;
        }
        
        updateUserData(currentUser);
        renderAddresses();
        
        // Show success message
        showToast('Address deleted', 'success');
    }

    // Set default address
    function setDefaultAddress(addressId) {
        if (!currentUser) return;
        
        currentUser.addresses.forEach(addr => {
            addr.isDefault = addr.id === addressId;
        });
        
        updateUserData(currentUser);
        renderAddresses();
        
        // Show success message
        showToast('Default address updated', 'success');
    }

    // Update user data in localStorage
    function updateUserData(user) {
        // Update current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        currentUser = user;
        
        // Update in users array
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === user.email);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    // Handle user logout
    function handleLogout() {
        localStorage.removeItem('currentUser');
        currentUser = null;
        
        // Update UI
        switchTab('login');
        dashboardTab.style.display = 'none';
        
        // Show success message
        showToast('You have been logged out', 'success');
    }

    // Show dashboard with user data
    function showDashboard() {
        if (!currentUser) return;
        
        // Update profile info
        document.getElementById('user-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('reward-points').textContent = currentUser.rewardPoints || 0;
        
        // Update profile form
        if (profileForm) {
            document.getElementById('profile-first-name').value = currentUser.firstName || '';
            document.getElementById('profile-last-name').value = currentUser.lastName || '';
            document.getElementById('profile-email').value = currentUser.email || '';
            document.getElementById('profile-phone').value = currentUser.phone || '';
        }
        
        // Render addresses
        renderAddresses();
        
        // Render orders
        renderOrders();
    }

    // Render addresses in the address book
    function renderAddresses() {
        if (!currentUser || !addressList) return;
        
        addressList.innerHTML = '';
        
        if (currentUser.addresses.length === 0) {
            addressList.innerHTML = '<p class="no-addresses">You have no saved addresses</p>';
            return;
        }
        
        currentUser.addresses.forEach(address => {
            const addressElement = document.createElement('div');
            addressElement.className = `address-card ${address.isDefault ? 'default' : ''}`;
            addressElement.innerHTML = `
                <h4>${address.name || 'Address'}</h4>
                <p>${address.fullName}</p>
                <p>${address.street}</p>
                <p>${address.city}, ${address.postal}</p>
                <p>${address.country}</p>
                <p>Phone: ${address.phone}</p>
                <div class="address-actions">
                    ${!address.isDefault ? 
                        `<button class="btn btn-sm btn-secondary set-default" data-id="${address.id}">Set Default</button>` : 
                        `<span class="default-badge">Default</span>`}
                    <button class="btn btn-sm btn-outline edit-address" data-id="${address.id}">Edit</button>
                    <button class="btn btn-sm btn-outline delete-address" data-id="${address.id}">Delete</button>
                </div>
            `;
            addressList.appendChild(addressElement);
        });
        
        // Add event listeners to address actions
        document.querySelectorAll('.set-default').forEach(btn => {
            btn.addEventListener('click', function() {
                setDefaultAddress(this.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.delete-address').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this address?')) {
                    deleteAddress(this.getAttribute('data-id'));
                }
            });
        });
        
        document.querySelectorAll('.edit-address').forEach(btn => {
            btn.addEventListener('click', function() {
                editAddress(this.getAttribute('data-id'));
            });
        });
    }

    // Render order history
    function renderOrders() {
        if (!currentUser || !orderHistory) return;
        
        orderHistory.innerHTML = '';
        
        if (currentUser.orders.length === 0) {
            orderHistory.innerHTML = '<p class="no-orders">You haven\'t placed any orders yet.</p>';
            return;
        }
        
        currentUser.orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-card';
            orderElement.innerHTML = `
                <div class="order-card-header">
                    <h4>Order #${order.id}</h4>
                    <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div class="order-card-body">
                    <p>Status: <span class="order-status ${order.status.toLowerCase()}">${order.status}</span></p>
                    <p>Total: R ${order.total.toFixed(2)}</p>
                    <a href="#" class="btn btn-sm btn-outline view-order">View Details</a>
                </div>
            `;
            orderHistory.appendChild(orderElement);
        });
    }

    // Open address modal for adding/editing
    function openAddressModal(addressId = null) {
        const modal = document.getElementById('address-modal');
        const title = document.getElementById('address-modal-title');
        const form = document.getElementById('address-form');
        
        if (addressId) {
            // Editing existing address
            const address = currentUser.addresses.find(addr => addr.id === addressId);
            if (!address) return;
            
            title.textContent = 'Edit Address';
            form.reset();
            
            // Fill form with address data
            document.getElementById('address-id').value = address.id;
            document.getElementById('address-name').value = address.name || '';
            document.getElementById('address-full-name').value = address.fullName || '';
            document.getElementById('address-street').value = address.street || '';
            document.getElementById('address-city').value = address.city || '';
            document.getElementById('address-postal').value = address.postal || '';
            document.getElementById('address-country').value = address.country || 'ZA';
            document.getElementById('address-phone').value = address.phone || '';
            document.getElementById('default-address').checked = address.isDefault || false;
        } else {
            // Adding new address
            title.textContent = 'Add New Address';
            form.reset();
            document.getElementById('address-id').value = '';
            document.getElementById('default-address').checked = currentUser.addresses.length === 0;
        }
        
        // Show modal
        modal.style.display = 'flex';
    }

    // Close modal
    function closeModal() {
        const modal = document.getElementById('address-modal');
        modal.style.display = 'none';
    }

    // Edit address
    function editAddress(addressId) {
        openAddressModal(addressId);
    }

    // Check password strength
    function checkPasswordStrength(password) {
        const strengthBars = document.querySelectorAll('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
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
                (strength === 1 ? 'var(--error-color)' : 
                 strength === 2 ? 'var(--accent-color)' : 'var(--success-color)') : 'var(--medium-gray)';
        });
        
        strengthText.textContent = 
            strength === 0 ? 'Weak' : 
            strength === 1 ? 'Fair' : 
            strength === 2 ? 'Good' : 'Strong';
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

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('address-modal');
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});