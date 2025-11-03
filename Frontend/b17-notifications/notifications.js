class NotificationManager {
    static registerNotification(order, status) {
        if (!order.notifications) {
            order.notifications = [];
        }

        order.notifications.push({
            status: status,
            sentAt: new Date().toISOString(),
            message: this.getNotificationMessage(status)
        });

        console.log(`📱 WhatsApp enviado: ${this.getNotificationMessage(status)}`);
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