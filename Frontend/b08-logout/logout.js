// Este módulo solo exporta la función logout
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

if (typeof window !== 'undefined') {
    window.LogoutManager = LogoutManager;
}