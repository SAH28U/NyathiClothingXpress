// cart.js - Professional Cart Implementation
document.addEventListener('DOMContentLoaded', function() {
    initCartPage();

    // Checkout button functionality
    const checkoutBtn = document.getElementById('checkout-btn');
    // Ensure you have a data-checkout-text attribute on your button in HTML
    // e.g., <button id="checkout-btn" data-checkout-text="Secure Checkout">Secure Checkout</button>
    const originalCheckoutText = checkoutBtn ? checkoutBtn.dataset.checkoutText : 'Secure Checkout'; 

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default link behavior
            
            // Check if cart is empty before proceeding
            const cart = getCart();
            if (cart.length === 0) {
                showToast('Your cart is empty. Please add items to proceed.', 'warning');
                return;
            }

            // Disable the button and add processing class
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('processing');
            checkoutBtn.innerHTML = '<span class="spinner"></span> Processing...';

            // Simulate a delay for processing (e.g., API call, validation)
            setTimeout(() => {
                // Once processing is done, redirect to checkout.html
                window.location.href = 'checkout.html';
            }, 2000); // 2 seconds delay
        });
    }
});

// Initialize cart page
function initCartPage() {
    displayCartItems();
    updateCartCount();
    setupEventListeners();
    loadRecentlyViewed();
}

// Enhanced Cart Display
function displayCartItems() {
    const cart = getCart();
    const cartContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        showEmptyCart();
        updateCartTotals(0);
        return;
    }

    cartContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const itemElement = createCartItemElement(item, index);
        cartContainer.appendChild(itemElement);
        animateElement(itemElement, 'fadeIn', 100 * index);
    });
    
    updateCartTotals(calculateCartTotal(cart));
    document.getElementById('item-count').textContent = getTotalItemCount(cart);
}

function showEmptyCart() {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <i class="fas fa-shopping-bag"></i>
            </div>
            <h2>Your bag is empty</h2>
            <p>Looks like you haven't added anything to your bag yet</p>
            <a href="products.html" class="btn-primary">
                <i class="fas fa-tshirt"></i> Browse Collections
            </a>
        </div>
    `;
}

function createCartItemElement(item, index) {
    const element = document.createElement('div');
    element.className = 'cart-item';
    element.dataset.id = item.id;
    element.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <button class="item-wishlist" data-id="${item.id}" aria-label="Add to wishlist">
                <i class="${isInWishlist(item.id) ? 'fas' : 'far'} fa-heart"></i>
            </button>
        </div>
        <div class="cart-item-details">
            <div class="item-header">
                <h4 class="item-title">${item.title}</h4>
                <span class="item-price">R ${item.price.toFixed(2)}</span>
            </div>
            <div class="item-options">
                <div class="option-size">
                    <label>Size:</label>
                    <select class="size-select" data-id="${item.id}">
                        <option ${item.size === 'S' ? 'selected' : ''}>S</option>
                        <option ${item.size === 'M' ? 'selected' : ''}>M</option>
                        <option ${item.size === 'L' ? 'selected' : ''}>L</option>
                        <option ${item.size === 'XL' ? 'selected' : ''}>XL</option>
                    </select>
                </div>
                <div class="option-color">
                    <label>Color:</label>
                    <div class="color-options">
                        <div class="color-option ${item.color === 'black' ? 'active' : ''}" 
                             style="background-color: #000" data-color="black" aria-label="Black"></div>
                        <div class="color-option ${item.color === 'blue' ? 'active' : ''}" 
                             style="background-color: #1D3557" data-color="blue" aria-label="Blue"></div>
                        <div class="color-option ${item.color === 'red' ? 'active' : ''}" 
                             style="background-color: #E63946" data-color="red" aria-label="Red"></div>
                    </div>
                </div>
            </div>
            <div class="item-footer">
                <div class="quantity-control">
                    <button class="quantity-btn minus" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
                <button class="btn-remove" data-id="${item.id}">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
    return element;
}

// Event Listeners
function setupEventListeners() {
    // Quantity adjustments
    document.addEventListener('click', function(e) {
        if (e.target.closest('.quantity-btn')) {
            const btn = e.target.closest('.quantity-btn');
            const productId = parseInt(btn.dataset.id);
            const isPlus = btn.classList.contains('plus');
            adjustCartQuantity(productId, isPlus ? 1 : -1);
        }
        
        if (e.target.closest('.btn-remove')) {
            const productId = parseInt(e.target.closest('.btn-remove').dataset.id);
            removeFromCart(productId);
        }
        
        if (e.target.closest('.item-wishlist')) {
            const productId = parseInt(e.target.closest('.item-wishlist').dataset.id);
            toggleWishlist(productId);
        }
    });
    
    // Size selection
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('size-select')) {
            const productId = parseInt(e.target.dataset.id);
            updateCartItemSize(productId, e.target.value);
        }
    });
    
    // Color selection
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('color-option')) {
            const colorOption = e.target;
            const productId = parseInt(colorOption.closest('.cart-item').dataset.id);
            const color = colorOption.dataset.color;
            
            // Update active state
            colorOption.parentElement.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('active');
            });
            colorOption.classList.add('active');
            
            updateCartItemColor(productId, color);
        }
    });
    
    // Discount code
    document.getElementById('apply-discount').addEventListener('click', applyDiscount);
    document.getElementById('discount-code').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') applyDiscount();
    });
    
}

// Cart Operations
function adjustCartQuantity(productId, change) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        const newQuantity = cart[itemIndex].quantity + change;
        
        if (newQuantity <= 0) {
            // Show removal animation
            const itemElement = document.querySelector(`.cart-item[data-id="${productId}"]`);
            if (itemElement) {
                animateElement(itemElement, 'fadeOut', 0, () => {
                    removeFromCart(productId);
                });
                return;
            }
        }
        
        // Limit maximum quantity
        if (newQuantity > 10) {
            showToast('Maximum quantity is 10 per item', 'warning');
            return;
        }
        
        cart[itemIndex].quantity = newQuantity;
        saveCart(cart);
        updateCartCount();
        updateCartTotals(calculateCartTotal(cart));
        showToast(`Quantity updated to ${newQuantity}`);
    }
}

function updateCartItemSize(productId, size) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].size = size;
        saveCart(cart);
        showToast('Size updated');
    }
}

function updateCartItemColor(productId, color) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].color = color;
        saveCart(cart);
        showToast('Color updated');
    }
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCount();
    displayCartItems();
    showToast('Item removed from cart');
}

// Discount and Checkout
function applyDiscount() {
    const code = document.getElementById('discount-code').value.trim();
    // Assuming you have a div/row for discount application in your HTML with this ID
    const discountRow = document.getElementById('discount-applied'); 
    
    if (!code) {
        showToast('Please enter a promo code', 'warning');
        return;
    }
    
    // Clear any existing discount
    if (discountRow) {
        discountRow.style.display = 'none';
    }
    
    // In a real app, you would validate with server
    if (code.toUpperCase() === 'NYATHI10') {
        const cart = getCart();
        const subtotal = calculateCartTotal(cart);
        const discount = subtotal * 0.1; // 10% discount
        const discountedTotal = subtotal - discount;
        
        // Show discount in UI
        if (discountRow) {
            discountRow.style.display = 'flex';
            document.getElementById('discount-amount').textContent = `-R ${discount.toFixed(2)}`;
        }
        
        updateCartTotals(discountedTotal);
        showToast('Discount applied! 10% off your order', 'success');
    } else {
        // Revert to original total if invalid code
        updateCartTotals(calculateCartTotal(getCart()));
        showToast('Invalid promo code', 'error');
    }
}

// Helper Functions
function calculateCartTotal(cart) {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getTotalItemCount(cart) {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartTotals(total) {
    document.getElementById('subtotal').textContent = `R ${total.toFixed(2)}`;
    document.getElementById('total').textContent = `R ${total.toFixed(2)}`;
}

function animateElement(element, animation, delay = 0, callback = null) {
    setTimeout(() => {
        if (element) { 
            element.style.animation = `${animation} 0.3s ease forwards`;
            if (callback) {
                element.addEventListener('animationend', callback, { once: true });
            }
        }
    }, delay);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('cart-toast');
    const toastMsg = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon i');
    
    if (!toast || !toastMsg || !toastIcon) {
        console.error("Toast elements not found.");
        return;
    }

    // Set icon based on type
    switch(type) {
        case 'success':
            toastIcon.className = 'fas fa-check-circle';
            break;
        case 'error':
            toastIcon.className = 'fas fa-times-circle';
            break;
        case 'warning':
            toastIcon.className = 'fas fa-exclamation-circle';
            break;
        default:
            toastIcon.className = ''; // No icon for unknown types
    }
    
    toastMsg.textContent = message;
    toast.className = `toast-notification show ${type}`;
    
    // Auto-hide after 3 seconds
    const hideTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
    
    // Close button
    const closeButton = toast.querySelector('.toast-close');
    if (closeButton) {
        closeButton.onclick = () => {
            clearTimeout(hideTimeout);
            toast.classList.remove('show');
        };
    }
}

// Wishlist Functions (would need separate wishlist implementation)
function isInWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    return wishlist.includes(productId);
}

function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const index = wishlist.indexOf(productId);
    
    if (index === -1) {
        wishlist.push(productId);
        showToast('Added to wishlist');
    } else {
        wishlist.splice(index, 1);
        showToast('Removed from wishlist');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistIcons();
}

function updateWishlistIcons() {
    document.querySelectorAll('.item-wishlist i').forEach(icon => {
        const productId = parseInt(icon.closest('.item-wishlist').dataset.id);
        icon.className = isInWishlist(productId) ? 'fas fa-heart' : 'far fa-heart';
    });
}

// Recently Viewed
function loadRecentlyViewed() {
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    const container = document.getElementById('recently-viewed');
    
    // Only show recently viewed section if there are items
    const recentlyViewedSection = document.getElementById('recently-viewed-section');
    if (recentlyViewed.length === 0 && recentlyViewedSection) {
        recentlyViewedSection.style.display = 'none';
        return;
    } else if (recentlyViewedSection) {
        recentlyViewedSection.style.display = 'block'; // Ensure it's visible if items exist
    }
    
    if (container) {
        container.innerHTML = '';
        
        // Display up to 4 recently viewed items
        recentlyViewed.slice(0, 4).forEach(productId => {
            const product = getProductById(productId); // This needs to fetch actual product data
            if (product) {
                const item = document.createElement('div');
                item.className = 'product-card';
                item.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.title}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <span class="product-price">R ${product.price.toFixed(2)}</span>
                        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    </div>
                `;
                container.appendChild(item);
            }
        });
    }
}

// Shared Cart Functions (also used in main.js)
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = getTotalItemCount(cart);
    
    // Update all cart count elements
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = totalItems;
    });
    
    // Pulse animation when cart updates
    document.querySelectorAll('.cart-pulse').forEach(pulse => {
        if (totalItems > 0) {
            pulse.style.animation = 'pulse 0.5s ease';
            pulse.addEventListener('animationend', () => {
                pulse.style.animation = '';
            }, { once: true });
        } else {
            pulse.style.animation = ''; // Reset animation if cart is empty
        }
    });
}

// Product helper (would need actual product data)
function getProductById(id) {
    // This function needs to return a product object based on its ID.
    // For a real store, this would fetch from a database or a predefined product list.
    // Example placeholder:
    const allProducts = [
        { id: 101, title: 'Classic T-Shirt', image: 'https://via.placeholder.com/120', price: 150.00 },
        { id: 102, title: 'Denim Jeans', image: 'https://via.placeholder.com/120', price: 450.00 },
        { id: 103, title: 'Hoodie', image: 'https://via.placeholder.com/120', price: 300.00 },
        { id: 104, title: 'Sneakers', image: 'https://via.placeholder.com/120', price: 600.00 },
        // Add more products as needed
    ];
    return allProducts.find(p => p.id === id);
}