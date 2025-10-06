// ==================== B-09: ACTUALIZACIÓN DE PERFIL ====================

class ProfileManager {
    static updateProfile(userData) {
        const user = AuthManager.checkSession();
        if (!user) {
            throw new Error('Debe iniciar sesión');
        }

        if (userData.email && !this.validateEmail(userData.email)) {
            throw new Error('El email no es válido');
        }

        if (userData.rut && typeof FullRegistrationManager !== 'undefined') {
            if (!FullRegistrationManager.validateRUT(userData.rut)) {
                throw new Error('RUT inválido');
            }
        }

        const users = StorageManager.getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex === -1) {
            throw new Error('Usuario no encontrado');
        }

        if (userData.email && userData.email !== user.email) {
            const emailExists = users.find(u => u.email === userData.email && u.id !== user.id);
            if (emailExists) {
                throw new Error('El email ya está en uso');
            }
        }

        users[userIndex] = {
            ...users[userIndex],
            name: userData.name || users[userIndex].name,
            email: userData.email || users[userIndex].email,
            phone: userData.phone || users[userIndex].phone,
            address: userData.address || users[userIndex].address,
            rut: userData.rut || users[userIndex].rut,
            birthdate: userData.birthdate || users[userIndex].birthdate,
            gender: userData.gender || users[userIndex].gender
        };

        StorageManager.saveUsers(users);

        const session = StorageManager.getSession();
        session.currentUser = users[userIndex];
        StorageManager.saveSession(session);

        return users[userIndex];
    }

    static changePassword(currentPassword, newPassword) {
        const user = AuthManager.checkSession();
        if (!user) {
            throw new Error('Debe iniciar sesión');
        }

        const users = StorageManager.getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex === -1) {
            throw new Error('Usuario no encontrado');
        }

        if (users[userIndex].password !== currentPassword) {
            throw new Error('Contraseña actual incorrecta');
        }

        if (!this.validatePassword(newPassword)) {
            throw new Error('La nueva contraseña no cumple los requisitos');
        }

        users[userIndex].password = newPassword;
        StorageManager.saveUsers(users);

        console.log('📧 Notificación de cambio de contraseña enviada por email');

        return true;
    }

    static validatePassword(password) {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        return hasMinLength && hasUpperCase && hasDigit;
    }

    static validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static loadProfileData() {
        const user = AuthManager.checkSession();
        if (!user) {
            window.location.href = '../b02-login/login.html';
            return null;
        }

        return {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            rut: user.rut || '',
            birthdate: user.birthdate || '',
            gender: user.gender || ''
        };
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

function loadProfile() {
    const user = requireAuth(['customer']);
    if (!user) return;

    const profileData = ProfileManager.loadProfileData();
    
    document.getElementById('profileName').value = profileData.name;
    document.getElementById('profileRut').value = profileData.rut;
    document.getElementById('profileEmail').value = profileData.email;
    document.getElementById('profilePhone').value = profileData.phone;
    document.getElementById('profileAddress').value = profileData.address;
    document.getElementById('profileBirthdate').value = profileData.birthdate;
    document.getElementById('profileGender').value = profileData.gender;
    
    document.getElementById('profileDisplayName').textContent = profileData.name;
    document.getElementById('profileDisplayEmail').textContent = profileData.email;
}

document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('profileName').value,
        rut: document.getElementById('profileRut').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        address: document.getElementById('profileAddress').value,
        birthdate: document.getElementById('profileBirthdate').value,
        gender: document.getElementById('profileGender').value
    };

    try {
        ProfileManager.updateProfile(userData);
        showToast('Perfil actualizado correctamente', 'success');
        
        document.getElementById('profileDisplayName').textContent = userData.name;
        document.getElementById('profileDisplayEmail').textContent = userData.email;
        
        updateNavbar();
        
    } catch (error) {
        showToast(error.message, 'error');
    }
});

document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
    }

    try {
        ProfileManager.changePassword(currentPassword, newPassword);
        showToast('Contraseña actualizada. Notificación enviada por correo', 'success');
        
        this.reset();
        
    } catch (error) {
        showToast(error.message, 'error');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});