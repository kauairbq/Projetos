/**
 * Contact Form Validation for Rock Band Website
 * Handles form validation, submission, and user feedback
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        initializeFormValidation();
    }
});

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const form = document.getElementById('contact-form');
    const inputs = form.querySelectorAll('input, textarea');

    // Real-time validation
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (validateForm()) {
            submitForm();
        }
    });
}

/**
 * Validation rules for each field
 */
const validationRules = {
    name: {
        required: true,
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
        message: {
            required: 'Por favor, insira seu nome.',
            minLength: 'O nome deve ter pelo menos 3 caracteres.',
            maxLength: 'O nome deve ter no máximo 50 caracteres.',
            pattern: 'O nome deve conter apenas letras e espaços.'
        }
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: {
            required: 'Por favor, insira seu email.',
            pattern: 'Por favor, insira um email válido.'
        }
    },
    subject: {
        required: true,
        minLength: 5,
        maxLength: 100,
        message: {
            required: 'Por favor, insira o assunto.',
            minLength: 'O assunto deve ter pelo menos 5 caracteres.',
            maxLength: 'O assunto deve ter no máximo 100 caracteres.'
        }
    },
    message: {
        required: true,
        minLength: 10,
        maxLength: 1000,
        message: {
            required: 'Por favor, insira sua mensagem.',
            minLength: 'A mensagem deve ter pelo menos 10 caracteres.',
            maxLength: 'A mensagem deve ter no máximo 1000 caracteres.'
        }
    }
};

/**
 * Validate a single field
 */
function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    const rules = validationRules[fieldName];

    if (!rules) return true;

    let isValid = true;
    let errorMessage = '';

    // Required check
    if (rules.required && !value) {
        isValid = false;
        errorMessage = rules.message.required;
    }
    // Pattern check
    else if (rules.pattern && !rules.pattern.test(value)) {
        isValid = false;
        errorMessage = rules.message.pattern;
    }
    // Length checks
    else if (rules.minLength && value.length < rules.minLength) {
        isValid = false;
        errorMessage = rules.message.minLength;
    }
    else if (rules.maxLength && value.length > rules.maxLength) {
        isValid = false;
        errorMessage = rules.message.maxLength;
    }

    // Update field appearance
    if (isValid) {
        field.classList.remove('error');
        field.classList.add('valid');
        hideErrorMessage(field);
    } else {
        field.classList.remove('valid');
        field.classList.add('error');
        showErrorMessage(field, errorMessage);
    }

    return isValid;
}

/**
 * Show error message for a field
 */
function showErrorMessage(field, message) {
    hideErrorMessage(field); // Remove existing error

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');

    field.parentNode.appendChild(errorElement);

    // Focus management for accessibility
    if (document.activeElement === field) {
        field.setAttribute('aria-describedby', 'error-' + field.name);
        errorElement.id = 'error-' + field.name;
    }
}

/**
 * Hide error message for a field
 */
function hideErrorMessage(field) {
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    field.removeAttribute('aria-describedby');
}

/**
 * Validate entire form
 */
function validateForm() {
    const form = document.getElementById('contact-form');
    const inputs = form.querySelectorAll('input, textarea');
    let isValid = true;
    let firstErrorField = null;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
            if (!firstErrorField) {
                firstErrorField = input;
            }
        }
    });

    if (!isValid && firstErrorField) {
        // Scroll to first error field
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
    }

    return isValid;
}

/**
 * Submit the form
 */
function submitForm() {
    const form = document.getElementById('contact-form');
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    // Simulate form submission (replace with actual submission logic)
    setTimeout(() => {
        // Create form data object
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        console.log('Form submitted:', data);

        // Show success message
        showSuccessMessage();

        // Reset form
        form.reset();

        // Clear validation states
        form.querySelectorAll('input, textarea').forEach(input => {
            input.classList.remove('valid', 'error');
            hideErrorMessage(input);
        });

        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar Mensagem';

    }, 2000); // Simulate 2 second delay
}

/**
 * Show success message
 */
function showSuccessMessage() {
    const form = document.getElementById('contact-form');
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
    successMessage.setAttribute('role', 'alert');
    successMessage.setAttribute('aria-live', 'polite');

    form.appendChild(successMessage);

    // Auto-remove success message after 5 seconds
    setTimeout(() => {
        if (successMessage.parentNode) {
            successMessage.remove();
        }
    }, 5000);
}

/**
 * Utility functions for form enhancement
 */

// Auto-resize textarea
function autoResizeTextarea() {
    const textareas = document.querySelectorAll('textarea');

    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });
}

// Character counter for message field
function addCharacterCounter() {
    const messageTextarea = document.querySelector('textarea[name="message"]');

    if (messageTextarea) {
        const maxLength = validationRules.message.maxLength;
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.textContent = `0/${maxLength}`;

        messageTextarea.parentNode.appendChild(counter);

        messageTextarea.addEventListener('input', function() {
            const length = this.value.length;
            counter.textContent = `${length}/${maxLength}`;

            if (length > maxLength * 0.9) {
                counter.style.color = '#dc3545';
            } else if (length > maxLength * 0.7) {
                counter.style.color = '#ffc107';
            } else {
                counter.style.color = '#6c757d';
            }
        });
    }
}

// Initialize additional form features
document.addEventListener('DOMContentLoaded', function() {
    autoResizeTextarea();
    addCharacterCounter();
});
