// ==================== B-19: PROCESAR VENTAS (CAJERO VIRTUAL) ====================

class CashierManager {
    static getCashierOrders(filter) {
        const orders = StorageManager.getOrders();

        switch(filter) {
            case 'card':
                return orders.filter(o => o.paymentMethod === 'Tarjeta');
            case 'transfer':
                return orders.filter(o => o.paymentMethod === 'Transferencia');
            case 'cash':
                return orders.filter(o => o.paymentMethod === 'Efectivo');
            case 'pending':
                return orders.filter(o => o.paymentStatus !== 'Pagado');
            default:
                return orders;
        }
    }

    static isCustomerRegistered(orderId) {
        const orders = StorageManager.getOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (!order) return false;

        const users = StorageManager.getUsers();
        const user = users.find(u => u.id === order.userId);
        
        return user && user.role === 'customer';
    }

    static processSale(orderId) {
        if (!this.isCustomerRegistered(orderId)) {
            throw new Error('El cliente debe registrarse para completar la compra');
        }

        const orders = StorageManager.getOrders();
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            throw new Error('Pedido no encontrado');
        }

        order.paymentStatus = 'Pagado';
        order.orderStatus = 'En preparación';
        
        StorageManager.saveOrders(orders);
        
        // Generar boleta
        if (typeof ReceiptManager !== 'undefined') {
            ReceiptManager.generateReceipt(orderId);
        }
        
        return order;
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

// Verificar permisos de cajero
const currentUser = AuthManager.checkSession();
if (!currentUser || (currentUser.role !== 'cashier' && currentUser.role !== 'admin')) {
    alert('No tienes permisos para acceder a esta sección');
    window.location.href = '../index.html';
}

let currentFilter = 'card';

function renderCashierOrders(filter) {
    const orders = CashierManager.getCashierOrders(filter);
    const cashierOrders = document.getElementById('cashierOrders');

    if (orders.length === 0) {
        cashierOrders.innerHTML = '<div class="alert alert-info">No hay pedidos en esta categoría</div>';
        return;
    }

    cashierOrders.innerHTML = orders.reverse().map(order => {
        const isRegistered = CashierManager.isCustomerRegistered(order.id);
        const canProcess = isRegistered && order.paymentStatus !== 'Pagado';

        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h5>Pedido ${order.orderNumber}</h5>
                            <p class="mb-1"><strong>Cliente:</strong> ${order.customerName}</p>
                            <p class="mb-1"><strong>Email:</strong> ${order.customerEmail}</p>
                            <p class="mb-1"><strong>Total:</strong> ${formatPrice(order.total)}</p>
                            <p class="mb-1"><strong>Método:</strong> ${order.paymentMethod}</p>
                            <p class="mb-2">
                                <strong>Estado Pago:</strong> 
                                <span class="badge bg-${order.paymentStatus === 'Pagado' ? 'success' : 'warning'}">
                                    ${order.paymentStatus}
                                </span>
                            </p>
                            
                            ${!isRegistered ? `
                                <div class="alert alert-warning mb-0">
                                    <i class="fas fa-exclamation-triangle"></i> 
                                    El cliente debe registrarse para completar la compra
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="col-md-4 text-end">
                            ${canProcess ? `
                                <button class="btn btn-success w-100" onclick="processSale(${order.id})">
                                    <i class="fas fa-check"></i> Procesar Venta
                                </button>
                            ` : ''}
                            
                            ${order.paymentStatus === 'Pagado' ? `
                                <span class="badge bg-success p-3">
                                    <i class="fas fa-check-circle"></i> Procesado
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterCashier(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderCashierOrders(filter);
}

function processSale(orderId) {
    try {
        const order = CashierManager.processSale(orderId);
        
        showToast('Venta procesada correctamente. Pedido cambia a "Pagado"', 'success');
        
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-check-circle"></i> Pago Confirmado
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <h3>Pedido ${order.orderNumber}</h3>
                        <p class="mb-1">Cliente: ${order.customerName}</p>
                        <h4 class="text-success">${formatPrice(order.total)}</h4>
                        <hr>
                        <p class="mb-0">El pedido pasó a estado <strong>"Pagado"</strong></p>
                        <p class="text-muted small">Boleta digital generada y enviada por email</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            Continuar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
            renderCashierOrders(currentFilter);
        });
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    renderCashierOrders('card');
    setInterval(() => renderCashierOrders(currentFilter), 30000);
});