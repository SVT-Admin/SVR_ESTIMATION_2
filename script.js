function initStorage() {
    if (!localStorage.getItem('brands')) 
        localStorage.setItem('brands', JSON.stringify([]));
    if (!localStorage.getItem('products')) 
        localStorage.setItem('products', JSON.stringify([]));
    if (!localStorage.getItem('bills')) 
        localStorage.setItem('bills', JSON.stringify([]));
    if (!localStorage.getItem('customers')) 
        localStorage.setItem('customers', JSON.stringify([]));
}

// Call initStorage when the page loads
window.onload = initStorage;

function getCurrentBillNumber() {
    return parseInt(localStorage.getItem('currentBillNumber')) || 1;
}

function incrementBillNumber() {
    const nextNumber = getCurrentBillNumber() + 1;
    localStorage.setItem('currentBillNumber', nextNumber);
    return nextNumber - 1; // Return the current number before increment
}

function loadStaffDropdown() {
    const staffSelect = document.getElementById('staff-select');
    staffSelect.innerHTML = '<option value="">Select Staff</option>'; // Clear existing options

    const staffList = JSON.parse(localStorage.getItem('staff')) || [];
    staffList.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff.id; // Use staff ID as the value
        option.textContent = `${staff.name} (${staff.role})`;
        staffSelect.appendChild(option);
    });
}

function showSection(sectionName) {
    const sections = ['brands', 'products', 'customers', 'billing', 'reports', 'download', 'pending-bills'];
    sections.forEach(section => {
        const sectionElement = document.getElementById(`${section}-section`);
        sectionElement.style.display = section === sectionName ? 'block' : 'none';
    });

    if (sectionName === 'brands') loadBrandsList();
    if (sectionName === 'products') loadProductsList();
    if (sectionName === 'customers') loadCustomersList();
    if (sectionName === 'billing') loadBrandsList();
    if (sectionName === 'reports') generateReport();
    if (sectionName === 'pending-bills') loadAllPendingBills();
}

function addCustomer() {
    const customerName = document.getElementById('customer-name-input').value.trim();
    const customerPhone = document.getElementById('customer-phone-input').value.trim();
    const customerAddress = document.getElementById('customer-address-input').value.trim();

    if (!customerName || !customerPhone || !customerAddress) {
        alert('Please fill all customer details');
        return;
    }

    if (!/^[0-9]{10}$/.test(customerPhone)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }

    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    
    // Check if customer already exists
    const existingCustomer = customers.find(c => 
        c.phone === customerPhone || 
        c.name.toLowerCase() === customerName.toLowerCase()
    );
    
    if (existingCustomer) {
        alert('Customer with this name or phone already exists!');
        return;
    }

    const newCustomer = {
        id: Date.now(),
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        createdDate: new Date().toISOString()
    };

    customers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customers));

    // Clear form
    document.getElementById('customer-name-input').value = '';
    document.getElementById('customer-phone-input').value = '';
    document.getElementById('customer-address-input').value = '';

    loadCustomersList();
    alert('Customer added successfully!');
}

function loadCustomersList() {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    customers.sort((a, b) => a.name.localeCompare(b.name));
    updateCustomersTable(customers);
}

function updateCustomersTable(customers) {
    const tableBody = document.getElementById('customers-table-body');
    tableBody.innerHTML = '';

    if (customers.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td colspan="5" style="text-align: center;">No customers found</td>
        `;
        return;
    }

    customers.forEach(customer => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td style="text-align: center;">${customer.name}</td>
            <td style="text-align: center;">${customer.phone}</td>
            <td style="text-align: center;">${customer.address}</td>
            <td style="text-align: center;">
                <button class="btn btn-success btn-sm" onclick="createEstimateForCustomer(${customer.id})">
                    <i class="icon">📋</i> Estimate
                </button>
                <button class="btn btn-secondary btn-sm" onclick="editCustomer(${customer.id})">
                    <i class="icon">✎</i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${customer.id})">
                    <i class="icon">×</i> Delete
                </button>
            </td>
        `;
    });
}

function searchCustomers() {
    const searchTerm = document.getElementById('customer-search').value.trim().toLowerCase();
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    
    if (!searchTerm) {
        updateCustomersTable(customers);
        return;
    }

    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm) ||
        customer.address.toLowerCase().includes(searchTerm)
    );

    updateCustomersTable(filteredCustomers);
}

function editCustomer(customerId) {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) return;

    const newName = prompt('Enter customer name:', customer.name);
    if (newName === null) return;

    const newPhone = prompt('Enter customer phone:', customer.phone);
    if (newPhone === null) return;

    const newAddress = prompt('Enter customer address:', customer.address);
    if (newAddress === null) return;

    // Validate inputs
    const trimmedName = newName.trim();
    const trimmedPhone = newPhone.trim();
    const trimmedAddress = newAddress.trim();

    if (!trimmedName || !trimmedPhone || !trimmedAddress) {
        alert('All fields are required');
        return;
    }

    if (!/^[0-9]{10}$/.test(trimmedPhone)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }

    // Check for duplicates (excluding current customer)
    const existingCustomer = customers.find(c => 
        c.id !== customerId && 
        (c.phone === trimmedPhone || c.name.toLowerCase() === trimmedName.toLowerCase())
    );

    if (existingCustomer) {
        alert('Customer with this name or phone already exists!');
        return;
    }

    // Update customer
    customer.name = trimmedName;
    customer.phone = trimmedPhone;
    customer.address = trimmedAddress;

    const customerIndex = customers.findIndex(c => c.id === customerId);
    customers[customerIndex] = customer;

    localStorage.setItem('customers', JSON.stringify(customers));
    loadCustomersList();
    alert('Customer updated successfully!');
}

function deleteCustomer(customerId) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const updatedCustomers = customers.filter(c => c.id !== customerId);
    
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    loadCustomersList();
    alert('Customer deleted successfully!');
}

function createEstimateForCustomer(customerId) {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) return;

    // Switch to billing section
    showSection('billing');

    // Auto-fill customer details
    document.getElementById('customer-name').value = customer.name;
    document.getElementById('customer-mobile').value = customer.phone;
    document.getElementById('customer-address').value = customer.address;

    // Scroll to billing section
    document.getElementById('billing-section').scrollIntoView({ behavior: 'smooth' });
}

async function checkAndSendPendingMessages() {
    if (!checkNetworkStatus()) return;

    const pendingMessages = JSON.parse(localStorage.getItem('pendingMessages') || '[]');
    if (pendingMessages.length === 0) return;

    console.log(`Found ${pendingMessages.length} pending messages to send`);
    showNotification(`Attempting to send ${pendingMessages.length} pending messages...`, 'info');

    const successfulMessages = [];
    const failedMessages = [];

    for (const message of pendingMessages) {
        try {
            const success = await sendTelegramMessage(message);
            if (success) {
                successfulMessages.push(message);
            } else {
                failedMessages.push(message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            failedMessages.push(message);
        }
    }

    // Update pending messages to only include failed ones
    localStorage.setItem('pendingMessages', JSON.stringify(failedMessages));

    if (successfulMessages.length > 0) {
        showNotification(`Successfully sent ${successfulMessages.length} pending messages`, 'success');
    }
    if (failedMessages.length > 0) {
        showNotification(`Failed to send ${failedMessages.length} messages. Will retry when connection improves.`, 'error');
    }
}

window.onload = function() {
    initStorage();
    loadStaffDropdown();
    showSection('billing');
    loadBrandsList();
    loadProductsList('');
    loadCustomersList();
    generateReport();
    checkAndSendPendingMessages();
    
    // Add the brand search component
    setTimeout(replaceBrandDropdown, 100);
    
    // Add event listener for toggle brand input
    const toggleBrandBtn = document.getElementById('toggle-brand-btn');
    if (toggleBrandBtn) {
        toggleBrandBtn.addEventListener('click', toggleBrandInput);
    }
};

// Hamburger Navigation JavaScript
const hamburger = document.getElementById('hamburger-btn');
const navSidebar = document.getElementById('nav-sidebar');
const navOverlay = document.getElementById('nav-overlay');

function toggleNav() {
    hamburger.classList.toggle('active');
    navSidebar.classList.toggle('active');
    navOverlay.classList.toggle('active');
}

function closeNav() {
    hamburger.classList.remove('active');
    navSidebar.classList.remove('active');
    navOverlay.classList.remove('active');
}

// Event listeners
hamburger.addEventListener('click', toggleNav);
navOverlay.addEventListener('click', closeNav);

// Close nav when pressing Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeNav();
    }
});

let isManualBrand = false;
let isManualProduct = false;

function toggleBrandInput() {
    isManualBrand = !isManualBrand;
    
    const brandSearchContainer = document.querySelector('.brand-search-container');
    const manualInput = document.getElementById('billing-brand-manual');
    
    if (brandSearchContainer && manualInput) {
        brandSearchContainer.style.display = isManualBrand ? 'none' : 'block';
        manualInput.style.display = isManualBrand ? 'block' : 'none';
        
        // Clear values when switching
        if (isManualBrand) {
            manualInput.value = '';
        } else {
            const brandSearchInput = document.getElementById('brand-search-input');
            if (brandSearchInput) {
                brandSearchInput.value = '';
                brandSearchInput.dataset.brandId = '';
            }
        }
    }
}

function toggleProductInput() {
    const selectElement = document.getElementById('billing-product');
    const manualInput = document.getElementById('billing-product-manual');
    isManualProduct = !isManualProduct;
    
    selectElement.style.display = isManualProduct ? 'none' : 'block';
    manualInput.style.display = isManualProduct ? 'block' : 'none';
    
    // Clear values when switching
    selectElement.value = '';
    manualInput.value = '';
    manualPrice.value = '';
}

function addBrand() {
    const brandNameInput = document.getElementById('brand-name');
    const brandName = brandNameInput.value.trim();
    if (!brandName) {
        alert('Please enter a brand name.');
        return;
    }
    const brands = JSON.parse(localStorage.getItem('brands')) || [];
    const existingBrand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
    if (existingBrand) {
        alert('This brand already exists!');
        return;
    }
    const newBrand = {
        id: Date.now(),
        name: brandName
    };
    brands.push(newBrand);
    localStorage.setItem('brands', JSON.stringify(brands));
    
    brandNameInput.value = '';
    loadBrandsList();
    alert('Brand added successfully!');
}

function editBrand(brandId) {
    const brands = JSON.parse(localStorage.getItem('brands')) || [];
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;
    const newBrandName = prompt('Enter new brand name:', brand.name);
    if (newBrandName === null) return; // User cancelled
    const trimmedName = newBrandName.trim();
    if (!trimmedName) {
        alert('Brand name cannot be empty.');
        return;
    }
    const existingBrand = brands.find(b => 
        b.name.toLowerCase() === trimmedName.toLowerCase() && b.id !== brandId
    );
    if (existingBrand) {
        alert('A brand with this name already exists!');
        return;
    }

    brand.name = trimmedName;
    const brandIndex = brands.findIndex(b => b.id === brandId);
    brands[brandIndex] = brand;
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const updatedProducts = products.map(product => {
        if (product.brandId == brandId) {
            return { ...product };
        }
        return product;
    });
    
    localStorage.setItem('brands', JSON.stringify(brands));
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    loadBrandsList();
    loadProductsList('');
    alert('Brand updated successfully!');
}

function deleteBrand(brandId) {
    if (!confirm('Are you sure you want to delete this brand? This will also delete all associated products.')) return;

    const brands = JSON.parse(localStorage.getItem('brands')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];

    const updatedBrands = brands.filter(b => b.id !== brandId);
    const updatedProducts = products.filter(p => p.brandId != brandId);
    localStorage.setItem('brands', JSON.stringify(updatedBrands));
    localStorage.setItem('products', JSON.stringify(updatedProducts));

    loadBrandsList();
    loadProductsList('');
    alert('Brand and its associated products deleted successfully!');
}

function addProduct() {
    const brandSelect = document.getElementById('product-brand');
    const productName = document.getElementById('product-name').value.trim();
    const brandId = brandSelect.value;

    if (!brandId || !productName) {
        alert('Please fill all product details');
        return;
    }

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const newProduct = {
        id: Date.now(),
        brandId: brandId,
        name: productName
    };

    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));

    document.getElementById('product-name').value = '';
    filterProductsByBrand();
}

function loadBrandsList() {
    try {
        const brands = JSON.parse(localStorage.getItem('brands')) || [];
        // Sort brands alphabetically
        brands.sort((a, b) => a.name.localeCompare(b.name));
        
        const brandSelects = [
            document.getElementById('product-brand')
        ];

        // Clear existing options
        brandSelects.forEach(select => {
            select.innerHTML = '<option value="">Select Brand</option>';
            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand.id;
                option.textContent = brand.name;
                select.appendChild(option);
            });
        });
        updateBrandsTable();
    } catch (error) {
        console.error('Error loading brands:', error);
    }
}

function createBrandSearchComponent() {
    // Create the container
    const container = document.createElement('div');
    container.classList.add('brand-search-container');
    container.style.position = 'relative';
    container.style.width = '100%'; // Make container full width
    container.style.maxWidth = '100%'; // Ensure it doesn't exceed screen width
    container.style.boxSizing = 'border-box'; // Include padding in width calculation
    
    // Create the input element
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'brand-search-input';
    input.classList.add('form-control');
    input.placeholder = 'Type to search brands...';
    input.autocomplete = 'off';
    input.style.width = '100%'; // Make input full width of container
    input.style.boxSizing = 'border-box'; // Include padding in width calculation
    
    // Create the dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'brand-search-dropdown';
    dropdown.classList.add('brand-search-dropdown');
    dropdown.style.display = 'none';
    dropdown.style.position = 'absolute';
    dropdown.style.width = '100%';
    dropdown.style.maxHeight = '200px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.backgroundColor = 'white';
    dropdown.style.border = '1px solid #ced4da';
    dropdown.style.borderRadius = '0 0 4px 4px';
    dropdown.style.zIndex = '1000';
    dropdown.style.top = '100%';
    dropdown.style.left = '0'; // Ensure dropdown aligns with left edge
    
    // Append elements
    container.appendChild(input);
    container.appendChild(dropdown);
    
    // Add event listeners
    input.addEventListener('input', function() {
        filterBrands(this.value);
    });
    
    input.addEventListener('focus', function() {
        if (dropdown.children.length > 0) {
            dropdown.style.display = 'block';
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
    
    return container;
}

function searchBills() {
    const searchTerm = document.getElementById('download-bill-number').value.trim();
    const resultsContainer = document.getElementById('bill-search-results');
    const bills = JSON.parse(localStorage.getItem('bills')) || [];
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    if (!searchTerm) {
        showDownloadMessage('Please enter a bill number to search', 'error');
        return;
    }
    
    // Find matching bills - search as you type approach (partial matches)
    const matchingBills = bills.filter(bill => 
        bill.billNumber.toString().includes(searchTerm)
    );
    
    if (matchingBills.length === 0) {
        resultsContainer.innerHTML = '<div class="alert alert-warning">No matching bills found</div>';
        return;
    }
    
    // Sort by most recent first
    matchingBills.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create table to display results
    const table = document.createElement('table');
    table.className = 'table table-bordered mt-3';
    table.innerHTML = `
        <thead>
            <tr>
                <th style="text-align: center;">Bill No</th>
                <th style="text-align: center;">Date</th>
                <th style="text-align: center;">Customer</th>
                <th style="text-align: center;">Amount</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center;">Action</th>
            </tr>
        </thead>
        <tbody>
            ${matchingBills.map(bill => `
                <tr ${bill.status === 'CANCELLED' ? 'class="cancelled-bill"' : ''}>
                    <td style="text-align: center;">${bill.billNumber}</td>
                    <td style="text-align: center;">${new Date(bill.date).toLocaleDateString()}</td>
                    <td style="text-align: center;">${bill.customer?.name || 'N/A'}</td>
                    <td style="text-align: center;">₹${bill.totalAmount.toFixed(2)}</td>
                    <td style="text-align: center;">
                        <span class="status-badge ${bill.status.toLowerCase()}">${bill.status}</span>
                    </td>
                    <td style="text-align: center;">
                        <button class="btn btn-primary btn-sm" onclick="generateProfessionalBillPDF(${JSON.stringify(bill).replace(/"/g, '&quot;')})">
                            <i class="icon">↓</i> Download
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    resultsContainer.appendChild(table);
    showDownloadMessage(`Found ${matchingBills.length} matching bills`, 'success');
}



function filterBrands(searchText) {
    const brands = JSON.parse(localStorage.getItem('brands')) || [];
    const dropdown = document.getElementById('brand-search-dropdown');
    
    // Clear previous results
    dropdown.innerHTML = '';
    
    // Sort brands alphabetically
    brands.sort((a, b) => a.name.localeCompare(b.name));
    
    // Filter brands based on search text
    const filteredBrands = searchText 
        ? brands.filter(brand => brand.name.toLowerCase().includes(searchText.toLowerCase())) 
        : brands;
    
    if (filteredBrands.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    // Add filtered brands to dropdown
    filteredBrands.forEach(brand => {
        const item = document.createElement('div');
        item.classList.add('brand-search-item');
        item.style.padding = '8px 12px';
        item.style.cursor = 'pointer';
        item.style.borderBottom = '1px solid #e9ecef';
        item.textContent = brand.name;
        
        item.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        item.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'white';
        });
        
        item.addEventListener('click', function() {
            selectBrand(brand.id, brand.name);
            dropdown.style.display = 'none';
        });
        
        dropdown.appendChild(item);
    });
    
    dropdown.style.display = 'block';
}

function selectBrand(brandId, brandName) {
    const input = document.getElementById('brand-search-input');
    input.value = brandName;
    input.dataset.brandId = brandId;
    
    // Update product dropdown based on selected brand
    updateProductList(brandId);
}

// Replace the old dropdown-based brand selection
function replaceBrandDropdown() {
    const oldBrandSelect = document.getElementById('billing-brand');
    
    if (!oldBrandSelect) return;
    
    const parentElement = oldBrandSelect.parentElement;
    const searchComponent = createBrandSearchComponent();
    
    // Replace the old dropdown with the new search component
    parentElement.replaceChild(searchComponent, oldBrandSelect);
    
    // Load initial brands
    const brands = JSON.parse(localStorage.getItem('brands')) || [];
    brands.sort((a, b) => a.name.localeCompare(b.name));
}

function updateBrandsTable() {
    const brands = JSON.parse(localStorage.getItem('brands')) || [];
    // Sort brands alphabetically by name
    brands.sort((a, b) => a.name.localeCompare(b.name));
    
    const tableBody = document.getElementById('brands-table-body');
    tableBody.innerHTML = '';

    brands.forEach(brand => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td style="text-align: center;">${brand.name}</td>
            <td style="text-align: center;">
                <button class="btn btn-secondary" onclick="editBrand(${brand.id})">
                    <i class="icon">✎</i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteBrand(${brand.id})">
                    <i class="icon">×</i> Delete
                </button>
            </td>
        `;
    });
}


function loadProductsList(filterBrandId = '') {
    const products = JSON.parse(localStorage.getItem('products'));
    const brands = JSON.parse(localStorage.getItem('brands'));
    const tableBody = document.getElementById('products-table-body');
    
    tableBody.innerHTML = '';

    const filteredProducts = filterBrandId 
        ? products.filter(product => product.brandId == filterBrandId)
        : products;
    
    if (filteredProducts.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td colspan="3" style="text-align: center;">
                ${filterBrandId ? 'No products found for this brand' : 'No products available'}
            </td>
        `;
        return;
    }

    filteredProducts.forEach(product => {
        const brand = brands.find(b => b.id == product.brandId);
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td style="text-align: center;">${brand ? brand.name : 'Unknown'}</td>
            <td style="text-align: center;">${product.name}</td>
            <td style="text-align: center;">
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">
                    <i class="icon">×</i> Delete
                </button>
            </td>
        `;
    });
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this Product?')) return;

    const products = JSON.parse(localStorage.getItem('products'));
    const filteredProducts = products.filter(p => p.id != productId);
    localStorage.setItem('products', JSON.stringify(filteredProducts));

    loadProductsList();
    filterProductsByBrand();
}

// Billing Section
function updateProductList(brandId) {
    const productSelect = document.getElementById('billing-product');
    const products = JSON.parse(localStorage.getItem('products')) || [];

    productSelect.innerHTML = '<option value="">Select Product</option>';
    products.filter(p => p.brandId == brandId).forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        productSelect.appendChild(option);
    });
}

function filterProductsByBrand() {
    const selectedBrandId = document.getElementById('product-brand').value;
    loadProductsList(selectedBrandId);
}

function validateCustomerInfo() {
    const customerName = document.getElementById('customer-name').value.trim();
    const customerMobile = document.getElementById('customer-mobile').value.trim();
    const customerAddress = document.getElementById('customer-address').value.trim();

    if (!customerName || !customerMobile || !customerAddress) {
        alert('Please fill in all customer details');
        return null;
    }

    if (!/^[0-9]{10}$/.test(customerMobile)) {
        alert('Please enter a valid 10-digit mobile number');
        return null;
    }

    return {
        name: customerName,
        mobile: customerMobile,
        address: customerAddress
    };
}

let currentBillItems = [];

function addProductToBill() {
    let brandName, productName, brandId;
    const quantity = parseFloat(document.getElementById('billing-quantity').value);
    const units = parseFloat(document.getElementById('billing-units').value);
    const price = parseFloat(document.getElementById('billing-manual-price').value);

    if (!quantity || quantity <= 0 || !price || price <= 0 || !units || units <= 0) {
        alert('Please enter valid quantity and price');
        return;
    }

    // Handle brand selection/entry
    if (isManualBrand) {
        brandName = document.getElementById('billing-brand-manual').value.trim();
        if (!brandName) {
            alert('Please enter a brand name');
            return;
        }
        // Save new brand if it doesn't exist
        const brands = JSON.parse(localStorage.getItem('brands')) || [];
        let brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
        if (!brand) {
            brand = {
                id: Date.now(),
                name: brandName,
                description: ''
            };
            brands.push(brand);
            localStorage.setItem('brands', JSON.stringify(brands));
        }
        brandId = brand.id;
    } else {
        // Get brand from the search input
        const brandSearchInput = document.getElementById('brand-search-input');
        if (!brandSearchInput.dataset.brandId) {
            alert('Please select a brand');
            return;
        }
        brandId = brandSearchInput.dataset.brandId;
        const brands = JSON.parse(localStorage.getItem('brands')) || [];
        const brand = brands.find(b => b.id == brandId);
        brandName = brand.name;
    }

    // Rest of the function remains the same...
    // Handle product selection/entry
    if (isManualProduct) {
        productName = document.getElementById('billing-product-manual').value.trim();
        if (!productName) {
            alert('Please enter product name');
            return;
        }
        // Save new product if it doesn't exist
        const products = JSON.parse(localStorage.getItem('products')) || [];
        let product = products.find(p => 
            p.brandId == brandId && 
            p.name.toLowerCase() === productName.toLowerCase()
        );
        if (!product) {
            product = {
                id: Date.now(),
                brandId: brandId,
                name: productName
            };
            products.push(product);
            localStorage.setItem('products', JSON.stringify(products));
        }
    } else {
        const productSelect = document.getElementById('billing-product');
        if (!productSelect.value) {
            alert('Please select a product');
            return;
        }
        const products = JSON.parse(localStorage.getItem('products'));
        const product = products.find(p => p.id == productSelect.value);
        productName = product.name;
    }

    const billItem = {
        productId: isManualProduct ? `manual-${Date.now()}` : document.getElementById('billing-product').value,
        brandName: brandName,
        productName: productName,
        quantity: quantity,
        units: units,
        price: price
    };

    currentBillItems.push(billItem);
    updateBillItemsTable();
    loadBrandsList();
    
    // Clear inputs
    document.getElementById('billing-quantity').value = '';
    document.getElementById('billing-units').value = '';
    document.getElementById('billing-manual-price').value = '';
    if (isManualProduct) {
        document.getElementById('billing-product-manual').value = '';
    }
    if (isManualBrand) {
        document.getElementById('billing-brand-manual').value = '';
    } else {
        const brandSearchInput = document.getElementById('brand-search-input');
        if (brandSearchInput) {
            brandSearchInput.value = '';
            brandSearchInput.dataset.brandId = '';
        }
    }
}

function updateProductPrice() {
    const productId = document.getElementById('billing-product').value;
    if (!productId) return;

    const products = JSON.parse(localStorage.getItem('products'));
    const product = products.find(p => p.id == productId);
}

function updateBillItemsTable() {
    const tableBody = document.getElementById('bill-items-body');
    tableBody.innerHTML = '';
    let subtotal = 0;

    currentBillItems.forEach((item, index) => {
        const itemTotal = item.quantity * item.price;
        subtotal += itemTotal;

        const row = tableBody.insertRow();
        row.innerHTML = `
            <td style="text-align: center;"><strong>${item.brandName}</strong> - ${item.productName}</td>
            <td style="text-align: center;">${item.quantity} KG</td>
            <td style="text-align: center;">${item.units}</td>
            <td style="text-align: center;">₹${item.price.toFixed(2)}</td>
            <td style="text-align: center;">₹${itemTotal.toFixed(2)}</td>
            <td style="text-align: center;">
                <button class="btn btn-danger" onclick="removeFromBill(${index})">Remove</button>
            </td>
        `;
    });

    updateBillTotals(subtotal);
}

function fillFullAmount() {
    const grandTotal = parseFloat(document.getElementById('bill-total-amount').textContent) || 0;
    document.getElementById('received-amount').value = grandTotal.toFixed(2);
    updateBillTotals();
}

function updateBillTotals(subtotal = null) {
    if (subtotal === null) {
        subtotal = currentBillItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    }

    const transportCharges = parseFloat(document.getElementById('transport-charges').value) || 0;
    const extraCharges = parseFloat(document.getElementById('extra-charges').value) || 0;
    const receivedAmount = parseFloat(document.getElementById('received-amount').value) || 0;
    
    const grandTotal = subtotal + transportCharges + extraCharges;
    const balanceAmount = grandTotal - receivedAmount;

    document.getElementById('bill-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('transport-amount').textContent = transportCharges.toFixed(2);
    document.getElementById('extra-amount').textContent = extraCharges.toFixed(2);
    document.getElementById('bill-total-amount').textContent = grandTotal.toFixed(2);
    document.getElementById('balance-amount').textContent = balanceAmount.toFixed(2);
}

function removeFromBill(index) {
    currentBillItems.splice(index, 1);
    updateBillItemsTable();
}

function formatBillDetailsForTelegram(bill) {
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();
    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString();

    let message = `🧾 *NEW ESTIMATE GENERATED*\n\n`;
    message += `Estimate No: *${bill.billNumber}*\n`;
    message += `Date: ${formatDate(bill.date)}\n`;
    message += `Time: ${formatTime(bill.date)}\n\n`;

    // Customer Details
    message += `*CUSTOMER DETAILS*\n`;
    message += `Name: ${bill.customer.name}\n`;
    message += `Mobile: ${bill.customer.mobile}\n`;
    message += `Address: ${bill.customer.address}\n\n`;

    // Staff Details
    message += `*STAFF DETAILS*\n`;
    message += `Name: ${bill.staff.name}\n`;
    message += `Role: ${bill.staff.role}\n\n`;

    // Items
    message += `*ITEMS*\n`;
    bill.items.forEach((item, index) => {
        message += `${index + 1}. ${item.brandName} - ${item.productName}\n`;
        message += `   Count (Units): ${item.units}\n`;
        message += `   Qty: ${item.quantity}KG x ₹${item.price}/KG = ₹${(item.quantity * item.price).toFixed(2)}\n`;
    });

    // Bill Summary
    message += `\n*ESTIMATE SUMMARY*\n`;
    message += `Subtotal: ₹${bill.subtotal.toFixed(2)}\n`;
    if (bill.transportCharges) message += `Transport: ₹${bill.transportCharges.toFixed(2)}\n`;
    if (bill.extraCharges) message += `Extra Charges: ₹${bill.extraCharges.toFixed(2)}\n`;
    message += `*TOTAL AMOUNT: ₹${bill.totalAmount.toFixed(2)}*\n`;
    message += `Received Amount: ₹${bill.receivedAmount.toFixed(2)}\n`;
    message += `*BALANCE AMOUNT: ₹${bill.balanceAmount.toFixed(2)}*\n`;
    message += `*Payment Status: ${bill.status}*`;

    return encodeURIComponent(message);
}

function checkNetworkStatus() {
    return navigator.onLine;
}

// Show notification message
function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${type === 'error' ? '#ff4444' : '#44bb44'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-in';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

async function sendTelegramMessage(message) {
    if (!checkNetworkStatus()) {
        console.log('No network connection, storing message for later');
        const pendingMessages = JSON.parse(localStorage.getItem('pendingMessages') || '[]');
        if (!pendingMessages.includes(message)) {
            pendingMessages.push(message);
            localStorage.setItem('pendingMessages', JSON.stringify(pendingMessages));
        }
        return false;
    }

    const botToken = '7520476821:AAEjzldN9I0ACrdCIkexT2O7D5TstFjgWQw';
    const chatId = '-1002402346984';
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=Markdown`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.ok) {
            throw new Error(`Telegram API Error: ${data.description}`);
        }
        return true;
    } catch (error) {
        console.error('Failed to send message:', error);
        const pendingMessages = JSON.parse(localStorage.getItem('pendingMessages') || '[]');
        if (!pendingMessages.includes(message)) {
            pendingMessages.push(message);
            localStorage.setItem('pendingMessages', JSON.stringify(pendingMessages));
        }
        showNotification('Message queued for retry when connection is restored', 'info');
        return false;
    }
}

window.addEventListener('online', () => {
    showNotification('Network connection restored', 'success');
    checkAndSendPendingMessages();
});

window.addEventListener('offline', () => {
    showNotification('Network connection lost. Messages will be sent when connection is restored.', 'error');
});

const styleSheet = document.createElement('style');
styleSheet.textContent = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;
document.head.appendChild(styleSheet);

function generateBill() {
    if (currentBillItems.length === 0) {
        alert('Please add items to the bill');
        return;
    }

    const customerInfo = validateCustomerInfo();
    if (!customerInfo) {
        return;
    }

    const staffId = document.getElementById('staff-select').value;
    if (!staffId) {
        alert('Please select a staff member');
        return;
    }

    const staffList = JSON.parse(localStorage.getItem('staff')) || [];
    const staff = staffList.find(s => s.id == staffId);

    const billNumber = incrementBillNumber();
    const subtotal = currentBillItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const transportCharges = parseFloat(document.getElementById('transport-charges').value) || 0;
    const extraCharges = parseFloat(document.getElementById('extra-charges').value) || 0;
    
    const grandTotal = subtotal + transportCharges + extraCharges;

    // Replace this part in generateBill function:
    const receivedAmount = parseFloat(document.getElementById('received-amount').value) || 0;
    const balanceAmount = grandTotal - receivedAmount;

    const bill = {
        id: Date.now(),
        billNumber: billNumber,
        date: new Date().toISOString(),
        customer: customerInfo,
        staff: staff,
        items: currentBillItems.map(item => ({
            ...item,
            itemTotal: item.quantity * item.price
        })),
        subtotal: subtotal,
        transportCharges: transportCharges,
        extraCharges: extraCharges,
        totalAmount: grandTotal,
        receivedAmount: receivedAmount,
        balanceAmount: balanceAmount,
        status: balanceAmount > 0 ? 'PENDING' : 'PAID'
    };

    const bills = JSON.parse(localStorage.getItem('bills')) || [];
    bills.push(bill);
    localStorage.setItem('bills', JSON.stringify(bills));

    // Send bill details to Telegram
    const telegramMessage = formatBillDetailsForTelegram(bill);
    sendTelegramMessage(telegramMessage);

    // Clear form
    currentBillItems = [];
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-mobile').value = '';
    document.getElementById('customer-address').value = '';
    document.getElementById('staff-select').value = '';
    document.getElementById('transport-charges').value = '';
    document.getElementById('extra-charges').value = '';
    document.getElementById('received-amount').value = '';

    updateBillItemsTable();

    alert(`Estimate No. ${billNumber} Generated Successfully!`);
}

function cancelBill(billId) {
    if (!confirm('Are you sure you want to cancel this Estimation?')) return;

    const bills = JSON.parse(localStorage.getItem('bills')) || [];
    const billIndex = bills.findIndex(b => b.id === billId);
    
    if (billIndex !== -1) {
        bills[billIndex].status = 'CANCELLED';
        bills[billIndex].cancellationDate = new Date().toISOString();
        localStorage.setItem('bills', JSON.stringify(bills));

        const cancelMessage = `❌ *ESTIMATE CANCELLED*\n\n` +
            `Estimate No: *${bills[billIndex].billNumber}*\n` +
            `Customer: ${bills[billIndex].customer.name}\n` +
            `Total Amount: ₹${bills[billIndex].totalAmount.toFixed(2)}\n` +
            `Received Amount: ₹${bills[billIndex].receivedAmount.toFixed(2)}\n` +
            `BALANCE AMOUNT: ₹${bills[billIndex].balanceAmount.toFixed(2)}\n` +
            `Cancelled on: ${new Date().toLocaleString()}`;

        sendTelegramMessage(encodeURIComponent(cancelMessage));

        generateReport();
    }
}

function generateProfessionalBillPDF(bill) {
    const template = `
    <div id="bill-pdf-content" style="padding: 20px; font-family: 'Arial', sans-serif; width: 210mm; margin: auto;">
        <!-- Header Section -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; margin: 0; font-weight: bold; color: #000;">SRI VINAYAGA RINGS</h1>
            <p style="margin: 0px 0; font-size: 14px;">No. 12/281, Puthantharuvai Road</p>
            <p style="margin: 0px 0; font-size: 14px;">Panaivilai, Thisayanvilai, 628656</p>
            <p style="margin: 0px 0; font-size: 14px;">Phone: +91 9710812345, +91 7598721234</p>
            <p style="margin: 0px 0; font-size: 14px;">Email: admin@srivinayagatraders.com</p>
        </div>

        <h1 STYLE="font-size: 24px; text-align: center;">ESTIMATE</h1>

        <!-- Bill Info Section -->
        <div style="margin-bottom: 10px; padding-bottom: 2;">
            <table style="width: 100%; font-size: 14px;">
                <tr>
                    <td style="width: 30%; text-align: center; border: 1px solid #535353;">
                        <strong>Estimate No:</strong> ${bill.billNumber}
                    </td>
                    <td style="width: 35%; text-align: center; border: 1px solid #535353;">
                        <strong>Date:</strong> ${new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td style="width: 35%; text-align: center; border: 1px solid #535353;">
                        <strong>Time:</strong> ${new Date(bill.date).toLocaleTimeString()}
                    </td>
                </tr>                   
            </table>
        </div>

        <!-- Customer & Staff Details -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
            <div style="width: 100%; border: 1px solid #ffffff; padding: 2px; border-radius: 5px;">
                <h3 style="margin: 0 0 2px 0; font-size: 16px; border-bottom: 1px solid #ffffff; padding-bottom: 2px;">Customer Details</h3>
                <p style="margin: 1px 0;"><strong>Name:</strong> ${bill.customer.name}</p>
                <p style="margin: 1px 0;"><strong>Mobile:</strong> ${bill.customer.mobile}</p>
                <p style="margin: 1px 0;"><strong>Address:</strong> ${bill.customer.address}</p>
            </div>
        </div>

        <!-- Products Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px; font-size: 14px;">
            <thead>
                <tr style="background-color: #ffffff;">
                    <th style="border: 1px solid #000000; padding: 3px; text-align: center;">S.No</th>
                    <th style="border: 1px solid #000000; padding: 3px; text-align: center;">Brand/Product</th>
                    <th style="border: 1px solid #000000; padding: 3px; text-align: center;">Quantity (KG)</th>
                    <th style="border: 1px solid #000000; padding: 3px; text-align: center;">Units</th>
                    <th style="border: 1px solid #000000; padding: 3px; text-align: center;">Price/KG</th>
                    <th style="border: 1px solid #000000; padding: 3px; text-align: center;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${bill.items.map((item, index) => `
                    <tr>
                        <td style="border: 1px solid #000000; padding: 1px; text-align: center;">${index + 1}</td>
                        <td style="border: 1px solid #000000; padding: 1px; text-align: center;">${item.brandName}-${item.productName}</td>
                        <td style="border: 1px solid #000000; padding: 1px; text-align: center;">${item.quantity}</td>
                        <td style="border: 1px solid #000000; padding: 1px; text-align: center;">${item.units}</td>
                        <td style="border: 1px solid #000000; padding: 1px; text-align: center;">₹${item.price.toFixed(2)}</td>
                        <td style="border: 1px solid #000000; padding: 1px; text-align: center;">₹${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Bill Summary -->
        <div style="width: 100%; display: flex; justify-content: flex-end; margin-bottom: 15px; font-size: 14px;">
            <table style="width: 300px; border-collapse: collapse;">
                <tr>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;"><strong>Sub Total</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;">₹${bill.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;"><strong>Transport Charges</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;">₹${(bill.transportCharges || 0).toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;"><strong>Extra Charges</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;">₹${(bill.extraCharges || 0).toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;"><strong>Total Amount</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;"><strong>₹${bill.totalAmount.toFixed(2)}</strong></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;"><strong>Received Amount</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;">₹${bill.receivedAmount.toFixed(2)}</td>
                </tr>
                <tr style="background-color: ${bill.balanceAmount > 0 ? '#ffebee' : '#e8f5e8'};">
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;"><strong>Balance Amount</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;"><strong>₹${bill.balanceAmount.toFixed(2)}</strong></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;"><strong>Payment Status</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 2px 0;"><strong>${bill.status}</strong></td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div style="margin-top: 20px; font-size: 14px;">
            <div style="float: left; width: 50%;">
                <p><strong>Terms & Conditions:</strong></p>
                <ol style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                    <li>This item is not for sale.</li>
                    <li>The price is for estimation purpose only.</li>
                    <li>GST included.</li>
                </ol>
            </div>
            <div style="float: right; width: 200px; text-align: center;">
                <div style="margin-bottom: 40px;">
                    <p style="margin-bottom: 50px;"></p>
                    <p style="margin: 0;"><strong>Authorized Signature</strong></p>
                </div>
            </div>
        </div>
    </div>
    `;

    // Create temporary container
    const container = document.createElement('div');
    container.innerHTML = template;
    document.body.appendChild(container);

    // PDF options
    const opt = {
        filename: `Bill-${bill.billNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait'
        },
        margin: [10, 0, 10, 0]
    };

    // Generate PDF
    html2pdf().from(container).set(opt).save()
        .then(() => {
            document.body.removeChild(container);
        });
}

function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const bills = JSON.parse(localStorage.getItem('bills')) || [];

    // Get filtered bills based on selected date range
    let filteredBills = getFilteredBills(bills, reportType, startDate, endDate);
    filteredBills.sort((a, b) => new Date(b.date) - new Date(a.date));

    const filteredActiveBills = filteredBills.filter(bill =>
        ['ACTIVE', 'PAID', 'PENDING'].includes(bill.status)
    );

    const originalBills = filteredActiveBills.filter(bill => bill.type !== 'BALANCE_PAYMENT');
    const balancePayments = filteredActiveBills.filter(bill => bill.type === 'BALANCE_PAYMENT');

    const summaryTotals = originalBills.reduce((acc, bill) => ({
        billCount: acc.billCount + 1,
        totalAmount: acc.totalAmount + (bill.totalAmount || 0),
        subtotal: acc.subtotal + ((bill.totalAmount || 0) - (bill.balanceAmount || 0)), // totalAmount - balanceAmount
        transportCharges: acc.transportCharges + (bill.transportCharges || 0),
        extraCharges: acc.extraCharges + (bill.extraCharges || 0)
    }), {
        billCount: 0, totalAmount: 0, subtotal: 0,
        transportCharges: 0, extraCharges: 0
    });

    const totalBillCount = summaryTotals.billCount + balancePayments.length;
    const dateRangeText = getDateRangeText(reportType, startDate, endDate);

    document.getElementById('full-summary').innerHTML = `
        <h3>Summary - ${dateRangeText}</h3>
        <p>Total Active Estimates: ${summaryTotals.billCount} Original Bills${balancePayments.length > 0 ? ` + ${balancePayments.length} Balance Payments` : ''}</p>
        <p>Subtotal (Original Bills): ₹${summaryTotals.subtotal.toFixed(2)}</p>
        <p>Transport Charges: ₹${(summaryTotals.transportCharges || 0).toFixed(2)}</p>
        <p>Extra Charges: ₹${(summaryTotals.extraCharges || 0).toFixed(2)}</p>
    `;

    updateReportTable(filteredBills);
}

function getFilteredBills(bills, reportType, startDate, endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch(reportType) {
        case 'daily':
            return bills.filter(bill => {
                const billDate = new Date(bill.date);
                billDate.setHours(0, 0, 0, 0);
                return billDate.getTime() === today.getTime();
            });

        case 'weekly':
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);
            return bills.filter(bill => {
                const billDate = new Date(bill.date);
                return billDate >= oneWeekAgo && billDate <= today;
            });

        case 'monthly':
            const oneMonthAgo = new Date(today);
            oneMonthAgo.setMonth(today.getMonth() - 1);
            return bills.filter(bill => {
                const billDate = new Date(bill.date);
                return billDate >= oneMonthAgo && billDate <= today;
            });

        case 'custom':
            if (startDate && endDate) {
                const startDateTime = new Date(startDate);
                startDateTime.setHours(0, 0, 0, 0);
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);
                return bills.filter(bill => {
                    const billDate = new Date(bill.date);
                    return billDate >= startDateTime && billDate <= endDateTime;
                });
            }
            return bills;

        default:
            return bills;
    }
}

function getDateRangeText(reportType, startDate, endDate) {
    const today = new Date();
    
    switch(reportType) {
        case 'daily':
            return `Daily Report (${today.toLocaleDateString()})`;
            
        case 'weekly':
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);
            return `Weekly Report (${oneWeekAgo.toLocaleDateString()} - ${today.toLocaleDateString()})`;
            
        case 'monthly':
            const oneMonthAgo = new Date(today);
            oneMonthAgo.setMonth(today.getMonth() - 1);
            return `Monthly Report (${oneMonthAgo.toLocaleDateString()} - ${today.toLocaleDateString()})`;
            
        case 'custom':
            if (startDate && endDate) {
                return `Custom Report (${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()})`;
            }
            return 'All Time Report';
            
        default:
            return 'All Time Report';
    }
}

function getBillDetailsHTML(bill) {
    return `
        <h3>Estimate No.: ${bill.billNumber}</h3>
        <p>Date: ${new Date(bill.date).toLocaleString()}</p>
        <div class="status-container">
            <p><strong>Status:</strong> 
                <span class="status-badge ${bill.status.toLowerCase()}">${bill.status}</span>
                ${bill.status === 'CANCELLED' ? 
                    `<span class="cancelled-info">(Cancelled on ${new Date(bill.cancellationDate).toLocaleDateString()})</span>` 
                    : ''}
            </p>
        </div>
        
        <div class="customer-details">
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> ${bill.customer?.name || 'N/A'}</p>
            <p><strong>Mobile:</strong> ${bill.customer?.mobile || 'N/A'}</p>
            <p><strong>Address:</strong> ${bill.customer?.address || 'N/A'}</p>
        </div>

        <div class="staff-details">
            <h4>Staff Information</h4>
            <p><strong>Staff:</strong> ${bill.staff?.name || 'N/A'} (${bill.staff?.role || 'N/A'})</p>
        </div>

        <table style="width: 100%; margin-top: 10px;">
            <thead>
                <tr>
                    <th style="text-align: center;">Brand/Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: center;">Units</th>
                    <th style="text-align: center;">Price/KG</th>
                    <th style="text-align: center;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${bill.items.map(item => `
                    <tr>
                        <td style="text-align: center;">${item.brandName} - ${item.productName}</td>
                        <td style="text-align: center;">${item.quantity} KG</td>
                        <td style="text-align: center;">${item.units}</td>
                        <td style="text-align: center;">₹${item.price.toFixed(2)}</td>
                        <td style="text-align: center;">₹${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4" style="text-align: right;"><strong>Subtotal:</strong></td>
                    <td style="text-align: center;"><b>₹${bill.subtotal.toFixed(2)}</b></td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;"><strong>Transport Charges:</strong></td>
                    <td style="text-align: center;"><b>₹${(bill.transportCharges || 0).toFixed(2)}</b></td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;"><strong>Extra Charges:</strong></td>
                    <td style="text-align: center;"><b>₹${(bill.extraCharges || 0).toFixed(2)}</b></td>
                </tr>
                <tr class="total-amount">
                    <td colspan="4" style="text-align: right;"><strong>Total Amount:</strong></td>
                    <td style="text-align: center;"><b>₹${bill.totalAmount.toFixed(2)}</b></td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;"><strong>Received Amount:</strong></td>
                    <td style="text-align: center;"><b>₹${(bill.receivedAmount || 0).toFixed(2)}</b></td>
                </tr>
                <tr style="background-color: ${(bill.balanceAmount || 0) > 0 ? '#ffebee' : '#e8f5e8'};">
                    <td colspan="4" style="text-align: right;"><strong>Balance Amount:</strong></td>
                    <td style="text-align: center;"><b>₹${(bill.balanceAmount || 0).toFixed(2)}</b></td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;"><strong>Payment Status:</strong></td>
                    <td style="text-align: center;"><span class="status-badge ${(bill.status || 'active').toLowerCase()}"><b>${bill.status || 'ACTIVE'}</b></span></td>
                </tr>
            </tfoot>
        </table>
    `;
}

function downloadBillByNumber() {
    searchBills();
}

function showDownloadMessage(message, type = 'error') {
    const messageArea = document.getElementById('download-message');
    messageArea.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    
    // Clear message after 3 seconds
    setTimeout(() => {
        messageArea.innerHTML = '';
    }, 3000);
}

// Update your updateReportTable function to handle balance payment records
function updateReportTable(filteredBills) {
    const reportTableBody = document.getElementById('report-table-body');
    reportTableBody.innerHTML = '';

    const reportTable = document.getElementById('report-table');
    reportTable.querySelector('thead').innerHTML = `
        <tr>
            <th style="text-align: center;">Bill Number</th>
            <th style="text-align: center;">Type</th>
            <th style="text-align: center;">Customer Name</th>
            <th style="text-align: center;">Total Amount</th>
            <th style="text-align: center;">Balance Amount</th>
            <th style="text-align: center;">Status</th>
            <th style="text-align: center;">Action</th>
        </tr>
    `;

    filteredBills.forEach(bill => {
        const row = reportTableBody.insertRow();
        const balanceAmount = bill.balanceAmount || 0;
        const isPending = balanceAmount > 0;
        const statusClass = bill.status === 'CANCELLED' ? 'cancelled-bill' : (isPending ? 'pending-bill' : '');
        const billType = bill.type === 'BALANCE_PAYMENT' ? 'Balance Payment' : 'Original Bill';
        
        row.className = statusClass;
        row.innerHTML = `
            <td style="text-align: center;"><b>${bill.billNumber}</b></td>
            <td style="text-align: center;"><b>${billType}</b></td>
            <td style="text-align: center;"><b>${bill.customer?.name || 'N/A'}</b></td>
            <td style="text-align: center;"><b>₹${bill.totalAmount.toFixed(2)}</b></td>
            <td style="text-align: center; ${isPending ? 'color: #d32f2f; font-weight: bold;' : ''}">
                <b>₹${balanceAmount.toFixed(2)}</b>
            </td>
            <td style="text-align: center;"><span class="status-badge ${(bill.status || 'active').toLowerCase()}">${bill.status || 'ACTIVE'}</span></td>
            <td style="text-align: center;">
                ${bill.status === 'ACTIVE' || bill.status === 'PAID' || bill.status === 'PENDING' ? 
                    (bill.type === 'BALANCE_PAYMENT' ? 
                        `<button class="btn btn-primary btn-sm" onclick="generateBalancePaymentPDF(${JSON.stringify(bill).replace(/"/g, '&quot;')})">
                            <i class="icon">↓</i> Download Receipt
                        </button>` :
                        `<button class="btn btn-danger" onclick="cancelBill(${bill.id})">Cancel</button>`) : 
                    `<span class="cancelled-date">Cancelled on ${new Date(bill.cancellationDate).toLocaleDateString()}</span>`
                }
            </td>
        `;
        
        const detailsCells = row.getElementsByTagName('td');
        for (let i = 0; i < detailsCells.length - 1; i++) {
            detailsCells[i].onclick = () => {
                // Remove any existing expanded details rows
                const existingDetailsRow = reportTableBody.querySelector('.bill-details-row');
                if (existingDetailsRow) {
                    if (existingDetailsRow.dataset.billId === bill.id.toString()) {
                        // If clicking the same bill, remove the details
                        existingDetailsRow.remove();
                        return;
                    }
                    existingDetailsRow.remove();
                }

                // Create a new row for bill details
                const detailsRow = reportTableBody.insertRow(row.rowIndex);
                detailsRow.classList.add('bill-details-row');
                detailsRow.dataset.billId = bill.id;
                
                const detailsCell = detailsRow.insertCell();
                detailsCell.colSpan = 7; // Update column span to match the total number of columns
                detailsCell.innerHTML = `
                    <div style="margin-top: 15px; padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
                        ${bill.type === 'BALANCE_PAYMENT' ? getBalancePaymentDetailsHTML(bill) : getBillDetailsHTML(bill)}
                    </div>
                `;
            };
        }
    });
}

// Add this new function to display balance payment details
function getBalancePaymentDetailsHTML(payment) {
    return `
        <h3>Balance Payment Receipt: ${payment.billNumber}</h3>
        <p>Original Bill No.: ${payment.originalBillNumber}</p>
        <p>Original Date: ${new Date(payment.originalBillDate).toLocaleDateString()}</p>
        <p>Payment Date: ${new Date(payment.paymentDate).toLocaleString()}</p>
        <div class="status-container">
            <p><strong>Status:</strong> 
                <span class="status-badge ${payment.status.toLowerCase()}">${payment.status}</span>
            </p>
        </div>
        
        <div class="customer-details">
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> ${payment.customer?.name || 'N/A'}</p>
            <p><strong>Mobile:</strong> ${payment.customer?.mobile || 'N/A'}</p>
            <p><strong>Address:</strong> ${payment.customer?.address || 'N/A'}</p>
        </div>

        <div class="payment-summary">
            <h4>Payment Summary</h4>
            <table style="width: 100%; margin-top: 10px;">
                <tr>
                    <td style="text-align: right; padding: 5px;"><strong>Original Bill Amount:</strong></td>
                    <td style="text-align: center; padding: 5px;"><b>₹${payment.totalAmount.toFixed(2)}</b></td>
                </tr>
                <tr>
                    <td style="text-align: right; padding: 5px;"><strong>Previously Received:</strong></td>
                    <td style="text-align: center; padding: 5px;"><b>₹${payment.originalReceivedAmount.toFixed(2)}</b></td>
                </tr>
                <tr style="background-color: #e8f5e8;">
                    <td style="text-align: right; padding: 5px;"><strong>Balance Payment (Today):</strong></td>
                    <td style="text-align: center; padding: 5px;"><b>₹${payment.balancePaymentAmount.toFixed(2)}</b></td>
                </tr>
                <tr>
                    <td style="text-align: right; padding: 5px;"><strong>Total Received Amount:</strong></td>
                    <td style="text-align: center; padding: 5px;"><b>₹${payment.receivedAmount.toFixed(2)}</b></td>
                </tr>
                <tr style="background-color: ${payment.balanceAmount > 0 ? '#ffebee' : '#e8f5e8'};">
                    <td style="text-align: right; padding: 5px;"><strong>Remaining Balance:</strong></td>
                    <td style="text-align: center; padding: 5px;"><b>₹${payment.balanceAmount.toFixed(2)}</b></td>
                </tr>
            </table>
        </div>
    `;
}

document.getElementById('report-type').addEventListener('change', function() {
    const customDateInputs = document.querySelectorAll('#start-date, #end-date');
    customDateInputs.forEach(input => {
        input.style.display = this.value === 'custom' ? 'inline-block' : 'none';
    });
    generateReport();
});

document.querySelectorAll('#start-date, #end-date').forEach(input => {
    input.addEventListener('change', generateReport);
});

let currentPendingBill = null;

function loadAllPendingBills() {
    const bills = JSON.parse(localStorage.getItem('bills')) || [];
    const pendingBills = bills.filter(bill => 
        (bill.status === 'PENDING' || bill.status === 'ACTIVE') && 
        (bill.balanceAmount > 0)
    );
    
    displayPendingBills(pendingBills);
}

function searchPendingBills() {
    const searchTerm = document.getElementById('pending-search').value.trim().toLowerCase();
    
    if (!searchTerm) {
        loadAllPendingBills();
        return;
    }
    
    const bills = JSON.parse(localStorage.getItem('bills')) || [];
    const pendingBills = bills.filter(bill => 
        (bill.status === 'PENDING' || bill.status === 'ACTIVE') && 
        (bill.balanceAmount > 0) &&
        (
            bill.billNumber.toString().includes(searchTerm) ||
            bill.customer?.name.toLowerCase().includes(searchTerm) ||
            bill.customer?.mobile.includes(searchTerm)
        )
    );
    
    displayPendingBills(pendingBills);
}

function displayPendingBills(bills) {
    const tableBody = document.getElementById('pending-bills-table-body');
    tableBody.innerHTML = '';
    
    if (bills.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = '<td colspan="8" style="text-align: center;">No pending bills found</td>';
        return;
    }
    
    // Sort by date (newest first)
    bills.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    bills.forEach(bill => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td style="text-align: center;"><b>${bill.billNumber}</b></td>
            <td style="text-align: center;">${new Date(bill.date).toLocaleDateString()}</td>
            <td style="text-align: center;">${bill.customer?.name || 'N/A'}</td>
            <td style="text-align: center;">${bill.customer?.mobile || 'N/A'}</td>
            <td style="text-align: center;">₹${bill.totalAmount.toFixed(2)}</td>
            <td style="text-align: center;">₹${(bill.receivedAmount || 0).toFixed(2)}</td>
            <td style="text-align: center; color: #d32f2f; font-weight: bold;">₹${bill.balanceAmount.toFixed(2)}</td>
            <td style="text-align: center;">
                <button class="btn btn-primary btn-sm" onclick="openBillForPayment(${bill.id})">
                    Pay Balance
                </button>
            </td>
        `;
    });
}

function openBillForPayment(billId) {
    const bills = JSON.parse(localStorage.getItem('bills')) || [];
    const bill = bills.find(b => b.id === billId);
    
    if (!bill) {
        alert('Bill not found');
        return;
    }
    
    currentPendingBill = bill;
    
    // Display bill details
    const detailsContent = document.getElementById('bill-details-content');
    detailsContent.innerHTML = getBillDetailsHTML(bill);
    
    // Set the balance amount as default payment amount
    document.getElementById('balance-payment-amount').value = bill.balanceAmount.toFixed(2);
    
    // Show the modal
    document.getElementById('bill-details-modal').style.display = 'block';
    
    // Scroll to the modal
    document.getElementById('bill-details-modal').scrollIntoView({ behavior: 'smooth' });
}

function processBalancePayment() {
    if (!currentPendingBill) {
        alert('No bill selected');
        return;
    }
    
    const paymentAmount = parseFloat(document.getElementById('balance-payment-amount').value);
    
    if (!paymentAmount || paymentAmount <= 0) {
        alert('Please enter a valid payment amount');
        return;
    }
    
    if (paymentAmount > currentPendingBill.balanceAmount) {
        alert('Payment amount cannot exceed balance amount');
        return;
    }
    
    // Create a new balance payment record
    const balancePayment = {
        id: Date.now(),
        originalBillId: currentPendingBill.id,
        originalBillNumber: currentPendingBill.billNumber,
        billNumber: `${currentPendingBill.billNumber}-BAL`,
        date: new Date().toISOString(),
        paymentDate: new Date().toISOString(),
        customer: currentPendingBill.customer,
        staff: currentPendingBill.staff,
        items: currentPendingBill.items,
        subtotal: currentPendingBill.subtotal,
        transportCharges: currentPendingBill.transportCharges || 0,
        extraCharges: currentPendingBill.extraCharges || 0,
        totalAmount: currentPendingBill.totalAmount,
        originalReceivedAmount: currentPendingBill.receivedAmount || 0,
        balancePaymentAmount: paymentAmount,
        receivedAmount: (currentPendingBill.receivedAmount || 0) + paymentAmount,
        balanceAmount: currentPendingBill.balanceAmount - paymentAmount,
        status: (currentPendingBill.balanceAmount - paymentAmount) <= 0 ? 'PAID' : 'PENDING',
        type: 'BALANCE_PAYMENT',
        originalBillDate: currentPendingBill.date
    };
    
    // Update the original bill
    const bills = JSON.parse(localStorage.getItem('bills')) || [];
    const billIndex = bills.findIndex(b => b.id === currentPendingBill.id);
    
    if (billIndex !== -1) {
        bills[billIndex].receivedAmount = (bills[billIndex].receivedAmount || 0) + paymentAmount;
        bills[billIndex].balanceAmount = bills[billIndex].balanceAmount - paymentAmount;
        bills[billIndex].status = bills[billIndex].balanceAmount <= 0 ? 'PAID' : 'PENDING';
        bills[billIndex].lastPaymentDate = new Date().toISOString();
    }
    
    // Add the balance payment record
    bills.push(balancePayment);
    localStorage.setItem('bills', JSON.stringify(bills));
    
    // Send Telegram notification
    const telegramMessage = formatBalancePaymentForTelegram(balancePayment);
    sendTelegramMessage(telegramMessage);
    
    // Close the modal and refresh the list
    closeBillDetails();
    loadAllPendingBills();
    
    alert(`Balance payment of ₹${paymentAmount.toFixed(2)} processed successfully!`);
}

function formatBalancePaymentForTelegram(payment) {
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();
    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString();

    let message = `💰 *BALANCE PAYMENT RECEIVED*\n\n`;
    message += `Original Estimate No: *${payment.originalBillNumber}*\n`;
    message += `Payment Reference: *${payment.billNumber}*\n`;
    message += `Original Date: ${formatDate(payment.originalBillDate)}\n`;
    message += `Payment Date: ${formatDate(payment.paymentDate)}\n`;
    message += `Payment Time: ${formatTime(payment.paymentDate)}\n\n`;

    // Customer Details
    message += `*CUSTOMER DETAILS*\n`;
    message += `Name: ${payment.customer.name}\n`;
    message += `Mobile: ${payment.customer.mobile}\n`;
    message += `Address: ${payment.customer.address}\n\n`;

    // Staff Details
    message += `*STAFF DETAILS*\n`;
    message += `Name: ${payment.staff.name}\n`;
    message += `Role: ${payment.staff.role}\n\n`;

    // Payment Summary
    message += `*PAYMENT SUMMARY*\n`;
    message += `Total Bill Amount: ₹${payment.totalAmount.toFixed(2)}\n`;
    message += `Previous Received: ₹${payment.originalReceivedAmount.toFixed(2)}\n`;
    message += `*Balance Payment: ₹${payment.balancePaymentAmount.toFixed(2)}*\n`;
    message += `*Total Received: ₹${payment.receivedAmount.toFixed(2)}*\n`;
    message += `*Remaining Balance: ₹${payment.balanceAmount.toFixed(2)}*\n`;
    message += `*Payment Status: ${payment.status}*`;

    return encodeURIComponent(message);
}

function closeBillDetails() {
    document.getElementById('bill-details-modal').style.display = 'none';
    currentPendingBill = null;
    document.getElementById('balance-payment-amount').value = '';
}

// Add event listener for Enter key in search
document.addEventListener('DOMContentLoaded', function() {
    const pendingSearchInput = document.getElementById('pending-search');
    if (pendingSearchInput) {
        pendingSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchPendingBills();
            }
        });
    }
});

function generateBalancePaymentPDF(payment) {
    const template = `
    <div id="bill-pdf-content" style="padding: 20px; font-family: 'Arial', sans-serif; width: 210mm; margin: auto;">
        <!-- Header Section -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; margin: 0; font-weight: bold; color: #000;">SRI VINAYAGA RINGS</h1>
            <p style="margin: 0px 0; font-size: 14px;">No. 12/281, Puthantharuvai Road</p>
            <p style="margin: 0px 0; font-size: 14px;">Panaivilai, Thisayanvilai, 628656</p>
            <p style="margin: 0px 0; font-size: 14px;">Phone: +91 9710812345, +91 7598721234</p>
            <p style="margin: 0px 0; font-size: 14px;">Email: admin@srivinayagatraders.com</p>
        </div>

        <h1 style="font-size: 24px; text-align: center;">BALANCE PAYMENT RECEIPT</h1>

        <!-- Bill Info Section -->
        <div style="margin-bottom: 10px; padding-bottom: 2;">
            <table style="width: 100%; font-size: 14px;">
                <tr>
                    <td style="width: 50%; text-align: center; border: 1px solid #535353;">
                        <strong>Original Estimate No:</strong> ${payment.originalBillNumber}
                    </td>
                    <td style="width: 50%; text-align: center; border: 1px solid #535353;">
                        <strong>Payment Reference:</strong> ${payment.billNumber}
                    </td>
                </tr>
                <tr>
                    <td style="width: 33%; text-align: center; border: 1px solid #535353;">
                        <strong>Original Date:</strong> ${new Date(payment.originalBillDate).toLocaleDateString()}
                    </td>
                    <td style="width: 33%; text-align: center; border: 1px solid #535353;">
                        <strong>Payment Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                </tr>                   
            </table>
        </div>

        <!-- Customer Details -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
            <div style="width: 100%; border: 1px solid #ffffff; padding: 2px; border-radius: 5px;">
                <h3 style="margin: 0 0 2px 0; font-size: 16px; border-bottom: 1px solid #ffffff; padding-bottom: 2px;">Customer Details</h3>
                <p style="margin: 1px 0;"><strong>Name:</strong> ${payment.customer.name}</p>
                <p style="margin: 1px 0;"><strong>Mobile:</strong> ${payment.customer.mobile}</p>
                <p style="margin: 1px 0;"><strong>Address:</strong> ${payment.customer.address}</p>
            </div>
        </div>

        <!-- Payment Summary -->
        <div style="width: 100%; display: flex; justify-content: center; margin-bottom: 15px; font-size: 14px;">
            <table style="width: 400px; border-collapse: collapse;">
                <tr>
                    <td style="border: 1px solid #000000; text-align: center; padding: 5px 0;"><strong>Original Bill Amount</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 5px 0;">₹${payment.totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; text-align: center; padding: 5px 0;"><strong>Previously Received</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 5px 0;">₹${payment.originalReceivedAmount.toFixed(2)}</td>
                </tr>
                <tr style="background-color: #e8f5e8;">
                    <td style="border: 1px solid #000000; text-align: center; padding: 5px 0;"><strong>Balance Payment (Today)</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 5px 0;"><strong>₹${payment.balancePaymentAmount.toFixed(2)}</strong></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; text-align: center; padding: 5px 0;"><strong>Total Received Amount</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 5px 0;"><strong>₹${payment.receivedAmount.toFixed(2)}</strong></td>
                </tr>
                <tr style="background-color: ${payment.balanceAmount > 0 ? '#ffebee' : '#e8f5e8'};">
                    <td style="border: 1px solid #000000; text-align: center; padding: 5px 0;"><strong>Remaining Balance</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 5px 0;"><strong>₹${payment.balanceAmount.toFixed(2)}</strong></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; text-align: center; padding: 5px 0;"><strong>Payment Status</strong></td>
                    <td style="border: 1px solid #000000; text-align: center; padding: 5px 0;"><strong>${payment.status}</strong></td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; font-size: 14px;">
            <div style="float: left; width: 50%;">
                <p><strong>Payment received on:</strong> ${new Date(payment.paymentDate).toLocaleString()}</p>
                <p style="margin-top: 20px;"><strong>Thank you for your payment!</strong></p>
            </div>
            <div style="float: right; width: 200px; text-align: center;">
                <div style="margin-bottom: 40px;">
                    <p style="margin-bottom: 50px;"></p>
                    <p style="margin: 0;"><strong>Authorized Signature</strong></p>
                </div>
            </div>
        </div>
    </div>
    `;

    // Create temporary container
    const container = document.createElement('div');
    container.innerHTML = template;
    document.body.appendChild(container);

    // PDF options
    const opt = {
        filename: `Balance-Payment-${payment.billNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait'
        },
        margin: [10, 0, 10, 0]
    };

    // Generate PDF
    html2pdf().from(container).set(opt).save()
        .then(() => {
            document.body.removeChild(container);
        });
}

// Initialize brands and products list on page load
window.addEventListener('load', () => {
    loadBrandsList();
    loadProductsList('');
    generateReport(); // Automatically generate report on load
});
