// Initialize the application
function initApp() {
    // Initialize language selector
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        languageSelector.addEventListener('change', updateLanguage);
        updateLanguage();
    }

    // Initialize cheque form if it exists
    const chequeForm = document.getElementById('chequeForm');
    if (chequeForm) {
        chequeForm.addEventListener('submit', handleChequeSubmit);
        initializeAmountInput();
    }

    // Initialize search if it exists
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Initialize clear all data button if it exists
    const clearAllDataBtn = document.getElementById('clearAllData');
    if (clearAllDataBtn) {
        clearAllDataBtn.addEventListener('click', handleClearAllData);
    }

    // Load cheques if we're on the main page
    if (document.getElementById('chequeTableBody')) {
        loadCheques();
    }

    // Initialize modals if they exist
    initializeModals();
}

// Initialize modals
function initializeModals() {
    // Preview Modal
    const previewModal = document.getElementById('previewModal');
    if (previewModal) {
        const printChequeBtn = previewModal.querySelector('#printCheque');
        const savePositionsBtn = previewModal.querySelector('#savePositions');
        const loadProfileBtn = previewModal.querySelector('#loadProfile');
        const saveProfileBtn = previewModal.querySelector('#saveProfileBtn');
        const deleteProfileBtn = previewModal.querySelector('#deleteProfileBtn');

        if (printChequeBtn) printChequeBtn.addEventListener('click', handlePrintCheque);
        if (savePositionsBtn) savePositionsBtn.addEventListener('click', handleSavePositions);
        if (loadProfileBtn) loadProfileBtn.addEventListener('click', handleLoadProfile);
        if (saveProfileBtn) saveProfileBtn.addEventListener('click', handleSaveProfile);
        if (deleteProfileBtn) deleteProfileBtn.addEventListener('click', handleDeleteProfile);
    }

    // Edit Modal
    const editModal = document.getElementById('editModal');
    if (editModal) {
        const saveEditBtn = editModal.querySelector('#saveEditBtn');
        if (saveEditBtn) saveEditBtn.addEventListener('click', handleSaveEdit);
    }

    // Confirmation Modal
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        const confirmDeleteBtn = confirmModal.querySelector('#confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', function() {
                const modal = bootstrap.Modal.getInstance(confirmModal);
                modal.hide();
            });
        }
    }
}

// Render cheque list
function renderChequeList(cheques) {
    const tableBody = document.getElementById('chequeTableBody');
    if (!tableBody) return; // Exit if element doesn't exist

    tableBody.innerHTML = '';
    cheques.forEach(cheque => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cheque.recipient}</td>
            <td>${cheque.amount} ${cheque.currency}</td>
            <td>${formatDate(cheque.date)}</td>
            <td><span class="badge bg-${getStatusColor(cheque.status)}">${cheque.status}</span></td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="handlePreview(${cheque.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary me-1" onclick="handleEdit(${cheque.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="handleDelete(${cheque.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Format date to display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Get status color for badges
function getStatusColor(status) {
    switch (status) {
        case 'pending': return 'warning';
        case 'printed': return 'success';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}

// Handle cheque form submission
function handleChequeSubmit(event) {
    event.preventDefault();
    
    const cheque = {
        id: Date.now(),
        recipient: document.getElementById('recipient').value,
        currency: document.getElementById('currency').value,
        amount: document.getElementById('amount').value,
        date: document.getElementById('date').value,
        cheque_number: document.getElementById('cheque_number').value,
        bank_name: document.getElementById('bank_name').value,
        account_number: document.getElementById('account_number').value,
        notes: document.getElementById('notes').value,
        status: 'pending'
    };

    saveCheque(cheque);
    event.target.reset();
    loadCheques();
}

// Save cheque to localStorage
function saveCheque(cheque) {
    const cheques = JSON.parse(localStorage.getItem('cheques') || '[]');
    cheques.push(cheque);
    localStorage.setItem('cheques', JSON.stringify(cheques));
}

// Load cheques from localStorage
function loadCheques() {
    const cheques = JSON.parse(localStorage.getItem('cheques') || '[]');
    renderChequeList(cheques);
}

// Handle search functionality
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const cheques = JSON.parse(localStorage.getItem('cheques') || '[]');
    
    const filteredCheques = cheques.filter(cheque => 
        cheque.recipient.toLowerCase().includes(searchTerm) ||
        cheque.amount.toString().includes(searchTerm) ||
        cheque.currency.toLowerCase().includes(searchTerm) ||
        cheque.cheque_number.toLowerCase().includes(searchTerm) ||
        cheque.bank_name.toLowerCase().includes(searchTerm)
    );
    
    renderChequeList(filteredCheques);
}

// Handle clear all data
function handleClearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.removeItem('cheques');
        loadCheques();
    }
}

// Handle preview
function handlePreview(id) {
    const cheques = JSON.parse(localStorage.getItem('cheques') || '[]');
    const cheque = cheques.find(c => c.id === id);
    if (cheque) {
        // Set preview modal content
        document.getElementById('previewModalLabel').textContent = `Preview Cheque #${cheque.cheque_number}`;
        // Add preview logic here
        const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
        previewModal.show();
    }
}

// Handle edit
function handleEdit(id) {
    const cheques = JSON.parse(localStorage.getItem('cheques') || '[]');
    const cheque = cheques.find(c => c.id === id);
    if (cheque) {
        // Fill edit form
        document.getElementById('edit_id').value = cheque.id;
        document.getElementById('edit_recipient').value = cheque.recipient;
        document.getElementById('edit_currency').value = cheque.currency;
        document.getElementById('edit_amount').value = cheque.amount;
        document.getElementById('edit_date').value = cheque.date;
        document.getElementById('edit_cheque_number').value = cheque.cheque_number;
        document.getElementById('edit_bank_name').value = cheque.bank_name;
        document.getElementById('edit_account_number').value = cheque.account_number;
        document.getElementById('edit_notes').value = cheque.notes;
        document.getElementById('edit_status').value = cheque.status;
        
        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    }
}

// Handle save edit
function handleSaveEdit() {
    const id = parseInt(document.getElementById('edit_id').value);
    const cheques = JSON.parse(localStorage.getItem('cheques') || '[]');
    const index = cheques.findIndex(c => c.id === id);
    
    if (index !== -1) {
        cheques[index] = {
            ...cheques[index],
            recipient: document.getElementById('edit_recipient').value,
            currency: document.getElementById('edit_currency').value,
            amount: document.getElementById('edit_amount').value,
            date: document.getElementById('edit_date').value,
            cheque_number: document.getElementById('edit_cheque_number').value,
            bank_name: document.getElementById('edit_bank_name').value,
            account_number: document.getElementById('edit_account_number').value,
            notes: document.getElementById('edit_notes').value,
            status: document.getElementById('edit_status').value
        };
        
        localStorage.setItem('cheques', JSON.stringify(cheques));
        loadCheques();
        
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        editModal.hide();
    }
}

// Handle delete
function handleDelete(id) {
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    document.getElementById('confirmDeleteBtn').onclick = () => {
        const cheques = JSON.parse(localStorage.getItem('cheques') || '[]');
        const filteredCheques = cheques.filter(c => c.id !== id);
        localStorage.setItem('cheques', JSON.stringify(filteredCheques));
        loadCheques();
        confirmModal.hide();
    };
    confirmModal.show();
}

// Initialize amount input
function initializeAmountInput() {
    const amountInput = document.getElementById('amount');
    const amountPlaceholder = document.getElementById('amountPlaceholder');
    
    if (amountInput && amountPlaceholder) {
        amountInput.addEventListener('input', function() {
            const value = this.value.replace(/[^0-9.]/g, '');
            if (value) {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    amountPlaceholder.textContent = `Amount in words: ${numberToWords(numValue)}`;
                }
            } else {
                amountPlaceholder.textContent = '';
            }
        });
    }
}

// Handle print cheque
function handlePrintCheque() {
    window.print();
}

// Handle save positions
function handleSavePositions() {
    // Implement position saving logic
    alert('Positions saved successfully!');
}

// Handle load profile
function handleLoadProfile() {
    // Implement profile loading logic
    alert('Profile loaded successfully!');
}

// Handle save profile
function handleSaveProfile() {
    // Implement profile saving logic
    alert('Profile saved successfully!');
}

// Handle delete profile
function handleDeleteProfile() {
    // Implement profile deletion logic
    alert('Profile deleted successfully!');
}

// Update language
function updateLanguage() {
    const language = document.getElementById('languageSelector').value;
    document.documentElement.lang = language;
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });
    
    // Update all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[language] && translations[language][key]) {
            element.placeholder = translations[language][key];
        }
    });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 