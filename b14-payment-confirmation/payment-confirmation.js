// ==================== B-14: CONFIRMACIÓN DE PAGO ====================

class PaymentConfirmationManager {
    static confirmPayment(order) {
        const orders = StorageManager.getOrders();
        const orderIndex = orders.findIndex(o => o.id === order.id);
        
        if (orderIndex !== -1) {
            orders[orderIndex].paymentStatus = 'Pagado';
            orders[orderIndex].orderStatus = 'En preparación';
            
            if (typeof ReceiptManager !== 'undefined') {
                orders[orderIndex].receiptUrl = ReceiptManager.generateReceipt(order.id);
            }
            
            StorageManager.saveOrders(orders);
            order = orders[orderIndex];
        }
        
        this.showSuccess(order);
    }

    static showSuccess(order) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-body text-center py-4">
                        <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
                        <h3>¡Pago exitoso!</h3>
                        <p class="mb-1">Número de pedido: <strong>${order.orderNumber}</strong></p>
                        ${order.receiptUrl ? '<p class="text-muted">Copia de boleta digital enviada a su correo</p>' : ''}
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-clock"></i> Tiempo estimado: <strong>${order.estimatedTime} minutos</strong>
                        </div>
                        <button class="btn btn-primary" onclick="window.location.href='../b06-tracking/orders.html'">
                            Ver mi pedido
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
            window.location.href = '../b06-tracking/orders.html';
        });
    }

    static showTransferInstructions(order) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Instrucciones de Transferencia</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Pedido <strong>${order.orderNumber}</strong> creado exitosamente</p>
                        <div class="alert alert-warning">
                            <strong>Datos de transferencia:</strong><br>
                            Banco: Banco Chile<br>
                            Cuenta Corriente: 121274455<br>
                            RUT: 12.123.234-0<br>
                            Monto: ${formatPrice(order.total)}
                        </div>
                        <p class="small text-muted">Deberás subir el comprobante de transferencia para que tu pedido sea procesado</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="window.location.href='../b06-tracking/orders.html'">
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
}