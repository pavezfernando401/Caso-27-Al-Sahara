class AuthManager {
    static login(email, password) {
        const users = StorageManager.getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
            throw new Error('Cuenta bloqueada temporalmente');
        }

        if (user.password !== password) {
            user.failedAttempts = (user.failedAttempts || 0) + 1;
            
            if (user.failedAttempts >= 5) {
                user.blockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
                StorageManager.saveUsers(users);
                throw new Error('Cuenta bloqueada temporalmente');
            }
            
            StorageManager.saveUsers(users);
            throw new Error(`Contraseña incorrecta. Intentos restantes: ${5 - user.failedAttempts}`);
        }

        user.failedAttempts = 0;
        user.blockedUntil = null;
        StorageManager.saveUsers(users);

        const session = {
            currentUser: user,
            lastActivity: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        };

        StorageManager.saveSession(session);
        this.startSessionTimer();
        
        return user;
    }

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

    static startSessionTimer() {
        setInterval(() => {
            const session = StorageManager.getSession();
            if (session.currentUser) {
                const lastActivity = new Date(session.lastActivity);
                const now = new Date();
                const diff = (now - lastActivity) / 1000 / 60;

                if (diff >= 30) {
                    alert('Sesión cerrada por inactividad');
                    this.logout();
                }
            }
        }, 60000);
    }

    static updateActivity() {
        const session = StorageManager.getSession();
        if (session.currentUser) {
            session.lastActivity = new Date().toISOString();
            session.expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
            StorageManager.saveSession(session);
        }
    }
}

// Event listeners
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const user = AuthManager.login(email, password);
        
        showToast(`¡Bienvenido ${user.name}!`, 'success');
        updateNavbar();
        
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = '../b05-dispatch/dispatch.html';
            } else if (user.role === 'cashier') {
                window.location.href = '../b19-cashier/cashier.html';
            } else {
                window.location.href = '../b07-catalog/catalog.html';
            }
        }, 1000);
        
    } catch (error) {
        showToast(error.message, 'error');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const user = AuthManager.checkSession();
    if (user) {
        showToast('Ya tienes una sesión activa', 'info');
        
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = '../b05-dispatch/dispatch.html';
            } else if (user.role === 'cashier') {
                window.location.href = '../b19-cashier/cashier.html';
            } else {
                window.location.href = '../b07-catalog/catalog.html';
            }
        }, 1500);
    }
});

// Auto-actualizar actividad
['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
    document.addEventListener(event, () => AuthManager.updateActivity(), { passive: true });
});