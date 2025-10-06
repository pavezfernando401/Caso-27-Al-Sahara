// ==================== B-11: DETALLE DE PRODUCTO ====================
// Este módulo maneja el modal de detalle de productos

class ProductDetailManager {
    static showProductDetail(productId) {
        const products = StorageManager.getProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) return;

        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        const categoryClass = `category-${product.category.toLowerCase()}`;

        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductPrice').textContent = formatPrice(product.price);
        document.getElementById('modalProductImage').className = `product-image ${categoryClass} ${!product.available ? 'opacity-50' : ''}`;
        document.getElementById('modalProductImage').innerHTML = '<i class="fas fa-utensils"></i>';
        
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
                    try {
                        this.toggleProductAvailability(product.id);
                        showToast('Producto marcado como agotado', 'success');
                        modal.hide();
                        if (typeof catalog !== 'undefined') {
                            catalog.renderCatalog();
                        }
                    } catch (error) {
                        showToast(error.message, 'error');
                    }
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
                    try {
                        this.toggleProductAvailability(product.id);
                        showToast('Producto marcado como disponible', 'success');
                        modal.hide();
                        if (typeof catalog !== 'undefined') {
                            catalog.renderCatalog();
                        }
                    } catch (error) {
                        showToast(error.message, 'error');
                    }
                };
            } else {
                addBtn.disabled = true;
                addBtn.className = 'btn btn-secondary btn-lg btn-rounded';
                addBtn.innerHTML = '<i class="fas fa-ban"></i> No Disponible';
            }
        }

        modal.show();
    }

    static toggleProductAvailability(productId) {
        const products = StorageManager.getProducts();
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            throw new Error('Producto no encontrado');
        }
        
        products[productIndex].available = !products[productIndex].available;
        localStorage.setItem('products', JSON.stringify(products));
        
        return products[productIndex];
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