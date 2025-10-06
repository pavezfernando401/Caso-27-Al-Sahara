// ==================== B-04: CARRITO DE COMPRAS ====================

class CartManager {
    static addToCart(productId, quantity = 1) {
        const user = AuthManager.checkSession();
        if (!user) {
            alert('Debes iniciar sesión para agregar productos');
            window.location.href = '../b02-login/login.html';
            return;
        }

        if (user.role !== 'customer') {
            alert('Solo los clientes pueden agregar productos al carrito');
            return;
        }

        const products = StorageManager.getProducts();
        const product = products.find(p => p.id === productId);

        if (!product || !product.available) {
            alert('Producto no disponible');
            return;
        }

        const cart = StorageManager.getCart();
        const existingItem = cart.items.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        StorageManager.saveCart(cart);
        this.updateCartBadge();
        
        if (typeof showToast === 'function') {
            showToast('Producto agregado al carrito', 'success');
        } else {
            alert('Producto agregado al carrito');
        }
    }

    static removeFromCart(productId) {
        const cart = StorageManager.getCart();
        cart.items = cart.items.filter(item => item.productId !== productId);
        StorageManager.saveCart(cart);
        this.updateCartBadge();
    }

    static updateQuantity(productId, quantity) {
        const cart = StorageManager.getCart();
        const item = cart.items.find(item => item.productId === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                StorageManager.saveCart(cart);
            }
        }
        this.updateCartBadge();
    }

    static getCartTotal() {
        const cart = StorageManager.getCart();
        const products = StorageManager.getProducts();
        let subtotal = 0;

        cart.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                subtotal += product.price * item.quantity;
            }
        });

        const tax = Math.round(subtotal * 0.19);
        const total = subtotal + tax;

        return { subtotal, tax, total };
    }

    static getCartItems() {
        const cart = StorageManager.getCart();
        const products = StorageManager.getProducts();

        return cart.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                ...item,
                product: product
            };
        }).filter(item => item.product);
    }

    static updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (!badge) return;

        const cart = StorageManager.getCart();
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    static isEmpty() {
        const cart = StorageManager.getCart();
        return cart.items.length === 0;
    }
}

class AuthManager {
    static checkSession() {
        const session = StorageManager.getSession();
        if (!session.currentUser) return null;

        const expiresAt = new Date(session.expiresAt);
        if (expiresAt < new Date()) {
            this.logout();
            return null;
        }

        return session.currentUser;
    }

    static logout() {
        StorageManager.saveSession({ currentUser: null, lastActivity: null });
        window.location.href = '../index.html';
    }
}

// Renderizar carrito
function renderCart() {
    const user = requireAuth(['customer']);
    if (!user) return;

    const cartItems = CartManager.getCartItems();
    const cartItemsDiv = document.getElementById('cartItems');

    if (cartItems.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
                <h4>Tu carrito está vacío</h4>
                <p class="text-muted">¡Agrega algunos productos deliciosos!</p>
                <a href="../b07-catalog/catalog.html" class="btn btn-primary mt-3">
                    <i class="fas fa-book-open"></i> Ver Menú
                </a>
            </div>
        `;
        document.getElementById('checkoutBtn').disabled = true;
        updateTotals();
        return;
    }

    cartItemsDiv.innerHTML = cartItems.map(item => {
        const product = item.product;
        const categoryClass = `category-${product.category.toLowerCase()}`;

        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <div class="product-image ${categoryClass}" style="height: 80px; font-size: 2rem;">
                                <i class="fas fa-utensils"></i>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <h5 class="mb-1">${product.name}</h5>
                            <p class="text-muted mb-0 small">${product.category}</p>
                            <p class="mb-0">${formatPrice(product.price)} c/u</p>
                        </div>
                        <div class="col-md-3">
                            <div class="input-group">
                                <button class="btn btn-outline-secondary" onclick="updateQuantity(${product.id}, ${item.quantity - 1})">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                                <button class="btn btn-outline-secondary" onclick="updateQuantity(${product.id}, ${item.quantity + 1})">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <h5 class="text-primary mb-0">${formatPrice(product.price * item.quantity)}</h5>
                        </div>
                        <div class="col-md-1">
                            <button class="btn btn-danger btn-sm" onclick="removeItem(${product.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('checkoutBtn').disabled = false;
    updateTotals();
}

function updateTotals() {
    const { subtotal, tax, total } = CartManager.getCartTotal();
    document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
    document.getElementById('cartTax').textContent = formatPrice(tax);
    document.getElementById('cartTotal').textContent = formatPrice(total);
}

function updateQuantity(productId, newQuantity) {
    CartManager.updateQuantity(productId, newQuantity);
    renderCart();
}

function removeItem(productId) {
    if (confirm('¿Eliminar este producto del carrito?')) {
        CartManager.removeFromCart(productId);
        renderCart();
        showToast('Producto eliminado del carrito', 'info');
    }
}

document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    window.location.href = '../b13-payment-methods/checkout.html';
});

window.addEventListener('DOMContentLoaded', () => {
    renderCart();
});