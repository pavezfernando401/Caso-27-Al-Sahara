class DeliveryEstimateManager {
    static calculateEstimate(deliveryType) {
        if (deliveryType === 'Retiro en tienda') {
            return 15;
        }
        return 35;
    }

    static updateEstimate(orderId, additionalMinutes = 0) {
        const orders = StorageManager.getOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (!order) return null;

        order.estimatedTime = Math.min(order.estimatedTime + additionalMinutes, 60);
        StorageManager.saveOrders(orders);
        
        return order.estimatedTime;
    }
}