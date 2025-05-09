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
        if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
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

// ... rest of your existing code ... 