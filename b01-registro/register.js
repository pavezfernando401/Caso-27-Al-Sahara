// ==================== B-01: REGISTRO DE USUARIO ====================

class AuthManager {
    static validatePassword(password) {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        return hasMinLength && hasUpperCase && hasDigit;
    }

    static validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static register(userData) {
        const users = StorageManager.getUsers();
        
        if (!this.validateEmail(userData.email)) {
            throw new Error('Email inválido');
        }

        if (users.find(u => u.email === userData.email)) {
            throw new Error('El email ya está en uso');
        }

        if (!this.validatePassword(userData.password)) {
            throw new Error('Contraseña inválida, probar otra válida');
        }

        const newUser = {
            id: users.length + 1,
            ...userData,
            role: userData.role || 'customer',
            failedAttempts: 0,
            blockedUntil: null,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        StorageManager.saveUsers(users);
        
        console.log('Usuario registrado exitosamente');
        return newUser;
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
}

// Event listeners
window.addEventListener('DOMContentLoaded', () => {
    const user = AuthManager.checkSession();
    if (user) {
        showToast('Ya tienes una cuenta activa', 'info');
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = '../b05-dispatch/dispatch.html';
            } else if (user.role === 'cashier') {
                window.location.href = '../b19-cashier/cashier.html';
            } else {
                window.location.href = '../b07-catalog/catalog.html';
            }
        }, 1000);
    }
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        address: document.getElementById('regAddress').value,
        password: document.getElementById('regPassword').value
    };

    try {
        AuthManager.register(userData);
        showToast('¡Cuenta creada exitosamente! Redirigiendo...', 'success');
        console.log('📧 Email de confirmación enviado a:', userData.email);
        
        setTimeout(() => {
            window.location.href = '../b02-login/login.html';
        }, 2000);
        
    } catch (error) {
        showToast(error.message, 'error');
        
        if (error.message.includes('email')) {
            document.getElementById('regEmail').classList.add('is-invalid');
        }
    }
});

document.getElementById('regEmail').addEventListener('input', function() {
    this.classList.remove('is-invalid');
});