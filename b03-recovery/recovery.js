// ==================== B-03: RECUPERACIÓN DE CONTRASEÑA ====================

class PasswordRecovery {
    static requestPasswordReset(email) {
        const users = StorageManager.getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Generar token válido por 15 minutos
        const token = Math.random().toString(36).substring(2);
        const tokens = JSON.parse(localStorage.getItem('recoveryTokens') || '[]');
        
        tokens.push({
            email,
            token,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            used: false
        });

        localStorage.setItem('recoveryTokens', JSON.stringify(tokens));
        
        console.log('Token de recuperación:', token);
        console.log('Enviado a:', email);
        
        return token;
    }
}

// Event listener
document.getElementById('recoverForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('recoverEmail').value;

    try {
        const token = PasswordRecovery.requestPasswordReset(email);
        
        showToast('Email enviado con enlace de restablecimiento', 'success');
        
        // Mostrar modal de confirmación
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Email Enviado</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-3">
                            <i class="fas fa-envelope-open-text fa-3x text-success"></i>
                        </div>
                        <p>Hemos enviado un correo a <strong>${email}</strong> con un enlace para restablecer tu contraseña.</p>
                        <div class="alert alert-warning">
                            <i class="fas fa-clock"></i> El enlace es válido por <strong>15 minutos</strong>
                        </div>
                        <p class="text-muted small mb-0">
                            <strong>Nota de desarrollo:</strong> Token generado: <code>${token}</code>
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="window.location.href='../b02-login/login.html'">
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => modal.remove());
        
    } catch (error) {
        showToast(error.message, 'error');
    }
});