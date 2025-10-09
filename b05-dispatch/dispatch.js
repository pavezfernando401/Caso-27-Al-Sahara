class DispatchManager {
    static getDispatchQueue() {
        const orders = StorageManager.getOrders();
        return orders
            .filter(o => o.paymentStatus === 'Pagado' && 
                        o.orderStatus !== 'Entregado' && 
                        o.orderStatus !== 'Cancelado')
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    static generateOrder(orderId) {
        const orders = StorageManager.getOrders();
        const order = orders.find(o => o.id === orderId);

        if (!order) return;

        if (order.paymentStatus !== 'Pagado') {
            showToast('El pedido no está pagado, no se puede imprimir', 'error');
            return;
        }

        const orderText = `
=================================
   ORDEN DE PREPARACIÓN
=================================
Pedido: ${order.orderNumber}
Cliente: ${order.customerName}
Dirección: ${order.address}
Teléfono: ${order.phone}

PRODUCTOS:
${order.items.map(i => `- ${i.quantity}x ${i.name}`).join('\n')}

Total: ${formatPrice(order.total)}
=================================
        `;

        console.log(orderText);
        alert('Orden de preparación generada:\n' + orderText);
        
        this.updateOrderStatus(orderId, 'En preparación');
        showToast('Orden enviada a cocina', 'success');
    }

    static updateOrderStatus(orderId, newStatus) {
        const orders = StorageManager.getOrders();
        const order = orders.find(o => o.id === orderId);

        if (!order) throw new Error('Pedido no encontrado');

        order.orderStatus = newStatus;
        
        if (!order.notifications) {
            order.notifications = [];
        }
        
        order.notifications.push({
            status: newStatus,
            sentAt: new Date().toISOString(),
            message: this.getNotificationMessage(newStatus)
        });

        StorageManager.saveOrders(orders);
        console.log(`📱 WhatsApp enviado: ${this.getNotificationMessage(newStatus)}`);
        
        return order;
    }

    static getNotificationMessage(status) {
        const messages = {
            'Pendiente': 'Tu pedido ha sido recibido',
            'En preparación': 'Tu pedido está en preparación',
            'En camino': 'Tu pedido está en camino',
            'Entregado': 'Tu pedido ha sido entregado',
            'Cancelado': 'Tu pedido ha sido cancelado'
        };
        return messages[status] || 'Actualización de pedido';
    }
}

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

function renderDispatch() {
    const orders = DispatchManager.getDispatchQueue();
    const dispatchQueue = document.getElementById('dispatchQueue');

    if (orders.length === 0) {
        dispatchQueue.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> No hay pedidos pendientes de despacho
            </div>
        `;
        return;
    }

    dispatchQueue.innerHTML = orders.map((order, index) => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-1 text-center">
                        <div class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                            <strong>${index + 1}</strong>
                        </div>
                    </div>
                    <div class="col-md-7">
                        <h5>Pedido ${order.orderNumber}</h5>
                        <p class="mb-1"><strong>Cliente:</strong> ${order.customerName}</p>
                        <p class="mb-1"><strong>Dirección:</strong> ${order.address}</p>
                        <p class="mb-1"><strong>Teléfono:</strong> ${order.phone}</p>
                        <p class="mb-2"><strong>Productos:</strong></p>
                        <ul class="mb-0">
                            ${order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('')}
                        </ul>
                        <p class="mt-2 mb-0 text-muted small">
                            <i class="fas fa-clock"></i> Recibido: ${formatDate(order.createdAt)}
                        </p>
                    </div>
                    <div class="col-md-4">
                        ${order.orderStatus === 'Pendiente' || order.orderStatus === 'En preparación' ? `
                            <button class="btn btn-success w-100 mb-2" onclick="generateOrder(${order.id})">
                                <i class="fas fa-print"></i> Generar Orden de Preparación
                            </button>
                        ` : ''}
                        
                        ${order.orderStatus === 'En preparación' ? `
                            <button class="btn btn-primary w-100 mb-2" onclick="markInTransit(${order.id})">
                                <i class="fas fa-shipping-fast"></i> Marcar En Camino
                            </button>
                        ` : ''}
                        
                        ${order.orderStatus === 'En camino' ? `
                            <button class="btn btn-info w-100 mb-2" onclick="markDelivered(${order.id})">
                                <i class="fas fa-check-circle"></i> Marcar Entregado
                            </button>
                        ` : ''}
                        
                        <span class="order-status ${getOrderStatusClass(order.orderStatus)} d-block text-center">
                            ${order.orderStatus}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function generateOrder(orderId) {
    DispatchManager.generateOrder(orderId);
    renderDispatch();
}

function markInTransit(orderId) {
    DispatchManager.updateOrderStatus(orderId, 'En camino');
    showToast('Pedido marcado como En Camino', 'success');
    renderDispatch();
}

function markDelivered(orderId) {
    if (confirm('¿Confirmar que el pedido fue entregado?')) {
        DispatchManager.updateOrderStatus(orderId, 'Entregado');
        showToast('Pedido marcado como Entregado', 'success');
        renderDispatch();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const currentUser = AuthManager.checkSession();
    
    if (!currentUser) {
        alert('Debes iniciar sesión para acceder a esta sección');
        window.location.href = '../b02-login/login.html';
        return;
    }
    
    if (currentUser.role !== 'admin' && currentUser.role !== 'cashier') {
        alert('No tienes permisos para acceder a esta sección');
        window.location.href = '../index.html';
        return;
    }
    renderDispatch();
    setInterval(renderDispatch, 30000);
});