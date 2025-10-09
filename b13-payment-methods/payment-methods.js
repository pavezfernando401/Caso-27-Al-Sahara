class PaymentMethodsManager {
    static createOrder(paymentMethod, deliveryType) {
        const user = AuthManager.checkSession();
        if (!user) {
            throw new Error('Debe iniciar sesión');
        }

        const cart = StorageManager.getCart();
        if (cart.items.length === 0) {
            throw new Error('El carrito está vacío');
        }

        const products = StorageManager.getProducts();
        const orderItems = cart.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                productId: item.productId,
                name: product.name,
                quantity: item.quantity,
                price: product.price
            };
        });

        const { subtotal, tax, total } = CartManager.getCartTotal();
        const orderId = StorageManager.getNextOrderId();

        const estimatedTime = typeof DeliveryEstimateManager !== 'undefined' 
            ? DeliveryEstimateManager.calculateEstimate(deliveryType)
            : (deliveryType === 'Retiro en tienda' ? 15 : 35);

        const order = {
            id: orderId,
            orderNumber: `#${orderId}`,
            userId: user.id,
            customerName: user.name,
            customerEmail: user.email,
            address: user.address,
            phone: user.phone,
            items: orderItems,
            subtotal,
            tax,
            total,
            paymentMethod,
            paymentStatus: this.getInitialPaymentStatus(paymentMethod),
            orderStatus: 'Pendiente',
            deliveryType,
            estimatedTime,
            receiptUrl: null,
            createdAt: new Date().toISOString(),
            notifications: []
        };

        const orders = StorageManager.getOrders();
        orders.push(order);
        StorageManager.saveOrders(orders);

        StorageManager.clearCart();
        CartManager.updateCartBadge();

        return order;
    }

    static getInitialPaymentStatus(paymentMethod) {
        switch(paymentMethod) {
            case 'Tarjeta':
                return 'Pagado';
            case 'Efectivo':
                return 'Pago a la entrega';
            case 'Transferencia':
                return 'Pendiente de comprobante';
            default:
                return 'Pendiente';
        }
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

// Verificación de autenticación y carrito
window.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth(['customer']);
    if (!user) {
        window.location.href = '../b02-login/login.html';
        return;
    }

    if (CartManager.isEmpty()) {
        alert('Tu carrito está vacío');
        window.location.href = '../b04-cart/cart.html';
        return;
    }

    renderCheckoutSummary();
    setupEventListeners();
});

function renderCheckoutSummary() {
    const cartItems = CartManager.getCartItems();
    const { subtotal, tax, total } = CartManager.getCartTotal();
    const user = AuthManager.checkSession();

    const summary = document.getElementById('checkoutSummary');
    summary.innerHTML = `
        <div class="mb-2"><strong>Dirección:</strong><br>${user.address}</div>
        <div class="mb-2"><strong>Productos:</strong></div>
        <ul class="small mb-3">
            ${cartItems.map(item => `<li>${item.quantity}x ${item.product.name}</li>`).join('')}
        </ul>
        <div class="d-flex justify-content-between mb-2">
            <span>Subtotal:</span>
            <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
            <span>IVA (19%):</span>
            <span>${formatPrice(tax)}</span>
        </div>
        <div class="d-flex justify-content-between">
            <strong>Total:</strong>
            <strong>${formatPrice(total)}</strong>
        </div>
    `;
}

function setupEventListeners() {
    // Actualizar estimación de entrega según tipo
    document.querySelectorAll('input[name="deliveryType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const estimate = document.getElementById('deliveryEstimate');
            if (this.value === 'Retiro en tienda') {
                estimate.innerHTML = '<i class="fas fa-clock"></i> <strong>Tiempo estimado:</strong> 15 minutos';
            } else {
                estimate.innerHTML = '<i class="fas fa-clock"></i> <strong>Entrega estimada:</strong> 35 minutos';
            }
        });
    });

    // Botón de confirmar pedido
    document.getElementById('confirmOrderBtn').addEventListener('click', processPayment);
}

function processPayment() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;

    try {
        const order = PaymentMethodsManager.createOrder(paymentMethod, deliveryType);

        if (paymentMethod === 'Tarjeta') {
            showToast('Procesando pago...', 'info');
            
            setTimeout(() => {
                if (typeof PaymentConfirmationManager !== 'undefined') {
                    PaymentConfirmationManager.confirmPayment(order);
                } else {
                    // Si no está disponible PaymentConfirmationManager, redirigir manualmente
                    const orders = StorageManager.getOrders();
                    const orderIndex = orders.findIndex(o => o.id === order.id);
                    if (orderIndex !== -1) {
                        orders[orderIndex].paymentStatus = 'Pagado';
                        orders[orderIndex].orderStatus = 'En preparación';
                        StorageManager.saveOrders(orders);
                    }
                    
                    showToast('¡Pago exitoso!', 'success');
                    setTimeout(() => {
                        window.location.href = '../b06-tracking/orders.html';
                    }, 1500);
                }
            }, 2000);
            
        } else if (paymentMethod === 'Transferencia') {
            showToast('Pedido creado. Sube tu comprobante de transferencia', 'info');
            if (typeof PaymentConfirmationManager !== 'undefined') {
                PaymentConfirmationManager.showTransferInstructions(order);
            } else {
                alert(`Pedido ${order.orderNumber} creado.\n\nDatos de transferencia:\nBanco: Banco Chile\nCuenta: 121274455\nRUT: 12.123.234-0\nMonto: ${formatPrice(order.total)}`);
                setTimeout(() => {
                    window.location.href = '../b06-tracking/orders.html';
                }, 2000);
            }
            
        } else {
            showToast('Pedido confirmado. Pago en efectivo a la entrega', 'success');
            if (typeof PaymentConfirmationManager !== 'undefined') {
                PaymentConfirmationManager.showSuccess(order);
            } else {
                setTimeout(() => {
                    window.location.href = '../b06-tracking/orders.html';
                }, 1500);
            }
        }
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}