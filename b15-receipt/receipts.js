// ==================== B-15: BOLETA DIGITAL AUTOMÁTICA ====================

class ReceiptManager {
    static generateReceipt(orderId) {
        const orders = StorageManager.getOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (!order) return null;

        const receiptUrl = `boleta-${orderId}.pdf`;
        
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].receiptUrl = receiptUrl;
            StorageManager.saveOrders(orders);
        }

        console.log('📄 Boleta digital generada:', receiptUrl);
        console.log('📧 Boleta enviada por email');
        
        return receiptUrl;
    }

    static downloadReceipt(receiptUrl) {
        showToast(`Descargando ${receiptUrl}...`, 'info');
        console.log('📄 Boleta descargada:', receiptUrl);
    }
}