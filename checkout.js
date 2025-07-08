document.addEventListener('DOMContentLoaded', function() {
    // Load cart items
    displayCheckoutItems();
    
    // Update payment method display
    setupPaymentMethods();
    
    // Setup form submission
    setupCheckoutForm();
});

function displayCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItems = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('checkout-subtotal');
    const totalElement = document.getElementById('checkout-total');
    const shippingCostElement = document.getElementById('checkout-shipping');
    
    if (cart.length === 0) {
        checkoutItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        subtotalElement.textContent = 'R 0.00';
        shippingCostElement.textContent = 'FREE';
        totalElement.textContent = 'R 0.00';
        return;
    }
    
    checkoutItems.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="order-item-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="order-item-details">
                <h4 class="order-item-title">${item.title}</h4>
                <span class="order-item-price">R ${item.price.toFixed(2)}</span>
                <p class="order-item-quantity">Quantity: ${item.quantity}</p>
            </div>
        `;
        checkoutItems.appendChild(itemElement);
        
        subtotal += item.price * item.quantity;
    });
    
    // Calculate initial total (subtotal + shipping)
    const shippingCost = document.querySelector('input[name="shipping"]:checked').id.includes('express') ? 99 : 0;
    const total = subtotal + shippingCost;
    
    subtotalElement.textContent = `R ${subtotal.toFixed(2)}`;
    shippingCostElement.textContent = shippingCost > 0 ? `R ${shippingCost.toFixed(2)}` : 'FREE';
    totalElement.textContent = `R ${total.toFixed(2)}`;
}

function setupPaymentMethods() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Show the corresponding form
            const method = this.dataset.method;
            document.querySelectorAll('.other-payment-form').forEach(form => {
                form.style.display = 'none';
            });
            
            document.getElementById(`${method}-form`).style.display = 'block';
        });
    });
    
    // Trigger click on first payment option
    document.querySelector('.payment-option').click();
}

function setupCheckoutForm() {
    const placeOrderBtn = document.getElementById('place-order-btn');
    const shippingForm = document.getElementById('shipping-form');
    const shippingMethods = document.querySelectorAll('input[name="shipping"]');
    const shippingCostElement = document.getElementById('checkout-shipping');
    const totalElement = document.getElementById('checkout-total');
    const subtotalElement = document.getElementById('checkout-subtotal');
    
    // Handle shipping method changes
    shippingMethods.forEach(method => {
        method.addEventListener('change', function() {
            const subtotal = parseFloat(subtotalElement.textContent.replace('R ', ''));
            let shippingCost = 0;
            
            if (this.id === 'express-shipping') {
                shippingCost = 99;
                shippingCostElement.textContent = 'R 99.00';
            } else {
                shippingCost = 0;
                shippingCostElement.textContent = 'FREE';
            }
            
            // Update total
            const total = subtotal + shippingCost;
            totalElement.textContent = `R ${total.toFixed(2)}`;
        });
    });
    
    // Handle form submission
    placeOrderBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!shippingForm.checkValidity()) {
            shippingForm.reportValidity();
            return;
        }
        
        // Get current total amount
        const total = parseFloat(totalElement.textContent.replace('R ', ''));
        const subtotal = parseFloat(subtotalElement.textContent.replace('R ', ''));
        const shippingCost = parseFloat(shippingCostElement.textContent.replace('R ', '')) || 0;
        
        // Get cart items
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Create order object
        const order = {
            date: new Date(),
            items: cartItems,
            subtotal: subtotal,
            shippingCost: shippingCost,
            total: total,
            shipping: {
                fullName: document.getElementById('full-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                postalCode: document.getElementById('postal-code').value,
                country: document.getElementById('country').value
            },
            shippingMethod: document.querySelector('input[name="shipping"]:checked').value,
            paymentMethod: document.querySelector('.payment-option.active').dataset.method
        };
        
        // Generate order ID
        const orderId = 'NYX-' + Date.now();
        
        // Save order details to localStorage
        localStorage.setItem('lastOrder', JSON.stringify(order));
        localStorage.setItem('orderId', orderId);
        
        // Also save to sessionStorage as backup
        sessionStorage.setItem('tempOrder', JSON.stringify(order));
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Disable button to prevent duplicate submissions
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Redirect to confirmation page
        setTimeout(() => {
            window.location.href = 'confirmation.html';
        }, 1000);
    });
}