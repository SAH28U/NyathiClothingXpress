document.addEventListener('DOMContentLoaded', function() {
    // Show processing overlay immediately
    const processingOverlay = document.getElementById('processing-overlay');
    const progressBar = document.getElementById('progress-bar');
    
    // Simulate progress bar animation
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
        }
        progressBar.style.width = `${progress}%`;
    }, 200);

    // Simulate processing delay (3-5 seconds)
    const processingTime = 3000 + Math.random() * 2000;
    
    setTimeout(() => {
        // Hide processing overlay
        processingOverlay.style.opacity = '0';
        setTimeout(() => {
            processingOverlay.style.display = 'none';
            initConfirmationPage();
        }, 500);
    }, processingTime);
});

function initConfirmationPage() {
    // Check for order data
    const orderData = getOrderData();
    
    if (!orderData) {
        showErrorState();
        return;
    }

    renderConfirmation(orderData);
}

function getOrderData() {
    // Try localStorage first
    const lastOrderString = localStorage.getItem('lastOrder') || localStorage.getItem('order');
    const orderId = localStorage.getItem('orderId');
    
    // Try sessionStorage as fallback
    if (!lastOrderString) {
        const sessionOrder = sessionStorage.getItem('tempOrder');
        if (sessionOrder) {
            localStorage.setItem('lastOrder', sessionOrder);
            sessionStorage.removeItem('tempOrder');
            return JSON.parse(sessionOrder);
        }
    }
    
    // Try URL parameters as last resort
    const urlParams = new URLSearchParams(window.location.search);
    const urlOrder = urlParams.get('order');
    
    if (urlOrder) {
        try {
            const order = JSON.parse(decodeURIComponent(urlOrder));
            localStorage.setItem('lastOrder', JSON.stringify(order));
            return order;
        } catch (e) {
            console.error('Error parsing URL order:', e);
        }
    }

    if (lastOrderString) {
        const order = JSON.parse(lastOrderString);
        // Ensure order has ID
        if (!orderId) {
            localStorage.setItem('orderId', `NYX-${Date.now()}`);
        }
        return order;
    }
    
    return null;
}

function renderConfirmation(order) {
    const confirmationContent = document.getElementById('confirmation-content');
    const orderId = localStorage.getItem('orderId') || `NYX-${Date.now()}`;
    const trackingNumber = `TRK${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    
    // Normalize order data structure
    order.items = order.items || [];
    order.totals = order.totals || {
        subtotal: order.subtotal || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: order.shippingCost || 0,
        grandTotal: order.total || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    order.customer = order.customer || {
        fullName: order.shipping?.fullName || 'N/A',
        email: order.shipping?.email || 'N/A',
        phone: order.shipping?.phone || 'N/A',
        address: {
            street: order.shipping?.address || 'N/A',
            city: order.shipping?.city || 'N/A',
            postalCode: order.shipping?.postalCode || 'N/A',
            country: order.shipping?.country || 'N/A'
        }
    };
    
    order.paymentMethod = order.paymentMethod || 'unknown';

    let content = `
        <div class="confirmation-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <h1>Order Confirmed!</h1>
        <p class="confirmation-message">Thank you for your purchase. Your order #${orderId} has been received.</p>
        
        <div class="order-details">
            <div class="detail-row">
                <span>Order Number:</span>
                <strong>${orderId}</strong>
            </div>
            <div class="detail-row">
                <span>Date:</span>
                <strong>${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}</strong>
            </div>
            <div class="detail-row">
                <span>Total:</span>
                <strong>R ${order.totals.grandTotal.toFixed(2)}</strong>
            </div>
            <div class="detail-row">
                <span>Payment Method:</span>
                <strong>${formatPaymentMethod(order.paymentMethod)}</strong>
            </div>
            <div class="detail-row">
                <span>Tracking Number:</span>
                <strong>${trackingNumber}</strong>
            </div>
        </div>
        
        <div class="order-timeline">
            <h3 class="timeline-title"><i class="fas fa-history"></i> Order Status</h3>
            <div class="timeline-steps">
                ${renderTimelineSteps(order.paymentMethod)}
            </div>
        </div>
        
        <div class="order-summary">
            <h2><i class="fas fa-shopping-bag"></i> Order Summary</h2>
            <div class="order-items">
                ${renderOrderItems(order.items)}
            </div>
            ${renderOrderTotals(order.totals)}
        </div>
        
        ${renderShippingDetails(order.customer)}
        ${renderPaymentInstructions(order.paymentMethod, orderId, order.totals.grandTotal)}
        
        <div class="confirmation-actions">
            <a href="products.html" class="btn btn-continue">
                <i class="fas fa-tshirt"></i> Continue Shopping
            </a>
            <a href="Index.html" class="btn btn-home">
                <i class="fas fa-home"></i> Back to Home
            </a>
            <button class="btn btn-print" onclick="window.print()">
                <i class="fas fa-print"></i> Print Receipt
            </button>
        </div>
        
        <div class="confirmation-note">
            <p>You will receive an order confirmation email shortly. For any questions, contact our <a href="contact.html">customer service</a>.</p>
        </div>
    `;

    confirmationContent.innerHTML = content;
    animateOrderItems();
}

function formatPaymentMethod(method) {
    if (!method) return 'N/A';
    return method.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function renderTimelineSteps(paymentMethod) {
    const isCOD = paymentMethod === 'pay-on-delivery';
    return `
        <div class="timeline-step completed">
            <div class="step-icon"><i class="fas fa-check"></i></div>
            <div class="step-label">Order Placed</div>
        </div>
        <div class="timeline-step ${isCOD ? 'current' : 'completed'}">
            <div class="step-icon"><i class="fas fa-money-bill-wave"></i></div>
            <div class="step-label">Payment ${isCOD ? 'Pending' : 'Received'}</div>
        </div>
        <div class="timeline-step ${isCOD ? '' : 'current'}">
            <div class="step-icon"><i class="fas fa-box"></i></div>
            <div class="step-label">Processing</div>
        </div>
        <div class="timeline-step">
            <div class="step-icon"><i class="fas fa-truck"></i></div>
            <div class="step-label">Shipped</div>
        </div>
        <div class="timeline-step">
            <div class="step-icon"><i class="fas fa-home"></i></div>
            <div class="step-label">Delivered</div>
        </div>
    `;
}

function renderOrderItems(items) {
    if (!items || items.length === 0) {
        return '<p class="empty-cart-message">No items found for this order.</p>';
    }
    
    return items.map(item => `
        <div class="order-item">
            <div class="order-item-image">
                <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}">
            </div>
            <div class="order-item-details">
                <h4 class="order-item-title">${item.name}</h4>
                <p class="order-item-quantity">Qty: ${item.quantity || 1} | Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'}</p>
                <span class="order-item-price">R ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

function renderOrderTotals(totals) {
    return `
        <div class="order-totals">
            <div class="total-row">
                <span>Subtotal</span>
                <span>R ${(totals.subtotal || 0).toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>Shipping</span>
                <span style="color: ${totals.shipping === 0 ? 'var(--success-color)' : 'inherit'}">
                    ${totals.shipping === 0 ? 'FREE' : `R ${(totals.shipping || 0).toFixed(2)}`}
                </span>
            </div>
            ${totals.discount && totals.discount > 0 ? `
                <div class="total-row">
                    <span>Discount</span>
                    <span style="color: var(--success-color)">-R ${totals.discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="total-row grand-total">
                <span>Total</span>
                <span>R ${(totals.grandTotal || 0).toFixed(2)}</span>
            </div>
        </div>
    `;
}

function renderShippingDetails(customer) {
    return `
        <div class="shipping-details">
            <h2><i class="fas fa-truck"></i> Shipping Details</h2>
            <div class="shipping-address">
                <p><strong>${customer.fullName || 'N/A'}</strong></p>
                ${customer.address ? `
                    <p>${customer.address.street || 'N/A'}</p>
                    <p>${customer.address.city || 'N/A'}, ${customer.address.postalCode || 'N/A'}</p>
                    <p>${customer.address.country || 'N/A'}</p>
                ` : '<p>No address provided</p>'}
                <p>Phone: ${customer.phone || 'N/A'}</p>
                <p>Email: ${customer.email || 'N/A'}</p>
            </div>
        </div>
    `;
}

function renderPaymentInstructions(method, orderId, amount) {
    if (method === 'eft') {
        return `
            <div class="payment-instructions">
                <h3><i class="fas fa-info-circle"></i> Payment Instructions</h3>
                <p>Please make your bank transfer to:</p>
                <ul>
                    <li><strong>Bank:</strong> FNB</li>
                    <li><strong>Account:</strong> NYATHI X CLOTHING</li>
                    <li><strong>Account #:</strong> 628${Math.floor(100000 + Math.random() * 900000)}</li>
                    <li><strong>Branch Code:</strong> 250655</li>
                    <li><strong>Reference:</strong> NYX-${orderId}</li>
                </ul>
                <p>Amount: R ${amount.toFixed(2)}</p>
            </div>
        `;
    } else if (method === 'pay-on-delivery') {
        return `
            <div class="payment-instructions">
                <h3><i class="fas fa-info-circle"></i> Payment Instructions</h3>
                <p>Please have R ${amount.toFixed(2)} ready when your order arrives.</p>
            </div>
        `;
    }
    return '';
}

function animateOrderItems() {
    const items = document.querySelectorAll('.order-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `all 0.3s ease ${index * 0.1}s`;
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100);
    });
}

function showErrorState() {
    const confirmationContent = document.getElementById('confirmation-content');
    confirmationContent.innerHTML = `
        <div class="error-state">
            <div class="error-icon">
                <i class="fas fa-shopping-bag"></i>
                <i class="fas fa-question"></i>
            </div>
            <h2>Order Status Unknown</h2>
            <p>We can't locate your order details, but don't worry!</p>
            <div class="solution-options">
                <div class="option">
                    <i class="fas fa-envelope"></i>
                    <p>Check your email for confirmation</p>
                </div>
                <div class="option">
                    <i class="fas fa-history"></i>
                    <p>Wait 5 minutes and refresh</p>
                </div>
                <div class="option">
                    <i class="fas fa-headset"></i>
                    <p><a href="contact.html">Contact support</a></p>
                </div>
            </div>
            <div class="confirmation-actions">
                <a href="Index.html" class="btn btn-home">
                    <i class="fas fa-home"></i> Back to Home
                </a>
                <a href="products.html" class="btn btn-continue">
                    <i class="fas fa-tshirt"></i> Continue Shopping
                </a>
            </div>
        </div>
    `;
}