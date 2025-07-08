// main.js - Unified Shopping Cart System
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// Initialize Application
function initApp() {
    // Load products based on current page
    if (document.getElementById('all-products')) {
        // Products page
        loadAllProducts();
    } else if (document.querySelector('.mens-collection')) {
        // Men's collection page
        loadMensProducts();
    } else if (document.querySelector('.womens-collection')) {
        // Women's collection page
        loadWomensProducts();
    }
    
    // Update cart count
    updateCartCount();
    
    // Initialize cart event listeners
    initCart();
}

// Product data for all collections
const allProducts = {
    men: [
        {
            id: 1,
            title: "Classic Cotton T-Shirt",
            price: 89.99,
            image: "t-shirt.jpg",
            category: "men",
            link: "menCollections.html"
        },
        {
            id: 2,
            title: "Slim Fit Jeans",
            price: 159.99,
            image: "jans.webp",
            category: "men",
            link: "menCollections.html"
        },
        {
            id: 3,
            title: "Formal Dress Shirt",
            price: 349.99,
            image: "sho.jpeg",
            category: "men",
            link: "menCollections.html"
        },
        {
            id: 4,
            title: "Denim Jacket",
            price: 579.99,
            image: "jac.webp",
            category: "men",
            link: "menCollections.html"
        },
        {
            id: 5,
            title: "Men's Sneakers",
            price: 1579.99,
            image: "Sneakers.webp",
            category: "men",
            link: "menCollections.html"
        }
    ],
    women: [
        {
            id: 6,
            title: "Basic Cotton T-Shirt",
            price: 99.99,
            image: "t-shirt.webp",
            category: "women",
            link: "womensCollections.html"
        },
        {
            id: 7,
            title: "Skinny Fit Jeans",
            price: 179.99,
            image: "Womans Jeans.webp",
            category: "women",
            link: "womensCollections.html"
        },
        {
            id: 8,
            title: "Summer Floral Dress",
            price: 399.99,
            image: "floral dress.webp",
            category: "women",
            link: "womensCollections.html"
        },
        {
            id: 9,
            title: "Cropped Denim Jacket",
            price: 599.99,
            image: "womes jacket.webp",
            category: "women",
            link: "womensCollections.html"
        },
        {
            id: 10,
            title: "Casual Sneakers",
            price: 1299.99,
            image: "womans shoes.jpeg",
            category: "women",
            link: "womensCollections.html"
        }
    ],
    kids: [
        // Add kids products if needed
    ]
};

// Load all products (for products.html)
function loadAllProducts() {
    // Combine all products
    const combinedProducts = [...allProducts.men, ...allProducts.women, ...allProducts.kids];
    renderProducts(combinedProducts);
    initSortingFiltering();
}

// Load men's products (for menCollections.html)
function loadMensProducts() {
    renderProducts(allProducts.men);
}

// Load women's products (for womensCollections.html)
function loadWomensProducts() {
    renderProducts(allProducts.women);
}

// Initialize Sorting and Filtering (for products.html)
function initSortingFiltering() {
    const sortSelect = document.getElementById('sort-by');
    const filterSelect = document.getElementById('filter-category');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', handleFilterChange);
    }
}

// Handle Sort Change
function handleSortChange() {
    const sortValue = this.value;
    let sortedProducts = [...allProducts.men, ...allProducts.women, ...allProducts.kids];
    
    switch(sortValue) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name-desc':
            sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
    
    // Apply category filter if active
    const filterSelect = document.getElementById('filter-category');
    if (filterSelect && filterSelect.value !== 'all') {
        sortedProducts = sortedProducts.filter(p => p.category === filterSelect.value);
    }
    
    renderProducts(sortedProducts);
}

// Handle Filter Change
function handleFilterChange() {
    const filterValue = this.value;
    let filteredProducts = [...allProducts.men, ...allProducts.women, ...allProducts.kids];
    
    if (filterValue !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === filterValue);
    }
    
    // Apply current sort if active
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect && sortSelect.value !== 'default') {
        handleSortChange.call(sortSelect);
        return;
    }
    
    renderProducts(filteredProducts);
}

// Render Products
function renderProducts(productsToRender) {
    let container;
    
    if (document.getElementById('all-products')) {
        container = document.getElementById('all-products');
    } else if (document.querySelector('.collection-grid')) {
        container = document.querySelector('.collection-grid');
    } else {
        return;
    }
    
    container.innerHTML = '';
    
    productsToRender.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// Create Product Card (works for all pages)
function createProductCard(product) {
    const card = document.createElement('div');
    
    // Determine which page we're on to set appropriate classes
    if (document.getElementById('all-products')) {
        // Products page
        card.className = 'product-card';
        card.dataset.category = product.category;
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-info">
                <h3 class="product-title"><a href="${product.link}">${product.title}</a></h3>
                <span class="product-price">R ${product.price.toFixed(2)}</span>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
    } else {
        // Collection page (men's or women's)
        card.className = 'collection-item';
        card.innerHTML = `
            <div class="collection-image">
                <img src="${product.image}" alt="${product.title}">
                <div class="collection-overlay">
                    <a href="${product.image}" class="btn btn-view">Quick View</a>
                </div>
            </div>
            <div class="collection-info">
                <h3>${product.title}</h3>
                <span class="price">R ${product.price.toFixed(2)}</span>
                <button class="btn btn-cart add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
    }
    
    return card;
}

// Initialize Cart Functionality
function initCart() {
    // Add event listeners to all add-to-cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart') || 
            e.target.closest('.add-to-cart')) {
            const button = e.target.classList.contains('add-to-cart') ? 
                          e.target : e.target.closest('.add-to-cart');
            const productId = parseInt(button.getAttribute('data-id'));
            addToCart(productId);
        }
    });
}

// Add to Cart Function
function addToCart(productId) {
    // Find product in any collection
    let product;
    for (const category in allProducts) {
        product = allProducts[category].find(p => p.id === productId);
        if (product) break;
    }
    
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1,
            category: product.category
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification(`${product.title} added to cart!`);
}

// Update Cart Count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update all cart count elements
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = totalItems;
    });
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Get Product by ID (used by cart.js)
function getProductById(id) {
    for (const category in allProducts) {
        const product = allProducts[category].find(p => p.id === id);
        if (product) return product;
    }
    return null;
}