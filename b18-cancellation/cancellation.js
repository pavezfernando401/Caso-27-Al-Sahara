// ==================== B-18: CANCELACIÓN DE PEDIDO ====================

class CancellationManager {
    static cancelOrder(orderId, reason) {
        const orders = StorageManager.getOrders();
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            throw new Error('Pedido no encontrado');
        }

        if (order.orderStatus === 'En camino' || order.orderStatus === 'Entregado') {
            throw new Error('El pedido no puede cancelarse en este estado');
        }

        order.orderStatus = 'Cancelado';
        order.cancelReason = reason;
        order.canceledAt = new Date().toISOString();

        if (!order.notifications) {
            order.notifications = [];
        }

        order.notifications.push({
            status: 'Cancelado',
            sentAt: new Date().toISOString(),
            message: 'Tu pedido ha sido cancelado. Recibirás un reembolso'
        });

        StorageManager.saveOrders(orders);
        
        console.log('📧 Email de cancelación enviado con detalles del reembolso');
        
        return order;
    }
}