// ==================== B-20: REGISTRO COMPLETO DE CLIENTES ====================

class FullRegistrationManager {
    static validateRUT(rut) {
        const rutPattern = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
        
        if (!rutPattern.test(rut)) {
            return false;
        }

        const cleanRut = rut.replace(/\./g, '').replace('-', '');
        const rutNumbers = cleanRut.slice(0, -1);
        const verifier = cleanRut.slice(-1).toLowerCase();

        let sum = 0;
        let multiplier = 2;

        for (let i = rutNumbers.length - 1; i >= 0; i--) {
            sum += parseInt(rutNumbers[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }

        const expectedVerifier = 11 - (sum % 11);
        const calculatedVerifier = expectedVerifier === 11 ? '0' : expectedVerifier === 10 ? 'k' : expectedVerifier.toString();

        return verifier === calculatedVerifier;
    }

    static formatRUT(value) {
        let rut = value.replace(/[^\dkK]/g, '');
        
        if (rut.length === 0) return '';
        
        const verifier = rut.slice(-1);
        let numbers = rut.slice(0, -1);
        
        if (numbers.length === 0) return verifier;
        
        numbers = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        
        return `${numbers}-${verifier}`;
    }

    static validatePhone(phone) {
        const phonePattern = /^(\+?56)?[- ]?[9]\d{8}$/;
        return phonePattern.test(phone.replace(/\s/g, ''));
    }

    static formatPhone(value) {
        const cleaned = value.replace(/\D/g, '');
        
        if (cleaned.length === 0) return '';
        
        if (cleaned.startsWith('56')) {
            const number = cleaned.slice(2);
            return `+56 ${number.slice(0, 1)} ${number.slice(1, 5)} ${number.slice(5, 9)}`;
        }
        
        return `+56 ${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5, 9)}`;
    }

    static validateAge(birthdate) {
        if (!birthdate) return true;
        
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age >= 18;
    }
}

// Auto-formateo de campos
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Auto-formatear RUT
        const rutInputs = document.querySelectorAll('input[id*="Rut"], input[id*="rut"]');
        rutInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const cursorPos = e.target.selectionStart;
                const oldLength = e.target.value.length;
                e.target.value = FullRegistrationManager.formatRUT(e.target.value);
                const newLength = e.target.value.length;
                e.target.setSelectionRange(cursorPos + (newLength - oldLength), cursorPos + (newLength - oldLength));
            });
        });

        // Auto-formatear teléfono
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                if (e.target.value) {
                    e.target.value = FullRegistrationManager.formatPhone(e.target.value);
                }
            });
        });
    });
}