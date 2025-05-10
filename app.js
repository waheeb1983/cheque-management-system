document.addEventListener('DOMContentLoaded', function() {
    // Initialize application
    initApp();
});

// Global variables
let cheques = [];
let currentChequeId = null;
let positionProfiles = [];
let currentLanguage = localStorage.getItem('language') || 'en';

function initApp() {
    // Load saved cheques and profiles from localStorage
    loadCheques();
    loadPositionProfiles();
    
    // Set up event listeners
    document.getElementById('chequeForm').addEventListener('submit', handleChequeFormSubmit);
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteConfirm);
    document.getElementById('saveEditBtn').addEventListener('click', handleEditSave);
    document.getElementById('savePositions').addEventListener('click', handleSavePositions);
    document.getElementById('printCheque').addEventListener('click', handlePrintCheque);
    
    // Language switcher
    document.getElementById('languageSelector').value = currentLanguage;
    document.getElementById('languageSelector').addEventListener('change', handleLanguageChange);
    
    // Clear data button
    document.getElementById('clearAllData').addEventListener('click', handleClearAllData);
    
    // Profile management event listeners
    document.getElementById('saveProfileBtn').addEventListener('click', handleSaveProfile);
    document.getElementById('loadProfile').addEventListener('click', handleLoadProfile);
    document.getElementById('deleteProfileBtn').addEventListener('click', handleDeleteProfile);
    
    // Set up position slider event listeners
    const positionSliders = document.querySelectorAll('.position-slider');
    positionSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            document.getElementById(`${this.id}_value`).textContent = this.value;
            updatePreview();
        });
    });
    
    // Set up font size slider event listeners
    const fontSliders = document.querySelectorAll('.font-slider');
    fontSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            document.getElementById(`${this.id}_value`).textContent = this.value;
            updatePreview();
        });
    });
    
    // Set today's date as default in the form
    document.getElementById('date').valueAsDate = new Date();
    
    // Apply current language
    applyLanguage();
    
    // Set up currency change listener
    document.getElementById('currency').addEventListener('change', function() {
        updateAmountPlaceholder();
        // Save selected currency
        localStorage.setItem('selectedCurrency', this.value);
    });
    document.getElementById('edit_currency').addEventListener('change', updateEditAmountPlaceholder);
    
    // Restore selected currency
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
        document.getElementById('currency').value = savedCurrency;
    }
    
    // Set initial placeholder
    updateAmountPlaceholder();
}

function handleLanguageChange(e) {
    currentLanguage = e.target.value;
    localStorage.setItem('language', currentLanguage);
    applyLanguage();
    
    // Always keep LTR layout
    document.documentElement.dir = 'ltr';
    
    // Update amount placeholders when language changes
    updateAmountPlaceholder();
    updateEditAmountPlaceholder();
}

function applyLanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
    
    // Update all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLanguage][key]) {
            element.placeholder = translations[currentLanguage][key];
        }
    });
    
    // Update status options
    const statusSelect = document.getElementById('edit_status');
    if (statusSelect) {
        statusSelect.innerHTML = `
            <option value="pending">${translations[currentLanguage]['pending']}</option>
            <option value="printed">${translations[currentLanguage]['printed']}</option>
            <option value="cancelled">${translations[currentLanguage]['cancelled']}</option>
        `;
    }
}

// CRUD Operations for Cheques
function loadCheques() {
    const savedCheques = localStorage.getItem('cheques');
    cheques = savedCheques ? JSON.parse(savedCheques) : [];
    renderChequeList();
}

function saveCheques() {
    localStorage.setItem('cheques', JSON.stringify(cheques));
}

function addCheque(chequeData) {
    const id = Date.now().toString();
    const newCheque = {
        id: id,
        ...chequeData,
        created_at: new Date().toISOString(),
        status: 'pending',
        positions: {
            recipient_x: 2400,
            recipient_y: 1080,
            amount_words_x: 1850,
            amount_words_y: 1170,
            amount_num_x: 3100,
            amount_num_y: 1250,
            piasters_num_x: 3300,
            piasters_num_y: 1250,
            date_x: 1650,
            date_y: 930
        },
        font_sizes: {
            recipient_font_size: 60,
            amount_words_font_size: 60,
            amount_num_font_size: 50,
            date_font_size: 50
        }
    };
    
    cheques.unshift(newCheque);
    saveCheques();
    renderChequeList();
    return id;
}

function updateCheque(updatedCheque) {
    const index = cheques.findIndex(cheque => String(cheque.id) === String(updatedCheque.id));
    if (index !== -1) {
        cheques[index] = {
            ...cheques[index],
            ...updatedCheque
        };
        saveCheques();
        renderChequeList();
        return true;
    }
    return false;
}

function deleteCheque(id) {
    const index = cheques.findIndex(cheque => String(cheque.id) === String(id));
    if (index !== -1) {
        cheques.splice(index, 1);
        saveCheques();
        renderChequeList();
        return true;
    }
    return false;
}

function getCheque(id) {
    const searchId = String(id);
    const cheque = cheques.find(cheque => String(cheque.id) === searchId);
    if (!cheque) {
        return null;
    }
    return cheque;
}

// Position Profiles Management
function loadPositionProfiles() {
    const savedProfiles = localStorage.getItem('positionProfiles');
    positionProfiles = savedProfiles ? JSON.parse(savedProfiles) : [];
    updateProfilesDropdown();
}

function savePositionProfiles() {
    localStorage.setItem('positionProfiles', JSON.stringify(positionProfiles));
    updateProfilesDropdown();
}

function updateProfilesDropdown() {
    const selector = document.getElementById('profileSelector');
    // Save current selection if any
    const currentSelection = selector.value;
    
    // Clear dropdown
    selector.innerHTML = '<option value="">Select a profile</option>';
    
    // Add profiles to dropdown
    positionProfiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile.id;
        option.textContent = profile.name;
        selector.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (currentSelection && positionProfiles.some(p => p.id === currentSelection)) {
        selector.value = currentSelection;
    }
}

function addPositionProfile(name, positions) {
    const id = Date.now().toString();
    const newProfile = {
        id,
        name,
        ...positions
    };
    
    positionProfiles.push(newProfile);
    savePositionProfiles();
    return id;
}

function deletePositionProfile(id) {
    const index = positionProfiles.findIndex(profile => profile.id === id);
    if (index !== -1) {
        positionProfiles.splice(index, 1);
        savePositionProfiles();
        return true;
    }
    return false;
}

function getPositionProfile(id) {
    return positionProfiles.find(profile => profile.id === id);
}

// Event Handlers
function handleChequeFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const recipient = document.getElementById('recipient').value;
    const currency = document.getElementById('currency').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const chequeNumber = document.getElementById('cheque_number').value;
    const bankName = document.getElementById('bank_name').value;
    const accountNumber = document.getElementById('account_number').value;
    const notes = document.getElementById('notes').value;
    
    // Split amount into dinars and piasters
    const [amountDinars, amountPiasters] = amount.split('.').map(Number);
    
    // Define currencies that use فلس/فلسات
    const filCurrencyCodes = ['JOD', 'BHD', 'IQD', 'KWD', 'AED', 'YER'];
    
    // Handle piasters based on currency type
    let finalPiasters = amountPiasters || 0;
    if (filCurrencyCodes.includes(currency)) {
        // For فلس currencies, keep up to 3 digits
        if (finalPiasters > 999) {
            finalPiasters = Math.floor(finalPiasters / 10);
        }
        finalPiasters = finalPiasters.toString().padStart(3, '0');
    } else {
        // For non-فلس currencies, always use two digits for cents
        finalPiasters = finalPiasters.toString().padEnd(2, '0').slice(0, 2);
    }
    
    // Convert amount to words
    const amount_words = convertAmountToWords(amountDinars, finalPiasters, currency);
    
    // Create cheque data
    const chequeData = {
        recipient,
        currency,
        amount_dinars: amountDinars,
        amount_piasters: finalPiasters,
        amount_words,
        date,
        cheque_number: chequeNumber,
        bank_name: bankName,
        account_number: accountNumber,
        notes
    };
    
    // Add cheque to storage
    addCheque(chequeData);
    
    // Reset form
    e.target.reset();
    
    // Show success message
    showToast('success', 'Cheque added successfully');
}

function handleEditSave() {
    // Get form values
    const id = document.getElementById('edit_id').value;
    const recipient = document.getElementById('edit_recipient').value;
    const currency = document.getElementById('edit_currency').value;
    const amount = document.getElementById('edit_amount').value;
    const date = document.getElementById('edit_date').value;
    const chequeNumber = document.getElementById('edit_cheque_number').value;
    const bankName = document.getElementById('edit_bank_name').value;
    const accountNumber = document.getElementById('edit_account_number').value;
    const notes = document.getElementById('edit_notes').value;
    const status = document.getElementById('edit_status').value;
    
    // Split amount into dinars and piasters
    const [amountDinars, amountPiasters] = amount.split('.').map(Number);
    
    // Define currencies that use فلس/فلسات
    const filCurrencyCodes = ['JOD', 'BHD', 'IQD', 'KWD', 'AED', 'YER'];
    
    // Handle piasters based on currency type
    let finalPiasters = amountPiasters || 0;
    if (filCurrencyCodes.includes(currency)) {
        // For فلس currencies, keep 3 digits
        finalPiasters = Math.floor(finalPiasters / 10) * 10; // Keep only first 3 digits
        finalPiasters = finalPiasters.toString().padStart(3, '0');
    } else {
        // For non-فلس currencies, always use two digits for cents
        finalPiasters = finalPiasters.toString().padEnd(2, '0').slice(0, 2);
    }
    
    // Convert amount to words
    const amount_words = convertAmountToWords(amountDinars, finalPiasters, currency);
    
    // Create updated cheque data
    const updatedCheque = {
        id: id,
        recipient,
        currency,
        amount_dinars: amountDinars,
        amount_piasters: finalPiasters,
        amount_words,
        date,
        cheque_number: chequeNumber,
        bank_name: bankName,
        account_number: accountNumber,
        notes,
        status
    };
    
    // Update cheque in storage
    if (updateCheque(updatedCheque)) {
        // Close modal
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        editModal.hide();
        
        // Show success message
        showToast('success', 'Cheque updated successfully');
    } else {
        showToast('error', 'Failed to update cheque');
    }
}

function handleDeleteConfirm() {
    if (!currentChequeId) {
        showToast('error', 'No cheque selected for deletion');
        return;
    }
    
    if (deleteCheque(currentChequeId)) {
        // Close modal
        const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
        if (confirmModal) {
            confirmModal.hide();
        }
        
        // Show success message
        showToast('success', 'Cheque deleted successfully');
        
        // Reset current cheque ID
        currentChequeId = null;
    } else {
        showToast('error', 'Failed to delete cheque');
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    renderChequeList(searchTerm);
}

function handleSavePositions() {
    if (!currentChequeId) return;
    
    const positions = getCurrentPositions();
    const fontSizes = getCurrentFontSizes();
    
    // Update positions and font sizes together
    const updatedCheque = {
        id: currentChequeId,
        positions,
        font_sizes: fontSizes
    };
    
    if (updateCheque(updatedCheque)) {
        showToast('success', 'Settings saved successfully');
    } else {
        showToast('error', 'Failed to save settings');
    }
}

function handlePrintCheque() {
    if (!currentChequeId) return;
    
    const canvas = document.getElementById('chequeCanvas');
    
    // Create a new window with the canvas image
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to print cheques');
        return;
    }
    
    // Scale the cheque image to fit A4 landscape (297mm × 210mm)
    // A4 dimensions in pixels at 300 DPI for better print quality
    const a4WidthMM = 297;
    const a4HeightMM = 210;
    const mmToPx = 300 / 25.4; // 300 DPI conversion
    const a4Width = a4WidthMM * mmToPx;
    const a4Height = a4HeightMM * mmToPx;
    
    // Calculate the scaling factor to fit the cheque image within A4
    const scaleWidth = a4Width / canvas.width;
    const scaleHeight = a4Height / canvas.height;
    const scale = Math.min(scaleWidth, scaleHeight) * 0.95; // 95% of the maximum scale to leave some margin
    
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;
    
    // Create a high-resolution canvas for better print quality
    const printCanvas = document.createElement('canvas');
    printCanvas.width = scaledWidth;
    printCanvas.height = scaledHeight;
    const printCtx = printCanvas.getContext('2d');
    
    // Draw the original canvas onto the high-res canvas with scaling
    printCtx.fillStyle = 'white';
    printCtx.fillRect(0, 0, printCanvas.width, printCanvas.height);
    printCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, scaledWidth, scaledHeight);
    
    // Setup the print document with CSS to enforce A4 landscape without printer dialog
    printWindow.document.write(`
        <html>
        <head>
            <title>Print Cheque</title>
            <style>
                @page {
                    size: A4 landscape;
                    margin: 0;
                }
                html, body {
                    margin: 0;
                    padding: 0;
                    width: ${a4WidthMM}mm;
                    height: ${a4HeightMM}mm;
                    overflow: hidden;
                    background-color: white;
                }
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                img {
                    display: block;
                    max-width: 100%;
                    max-height: 100%;
                }
                @media print {
                    html, body {
                        width: 100%;
                        height: 100%;
                    }
                    /* Hide any browser-generated headers and footers */
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                }
            </style>
            <script>
                window.onload = function() {
                    // Print immediately without showing dialog if possible
                    setTimeout(function() {
                        document.title = ""; // Remove title from print output
                        try {
                            // Try to use the non-standard print API to suppress dialog
                            // This works in some browsers like Chrome
                            window.print({silent: true});
                        } catch (e) {
                            // Fall back to standard print
                            window.print();
                        }
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    }, 300);
                };
            </script>
        </head>
        <body>
            <img src="${printCanvas.toDataURL('image/png', 1.0)}" />
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Update status to printed
    const cheque = getCheque(currentChequeId);
    if (cheque) {
        updateCheque({
            id: currentChequeId,
            status: 'printed'
        });
        showToast('success', 'Cheque printed successfully');
    }
}

function handleSaveProfile() {
    const profileName = document.getElementById('profileName').value.trim();
    if (!profileName) {
        alert('Please enter a profile name');
        return;
    }
    
    // Get current position values and font sizes
    const positions = getCurrentPositions();
    const fontSizes = getCurrentFontSizes();
    
    // Add new profile with both positions and font sizes
    const profileId = addPositionProfile(profileName, {...positions, ...fontSizes});
    
    // Clear the input field
    document.getElementById('profileName').value = '';
    
    // Select the new profile in dropdown
    document.getElementById('profileSelector').value = profileId;
    
    // Show success message
    alert(`Profile "${profileName}" saved successfully!`);
}

function handleLoadProfile() {
    const profileId = document.getElementById('profileSelector').value;
    if (!profileId) {
        alert('Please select a profile');
        return;
    }
    
    const profile = getPositionProfile(profileId);
    if (!profile) {
        alert('Profile not found');
        return;
    }
    
    // Set slider values from profile
    document.getElementById('recipient_x').value = profile.recipient_x;
    document.getElementById('recipient_y').value = profile.recipient_y;
    document.getElementById('amount_words_x').value = profile.amount_words_x;
    document.getElementById('amount_words_y').value = profile.amount_words_y;
    document.getElementById('amount_num_x').value = profile.amount_num_x;
    document.getElementById('amount_num_y').value = profile.amount_num_y;
    document.getElementById('piasters_num_x').value = profile.piasters_num_x;
    document.getElementById('piasters_num_y').value = profile.piasters_num_y;
    document.getElementById('date_x').value = profile.date_x;
    document.getElementById('date_y').value = profile.date_y;
    
    // Set font size values if they exist in the profile
    if (profile.recipient_font_size) document.getElementById('recipient_font_size').value = profile.recipient_font_size;
    if (profile.amount_words_font_size) document.getElementById('amount_words_font_size').value = profile.amount_words_font_size;
    if (profile.amount_num_font_size) document.getElementById('amount_num_font_size').value = profile.amount_num_font_size;
    if (profile.date_font_size) document.getElementById('date_font_size').value = profile.date_font_size;
    
    // Update display values
    document.getElementById('recipient_x_value').textContent = profile.recipient_x;
    document.getElementById('recipient_y_value').textContent = profile.recipient_y;
    document.getElementById('amount_words_x_value').textContent = profile.amount_words_x;
    document.getElementById('amount_words_y_value').textContent = profile.amount_words_y;
    document.getElementById('amount_num_x_value').textContent = profile.amount_num_x;
    document.getElementById('amount_num_y_value').textContent = profile.amount_num_y;
    document.getElementById('piasters_num_x_value').textContent = profile.piasters_num_x;
    document.getElementById('piasters_num_y_value').textContent = profile.piasters_num_y;
    document.getElementById('date_x_value').textContent = profile.date_x;
    document.getElementById('date_y_value').textContent = profile.date_y;
    
    // Update font size display values if they exist
    if (profile.recipient_font_size) document.getElementById('recipient_font_size_value').textContent = profile.recipient_font_size;
    if (profile.amount_words_font_size) document.getElementById('amount_words_font_size_value').textContent = profile.amount_words_font_size;
    if (profile.amount_num_font_size) document.getElementById('amount_num_font_size_value').textContent = profile.amount_num_font_size;
    if (profile.date_font_size) document.getElementById('date_font_size_value').textContent = profile.date_font_size;
    
    // Update preview
    updatePreview();
    
    // Show success message
    alert(`Profile "${profile.name}" loaded successfully!`);
}

function handleDeleteProfile() {
    const profileId = document.getElementById('profileSelector').value;
    if (!profileId) {
        alert('Please select a profile to delete');
        return;
    }
    
    const profile = getPositionProfile(profileId);
    if (!profile) {
        alert('Profile not found');
        return;
    }
    
    if (confirm(`Are you sure you want to delete the profile "${profile.name}"?`)) {
        if (deletePositionProfile(profileId)) {
            alert(`Profile "${profile.name}" deleted successfully!`);
        }
    }
}

// UI Rendering Functions
function renderChequeList(searchTerm = '') {
    const tableBody = document.getElementById('chequeTableBody');
    tableBody.innerHTML = '';
    
    const filteredCheques = searchTerm ? 
        cheques.filter(cheque => 
            cheque.recipient.toLowerCase().includes(searchTerm) ||
            cheque.amount_words.toLowerCase().includes(searchTerm) ||
            cheque.date.includes(searchTerm) ||
            (cheque.cheque_number && cheque.cheque_number.toLowerCase().includes(searchTerm)) ||
            (cheque.bank_name && cheque.bank_name.toLowerCase().includes(searchTerm)) ||
            (cheque.account_number && cheque.account_number.toLowerCase().includes(searchTerm)) ||
            (cheque.notes && cheque.notes.toLowerCase().includes(searchTerm))
        ) : cheques;
    
    if (filteredCheques.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No cheques found</td>
            </tr>
        `;
        return;
    }
    
    // Define currencies that use فلس/فلسات
    const filCurrencyCodes = ['JOD', 'BHD', 'IQD', 'KWD', 'AED', 'YER'];
    
    filteredCheques.forEach(cheque => {
        const row = document.createElement('tr');
        
        // Format amount with currency
        let amount = '';
        if (cheque.amount_piasters) {
            if (filCurrencyCodes.includes(cheque.currency)) {
                // For فلس currencies, keep 3 digits
                amount = `${cheque.amount_dinars}.${cheque.amount_piasters.toString().padStart(3, '0')} ${cheque.currency}`;
            } else {
                // For non-فلس currencies, keep 2 digits
                amount = `${cheque.amount_dinars}.${cheque.amount_piasters.toString().padStart(2, '0')} ${cheque.currency}`;
            }
        } else {
            amount = `${cheque.amount_dinars} ${cheque.currency}`;
        }
        
        row.innerHTML = `
            <td>${cheque.recipient}</td>
            <td>${amount}</td>
            <td>${formatDate(cheque.date)}</td>
            <td>
                <span class="status-badge status-${cheque.status}">
                    ${capitalize(cheque.status)}
                </span>
            </td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-info info-btn" data-id="${cheque.id}">
                    <i class="bi bi-info-circle"></i>
                </button>
                <button class="btn btn-sm btn-primary preview-btn" data-id="${cheque.id}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-secondary edit-btn" data-id="${cheque.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${cheque.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.info-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const chequeId = this.getAttribute('data-id');
            showInfoModal(chequeId);
        });
    });
    
    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const chequeId = this.getAttribute('data-id');
            showPreviewModal(chequeId);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const chequeId = this.getAttribute('data-id');
            showEditModal(chequeId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const chequeId = this.getAttribute('data-id');
            showDeleteConfirmation(chequeId);
        });
    });
}

function showPreviewModal(chequeId) {
    const cheque = getCheque(chequeId);
    if (!cheque) {
        showToast('error', 'Cheque not found');
        return;
    }
    
    currentChequeId = chequeId;
    
    // Initialize default positions if not exists
    if (!cheque.positions) {
        cheque.positions = {
            recipient_x: 2400,
            recipient_y: 1080,
            amount_words_x: 1850,
            amount_words_y: 1170,
            amount_num_x: 3100,
            amount_num_y: 1250,
            piasters_num_x: 3300,
            piasters_num_y: 1250,
            date_x: 1650,
            date_y: 930
        };
    }
    
    // Initialize default font sizes if not exists
    if (!cheque.font_sizes) {
        cheque.font_sizes = {
            recipient_font_size: 60,
            amount_words_font_size: 60,
            amount_num_font_size: 50,
            date_font_size: 50
        };
    }
    
    // Set position values in sliders
    document.getElementById('recipient_x').value = cheque.positions.recipient_x;
    document.getElementById('recipient_y').value = cheque.positions.recipient_y;
    document.getElementById('amount_words_x').value = cheque.positions.amount_words_x;
    document.getElementById('amount_words_y').value = cheque.positions.amount_words_y;
    document.getElementById('amount_num_x').value = cheque.positions.amount_num_x;
    document.getElementById('amount_num_y').value = cheque.positions.amount_num_y;
    document.getElementById('piasters_num_x').value = cheque.positions.piasters_num_x;
    document.getElementById('piasters_num_y').value = cheque.positions.piasters_num_y;
    document.getElementById('date_x').value = cheque.positions.date_x;
    document.getElementById('date_y').value = cheque.positions.date_y;
    
    // Set font size values
    document.getElementById('recipient_font_size').value = cheque.font_sizes.recipient_font_size;
    document.getElementById('amount_words_font_size').value = cheque.font_sizes.amount_words_font_size;
    document.getElementById('amount_num_font_size').value = cheque.font_sizes.amount_num_font_size;
    document.getElementById('date_font_size').value = cheque.font_sizes.date_font_size;
    
    // Update value displays
    document.getElementById('recipient_x_value').textContent = cheque.positions.recipient_x;
    document.getElementById('recipient_y_value').textContent = cheque.positions.recipient_y;
    document.getElementById('amount_words_x_value').textContent = cheque.positions.amount_words_x;
    document.getElementById('amount_words_y_value').textContent = cheque.positions.amount_words_y;
    document.getElementById('amount_num_x_value').textContent = cheque.positions.amount_num_x;
    document.getElementById('amount_num_y_value').textContent = cheque.positions.amount_num_y;
    document.getElementById('piasters_num_x_value').textContent = cheque.positions.piasters_num_x;
    document.getElementById('piasters_num_y_value').textContent = cheque.positions.piasters_num_y;
    document.getElementById('date_x_value').textContent = cheque.positions.date_x;
    document.getElementById('date_y_value').textContent = cheque.positions.date_y;
    
    // Update font size displays
    document.getElementById('recipient_font_size_value').textContent = cheque.font_sizes.recipient_font_size;
    document.getElementById('amount_words_font_size_value').textContent = cheque.font_sizes.amount_words_font_size;
    document.getElementById('amount_num_font_size_value').textContent = cheque.font_sizes.amount_num_font_size;
    document.getElementById('date_font_size_value').textContent = cheque.font_sizes.date_font_size;
    
    // Show modal
    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    previewModal.show();
    
    // Update preview after modal is shown
    previewModal._element.addEventListener('shown.bs.modal', function () {
        updatePreview();
    });
}

function showEditModal(chequeId) {
    const cheque = getCheque(chequeId);
    if (!cheque) {
        showToast('error', 'Cheque not found');
        return;
    }
    
    currentChequeId = chequeId;
    
    // Populate form fields
    document.getElementById('edit_id').value = cheque.id;
    document.getElementById('edit_recipient').value = cheque.recipient;
    document.getElementById('edit_currency').value = cheque.currency || 'JOD';
    document.getElementById('edit_amount').value = cheque.amount_piasters ? 
        `${cheque.amount_dinars}.${cheque.amount_piasters}` : 
        cheque.amount_dinars.toString();
    document.getElementById('edit_date').value = cheque.date;
    document.getElementById('edit_cheque_number').value = cheque.cheque_number || '';
    document.getElementById('edit_bank_name').value = cheque.bank_name || '';
    document.getElementById('edit_account_number').value = cheque.account_number || '';
    document.getElementById('edit_notes').value = cheque.notes || '';
    document.getElementById('edit_status').value = cheque.status || 'pending';
    
    // Show modal
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
}

function showDeleteConfirmation(chequeId) {
    const cheque = getCheque(chequeId);
    if (!cheque) {
        showToast('error', 'Cheque not found');
        return;
    }
    
    currentChequeId = chequeId;
    
    // Show confirmation modal
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    confirmModal.show();
}

function showInfoModal(chequeId) {
    const cheque = getCheque(chequeId);
    if (!cheque) {
        showToast('error', 'Cheque not found');
        return;
    }
    
    // Update modal content
    document.getElementById('info_cheque_number').textContent = cheque.cheque_number || '-';
    document.getElementById('info_bank_name').textContent = cheque.bank_name || '-';
    document.getElementById('info_account_number').textContent = cheque.account_number || '-';
    document.getElementById('info_notes').textContent = cheque.notes || '-';
    
    // Show modal
    const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));
    infoModal.show();
}

function updatePreview() {
    const cheque = getCheque(currentChequeId);
    if (!cheque) {
        return;
    }
    
    const canvas = document.getElementById('chequeCanvas');
    if (!canvas) {
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get current positions
    const positions = {
        recipient_x: parseInt(document.getElementById('recipient_x').value),
        recipient_y: parseInt(document.getElementById('recipient_y').value),
        amount_words_x: parseInt(document.getElementById('amount_words_x').value),
        amount_words_y: parseInt(document.getElementById('amount_words_y').value),
        amount_num_x: parseInt(document.getElementById('amount_num_x').value),
        amount_num_y: parseInt(document.getElementById('amount_num_y').value),
        piasters_num_x: parseInt(document.getElementById('piasters_num_x').value),
        piasters_num_y: parseInt(document.getElementById('piasters_num_y').value),
        date_x: parseInt(document.getElementById('date_x').value),
        date_y: parseInt(document.getElementById('date_y').value)
    };
    
    // Get current font sizes
    const fontSizes = {
        recipient_font_size: parseInt(document.getElementById('recipient_font_size').value),
        amount_words_font_size: parseInt(document.getElementById('amount_words_font_size').value),
        amount_num_font_size: parseInt(document.getElementById('amount_num_font_size').value),
        date_font_size: parseInt(document.getElementById('date_font_size').value)
    };
    
    // Draw recipient
    ctx.font = `${fontSizes.recipient_font_size}px Arial`;
    ctx.fillStyle = 'black';
    drawArabicText(ctx, positions.recipient_x, positions.recipient_y, cheque.recipient);
    
    // Draw amount in words
    ctx.font = `${fontSizes.amount_words_font_size}px Arial`;
    drawArabicText(ctx, positions.amount_words_x, positions.amount_words_y, cheque.amount_words);
    
    // Draw amount in numbers
    ctx.font = `${fontSizes.amount_num_font_size}px Arial`;
    const amountText = cheque.amount_dinars.toString();
    ctx.fillText(`#${amountText}#`, positions.amount_num_x, positions.amount_num_y);
    
    // Draw piasters
    const piastersText = cheque.amount_piasters ? cheque.amount_piasters.toString() : '0';
    ctx.fillText(`#${piastersText}#`, positions.piasters_num_x, positions.piasters_num_y);
    
    // Draw date
    ctx.font = `${fontSizes.date_font_size}px Arial`;
    const dateFormatted = formatDate(cheque.date);
    ctx.fillText(dateFormatted, positions.date_x, positions.date_y);
}

// Helper Functions
function getCurrentPositions() {
    return {
        recipient_x: parseInt(document.getElementById('recipient_x').value),
        recipient_y: parseInt(document.getElementById('recipient_y').value),
        amount_words_x: parseInt(document.getElementById('amount_words_x').value),
        amount_words_y: parseInt(document.getElementById('amount_words_y').value),
        amount_num_x: parseInt(document.getElementById('amount_num_x').value),
        amount_num_y: parseInt(document.getElementById('amount_num_y').value),
        piasters_num_x: parseInt(document.getElementById('piasters_num_x').value),
        piasters_num_y: parseInt(document.getElementById('piasters_num_y').value),
        date_x: parseInt(document.getElementById('date_x').value),
        date_y: parseInt(document.getElementById('date_y').value)
    };
}

function getCurrentFontSizes() {
    return {
        recipient_font_size: parseInt(document.getElementById('recipient_font_size').value),
        amount_words_font_size: parseInt(document.getElementById('amount_words_font_size').value),
        amount_num_font_size: parseInt(document.getElementById('amount_num_font_size').value),
        date_font_size: parseInt(document.getElementById('date_font_size').value)
    };
}

// Utility Functions
function drawArabicText(ctx, x, y, text) {
    // Reshape Arabic text for proper display
    try {
        if (window.ArabicShaper && window.bidi) {
            const reshaped = ArabicShaper.reshape(text);
            const bidiText = bidi.getBidiText(reshaped);
            ctx.fillText(bidiText, x, y);
        } else {
            // Fallback if libraries aren't available
            ctx.fillText(text, x, y);
        }
    } catch (e) {
        // Fallback in case of error
        ctx.fillText(text, x, y);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to handle clearing all application data
function handleClearAllData() {
    if (confirm('Are you sure you want to delete ALL cheques and profiles? This action cannot be undone.')) {
        // Clear all application data from localStorage
        localStorage.removeItem('cheques');
        localStorage.removeItem('positionProfiles');
        
        // Reset application state
        cheques = [];
        positionProfiles = [];
        
        // Update UI
        renderChequeList();
        updateProfilesDropdown();
        
        // Show confirmation
        alert('All data has been cleared successfully.');
    }
}

// Toast notification function
function showToast(type, message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Create toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function updateAmountPlaceholder() {
    const currency = document.getElementById('currency').value;
    const placeholderText = document.getElementById('amountPlaceholder');
    const isEnglish = currentLanguage === 'en';
    
    // Define currency subunit mappings
    const currencySubunits = {
        'JOD': isEnglish ? 'Fils' : 'فلس',
        'BHD': isEnglish ? 'Fils' : 'فلس',
        'IQD': isEnglish ? 'Fils' : 'فلس',
        'KWD': isEnglish ? 'Fils' : 'فلس',
        'AED': isEnglish ? 'Fils' : 'فلس',
        'YER': isEnglish ? 'Fils' : 'فلس',
        'SAR': isEnglish ? 'Halala' : 'هللة',
        'QAR': isEnglish ? 'Dirham' : 'درهم',
        'OMR': isEnglish ? 'Baisa' : 'بيسة',
        'EGP': isEnglish ? 'Piaster' : 'قرش',
        'DZD': isEnglish ? 'Centime' : 'سنتيم',
        'LBP': isEnglish ? 'Piaster' : 'قرش',
        'LYD': isEnglish ? 'Dirham' : 'درهم',
        'MRU': isEnglish ? 'Khoums' : 'خمس',
        'MAD': isEnglish ? 'Centime' : 'سنتيم',
        'SYP': isEnglish ? 'Piaster' : 'قرش',
        'TND': isEnglish ? 'Millime' : 'مليم'
    };
    
    const decimalPlaces = ['JOD', 'BHD', 'IQD', 'KWD', 'AED', 'YER'].includes(currency) ? 
        (isEnglish ? 'three' : 'ثلاثة') : 
        (isEnglish ? 'two' : 'اثنين');
    
    const example = ['JOD', 'BHD', 'IQD', 'KWD', 'AED', 'YER'].includes(currency) ? '1000.550' : '1000.55';
    const subunitName = currencySubunits[currency] || (isEnglish ? 'Piaster' : 'قرش');
    
    if (isEnglish) {
        placeholderText.textContent = `Enter amount with ${subunitName} using decimal point (example: ${example})`;
    } else {
        placeholderText.textContent = `أدخل المبلغ مع ${subunitName} باستخدام النقطة (مثال: ${example})`;
    }
}

function updateEditAmountPlaceholder() {
    const currency = document.getElementById('edit_currency').value;
    const placeholderText = document.getElementById('editAmountPlaceholder');
    const isEnglish = currentLanguage === 'en';
    
    // Define currency subunit mappings
    const currencySubunits = {
        'JOD': isEnglish ? 'Fils' : 'فلس',
        'BHD': isEnglish ? 'Fils' : 'فلس',
        'IQD': isEnglish ? 'Fils' : 'فلس',
        'KWD': isEnglish ? 'Fils' : 'فلس',
        'AED': isEnglish ? 'Fils' : 'فلس',
        'YER': isEnglish ? 'Fils' : 'فلس',
        'SAR': isEnglish ? 'Halala' : 'هللة',
        'QAR': isEnglish ? 'Dirham' : 'درهم',
        'OMR': isEnglish ? 'Baisa' : 'بيسة',
        'EGP': isEnglish ? 'Piaster' : 'قرش',
        'DZD': isEnglish ? 'Centime' : 'سنتيم',
        'LBP': isEnglish ? 'Piaster' : 'قرش',
        'LYD': isEnglish ? 'Dirham' : 'درهم',
        'MRU': isEnglish ? 'Khoums' : 'خمس',
        'MAD': isEnglish ? 'Centime' : 'سنتيم',
        'SYP': isEnglish ? 'Piaster' : 'قرش',
        'TND': isEnglish ? 'Millime' : 'مليم'
    };
    
    const decimalPlaces = ['JOD', 'BHD', 'IQD', 'KWD', 'AED', 'YER'].includes(currency) ? 
        (isEnglish ? 'three' : 'ثلاثة') : 
        (isEnglish ? 'two' : 'اثنين');
    
    const example = ['JOD', 'BHD', 'IQD', 'KWD', 'AED', 'YER'].includes(currency) ? '1000.550' : '1000.55';
    const subunitName = currencySubunits[currency] || (isEnglish ? 'Piaster' : 'قرش');
    
    if (isEnglish) {
        placeholderText.textContent = `Enter amount with ${subunitName} using decimal point (example: ${example})`;
    } else {
        placeholderText.textContent = `أدخل المبلغ مع ${subunitName} باستخدام النقطة (مثال: ${example})`;
    }
} 