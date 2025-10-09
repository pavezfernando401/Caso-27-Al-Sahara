// AuthManager
class AuthManager {
    static checkSession() {
        const session = StorageManager.getSession();
        if (!session || !session.currentUser) return null;

        const expiresAt = new Date(session.expiresAt);
        if (expiresAt < new Date()) {
            return null;
        }

        return session.currentUser;
    }
}

// CartManager
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
        }
    }

    static updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (!badge) return;

        const cart = StorageManager.getCart();
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// ProductDetailManager
class ProductDetailManager {
    static getCategoryIcon(category) {
        const iconMap = {
            'Shawarma': 'fa-drumstick-bite',
            'Falafel': 'fa-cookie-bite',
            'Kebab': 'fa-hotdog',
            'Salsa': 'fa-bottle-droplet',
            'Bebida': 'fa-glass-water'
        };
        return iconMap[category] || 'fa-utensils';
    }

    static showProductDetail(productId) {
        const products = StorageManager.getProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) return;

        const modal = new bootstrap.Modal(document.getElementById('productModal'));

        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductPrice').textContent = formatPrice(product.price);
        document.getElementById('modalProductImage').className = `${!product.available ? 'opacity-50' : ''}`;
        document.getElementById('modalProductImage').innerHTML = `<img src="${product.image}" alt="${product.name}" class="w-100 rounded" style="max-height: 300px; object-fit: cover;">`;
        
        const ingredientsList = document.getElementById('modalProductIngredients');
        ingredientsList.innerHTML = product.ingredients.map(ing => `<li>${ing}</li>`).join('');

        const stockDiv = document.getElementById('modalProductStock');
        const addBtn = document.getElementById('modalAddToCart');

        const user = AuthManager.checkSession();
        const canManageProducts = user && (user.role === 'admin' || user.role === 'cashier');

        if (product.available) {
            stockDiv.className = 'alert alert-success';
            stockDiv.textContent = '✓ Producto disponible';
            
            if (canManageProducts) {
                addBtn.disabled = false;
                addBtn.className = 'btn btn-warning btn-lg btn-rounded';
                addBtn.innerHTML = '<i class="fas fa-ban"></i> Marcar como Agotado';
                addBtn.onclick = () => {
                    toggleProductAdmin(product.id);
                    modal.hide();
                };
            } else {
                addBtn.disabled = false;
                addBtn.className = 'btn btn-primary btn-lg btn-rounded';
                addBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Añadir al Carrito';
                addBtn.onclick = () => {
                    CartManager.addToCart(product.id);
                    modal.hide();
                };
            }
        } else {
            stockDiv.className = 'alert alert-warning';
            stockDiv.textContent = '⚠ Producto agotado temporalmente';
            
            if (canManageProducts) {
                addBtn.disabled = false;
                addBtn.className = 'btn btn-success btn-lg btn-rounded';
                addBtn.innerHTML = '<i class="fas fa-check"></i> Marcar como Disponible';
                addBtn.onclick = () => {
                    toggleProductAdmin(product.id);
                    modal.hide();
                };
            } else {
                addBtn.disabled = true;
                addBtn.className = 'btn btn-secondary btn-lg btn-rounded';
                addBtn.innerHTML = '<i class="fas fa-ban"></i> No Disponible';
            }
        }

        modal.show();
    }
}

// FeaturedManager
class FeaturedManager {
    static getFeaturedProducts() {
        const products = StorageManager.getProducts();
        return products.filter(p => p.featured && p.available);
    }

    static renderFeatured(catalogInstance) {
        const featured = this.getFeaturedProducts();
        const featuredSection = document.getElementById('featuredSection');
        const featuredProducts = document.getElementById('featuredProducts');

        if (!featuredSection || !featuredProducts) return;

        if (featured.length > 0) {
            featuredSection.style.display = 'block';
            
            if (catalogInstance) {
                featuredProducts.innerHTML = featured.map(p => catalogInstance.renderProductCard(p, true)).join('');
            }
        } else {
            featuredSection.style.display = 'none';
        }
    }
}

// CatalogManager
class CatalogManager {
    constructor() {
        this.currentPage = 1;
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.itemsPerPage = 12;
    }

    getCategoryIcon(category) {
        const iconMap = {
            'Shawarma': 'fa-drumstick-bite',
            'Falafel': 'fa-cookie-bite',
            'Kebab': 'fa-hotdog',
            'Salsa': 'fa-bottle-droplet',
            'Bebida': 'fa-glass-water'
        };
        return iconMap[category] || 'fa-utensils';
    }

    getFilteredProducts() {
        let products = StorageManager.getProducts();

        if (this.currentFilter !== 'all') {
            products = products.filter(p => p.category === this.currentFilter);
        }

        if (this.currentSearch) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                p.category.toLowerCase().includes(this.currentSearch.toLowerCase())
            );
        }

        return products;
    }

    getPageProducts() {
        const products = this.getFilteredProducts();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return products.slice(start, end);
    }

    getTotalPages() {
        const products = this.getFilteredProducts();
        return Math.ceil(products.length / this.itemsPerPage);
    }

    setPage(page) {
        const totalPages = this.getTotalPages();
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            return true;
        }
        return false;
    }

    setFilter(category) {
        this.currentFilter = category;
        this.currentPage = 1;
    }

    setSearch(searchTerm) {
        this.currentSearch = searchTerm;
        this.currentPage = 1;
    }

    renderProductCard(product, isFeatured = false) {
        const featuredBadge = product.tags && (product.tags.includes('2x1') || product.tags.includes('Promoción')) ? 
            `<span style="position: absolute; top: 10px; right: 10px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 10px 15px; border-radius: 8px; font-weight: 900; font-size: 0.9rem; z-index: 10; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.6); text-transform: uppercase; letter-spacing: 1px; border: 2px solid white;">${product.tags.find(t => t === '2x1' || t === 'Promoción')}</span>` : '';

        const user = AuthManager.checkSession();
        const canManageProducts = user && (user.role === 'admin' || user.role === 'cashier');
        const isCustomer = user && user.role === 'customer';

        return `
            <div class="col-md-${isFeatured ? '6' : '3'} col-sm-6 mb-4">
                <div class="card product-card h-100 ${!product.available ? 'border-warning' : ''}" onclick="ProductDetailManager.showProductDetail(${product.id})" style="position: relative;">
                    ${featuredBadge}
                    ${!product.available ? '<span style="position: absolute; top: 10px; right: 10px; background: #fbbf24; color: black; padding: 8px 12px; border-radius: 8px; font-weight: bold; font-size: 0.85rem; z-index: 10; box-shadow: 0 3px 8px rgba(0,0,0,0.3);">Agotado</span>' : ''}
                    <img src="${product.image}" alt="${product.name}" class="card-img-top" style="height: 200px; object-fit: cover; object-position: center;">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted small">${product.category}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <h4 class="text-primary mb-0">${formatPrice(product.price)}</h4>
                        </div>
                        ${canManageProducts ? `
                            <button class="btn btn-${product.available ? 'warning' : 'success'} btn-sm w-100 mt-2" 
                                    onclick="event.stopPropagation(); toggleProductAdmin(${product.id})">
                                <i class="fas fa-${product.available ? 'ban' : 'check'}"></i> 
                                ${product.available ? 'Marcar Agotado' : 'Marcar Disponible'}
                            </button>
                        ` : isCustomer ? `
                            <button class="btn btn-${product.available ? 'primary' : 'secondary'} btn-sm w-100 mt-2" 
                                    onclick="event.stopPropagation(); CartManager.addToCart(${product.id})"
                                    ${!product.available ? 'disabled' : ''}>
                                <i class="fas fa-${product.available ? 'cart-plus' : 'ban'}"></i> 
                                ${product.available ? 'Agregar' : 'Agotado'}
                            </button>
                        ` : `
                            <button class="btn btn-${product.available ? 'primary' : 'secondary'} btn-sm w-100 mt-2" 
                                    onclick="event.stopPropagation(); alert('Inicia sesión para agregar productos')"
                                    ${!product.available ? 'disabled' : ''}>
                                <i class="fas fa-${product.available ? 'cart-plus' : 'ban'}"></i> 
                                ${product.available ? 'Agregar' : 'Agotado'}
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    renderCatalog() {
        FeaturedManager.renderFeatured(this);
        this.renderProductGrid();
    }

    renderProductGrid() {
        const products = this.getPageProducts();
        const grid = document.getElementById('productsGrid');
        const totalPages = this.getTotalPages();

        if (products.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>No hay productos disponibles</h4>
                    <p class="text-muted">Intenta cambiar los filtros de búsqueda</p>
                </div>
            `;
            document.getElementById('pageInfo').textContent = 'Sin resultados';
            document.getElementById('prevPage').disabled = true;
            document.getElementById('nextPage').disabled = true;
            return;
        }

        grid.innerHTML = products.map(product => this.renderProductCard(product)).join('');

        document.getElementById('pageInfo').textContent = `Página ${this.currentPage} de ${totalPages}`;
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;
    }

    initializeEvents() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setFilter(btn.dataset.category);
                this.renderProductGrid();
            });
        });

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.setSearch(e.target.value);
                this.renderProductGrid();
            });
        }

        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (this.setPage(this.currentPage - 1)) {
                this.renderProductGrid();
                window.scrollTo(0, 0);
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            if (this.setPage(this.currentPage + 1)) {
                this.renderProductGrid();
                window.scrollTo(0, 0);
            }
        });
    }
}

function toggleProductAdmin(productId) {
    try {
        const products = StorageManager.getProducts();
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            throw new Error('Producto no encontrado');
        }
        
        products[productIndex].available = !products[productIndex].available;
        localStorage.setItem('products', JSON.stringify(products));
        
        if (typeof showToast === 'function') {
            showToast('Disponibilidad actualizada', 'success');
        }
        catalog.renderCatalog();
    } catch (error) {
        if (typeof showToast === 'function') {
            showToast(error.message, 'error');
        }
    }
}

const catalog = new CatalogManager();

window.addEventListener('DOMContentLoaded', () => {
    catalog.renderCatalog();
    catalog.initializeEvents();
    CartManager.updateCartBadge();
});