// ==================== B-08: CIERRE DE SESIÓN ====================
// Este módulo no tiene HTML propio, solo exporta la función de logout

class LogoutManager {
    static logout() {
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            StorageManager.saveSession({ currentUser: null, lastActivity: null });
            
            // Limpiar datos temporales si es necesario
            console.log('Sesión cerrada exitosamente');
            
            // Redirigir al index
            window.location.href = '../index.html';
        }
    }
}

// Hacer disponible globalmente si se necesita
if (typeof window !== 'undefined') {
    window.LogoutManager = LogoutManager;
}