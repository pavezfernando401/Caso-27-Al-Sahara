class AdminRegisterManager {
    static registerCustomer(customerData) {
        const users = StorageManager.getUsers();
        
        // Validar RUT duplicado
        if (customerData.rut && users.find(u => u.rut === customerData.rut)) {
            throw new Error('El RUT ya está registrado');
        }

        // Validar email
        if (!this.validateEmail(customerData.email)) {
            throw new Error('Email inválido');
        }

        if (users.find(u => u.email === customerData.email)) {
            throw new Error('El email ya está en uso');
        }

        // Validar contraseña
        if (!this.validatePassword(customerData.password)) {
            throw new Error('Contraseña inválida');
        }

        const newCustomer = {
            id: users.length + 1,
            ...customerData,
            role: 'customer',
            failedAttempts: 0,
            blockedUntil: null,
            createdAt: new Date().toISOString()
        };

        users.push(newCustomer);
        StorageManager.saveUsers(users);
        
        console.log('✓ Cliente registrado por administrador:', newCustomer.name);
        return newCustomer;
    }

    static validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static validatePassword(password) {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        return hasMinLength && hasUpperCase && hasDigit;
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

// Verificar permisos
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = AuthManager.checkSession();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'cashier')) {
        alert('No tienes permisos para acceder a esta sección');
        window.location.href = '../index.html';
        return;
    }

    document.getElementById('adminRegisterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const customerData = {
            name: document.getElementById('adminRegName').value,
            rut: document.getElementById('adminRegRut').value,
            email: document.getElementById('adminRegEmail').value,
            phone: document.getElementById('adminRegPhone').value,
            address: document.getElementById('adminRegAddress').value,
            birthdate: document.getElementById('adminRegBirthdate').value,
            gender: document.getElementById('adminRegGender').value,
            password: document.getElementById('adminRegPassword').value
        };

        try {
            const newCustomer = AdminRegisterManager.registerCustomer(customerData);
            
            showToast(`Cliente ${newCustomer.name} registrado exitosamente`, 'success');
            
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-check-circle"></i> Cliente Registrado
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Nombre:</strong> ${newCustomer.name}</p>
                            <p><strong>RUT:</strong> ${newCustomer.rut}</p>
                            <p><strong>Email:</strong> ${newCustomer.email}</p>
                            <p class="mb-0"><strong>Teléfono:</strong> ${newCustomer.phone}</p>
                            <hr>
                            <div class="alert alert-success mb-0">
                                <i class="fas fa-check"></i> El cliente queda habilitado para realizar compras
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            modal.addEventListener('hidden.bs.modal', () => modal.remove());
            
            this.reset();
            
        } catch (error) {
            showToast(error.message, 'error');
            
            if (error.message.includes('RUT')) {
                document.getElementById('adminRegRut').classList.add('is-invalid');
            }
            if (error.message.includes('email')) {
                document.getElementById('adminRegEmail').classList.add('is-invalid');
            }
        }
    });

    document.getElementById('adminRegRut').addEventListener('input', function() {
        this.classList.remove('is-invalid');
    });
    
    document.getElementById('adminRegEmail').addEventListener('input', function() {
        this.classList.remove('is-invalid');
    });
});