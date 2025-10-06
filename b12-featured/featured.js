// ==================== B-12: PRODUCTOS DESTACADOS ====================

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