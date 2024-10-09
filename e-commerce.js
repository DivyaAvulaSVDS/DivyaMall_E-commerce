// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const productsContainer = document.getElementById('products-container');
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeCartButton = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalPriceEl = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');
    const loading = document.getElementById('loading');
    const toastContainer = document.getElementById('toast-container');
    const contactForm = document.getElementById('contact-form');

    let cart = [];

    // Initialize Cart from localStorage
    if (localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
        updateCart();
    }

    // Fetch and Display Products (Only on Products Page)
    if (productsContainer) {
        fetchProducts();
    }

    // Event Listeners
    cartButton.addEventListener('click', () => {
        cartModal.style.display = 'block';
    });

    closeCartButton.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == cartModal) {
            cartModal.style.display = 'none';
        }
    });

    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        alert('Thank you for your purchase!');
        cart = [];
        updateCart();
        cartModal.style.display = 'none';
    });

    // Contact Form Submission (Only on Contact Page)
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = contactForm.name.value.trim();
            const email = contactForm.email.value.trim();
            const message = contactForm.message.value.trim();

            if (name === '' || email === '' || message === '') {
                showToast('Please fill in all fields.', 'error');
                return;
            }

            // Here, you would typically send the data to a server
            // For this example, we'll just show a success toast
            showToast('Your message has been sent!', 'success');
            contactForm.reset();
        });
    }

    // Function to Fetch Products from Platzi Fake Store API
    function fetchProducts() {
        fetch('https://fakestoreapi.com/products') // Replace with Platzi Fake Store API endpoint if different
            .then(response => response.json())
            .then(data => {
                loading.style.display = 'none';
                displayProducts(data);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                loading.textContent = 'Failed to load products.';
            });
    }

    // Function to Display Products
    function displayProducts(products) {
        productsContainer.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>${truncateText(product.description, 100)}</p>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button data-id="${product.id}">Add to Cart</button>
            `;

            productsContainer.appendChild(productCard);
        });

        // Add event listeners to "Add to Cart" buttons
        const addToCartButtons = document.querySelectorAll('.product-card button');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }

    // Function to Truncate Text
    function truncateText(text, maxLength) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    }

    // Function to Add Product to Cart
    function addToCart(event) {
        const productId = event.target.getAttribute('data-id');
        fetch(`https://fakestoreapi.com/products/${productId}`) // Replace with Platzi Fake Store API endpoint if different
            .then(response => response.json())
            .then(product => {
                const existingProduct = cart.find(item => item.id === product.id);
                if (existingProduct) {
                    existingProduct.quantity += 1;
                } else {
                    cart.push({
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        image: product.image,
                        quantity: 1
                    });
                }
                updateCart();
                showToast(`"${product.title}" has been added to your cart.`, 'success');
            })
            .catch(error => {
                console.error('Error adding to cart:', error);
                showToast('Failed to add item to cart.', 'error');
            });
    }

    // Function to Update Cart Display and Count
    function updateCart() {
        // Update cart count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart items in modal
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');

            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <button class="remove-item" data-id="${item.id}">&times;</button>
            `;

            cartItemsContainer.appendChild(cartItem);
        });

        // Update total price
        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        totalPriceEl.textContent = totalPrice.toFixed(2);

        // Add event listeners to remove buttons
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', removeFromCart);
        });

        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Function to Remove Item from Cart
    function removeFromCart(event) {
        const productId = parseInt(event.target.getAttribute('data-id'));
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    }

    // Function to Show Toast Notifications
    // Type can be 'success' or 'error' for different styles
    function showToast(message, type = 'success') {
        console.log('showToast called with message:', message, 'and type:', type); // Debugging line
        const toast = document.createElement('div');
        toast.classList.add('toast');

        if (type === 'error') {
            toast.style.backgroundColor = '#c0392b'; // Red for errors
        } else if (type === 'success') {
            toast.style.backgroundColor = '#27ae60'; // Green for success
        }

        toast.textContent = message;

        toastContainer.appendChild(toast);

        // Automatically remove the toast after the animation duration
        toast.addEventListener('animationend', () => {
            toastContainer.removeChild(toast);
        });
    }
});
