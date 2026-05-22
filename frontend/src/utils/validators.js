/**
 * Form validators for the Voy platform
 */

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'El email es obligatorio';
  if (!re.test(email)) return 'Ingresá un email válido';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < 6) return 'Mínimo 6 caracteres';
  if (!/[A-Z]/.test(password)) return 'Debe contener al menos una mayúscula';
  if (!/[0-9]/.test(password)) return 'Debe contener al menos un número';
  return null;
}

export function validateDNI(dni) {
  if (!dni) return 'El DNI es obligatorio';
  if (!/^\d{7,8}$/.test(dni)) return 'DNI inválido (7-8 dígitos numéricos)';
  return null;
}

export function validatePhone(phone) {
  if (!phone) return 'El celular es obligatorio';
  if (!/^\d{8,15}$/.test(phone.replace(/[\s-+]/g, ''))) return 'Número inválido';
  return null;
}

export function validateRequired(value, fieldName) {
  if (!value || !value.trim()) return `${fieldName} es obligatorio`;
  return null;
}

export function validateForm(fields) {
  const errors = {};
  let hasErrors = false;

  for (const [key, { value, validator, label }] of Object.entries(fields)) {
    const error = validator(value, label);
    if (error) {
      errors[key] = error;
      hasErrors = true;
    }
  }

  return { errors, hasErrors };
}
