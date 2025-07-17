// Global Variables
let allProducts = [];
let filteredProducts = [];
let currentTheme = localStorage.getItem("theme") || "light";
let currentPage = 1;
let productsPerPage = 12; // Desktop: 12 products, Mobile: 6 products

// Google Apps Script Configuration
const GOOGLE_APPS_SCRIPT_CONFIG = {
    // Replace with your deployed Google Apps Script Web App URL
    webAppUrl:
        "https://script.google.com/macros/s/AKfycbwllOKjlvNDGyHPIHiY68bMnClcuddwAwHmWPd5GB-FsTqkYWoG7DektCn4mqWAAX7Jiw/exec",
    // Fallback to direct API if needed
    fallbackToApi: false,
};

// Initialize Application
document.addEventListener("DOMContentLoaded", function () {
    initializeApp();
});

function initializeApp() {
    // Initialize theme
    applyTheme(currentTheme);

    // Initialize AOS animations
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
    });

    // Set up event listeners
    setupEventListeners();

    // Load products from Google Sheets
    loadProductsFromGoogleSheets();

    // Initialize navbar scroll effect
    initializeNavbarScroll();
}

function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }

    // Search functionality with debouncing
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        const debouncedSearch = debounce(handleSearch, 300);
        searchInput.addEventListener("input", debouncedSearch);
        
        // Also add event listener for Enter key
        searchInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
            }
        });
        
        // Add click/focus event to scroll to products section
        searchInput.addEventListener("click", function() {
            const productsSection = document.getElementById('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        searchInput.addEventListener("focus", function() {
            const productsSection = document.getElementById('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Filter functionality
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");
    
    if (categoryFilter) {
        categoryFilter.addEventListener("change", handleFilter);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener("change", handleSort);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
}

function toggleTheme() {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    applyTheme(currentTheme);
    localStorage.setItem("theme", currentTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const themeIcon = document.querySelector("#themeToggle i");
    if (theme === "dark") {
        themeIcon.className = "fas fa-sun";
    } else {
        themeIcon.className = "fas fa-moon";
    }
}

function initializeNavbarScroll() {
    window.addEventListener("scroll", function () {
        const navbar = document.getElementById("mainNav");
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

// Google Apps Script Integration
async function loadProductsFromGoogleSheets() {
    try {
        showLoadingIndicator();

        // Try Google Apps Script first
        if (
            GOOGLE_APPS_SCRIPT_CONFIG.webAppUrl !== "YOUR_APPS_SCRIPT_URL_HERE"
        ) {
            await loadProductsFromAppsScript();
            return;
        }

        // Fallback to direct API if configured
        const apiKey = getGoogleSheetsApiKey();
        if (apiKey && apiKey !== "GOOGLE_API_KEY_PLACEHOLDER") {
            await loadProductsFromDirectAPI();
            return;
        }

        // If no configuration, load fallback products
        console.log(
            "No Google Apps Script URL configured, loading fallback products",
        );
        loadFallbackProducts();
    } catch (error) {
        console.error("Error loading products:", error);
        handleLoadingError(error.message);
    }
}

async function loadProductsFromAppsScript() {
    try {
        const response = await fetch(
            `${GOOGLE_APPS_SCRIPT_CONFIG.webAppUrl}?action=getProducts`,
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.error || "Failed to load products from Apps Script",
            );
        }

        allProducts = data.data || [];
        filteredProducts = [...allProducts];

        displayProducts();
        displayTopSellingProducts();
        hideLoadingIndicator();
    } catch (error) {
        console.error("Error loading products from Apps Script:", error);
        // Fallback to demo products
        loadFallbackProducts();
    }
}

async function loadProductsFromDirectAPI() {
    try {
        const apiKey = getGoogleSheetsApiKey();

        if (!apiKey) {
            throw new Error("Google Sheets API key not configured");
        }

        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/1_5WnD9v2xIFA8qhDzDmYzOJhunp3fSwgUCMALoB-bLM/values/Sheet1!A:F?key=${apiKey}`,
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.values || data.values.length === 0) {
            throw new Error("No data found in spreadsheet");
        }

        // Parse products data (skip header row)
        const rows = data.values.slice(1);

        allProducts = rows
            .filter((row) => row[0] && row[0].trim() !== "") // Filter out empty rows
            .map((row) => ({
                id: generateProductId(),
                name: row[0] || "Unknown Product",
                imageUrl: row[1] || getDefaultProductImage(),
                description: row[2] || "No description available",
                price: parseFloat(row[3]) || 0,
                topSelling: (row[4] || "").toLowerCase() === "true",
                category: row[5] || "general",
            }));

        filteredProducts = [...allProducts];

        displayProducts();
        displayTopSellingProducts();
        populateCategoryFilter();
        hideLoadingIndicator();
    } catch (error) {
        console.error("Error loading products from direct API:", error);
        loadFallbackProducts();
    }
}

function getGoogleSheetsApiKey() {
    // Since browsers can't access environment variables directly,
    // we'll need to get the API key from the server
    // For now, we'll use a placeholder that will be replaced
    return window.GOOGLE_API_KEY || GOOGLE_SHEETS_CONFIG.apiKey;
}

function generateProductId() {
    return "prod_" + Math.random().toString(36).substr(2, 9);
}

function getDefaultProductImage() {
    // Return one of the provided stock photos as fallback
    const defaultImages = [
        "https://pixabay.com/get/gb06f00ec003ba149708110e22aa67a1eacd685b936724a1674be47538c424f894d5cb935b5ccd0a11724a6f2c7f9aac3c73eac15f3b2f5cc14dbd8ec3f4daf0b_1280.jpg",
        "https://pixabay.com/get/g9039dcf4d79cbe84ad451871270cdbc4ae5b83d8cbccab348925c0ef6ec3ab18b004793d13572dfdffbc086037523217005a861d43998f901af162bf02651c20_1280.jpg",
        "https://pixabay.com/get/gd05ffe5eae3077236d8b37410a80c7638473b48d1ecb8f5851a028fa1790d02818c888458136d65a59a5c7dcc39167df30ef2f890affffe7bc482a6931cdf2d2_1280.jpg",
    ];
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}

function showLoadingIndicator() {
    document.getElementById("loadingIndicator").style.display = "block";
    document.getElementById("errorMessage").classList.add("d-none");
    document.getElementById("noProductsMessage").classList.add("d-none");
}

function hideLoadingIndicator() {
    document.getElementById("loadingIndicator").style.display = "none";
}

function handleLoadingError(errorMessage) {
    hideLoadingIndicator();
    document.getElementById("errorMessage").classList.remove("d-none");

    // Log error for debugging
    console.error("Product loading error:", errorMessage);

    // Show fallback products if available
    if (allProducts.length === 0) {
        loadFallbackProducts();
    }
}

function loadFallbackProducts() {
    // Load demo products with stock images when API fails
    allProducts = [
        {
            id: "fallback_1",
            name: "Premium Smartphone",
            imageUrl:
                "https://pixabay.com/get/gb06f00ec003ba149708110e22aa67a1eacd685b936724a1674be47538c424f894d5cb935b5ccd0a11724a6f2c7f9aac3c73eac15f3b2f5cc14dbd8ec3f4daf0b_1280.jpg",
            description: "Latest flagship smartphone with advanced features",
            price: 999.99,
            topSelling: true,
            category: "smartphones",
        },
        {
            id: "fallback_2",
            name: "Gaming Laptop",
            imageUrl:
                "https://pixabay.com/get/g9039dcf4d79cbe84ad451871270cdbc4ae5b83d8cbccab348925c0ef6ec3ab18b004793d13572dfdffbc086037523217005a861d43998f901af162bf02651c20_1280.jpg",
            description: "High-performance gaming laptop for professionals",
            price: 1299.99,
            topSelling: false,
            category: "laptops",
        },
        {
            id: "fallback_3",
            name: "Wireless Earbuds",
            imageUrl:
                "https://pixabay.com/get/gd05ffe5eae3077236d8b37410a80c7638473b48d1ecb8f5851a028fa1790d02818c888458136d65a59a5c7dcc39167df30ef2f890affffe7bc482a6931cdf2d2_1280.jpg",
            description: "Premium wireless earbuds with noise cancellation",
            price: 199.99,
            topSelling: true,
            category: "audio",
        },
    ];

    filteredProducts = [...allProducts];
    displayProducts();
    displayTopSellingProducts();
    populateCategoryFilter();
}

function displayProducts() {
    const productsGrid = document.getElementById("productsGrid");
    const noProductsMessage = document.getElementById("noProductsMessage");

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = "";
        noProductsMessage.classList.remove("d-none");
        updatePaginationControls();
        return;
    }

    noProductsMessage.classList.add("d-none");

    // Adjust products per page for mobile
    const isMobile = window.innerWidth <= 768;
    productsPerPage = isMobile ? 6 : 12;

    // Calculate pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    productsGrid.innerHTML = currentProducts
        .map(
            (product) => `
        <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up">
            <div class="product-card" data-product-id="${product.id}" onclick="showProductDetail('${product.id}')">
                <div class="product-image">
                    <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='${getDefaultProductImage()}'">
                    ${product.topSelling ? '<div class="product-badge">Top Selling</div>' : ""}
                </div>
                <div class="product-body">
                    <h5 class="product-title">${product.name}</h5>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-actions">
                        <button class="btn-buy" onclick="event.stopPropagation(); handlePurchase('${product.id}')">
                            <i class="fab fa-whatsapp"></i> Buy Now
                        </button>
                        <button class="btn-wishlist" onclick="event.stopPropagation(); toggleWishlist('${product.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
        )
        .join("");

    // Update pagination controls
    updatePaginationControls();

    // Track product views
    trackProductViews();
}

function displayTopSellingProducts() {
    const topSellingContainer = document.getElementById("topSellingProducts");
    const topSellingProducts = allProducts
        .filter((product) => product.topSelling)
        .slice(0, 6);

    topSellingContainer.innerHTML = topSellingProducts
        .map(
            (product) => `
        <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up">
            <div class="product-card" data-product-id="${product.id}" onclick="showProductDetail('${product.id}')">
                <div class="product-image">
                    <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='${getDefaultProductImage()}'">
                    <div class="product-badge">Top Selling</div>
                </div>
                <div class="product-body">
                    <h5 class="product-title">${product.name}</h5>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-actions">
                        <button class="btn-buy" onclick="event.stopPropagation(); handlePurchase('${product.id}')">
                            <i class="fab fa-whatsapp"></i> Buy Now
                        </button>
                        <button class="btn-wishlist" onclick="event.stopPropagation(); toggleWishlist('${product.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
        )
        .join("");
}

function updatePaginationControls() {
    const paginationContainer = document.getElementById("paginationContainer");
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = "";
        return;
    }

    let paginationHTML = `
        <nav aria-label="Product pagination">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${currentPage - 1})" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
    `;

    // Show first page, current page range, and last page
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)">1</a></li>`;
        if (startPage > 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a></li>`;
    }

    paginationHTML += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${currentPage + 1})" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayProducts();
    
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(allProducts.map(product => product.category))];
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    // Add categories from actual product data
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
}

function trackProductViews() {
    const viewedProducts = JSON.parse(
        localStorage.getItem("viewedProducts") || "[]",
    );

    document.querySelectorAll(".product-card").forEach((card) => {
        const productId = card.dataset.productId;

        // Add intersection observer to track when product comes into view
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (
                        entry.isIntersecting &&
                        !viewedProducts.includes(productId)
                    ) {
                        viewedProducts.push(productId);
                        localStorage.setItem(
                            "viewedProducts",
                            JSON.stringify(viewedProducts),
                        );
                    }
                });
            },
            { threshold: 0.5 },
        );

        observer.observe(card);
    });
}

function handleSearch() {
    const searchTerm = document
        .getElementById("searchInput")
        .value.toLowerCase();

    filteredProducts = allProducts.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm),
    );

    currentPage = 1; // Reset to first page when searching
    displayProducts();
}

function handleFilter() {
    const categoryFilter = document.getElementById("categoryFilter").value;
    const searchTerm = document
        .getElementById("searchInput")
        .value.toLowerCase();

    filteredProducts = allProducts.filter((product) => {
        const matchesCategory =
            !categoryFilter || product.category.toLowerCase() === categoryFilter.toLowerCase();
        const matchesSearch =
            !searchTerm ||
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    currentPage = 1; // Reset to first page when filtering
    displayProducts();
}

function handleSort() {
    const sortOption = document.getElementById("sortFilter").value;

    switch (sortOption) {
        case "price-low":
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case "price-high":
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case "name":
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Reset to original order
            filteredProducts = [...allProducts];
            handleFilter(); // Reapply current filters
            return;
    }

    displayProducts();
}

function handlePurchase(productId) {
    const product = allProducts.find((p) => p.id === productId);

    if (!product) {
        console.error("Product not found:", productId);
        return;
    }

    // Show purchase modal
    const modal = new bootstrap.Modal(document.getElementById("purchaseModal"));
    document.getElementById("modalProductName").textContent = product.name;
    modal.show();

    // Prepare WhatsApp message
    const message = `Hi! I'm interested in ${product.name}. Is it still available?`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    // Open WhatsApp after a short delay
    setTimeout(() => {
        window.open(whatsappUrl, "_blank");
        modal.hide();
    }, 1500);

    // Track purchase attempt
    trackPurchaseAttempt(productId);
}

function trackPurchaseAttempt(productId) {
    const purchaseAttempts = JSON.parse(
        localStorage.getItem("purchaseAttempts") || "[]",
    );
    purchaseAttempts.push({
        productId: productId,
        timestamp: new Date().toISOString(),
    });
    localStorage.setItem("purchaseAttempts", JSON.stringify(purchaseAttempts));
}

function toggleWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const button = document.querySelector(
        `[data-product-id="${productId}"] .btn-wishlist`,
    );

    if (wishlist.includes(productId)) {
        // Remove from wishlist
        const index = wishlist.indexOf(productId);
        wishlist.splice(index, 1);
        button.innerHTML = '<i class="fas fa-heart"></i>';
        button.classList.remove("active");
    } else {
        // Add to wishlist
        wishlist.push(productId);
        button.innerHTML = '<i class="fas fa-heart"></i>';
        button.classList.add("active");
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    
    // Update wishlist counter and display
    updateWishlistCounter();
    displayWishlistItems();
}

// Show product detail modal
function showProductDetail(productId) {
    const product = allProducts.find((p) => p.id === productId);
    
    if (!product) {
        console.error("Product not found:", productId);
        return;
    }

    // Populate modal content
    document.getElementById('productDetailTitle').textContent = product.name;
    document.getElementById('productDetailImage').src = product.imageUrl;
    document.getElementById('productDetailImage').alt = product.name;
    document.getElementById('productDetailName').textContent = product.name;
    document.getElementById('productDetailDescription').textContent = product.description;
    document.getElementById('productDetailPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('productDetailCategory').textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    
    // Generate features based on product category
    const features = generateProductFeatures(product);
    const featuresList = document.getElementById('productDetailFeatures');
    featuresList.innerHTML = features.map(feature => `<li>${feature}</li>`).join('');
    
    // Set up buy button
    const buyBtn = document.getElementById('productDetailBuyBtn');
    buyBtn.onclick = () => handlePurchase(productId);
    
    // Set up wishlist button
    const wishlistBtn = document.getElementById('productDetailWishlistBtn');
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const isInWishlist = wishlist.includes(productId);
    
    wishlistBtn.innerHTML = isInWishlist ? 
        '<i class="fas fa-heart"></i> Remove from Wishlist' : 
        '<i class="fas fa-heart"></i> Add to Wishlist';
    wishlistBtn.onclick = () => toggleWishlist(productId);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
    modal.show();
}

// Generate product features based on category
function generateProductFeatures(product) {
    const baseFeatures = [
        "High-quality construction",
        "Manufacturer warranty included",
        "Fast delivery available",
        "Customer support included"
    ];
    
    const categoryFeatures = {
        smartphones: [
            "Latest mobile technology",
            "High-resolution camera",
            "Long battery life",
            "5G connectivity ready"
        ],
        laptops: [
            "High-performance processor",
            "Excellent display quality",
            "Portable design",
            "Multiple connectivity options"
        ],
        audio: [
            "Premium sound quality",
            "Noise cancellation",
            "Comfortable fit",
            "Wireless connectivity"
        ],
        gaming: [
            "High refresh rate",
            "Low input lag",
            "Ergonomic design",
            "RGB lighting"
        ],
        accessories: [
            "Universal compatibility",
            "Durable materials",
            "Easy installation",
            "Compact design"
        ]
    };
    
    const specificFeatures = categoryFeatures[product.category] || baseFeatures;
    return specificFeatures.slice(0, 4);
}

// Initialize wishlist states on page load
function initializeWishlistStates() {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

    wishlist.forEach((productId) => {
        const button = document.querySelector(
            `[data-product-id="${productId}"] .btn-wishlist`,
        );
        if (button) {
            button.classList.add("active");
        }
    });
    
    // Update wishlist counter
    updateWishlistCounter();
    displayWishlistItems();
}

// Update wishlist counter in navigation
function updateWishlistCounter() {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const counter = document.getElementById("wishlistCount");
    if (counter) {
        counter.textContent = wishlist.length;
        counter.style.display = wishlist.length > 0 ? "inline" : "none";
    }
}

// Display wishlist items
function displayWishlistItems() {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const wishlistGrid = document.getElementById("wishlistGrid");
    const emptyWishlist = document.getElementById("emptyWishlist");
    
    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = "";
        emptyWishlist.style.display = "block";
        return;
    }
    
    emptyWishlist.style.display = "none";
    
    const wishlistProducts = allProducts.filter(product => wishlist.includes(product.id));
    
    wishlistGrid.innerHTML = wishlistProducts
        .map(product => `
            <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up">
                <div class="product-card" data-product-id="${product.id}" onclick="showProductDetail('${product.id}')">
                    <div class="product-image">
                        <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='${getDefaultProductImage()}'">
                        ${product.topSelling ? '<div class="product-badge">Top Selling</div>' : ""}
                    </div>
                    <div class="product-body">
                        <h5 class="product-title">${product.name}</h5>
                        <p class="product-description">${product.description}</p>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-actions">
                            <button class="btn-buy" onclick="event.stopPropagation(); handlePurchase('${product.id}')">
                                <i class="fab fa-whatsapp"></i> Buy Now
                            </button>
                            <button class="btn-wishlist active" onclick="event.stopPropagation(); toggleWishlist('${product.id}')">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `)
        .join("");
}

// Error handling for images
function handleImageError(img) {
    img.src = getDefaultProductImage();
    img.onerror = null; // Prevent infinite loop
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounce function for search optimization

// Performance monitoring
function logPerformanceMetrics() {
    if (performance.getEntriesByType) {
        const navigationEntries = performance.getEntriesByType("navigation");
        if (navigationEntries.length > 0) {
            const entry = navigationEntries[0];
            console.log(
                "Page Load Time:",
                entry.loadEventEnd - entry.loadEventStart,
                "ms",
            );
            console.log(
                "DOM Content Loaded:",
                entry.domContentLoadedEventEnd -
                    entry.domContentLoadedEventStart,
                "ms",
            );
        }
    }
}

// Call performance logging after page load
window.addEventListener("load", logPerformanceMetrics);

// Service Worker registration for offline functionality (optional)
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        // Service worker implementation would go here
        console.log("Service Worker support detected");
    });
}

// Analytics tracking (placeholder for integration)
function trackEvent(eventName, eventData) {
    // This would integrate with your analytics service
    console.log("Event tracked:", eventName, eventData);
}

// Error boundary for JavaScript errors
window.addEventListener("error", function (event) {
    console.error("JavaScript error:", event.error);
    // You could send this to an error reporting service
});

// Unhandled promise rejection handler
window.addEventListener("unhandledrejection", function (event) {
    console.error("Unhandled promise rejection:", event.reason);
    // You could send this to an error reporting service
});
