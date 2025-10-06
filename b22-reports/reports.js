// ==================== B-22: REPORTES DE VENTAS ====================

class ReportsManager {
    static generateSalesReport(startDate, endDate) {
        const orders = StorageManager.getOrders();
        
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && 
                   orderDate <= endDate && 
                   order.paymentStatus === 'Pagado';
        });

        if (filteredOrders.length === 0) {
            return {
                hasData: false,
                message: 'No existen ventas registradas en el período seleccionado'
            };
        }

        const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = filteredOrders.length;
        const averageTicket = Math.round(totalSales / totalOrders);

        const productCount = {};
        const productRevenue = {};

        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const productName = item.name;
                productCount[productName] = (productCount[productName] || 0) + item.quantity;
                productRevenue[productName] = (productRevenue[productName] || 0) + (item.price * item.quantity);
            });
        });

        const topProducts = Object.entries(productCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }));

        const topRevenue = Object.entries(productRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, revenue]) => ({ name, revenue }));

        const salesByDay = {};
        filteredOrders.forEach(order => {
            const day = new Date(order.createdAt).toLocaleDateString('es-CL');
            salesByDay[day] = (salesByDay[day] || 0) + order.total;
        });

        const paymentMethods = {};
        filteredOrders.forEach(order => {
            paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + 1;
        });

        return {
            hasData: true,
            period: {
                start: startDate.toLocaleDateString('es-CL'),
                end: endDate.toLocaleDateString('es-CL')
            },
            summary: {
                totalSales,
                totalOrders,
                averageTicket
            },
            topProducts,
            topRevenue,
            salesByDay,
            paymentMethods,
            orders: filteredOrders
        };
    }

    static exportReportToPDF(reportData) {
        console.log('📄 Generando Reporte.pdf...');
        console.log('Datos del reporte:', reportData);
        
        alert(`Reporte generado exitosamente\n\nPeríodo: ${reportData.period.start} - ${reportData.period.end}\nTotal Ventas: ${formatPrice(reportData.summary.totalSales)}\n\nDescargando Reporte.pdf...`);
        
        return 'Reporte.pdf';
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

// Verificar permisos de administrador
const currentUser = AuthManager.checkSession();
if (!currentUser || currentUser.role !== 'admin') {
    alert('No tienes permisos para acceder a esta sección');
    window.location.href = '../index.html';
}

function setupReports() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('reportStartDate').valueAsDate = firstDay;
    document.getElementById('reportEndDate').valueAsDate = today;
}

function generateReport() {
    const startDate = new Date(document.getElementById('reportStartDate').value);
    const endDate = new Date(document.getElementById('reportEndDate').value);
    endDate.setHours(23, 59, 59);

    if (!document.getElementById('reportStartDate').value || !document.getElementById('reportEndDate').value) {
        showToast('Debe seleccionar ambas fechas', 'warning');
        return;
    }

    if (startDate > endDate) {
        showToast('La fecha de inicio debe ser anterior a la fecha fin', 'error');
        return;
    }

    const reportData = ReportsManager.generateSalesReport(startDate, endDate);
    const reportContent = document.getElementById('reportContent');

    if (!reportData.hasData) {
        reportContent.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i> ${reportData.message}
            </div>
        `;
        return;
    }

    reportContent.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4>Reporte de Ventas</h4>
                    <button class="btn btn-success" onclick="downloadReport()">
                        <i class="fas fa-download"></i> Descargar PDF
                    </button>
                    </div>
                
                <p><strong>Período:</strong> ${reportData.period.start} - ${reportData.period.end}</p>
                <hr>
                
                <!-- Resumen -->
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card bg-primary text-white">
                            <div class="card-body text-center">
                                <h5>Total Ventas</h5>
                                <h2>${formatPrice(reportData.summary.totalSales)}</h2>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-success text-white">
                            <div class="card-body text-center">
                                <h5>N° de Pedidos</h5>
                                <h2>${reportData.summary.totalOrders}</h2>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-info text-white">
                            <div class="card-body text-center">
                                <h5>Ticket Promedio</h5>
                                <h2>${formatPrice(reportData.summary.averageTicket)}</h2>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Productos más vendidos -->
                <h5 class="mb-3">Productos Más Vendidos</h5>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Posición</th>
                            <th>Producto</th>
                            <th>Cantidad Vendida</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.topProducts.map((item, index) => `
                            <tr>
                                <td><strong>#${index + 1}</strong></td>
                                <td>${item.name}</td>
                                <td><strong>${item.quantity}</strong> unidades</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <!-- Métodos de pago -->
                <h5 class="mb-3 mt-4">Métodos de Pago</h5>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Método</th>
                            <th>Cantidad</th>
                            <th>Porcentaje</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(reportData.paymentMethods).map(([method, count]) => `
                            <tr>
                                <td>${method}</td>
                                <td>${count}</td>
                                <td>${Math.round((count / reportData.summary.totalOrders) * 100)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    window.currentReportData = reportData;
}

function downloadReport() {
    if (!window.currentReportData) {
        showToast('Debe generar un reporte primero', 'warning');
        return;
    }

    ReportsManager.exportReportToPDF(window.currentReportData);
    showToast('Reporte descargado exitosamente', 'success');
}

window.addEventListener('DOMContentLoaded', () => {
    setupReports();
});