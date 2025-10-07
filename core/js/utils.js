// ==================== UTILIDADES GLOBALES ====================
// Funciones reutilizables en toda la aplicación

// Mostrar notificaciones toast
function showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container');
    if (!container) return;

    const bgClass = {
        'success': 'bg-success',
        'error': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
    }[type] || 'bg-info';

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white ${bgClass} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    container.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// Formatear precio en pesos chilenos
function formatPrice(price) {
    return `$${price.toLocaleString('es-CL')}`;
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Obtener clase CSS de estado de pedido
function getOrderStatusClass(status) {
    const classes = {
        'Pendiente': 'status-pendiente',
        'En preparación': 'status-preparacion',
        'En camino': 'status-camino',
        'Entregado': 'status-entregado',
        'Cancelado': 'status-cancelado'
    };
    return classes[status] || 'status-pendiente';
}

// Función global de logout
function handleLogout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        StorageManager.saveSession({ currentUser: null, lastActivity: null });
        showToast('Sesión cerrada exitosamente', 'info');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 500);
    }
}

// Actualizar navbar según usuario logueado
function updateNavbar() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;

    const user = AuthManager.checkSession();

    if (!user) {
        navMenu.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="../index.html">Inicio</a></li>
            <li class="nav-item"><a class="nav-link" href="../b07-catalog/catalog.html">Menú</a></li>
            <li class="nav-item"><a class="nav-link" href="../b02-login/login.html">Iniciar Sesión</a></li>
            <li class="nav-item"><a class="nav-link" href="../b01-registro/register.html">Registrarse</a></li>
        `;
    } else {
        let menuItems = `<li class="nav-item"><a class="nav-link" href="../b07-catalog/catalog.html">Menú</a></li>`;

        if (user.role === 'customer') {
            menuItems += `
                <li class="nav-item" style="position: relative;">
                    <a class="nav-link" href="../b04-cart/cart.html" style="position: relative; display: inline-block;">
                        <i class="fas fa-shopping-cart"></i> Carrito
                        <span class="cart-badge" id="cartBadge" style="position: absolute; top: -8px; right: -12px; background: #dc3545; color: white; border-radius: 50%; min-width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; padding: 2px 4px; box-shadow: 0 2px 6px rgba(220, 53, 69, 0.5); line-height: 1;">0</span>
                    </a>
                </li>
                <li class="nav-item"><a class="nav-link" href="../b06-tracking/orders.html">Mis Pedidos</a></li>
                <li class="nav-item"><a class="nav-link" href="../b09-profile/profile.html">Mi Cuenta</a></li>
            `;
        }

        if (user.role === 'admin') {
            menuItems += `
                <li class="nav-item"><a class="nav-link" href="../b05-dispatch/dispatch.html">Despacho</a></li>
                <li class="nav-item"><a class="nav-link" href="../b19-cashier/cashier.html">Caja</a></li>
                <li class="nav-item"><a class="nav-link" href="../b21-admin-register/admin-register.html">Registrar Cliente</a></li>
                <li class="nav-item"><a class="nav-link" href="../b22-reports/reports.html">Reportes</a></li>
            `;
        }

        if (user.role === 'cashier') {
            menuItems += `
                <li class="nav-item"><a class="nav-link" href="../b05-dispatch/dispatch.html">Despacho</a></li>
                <li class="nav-item"><a class="nav-link" href="../b19-cashier/cashier.html">Caja Virtual</a></li>
                <li class="nav-item"><a class="nav-link" href="../b21-admin-register/admin-register.html">Registrar Cliente</a></li>
            `;
        }

        menuItems += `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                    <i class="fas fa-user"></i> ${user.name}
                </a>
                <ul class="dropdown-menu">
                    ${user.role === 'customer' ? '<li><a class="dropdown-item" href="../b09-profile/profile.html"><i class="fas fa-user-edit"></i> Mi Perfil</a></li>' : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="handleLogout(); return false;">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                    </a></li>
                </ul>
            </li>
        `;

        navMenu.innerHTML = menuItems;
        
        if (user.role === 'customer' && typeof CartManager !== 'undefined') {
            CartManager.updateCartBadge();
        }
    }
}

// Proteger página que requiere autenticación
function requireAuth(allowedRoles = ['customer', 'admin', 'cashier']) {
    const user = AuthManager.checkSession();
    
    if (!user) {
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = '../b02-login/login.html';
        return null;
    }

    if (!allowedRoles.includes(user.role)) {
        alert('No tienes permisos para acceder a esta página');
        window.location.href = '../index.html';
        return null;
    }

    return user;
}

// Timer de inactividad
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    
    const user = AuthManager.checkSession();
    if (user) {
        inactivityTimer = setTimeout(() => {
            alert('Tu sesión ha expirado por inactividad');
            handleLogout();
        }, 30 * 60 * 1000);
    }
}

// Eventos globales de actividad
['mousemove', 'keypress', 'click', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, { passive: true });
});

// Inicialización global
document.addEventListener('DOMContentLoaded', function() {
    StorageManager.init();
    updateNavbar();
    
    const user = AuthManager.checkSession();
    if (user && typeof AuthManager.startSessionTimer === 'function') {
        AuthManager.startSessionTimer();
        resetInactivityTimer();
    }
});