class OrderTracker {
    static getUserOrders() {
        const user = AuthManager.checkSession();
        if (!user) return [];

        const orders = StorageManager.getOrders();
        return orders.filter(o => o.userId === user.id).reverse();
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

let orderToCancel = null;

function renderOrders() {
    const user = requireAuth(['customer']);
    if (!user) return;

    const orders = OrderTracker.getUserOrders();
    const ordersList = document.getElementById('ordersList');

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
                <h4>No tienes pedidos aún</h4>
                <p class="text-muted">¡Haz tu primer pedido ahora!</p>
                <a href="../b07-catalog/catalog.html" class="btn btn-primary mt-3">
                    <i class="fas fa-book-open"></i> Ver Menú
                </a>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = orders.map(order => {
        const canCancel = order.orderStatus === 'Pendiente' || order.orderStatus === 'En preparación';
        const statusClass = getOrderStatusClass(order.orderStatus);

        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h5>Pedido ${order.orderNumber}</h5>
                            <p class="text-muted mb-2">
                                <i class="fas fa-calendar"></i> ${formatDate(order.createdAt)}
                            </p>
                            <div class="mb-2">
                                <span class="order-status ${statusClass}">${order.orderStatus}</span>
                                <span class="badge bg-secondary ms-2">${order.paymentStatus}</span>
                            </div>
                            
                            <p class="mb-2"><strong>Productos:</strong></p>
                            <ul class="small mb-2">
                                ${order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('')}
                            </ul>
                            
                            <p class="mb-1"><strong>Total:</strong> ${formatPrice(order.total)}</p>
                            
                            ${order.deliveryType === 'Retiro en tienda' ? 
                                '<p class="text-info mb-1"><i class="fas fa-store"></i> Retiro en local</p>' : 
                                '<p class="mb-1"><i class="fas fa-map-marker-alt"></i> Entrega: ' + order.address + '</p>'
                            }
                            
                            <p class="mb-0"><i class="fas fa-clock"></i> Tiempo estimado: ${order.estimatedTime} minutos</p>
                            
                            ${order.notifications && order.notifications.length > 0 ? `
                                <div class="mt-2">
                                    <small class="text-muted">
                                        <i class="fas fa-bell"></i> Última actualización: ${order.notifications[order.notifications.length - 1].message}
                                    </small>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="col-md-4 text-end">
                            ${order.receiptUrl ? `
                                <button class="btn btn-outline-primary btn-sm mb-2 w-100" onclick="downloadReceipt('${order.receiptUrl}')">
                                    <i class="fas fa-file-pdf"></i> Descargar Boleta
                                </button>
                            ` : ''}
                            
                            ${canCancel ? `
                                <button class="btn btn-outline-danger btn-sm w-100" onclick="showCancelOrderModal(${order.id})">
                                    <i class="fas fa-times"></i> Cancelar Pedido
                                </button>
                            ` : ''}
                            
                            ${!canCancel && order.orderStatus === 'En camino' ? `
                                <div class="alert alert-info mt-2 mb-0">
                                    <i class="fas fa-info-circle"></i> El pedido no puede cancelarse en este estado
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showCancelOrderModal(orderId) {
    orderToCancel = orderId;
    const modal = new bootstrap.Modal(document.getElementById('cancelOrderModal'));
    modal.show();
}

function confirmCancelOrder() {
    if (!orderToCancel) return;

    const reason = document.getElementById('cancelReason').value;
    
    try {
        if (typeof CancellationManager !== 'undefined') {
            CancellationManager.cancelOrder(orderToCancel, reason);
        }
        
        bootstrap.Modal.getInstance(document.getElementById('cancelOrderModal')).hide();
        
        showToast('Pedido cancelado. Recibirás confirmación de reembolso por email', 'success');
        
        renderOrders();
        
        orderToCancel = null;
        document.getElementById('cancelReason').value = '';
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function downloadReceipt(receiptUrl) {
    if (typeof ReceiptManager !== 'undefined') {
        ReceiptManager.downloadReceipt(receiptUrl);
    } else {
      showToast(`Descargando ${receiptUrl}...`, 'info');
        console.log('📄 Boleta descargada:', receiptUrl);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    renderOrders();
});
