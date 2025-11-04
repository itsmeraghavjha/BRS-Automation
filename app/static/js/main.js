// // app/static/js/main.js
// document.addEventListener('DOMContentLoaded', () => {
//     const App = {
//         state: {
//             isAdmin: document.body.dataset.isAdmin === 'true',
//             currentFile: null, 
//             processedData: null, 
//             currentConfirmCallback: null, 
//             mappingFields: [
//                 'accountNo', 'profitCenter', 'costCenter', 'branchName', 'owner', 'email',
//                 'houseBank', 'bankGL', 'bankName' 
//             ],
//             displayFields: [
//                 { key: 'id', header: 'S No.' },
//                 { key: 'houseBank', header: 'House Bank' },
//                 { key: 'bankName', header: 'Bank Name' },
//                 { key: 'branchName', header: 'Branch Name' },
//                 { key: 'accountNo', header: 'Bank Account No.' },
//                 { key: 'profitCenter', header: 'Profit Center' },
//                 { key: 'owner', header: 'Owner' },
//                 { key: 'bankGL', header: 'Bank G/L Account' }
//             ]
//         },
        
//         ui: {},

//         init() {
//             this.cacheDOMElements();
            
//             // Debug check for missing elements
//             console.log('Initialized elements:', {
//                 bankSelect: !!this.ui.bankSelect,
//                 accountTypeSelect: !!this.ui.accountTypeSelect,
//                 dropZone: !!this.ui.dropZone,
//                 fileInput: !!this.ui.fileInput
//             });
            
//             this.bindEvents();
//             if (this.ui.bankSelect) this.handlers.handleBankSelection();
//         },

//         cacheDOMElements() {
//             // Main page elements
//             this.ui.bankSelect = document.getElementById('bank-select');
//             this.ui.accountTypeSelect = document.getElementById('account-type-select');
//             this.ui.dropZone = document.getElementById('drop-zone');
//             this.ui.fileInput = document.getElementById('statement-file');
//             this.ui.processBtn = document.getElementById('process-btn');
//             this.ui.clearFileBtn = document.getElementById('clear-file-btn');
//             this.ui.downloadBtn = document.getElementById('download-btn');
//             this.ui.downloadExcelBtn = document.getElementById('download-excel-btn');
//             this.ui.fileNameDisplay = document.getElementById('file-name');
//             this.ui.bankNameDisplay = document.getElementById('bank-name-display');
//             this.ui.uploadInitialState = document.getElementById('upload-initial-state');
//             this.ui.uploadSelectedState = document.getElementById('upload-selected-state');
//             this.ui.processingState = document.getElementById('processing-state');
//             this.ui.resultsContainer = document.getElementById('results-container');
//             this.ui.dataTableBody = document.getElementById('data-table-body');
//             this.ui.dataTableHead = document.getElementById('data-table-head');
//             this.ui.statusText = document.getElementById('status-text');
            
//             // Modal related elements
//             this.ui.manageMappingsBtn = document.getElementById('manage-mappings-btn');
//             this.ui.mappingModal = document.getElementById('mapping-modal');
//             this.ui.mappingTableContainer = document.getElementById('mapping-table-container');
//             this.ui.addNewMappingBtn = document.getElementById('add-new-mapping-btn');
            
//             // Form Modal elements
//             this.ui.mappingFormModal = document.getElementById('mapping-form-modal');
//             this.ui.mappingForm = document.getElementById('mapping-form');
//             this.ui.formModalTitle = document.getElementById('form-modal-title');
            
//             // Alert Modal elements
//             this.ui.alertModal = document.getElementById('alert-modal');
//             this.ui.alertTitle = document.getElementById('alert-title');
//             this.ui.alertMessage = document.getElementById('alert-message');
//             this.ui.alertIcon = document.getElementById('alert-icon');
//             this.ui.alertIconContainer = document.getElementById('alert-icon-container');
//         },

//         bindEvents() {
//             // Mapping Management Events
//             this.ui.manageMappingsBtn?.addEventListener('click', () => this.handlers.openMappingModal());
//             this.ui.addNewMappingBtn?.addEventListener('click', () => this.handlers.openMappingForm(null));
//             this.ui.mappingForm?.addEventListener('submit', (e) => this.handlers.saveMapping(e));
//             this.ui.mappingTableContainer?.addEventListener('click', (e) => this.handlers.handleMappingTableClicks(e));
//             this.ui.bankSelect?.addEventListener('change', () => this.handlers.handleBankSelection());

//             // FILE UPLOAD BINDINGS
//             this.ui.dropZone?.addEventListener('click', () => this.ui.fileInput.click()); 
//             this.ui.fileInput?.addEventListener('change', (e) => this.handlers.handleFileSelect(e.target.files)); 
//             this.ui.clearFileBtn?.addEventListener('click', () => this.handlers.clearFile()); 
//             this.ui.processBtn?.addEventListener('click', () => this.handlers.processStatement()); 
//             this.ui.downloadBtn?.addEventListener('click', () => this.handlers.downloadResults()); 
//             this.ui.downloadExcelBtn?.addEventListener('click', () => this.handlers.downloadExcel());

//             // Drop Zone Drag Events
//             this.ui.dropZone?.addEventListener('dragover', (e) => this.handlers.handleDragOver(e));
//             this.ui.dropZone?.addEventListener('dragleave', (e) => this.handlers.handleDragLeave(e));
//             this.ui.dropZone?.addEventListener('drop', (e) => this.handlers.handleDrop(e));
            
//             // MODAL CLOSE BINDINGS
//             const delegateModalClose = (modalElement, modalId) => {
//                 modalElement?.addEventListener('click', (e) => {
//                     const closeButton = e.target.closest(`[data-close-modal="${modalId}"]`);
//                     if (closeButton) {
//                         e.preventDefault();
//                         this.render.closeModal(modalId);
//                     }
//                 });
//             };

//             delegateModalClose(this.ui.mappingModal, 'mapping-modal');
//             delegateModalClose(this.ui.mappingFormModal, 'mapping-form-modal');
//             delegateModalClose(this.ui.alertModal, 'alert-modal'); 
//         },

//         api: {
//             async getMappings() {
//                 const response = await fetch('/mappings/');
//                 if (!response.ok) throw new Error('Could not fetch mappings.');
//                 return response.json();
//             },
//             async getMapping(id) {
//                 const response = await fetch(`/mappings/${id}`);
//                 if (!response.ok) throw new Error('Could not fetch mapping data.');
//                 return response.json();
//             },
//             async addMapping(payload) {
//                 const response = await fetch('/mappings/add', { 
//                     method: 'POST', 
//                     headers: { 'Content-Type': 'application/json' }, 
//                     body: JSON.stringify(payload) 
//                 });
//                 return response.json();
//             },
//             async updateMapping(id, payload) {
//                 const response = await fetch(`/mappings/update/${id}`, { 
//                     method: 'POST', 
//                     headers: { 'Content-Type': 'application/json' }, 
//                     body: JSON.stringify(payload) 
//                 });
//                 return response.json();
//             },
//             async deleteMapping(id) {
//                 const response = await fetch(`/mappings/delete/${id}`, { method: 'POST' });
//                 return response.json();
//             },
//             async processFile(formData) {
//                 const response = await fetch('/process', { method: 'POST', body: formData });
//                 const result = await response.json();
//                 if (!response.ok) {
//                     throw new Error(result.error || 'Failed to process file on the server.');
//                 }
//                 return result;
//             }
//         },

//         handlers: {
//             handleFileSelect(files) {
//                 if (files.length === 0) return;
//                 const file = files[0];

//                 const bank = App.ui.bankSelect?.value;
//                 if (!bank) {
//                     App.render.showAlert('Warning', 'Please select a bank before uploading a file.', 'warning');
//                     if (App.ui.fileInput) App.ui.fileInput.value = '';
//                     return;
//                 }
                
//                 App.state.currentFile = file;
//                 App.render.updateUploadState('selected');
//                 if (App.ui.fileNameDisplay) App.ui.fileNameDisplay.textContent = file.name;
//                 if (App.ui.bankNameDisplay && App.ui.bankSelect) {
//                     App.ui.bankNameDisplay.textContent = `Bank: ${App.ui.bankSelect.options[App.ui.bankSelect.selectedIndex].text}`;
//                 }
                
//                 App.ui.resultsContainer?.classList.add('hidden', 'opacity-0');
//             },
            
//             clearFile() {
//                 App.state.currentFile = null;
//                 if (App.ui.fileInput) App.ui.fileInput.value = '';
//                 App.render.updateUploadState('initial');
//                 App.ui.resultsContainer?.classList.add('hidden', 'opacity-0');
//             },
            
//             handleDragOver(e) {
//                 e.preventDefault();
//                 e.stopPropagation();
//                 if (App.ui.bankSelect?.value) {
//                     App.ui.dropZone?.classList.add('dragover');
//                 }
//             },
            
//             handleDragLeave(e) {
//                 e.preventDefault();
//                 e.stopPropagation();
//                 App.ui.dropZone?.classList.remove('dragover');
//             },

//             handleDrop(e) {
//                 e.preventDefault();
//                 e.stopPropagation();
//                 App.ui.dropZone?.classList.remove('dragover');
                
//                 if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//                     App.handlers.handleFileSelect(e.dataTransfer.files);
//                 }
//             },
            
//             async processStatement() {
//                 const file = App.state.currentFile;
//                 const bank = App.ui.bankSelect?.value;
//                 const accountType = App.ui.accountTypeSelect?.value;

//                 console.log('Processing started:', { bank, accountType, fileName: file?.name });

//                 if (!bank || !file) {
//                     return App.render.showAlert('Missing Information', 'Please select a bank and a statement file to process.', 'warning');
//                 }

//                 App.render.updateUploadState('processing');

//                 try {
//                     const formData = new FormData();
//                     formData.append('statement', file);
//                     formData.append('bank', bank);
//                     formData.append('account_type', accountType);

//                     console.log('Sending request to /process...');
//                     const result = await App.api.processFile(formData);
                    
//                     console.log('Received result:', result);
                    
//                     if (!result) {
//                         throw new Error('Empty response from server');
//                     }
//                     if (!result.rows || !result.headers) {
//                         throw new Error('Invalid response format: ' + JSON.stringify(result));
//                     }
                    
//                     App.state.processedData = result;
//                     App.render.updateUploadState('results');
//                     App.render.renderResults(result);

//                 } catch (error) {
//                     console.error('Processing error:', error);
//                     App.render.updateUploadState('selected');
//                     App.render.showAlert('Processing Error', error.message, 'error');
//                 }
//             },
            
//             downloadResults() {
//                 const data = App.state.processedData;
//                 if (!data || !data.rows || data.rows.length === 0) {
//                     return App.render.showAlert('Download Error', 'No processed data available to download.', 'warning');
//                 }
                
//                 const headers = data.headers || ["Posting Rule", "Date", "Amount", "Narration", "Reference ID", "Profit Center", "Cost Center"];
                
//                 const header = headers.join('\t');
//                 const rows = data.rows.map(row => 
//                     row.map(cell => (cell === null || cell === undefined) ? '' : String(cell)).join('\t')
//                 );
                
//                 const fileContent = [header, ...rows].join('\n');

//                 const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
//                 const url = URL.createObjectURL(blob);
                
//                 const a = document.createElement('a');
//                 a.href = url;
//                 a.download = `Processed_Statement_${new Date().toISOString().slice(0, 10)}.txt`;
//                 document.body.appendChild(a);
//                 a.click();
//                 document.body.removeChild(a);
//                 URL.revokeObjectURL(url);
//             },

//             downloadExcel() {
//                 const data = App.state.processedData;
//                 if (!data || !data.rows || data.rows.length === 0) {
//                     return App.render.showAlert('Download Error', 'No processed data available to download.', 'warning');
//                 }
                
//                 const headers = data.headers || ["Posting Rule", "Date", "Amount", "Narration", "Reference ID", "Profit Center", "Cost Center"];
                
//                 const csvContent = [
//                     headers.join(','),
//                     ...data.rows.map(row => 
//                         row.map(cell => {
//                             const cellStr = (cell === null || cell === undefined) ? '' : String(cell);
//                             if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
//                                 return `"${cellStr.replace(/"/g, '""')}"`;
//                             }
//                             return cellStr;
//                         }).join(',')
//                     )
//                 ].join('\n');

//                 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
//                 const url = URL.createObjectURL(blob);
                
//                 const a = document.createElement('a');
//                 a.href = url;
//                 a.download = `Processed_Statement_${new Date().toISOString().slice(0, 10)}.csv`;
//                 document.body.appendChild(a);
//                 a.click();
//                 document.body.removeChild(a);
//                 URL.revokeObjectURL(url);
//             },
            
//             async openMappingModal() {
//                 try {
//                     const mappings = await App.api.getMappings();
//                     App.render.renderMappingTable(mappings);
//                     App.render.openModal('mapping-modal');
//                 } catch (error) {
//                     App.render.showAlert('Load Failed', error.message, 'error');
//                 }
//             },
            
//             async openMappingForm(mappingId) {
//                 const isEditing = mappingId !== null;
//                 App.ui.mappingForm?.reset();
//                 if (App.ui.formModalTitle) {
//                     App.ui.formModalTitle.textContent = isEditing ? "Edit Mapping" : "Add New Mapping";
//                 }
//                 if (App.ui.mappingForm) {
//                     App.ui.mappingForm.dataset.editingId = isEditing ? mappingId : '';
//                 }

//                 if (isEditing) {
//                     try {
//                         const mapping = await App.api.getMapping(mappingId);
                        
//                         App.state.mappingFields.forEach(key => {
//                             const input = App.ui.mappingForm?.elements[key];
//                             if (input && mapping[key] !== null && mapping[key] !== undefined) {
//                                 input.value = mapping[key];
//                             }
//                         });
                        
//                         const originalAcctNo = document.getElementById('original-account-no');
//                         if (originalAcctNo) {
//                             originalAcctNo.value = mapping.accountNo || '';
//                         }

//                     } catch(error) {
//                         App.render.showAlert('Error', error.message, 'error');
//                         return;
//                     }
//                 } else {
//                     const originalAcctNo = document.getElementById('original-account-no');
//                     if (originalAcctNo) {
//                         originalAcctNo.value = '';
//                     }
//                 }
//                 App.render.openModal('mapping-form-modal');
//             },

//             async saveMapping(event) {
//                 event.preventDefault();
//                 const form = event.target;
//                 const editingId = form.dataset.editingId;
//                 const isEditing = !!editingId;
                
//                 const formData = new FormData(form);
//                 const payload = Object.fromEntries(formData.entries());

//                 try {
//                     const result = isEditing 
//                         ? await App.api.updateMapping(editingId, payload)
//                         : await App.api.addMapping(payload);
                    
//                     if (!result.success) throw new Error(result.error || 'Failed to save.');
                    
//                     App.render.closeModal('mapping-form-modal');
//                     const mappings = await App.api.getMappings();
//                     App.render.renderMappingTable(mappings);
//                     App.render.showAlert('Success', 'Mapping saved successfully.', 'success');

//                 } catch (error) {
//                     App.render.showAlert('Save Failed', error.message, 'error');
//                 }
//             },

//             handleMappingTableClicks(event) {
//                 const editButton = event.target.closest('.edit-btn');
//                 const deleteButton = event.target.closest('.delete-btn');
                
//                 if (editButton) {
//                     App.handlers.openMappingForm(editButton.dataset.id);
//                 }
                
//                 if (deleteButton) {
//                     const mappingId = deleteButton.dataset.id;
                    
//                     App.render.showAlert('Confirm Deletion', `Are you sure you want to delete mapping ID ${mappingId}?`, 'confirm', async () => {
//                         try {
//                             const result = await App.api.deleteMapping(mappingId);
//                             if (!result.success) throw new Error(result.error);
                            
//                             const mappings = await App.api.getMappings();
//                             App.render.renderMappingTable(mappings);
//                             App.render.showAlert('Success', 'Mapping deleted successfully.', 'success');
//                         } catch (error) {
//                             App.render.showAlert('Deletion Failed', error.message, 'error');
//                         }
//                     });
//                 }
//             },

//             handleBankSelection() {
//                 const selectedBank = App.ui.bankSelect?.value;
//                 const bankAccountTypes = { 'hdfc': true, 'icici': true };
                
//                 // Fixed: Added null check to prevent the error
//                 if (App.ui.accountTypeSelect) {
//                     App.ui.accountTypeSelect.disabled = !bankAccountTypes[selectedBank];
//                 }

//                 if (App.state.currentFile) {
//                     App.handlers.clearFile(); 
//                 }
//             },
//         },

//         render: {
//             updateUploadState(newState) {
//                 App.ui.uploadInitialState?.classList.add('hidden');
//                 App.ui.uploadSelectedState?.classList.add('hidden');
//                 App.ui.processingState?.classList.add('hidden');
                
//                 if (newState !== 'results') {
//                     App.ui.resultsContainer?.classList.add('hidden', 'opacity-0');
//                     if (App.ui.downloadBtn) App.ui.downloadBtn.disabled = true;
//                     if (App.ui.downloadExcelBtn) App.ui.downloadExcelBtn.disabled = true;
//                 }

//                 switch (newState) {
//                     case 'initial':
//                         App.ui.uploadInitialState?.classList.remove('hidden');
//                         break;
//                     case 'selected':
//                         App.ui.uploadSelectedState?.classList.remove('hidden');
//                         break;
//                     case 'processing':
//                         App.ui.processingState?.classList.remove('hidden');
//                         break;
//                     case 'results':
//                         App.ui.uploadSelectedState?.classList.remove('hidden');
//                         App.ui.resultsContainer?.classList.remove('hidden');
//                         setTimeout(() => App.ui.resultsContainer?.classList.remove('opacity-0'), 10);
//                         if (App.ui.downloadBtn) App.ui.downloadBtn.disabled = false;
//                         if (App.ui.downloadExcelBtn) App.ui.downloadExcelBtn.disabled = false;
//                         break;
//                 }
//             },
            
//             renderResults(data) {
//                 const headers = data.headers || ["Posting Rule", "Date", "Amount", "Narration", "Reference ID", "Profit Center", "Cost Center"];

//                 if (App.ui.dataTableHead) {
//                     App.ui.dataTableHead.innerHTML = `
//                         <tr class="bg-gray-100 sticky top-0 z-10">
//                             ${headers.map(header => 
//                                 `<th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">${header}</th>`
//                             ).join('')}
//                         </tr>
//                     `;
//                 }
                
//                 if (App.ui.dataTableBody) {
//                     App.ui.dataTableBody.innerHTML = data.rows.map(row => {
//                         return `
//                             <tr class="hover:bg-gray-50">
//                                 ${row.map(cell => 
//                                     `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${(cell === null || cell === undefined || cell === '' || cell === 'NaN') ? '' : cell}</td>`
//                                 ).join('')}
//                             </tr>
//                         `;
//                     }).join('');
//                 }
                
//                 if (App.ui.statusText) {
//                     App.ui.statusText.textContent = `Found ${data.rows.length} transactions.`;
//                 }
//             },
            
//             renderMappingTable(mappings) {
//                 if (!mappings || mappings.length === 0) {
//                     if (App.ui.mappingTableContainer) {
//                         App.ui.mappingTableContainer.innerHTML = '<p class="text-center p-6 text-gray-500">No mappings defined.</p>';
//                     }
//                     return;
//                 }
                
//                 // Sort mappings by account number
//                 const sortedMappings = [...mappings].sort((a, b) => {
//                     const accountA = String(a.accountNo || '').trim();
//                     const accountB = String(b.accountNo || '').trim();
//                     return accountA.localeCompare(accountB, undefined, { numeric: true });
//                 });
                
//                 const headerClass = "px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider";
//                 const cellClass = "px-6 py-4 whitespace-nowrap text-sm text-gray-800";
                
//                 const displayFields = App.state.displayFields;

//                 const headersHtml = displayFields.map(f => `<th class="${headerClass}">${f.header}</th>`).join('');
//                 const actionsHeader = App.state.isAdmin ? `<th class="${headerClass}">Actions</th>` : '';
                
//                 if (App.ui.mappingTableContainer) {
//                     App.ui.mappingTableContainer.innerHTML = `
//                         <table class="min-w-full divide-y divide-gray-200">
//                             <thead class="bg-gray-100">
//                                 <tr>
//                                     ${headersHtml}
//                                     ${actionsHeader}
//                                 </tr>
//                             </thead>
//                             <tbody class="bg-white divide-y divide-gray-200">
//                             ${sortedMappings.map((row, index) => {
//                                 const cellsHtml = displayFields.map(f => {
//                                     let value = row[f.key];
//                                     // Replace database ID with sequential number
//                                     if (f.key === 'id') {
//                                         value = index + 1;
//                                     }
//                                     return `<td class="${cellClass} ${f.key === 'id' || f.key === 'accountNo' ? 'font-medium' : ''}">${value || '-'}</td>`;
//                                 }).join('');

//                                 return `
//                                 <tr class="hover:bg-gray-50">
//                                     ${cellsHtml}
//                                     ${App.state.isAdmin ? `
//                                     <td class="${cellClass}">
//                                         <button class="edit-btn text-green-600 hover:text-green-800 mr-4" data-id="${row.id}">Edit</button>
//                                         <button class="delete-btn text-red-600 hover:text-red-800" data-id="${row.id}">Delete</button>
//                                     </td>` : ''}
//                                 </tr>`;
//                             }).join('')}
//                             </tbody>
//                         </table>`;
//                 }
//             },
            
//             openModal(modalId) {
//                 const modal = document.getElementById(modalId);
//                 if (modal) {
//                     modal.classList.remove('hidden');
//                 }
//             },
            
//             closeModal(modalId) {
//                 const modal = document.getElementById(modalId);
//                 if (modal) {
//                     modal.classList.add('hidden');
//                 }
//             },
            
//             showAlert(title, message, type, confirmCallback = null) {
//                 const modal = App.ui.alertModal;
//                 if (!modal) return;
                
//                 if (App.ui.alertTitle) App.ui.alertTitle.textContent = title;
//                 if (App.ui.alertMessage) App.ui.alertMessage.textContent = message;
                
//                 if (App.ui.alertIconContainer) {
//                     App.ui.alertIconContainer.className = 'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10';
//                 }
//                 if (App.ui.alertIcon) {
//                     App.ui.alertIcon.className = 'fas fa-2x';
//                 }
                
//                 let iconClass = '';
//                 let iconColor = '';
//                 let buttonsHtml = '';
                
//                 const buttonsDiv = document.getElementById('alert-buttons');
//                 App.state.currentConfirmCallback = null;

//                 switch (type) {
//                     case 'success':
//                         iconClass = 'fa-check-circle';
//                         iconColor = 'bg-green-100 text-green-600';
//                         buttonsHtml = `<button type="button" data-close-modal="alert-modal" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 main-button text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm">OK</button>`;
//                         break;
//                     case 'warning':
//                         iconClass = 'fa-exclamation-triangle';
//                         iconColor = 'bg-yellow-100 text-yellow-600';
//                         buttonsHtml = `<button type="button" data-close-modal="alert-modal" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 main-button text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm">OK</button>`;
//                         break;
//                     case 'error':
//                         iconClass = 'fa-times-circle';
//                         iconColor = 'bg-red-100 text-red-600';
//                         buttonsHtml = `<button type="button" data-close-modal="alert-modal" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 main-button text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm">Close</button>`;
//                         break;
//                     case 'confirm':
//                         iconClass = 'fa-question-circle';
//                         iconColor = 'bg-blue-100 text-blue-600';
//                         buttonsHtml = `
//                             <button id="alert-confirm-btn" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 main-button text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm">Confirm</button>
//                             <button type="button" data-close-modal="alert-modal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
//                         `;
//                         App.state.currentConfirmCallback = confirmCallback;
//                         break;
//                 }
                
//                 if (App.ui.alertIconContainer) {
//                     App.ui.alertIconContainer.classList.add(...iconColor.split(' '));
//                 }
//                 if (App.ui.alertIcon) {
//                     App.ui.alertIcon.classList.add(iconClass);
//                 }
                
//                 if (buttonsDiv) {
//                     buttonsDiv.innerHTML = buttonsHtml;
//                 }
                
//                 App.render.openModal('alert-modal');

//                 if (type === 'confirm' && confirmCallback) {
//                     setTimeout(() => {
//                         const confirmBtn = document.getElementById('alert-confirm-btn');
//                         if (confirmBtn) {
//                             confirmBtn.addEventListener('click', () => {
//                                 App.render.closeModal('alert-modal');
//                                 confirmCallback();
//                             }, { once: true });
//                         }
//                     }, 0);
//                 }
//             }
//         }
//     };

//     App.init();
// });



// app/static/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const App = {
        state: {
            isAdmin: document.body.dataset.isAdmin === 'true',
            currentFile: null, 
            processedData: null, 
            currentConfirmCallback: null, 
            mappingFields: [
                'accountNo', 'profitCenter', 'costCenter', 'branchName', 'owner', 'email',
                'houseBank', 'bankGL', 'bankName' 
            ],
            displayFields: [
                { key: 'id', header: 'S No.' },
                { key: 'houseBank', header: 'House Bank' },
                { key: 'bankName', header: 'Bank Name' },
                { key: 'branchName', header: 'Branch Name' },
                { key: 'accountNo', header: 'Bank Account No.' },
                { key: 'profitCenter', header: 'Profit Center' },
                { key: 'owner', header: 'Owner' },
                { key: 'bankGL', header: 'Bank G/L Account' }
            ]
        },
        
        ui: {},

        init() {
            this.cacheDOMElements();
            
            // Debug check for missing elements
            console.log('Initialized elements:', {
                bankSelect: !!this.ui.bankSelect,
                accountTypeSelect: !!this.ui.accountTypeSelect,
                dropZone: !!this.ui.dropZone,
                fileInput: !!this.ui.fileInput
            });
            
            this.bindEvents();
            if (this.ui.bankSelect) this.handlers.handleBankSelection();
        },

        cacheDOMElements() {
            // Main page elements
            this.ui.bankSelect = document.getElementById('bank-select');
            this.ui.accountTypeSelect = document.getElementById('account-type-select');
            this.ui.dropZone = document.getElementById('drop-zone');
            this.ui.fileInput = document.getElementById('statement-file');
            this.ui.processBtn = document.getElementById('process-btn');
            this.ui.clearFileBtn = document.getElementById('clear-file-btn');
            this.ui.downloadBtn = document.getElementById('download-btn');
            this.ui.downloadExcelBtn = document.getElementById('download-excel-btn');
            this.ui.fileNameDisplay = document.getElementById('file-name');
            this.ui.bankNameDisplay = document.getElementById('bank-name-display');
            this.ui.uploadInitialState = document.getElementById('upload-initial-state');
            this.ui.uploadSelectedState = document.getElementById('upload-selected-state');
            this.ui.processingState = document.getElementById('processing-state');
            this.ui.resultsContainer = document.getElementById('results-container');
            this.ui.dataTableBody = document.getElementById('data-table-body');
            this.ui.dataTableHead = document.getElementById('data-table-head');
            this.ui.statusText = document.getElementById('status-text');
            
            // Modal related elements
            this.ui.manageMappingsBtn = document.getElementById('manage-mappings-btn');
            this.ui.mappingModal = document.getElementById('mapping-modal');
            this.ui.mappingTableContainer = document.getElementById('mapping-table-container');
            this.ui.addNewMappingBtn = document.getElementById('add-new-mapping-btn');
            
            // Form Modal elements
            this.ui.mappingFormModal = document.getElementById('mapping-form-modal');
            this.ui.mappingForm = document.getElementById('mapping-form');
            this.ui.formModalTitle = document.getElementById('form-modal-title');
            
            // Alert Modal elements
            this.ui.alertModal = document.getElementById('alert-modal');
            this.ui.alertTitle = document.getElementById('alert-title');
            this.ui.alertMessage = document.getElementById('alert-message');
            this.ui.alertIcon = document.getElementById('alert-icon');
            this.ui.alertIconContainer = document.getElementById('alert-icon-container');
        },

        bindEvents() {
            // Mapping Management Events
            this.ui.manageMappingsBtn?.addEventListener('click', () => this.handlers.openMappingModal());
            this.ui.addNewMappingBtn?.addEventListener('click', () => this.handlers.openMappingForm(null));
            this.ui.mappingForm?.addEventListener('submit', (e) => this.handlers.saveMapping(e));
            this.ui.mappingTableContainer?.addEventListener('click', (e) => this.handlers.handleMappingTableClicks(e));
            this.ui.bankSelect?.addEventListener('change', () => this.handlers.handleBankSelection());

            // FILE UPLOAD BINDINGS
            this.ui.dropZone?.addEventListener('click', () => this.ui.fileInput.click()); 
            this.ui.fileInput?.addEventListener('change', (e) => this.handlers.handleFileSelect(e.target.files)); 
            this.ui.clearFileBtn?.addEventListener('click', () => this.handlers.clearFile()); 
            this.ui.processBtn?.addEventListener('click', () => this.handlers.processStatement()); 
            this.ui.downloadBtn?.addEventListener('click', () => this.handlers.downloadResults()); 
            this.ui.downloadExcelBtn?.addEventListener('click', () => this.handlers.downloadExcel());

            // Drop Zone Drag Events
            this.ui.dropZone?.addEventListener('dragover', (e) => this.handlers.handleDragOver(e));
            this.ui.dropZone?.addEventListener('dragleave', (e) => this.handlers.handleDragLeave(e));
            this.ui.dropZone?.addEventListener('drop', (e) => this.handlers.handleDrop(e));
            
            // MODAL CLOSE BINDINGS
            const delegateModalClose = (modalElement, modalId) => {
                modalElement?.addEventListener('click', (e) => {
                    const closeButton = e.target.closest(`[data-close-modal="${modalId}"]`);
                    if (closeButton) {
                        e.preventDefault();
                        this.render.closeModal(modalId);
                    }
                });
            };

            delegateModalClose(this.ui.mappingModal, 'mapping-modal');
            delegateModalClose(this.ui.mappingFormModal, 'mapping-form-modal');
            delegateModalClose(this.ui.alertModal, 'alert-modal'); 
        },

        api: {
            async getMappings() {
                const response = await fetch('/mappings/');
                if (!response.ok) throw new Error('Could not fetch mappings.');
                return response.json();
            },
            async getMapping(id) {
                const response = await fetch(`/mappings/${id}`);
                if (!response.ok) throw new Error('Could not fetch mapping data.');
                return response.json();
            },
            async addMapping(payload) {
                const response = await fetch('/mappings/add', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(payload) 
                });
                return response.json();
            },
            async updateMapping(id, payload) {
                const response = await fetch(`/mappings/update/${id}`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(payload) 
                });
                return response.json();
            },
            async deleteMapping(id) {
                const response = await fetch(`/mappings/delete/${id}`, { method: 'POST' });
                return response.json();
            },
            async processFile(formData) {
                const response = await fetch('/process', { method: 'POST', body: formData });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to process file on the server.');
                }
                return result;
            }
        },

        handlers: {
            handleFileSelect(files) {
                if (files.length === 0) return;
                const file = files[0];

                const bank = App.ui.bankSelect?.value;
                if (!bank) {
                    App.render.showAlert('Warning', 'Please select a bank before uploading a file.', 'warning');
                    if (App.ui.fileInput) App.ui.fileInput.value = '';
                    return;
                }
                
                App.state.currentFile = file;
                App.render.updateUploadState('selected');
                if (App.ui.fileNameDisplay) App.ui.fileNameDisplay.textContent = file.name;
                if (App.ui.bankNameDisplay && App.ui.bankSelect) {
                    App.ui.bankNameDisplay.textContent = `Bank: ${App.ui.bankSelect.options[App.ui.bankSelect.selectedIndex].text}`;
                }
                
                App.ui.resultsContainer?.classList.add('hidden', 'opacity-0');
            },
            
            clearFile() {
                App.state.currentFile = null;
                if (App.ui.fileInput) App.ui.fileInput.value = '';
                App.render.updateUploadState('initial');
                App.ui.resultsContainer?.classList.add('hidden', 'opacity-0');
            },
            
            handleDragOver(e) {
                e.preventDefault();
                e.stopPropagation();
                if (App.ui.bankSelect?.value) {
                    App.ui.dropZone?.classList.add('dragover');
                }
            },
            
            handleDragLeave(e) {
                e.preventDefault();
                e.stopPropagation();
                App.ui.dropZone?.classList.remove('dragover');
            },

            handleDrop(e) {
                e.preventDefault();
                e.stopPropagation();
                App.ui.dropZone?.classList.remove('dragover');
                
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    App.handlers.handleFileSelect(e.dataTransfer.files);
                }
            },
            
            async processStatement() {
                const file = App.state.currentFile;
                const bank = App.ui.bankSelect?.value;
                const accountType = App.ui.accountTypeSelect?.value;

                console.log('Processing started:', { bank, accountType, fileName: file?.name });

                if (!bank || !file) {
                    return App.render.showAlert('Missing Information', 'Please select a bank and a statement file to process.', 'warning');
                }

                App.render.updateUploadState('processing');

                try {
                    const formData = new FormData();
                    formData.append('statement', file);
                    formData.append('bank', bank);
                    formData.append('account_type', accountType);

                    console.log('Sending request to /process...');
                    const result = await App.api.processFile(formData);
                    
                    console.log('Received result:', result);
                    
                    if (!result) {
                        throw new Error('Empty response from server');
                    }
                    
                    // --- CHANGE #1: Fix the error check ---
                    // This now checks if 'headers' is an array (even an empty one)
                    if (!result.rows || !Array.isArray(result.headers)) {
                        throw new Error('Invalid response format: ' + JSON.stringify(result));
                    }
                    
                    App.state.processedData = result;
                    App.render.updateUploadState('results');
                    App.render.renderResults(result);

                } catch (error) {
                    console.error('Processing error:', error);
                    App.render.updateUploadState('selected');
                    App.render.showAlert('Processing Error', error.message, 'error');
                }
            },
            
            downloadResults() {
                const data = App.state.processedData;
                if (!data || !data.rows || data.rows.length === 0) {
                    return App.render.showAlert('Download Error', 'No processed data available to download.', 'warning');
                }
                
                // --- CHANGE #2: Fix the text download ---
                const headers = data.headers; // No fallback
                
                const rows = data.rows.map(row => 
                    row.map(cell => (cell === null || cell === undefined) ? '' : String(cell)).join('\t')
                );
                
                let fileContent;
                if (headers && headers.length > 0) {
                    // Only add header if it exists
                    const header = headers.join('\t');
                    fileContent = [header, ...rows].join('\n');
                } else {
                    // Otherwise, just join the rows
                    fileContent = rows.join('\n');
                }

                const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `Processed_Statement_${new Date().toISOString().slice(0, 10)}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            },

            downloadExcel() {
                const data = App.state.processedData;
                if (!data || !data.rows || data.rows.length === 0) {
                    return App.render.showAlert('Download Error', 'No processed data available to download.', 'warning');
                }
                
                // --- CHANGE #3: Fix the Excel/CSV download ---
                const headers = data.headers; // No fallback
                
                const rows = data.rows.map(row => 
                    row.map(cell => {
                        const cellStr = (cell === null || cell === undefined) ? '' : String(cell);
                        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                            return `"${cellStr.replace(/"/g, '""')}"`;
                        }
                        return cellStr;
                    }).join(',')
                );

                let csvContent;
                if (headers && headers.length > 0) {
                    // Only add header if it exists
                    csvContent = [
                        headers.join(','),
                        ...rows
                    ].join('\n');
                } else {
                    // Otherwise, just join the rows
                    csvContent = rows.join('\n');
                }

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `Processed_Statement_${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            },
            
            async openMappingModal() {
                try {
                    const mappings = await App.api.getMappings();
                    App.render.renderMappingTable(mappings);
                    App.render.openModal('mapping-modal');
                } catch (error) {
                    App.render.showAlert('Load Failed', error.message, 'error');
                }
            },
            
            async openMappingForm(mappingId) {
                const isEditing = mappingId !== null;
                App.ui.mappingForm?.reset();
                if (App.ui.formModalTitle) {
                    App.ui.formModalTitle.textContent = isEditing ? "Edit Mapping" : "Add New Mapping";
                }
                if (App.ui.mappingForm) {
                    App.ui.mappingForm.dataset.editingId = isEditing ? mappingId : '';
                }

                if (isEditing) {
                    try {
                        const mapping = await App.api.getMapping(mappingId);
                        
                        App.state.mappingFields.forEach(key => {
                            const input = App.ui.mappingForm?.elements[key];
                            if (input && mapping[key] !== null && mapping[key] !== undefined) {
                                input.value = mapping[key];
                            }
                        });
                        
                        const originalAcctNo = document.getElementById('original-account-no');
                        if (originalAcctNo) {
                            originalAcctNo.value = mapping.accountNo || '';
                        }

                    } catch(error) {
                        App.render.showAlert('Error', error.message, 'error');
                        return;
                    }
                } else {
                    const originalAcctNo = document.getElementById('original-account-no');
                    if (originalAcctNo) {
                        originalAcctNo.value = '';
                    }
                }
                App.render.openModal('mapping-form-modal');
            },

            async saveMapping(event) {
                event.preventDefault();
                const form = event.target;
                const editingId = form.dataset.editingId;
                const isEditing = !!editingId;
                
                const formData = new FormData(form);
                const payload = Object.fromEntries(formData.entries());

                try {
                    const result = isEditing 
                        ? await App.api.updateMapping(editingId, payload)
                        : await App.api.addMapping(payload);
                    
                    if (!result.success) throw new Error(result.error || 'Failed to save.');
                    
                    App.render.closeModal('mapping-form-modal');
                    const mappings = await App.api.getMappings();
                    App.render.renderMappingTable(mappings);
                    App.render.showAlert('Success', 'Mapping saved successfully.', 'success');

                } catch (error) {
                    App.render.showAlert('Save Failed', error.message, 'error');
                }
            },

            handleMappingTableClicks(event) {
                const editButton = event.target.closest('.edit-btn');
                const deleteButton = event.target.closest('.delete-btn');
                
                if (editButton) {
                    App.handlers.openMappingForm(editButton.dataset.id);
                }
                
                if (deleteButton) {
                    const mappingId = deleteButton.dataset.id;
                    
                    App.render.showAlert('Confirm Deletion', `Are you sure you want to delete mapping ID ${mappingId}?`, 'confirm', async () => {
                        try {
                            const result = await App.api.deleteMapping(mappingId);
                            if (!result.success) throw new Error(result.error);
                            
                            const mappings = await App.api.getMappings();
                            App.render.renderMappingTable(mappings);
                            App.render.showAlert('Success', 'Mapping deleted successfully.', 'success');
                        } catch (error) {
                            App.render.showAlert('Deletion Failed', error.message, 'error');
                        }
                    });
                }
            },

            handleBankSelection() {
                const selectedBank = App.ui.bankSelect?.value;
                const bankAccountTypes = { 'hdfc': true, 'icici': true };
                
                // Fixed: Added null check to prevent the error
                if (App.ui.accountTypeSelect) {
                    App.ui.accountTypeSelect.disabled = !bankAccountTypes[selectedBank];
                }

                if (App.state.currentFile) {
                    App.handlers.clearFile(); 
                }
            },
        },

        render: {
            updateUploadState(newState) {
                App.ui.uploadInitialState?.classList.add('hidden');
                App.ui.uploadSelectedState?.classList.add('hidden');
                App.ui.processingState?.classList.add('hidden');
                
                if (newState !== 'results') {
                    App.ui.resultsContainer?.classList.add('hidden', 'opacity-0');
                    if (App.ui.downloadBtn) App.ui.downloadBtn.disabled = true;
                    if (App.ui.downloadExcelBtn) App.ui.downloadExcelBtn.disabled = true;
                }

                switch (newState) {
                    case 'initial':
                        App.ui.uploadInitialState?.classList.remove('hidden');
                        break;
                    case 'selected':
                        App.ui.uploadSelectedState?.classList.remove('hidden');
                        break;
                    case 'processing':
                        App.ui.processingState?.classList.remove('hidden');
                        break;
                    case 'results':
                        App.ui.uploadSelectedState?.classList.remove('hidden');
                        App.ui.resultsContainer?.classList.remove('hidden');
                        setTimeout(() => App.ui.resultsContainer?.classList.remove('opacity-0'), 10);
                        if (App.ui.downloadBtn) App.ui.downloadBtn.disabled = false;
                        if (App.ui.downloadExcelBtn) App.ui.downloadExcelBtn.disabled = false;
                        break;
                }
            },
            
            renderResults(data) {
                // --- CHANGE #4: Fix the "blank row" ---
                // Use the headers from data, but do not provide a fallback
                const headers = data.headers;

                if (App.ui.dataTableHead) {
                    // Only render the header row IF headers exist and the list is not empty
                    if (headers && headers.length > 0) {
                        App.ui.dataTableHead.innerHTML = `
                            <tr class="bg-gray-100 sticky top-0 z-10">
                                ${headers.map(header => 
                                    `<th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">${header}</th>`
                                ).join('')}
                            </tr>
                        `;
                    } else {
                        // Otherwise, render an empty header
                        App.ui.dataTableHead.innerHTML = '';
                    }
                }
                
                if (App.ui.dataTableBody) {
                    App.ui.dataTableBody.innerHTML = data.rows.map(row => {
                        return `
                            <tr class="hover:bg-gray-50">
                                ${row.map(cell => 
                                    `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${(cell === null || cell === undefined || cell === '' || cell === 'NaN') ? '' : cell}</td>`
                                ).join('')}
                            </tr>
                        `;
                    }).join('');
                }
                
                if (App.ui.statusText) {
                    App.ui.statusText.textContent = `Found ${data.rows.length} transactions.`;
                }
            },
            
            renderMappingTable(mappings) {
                if (!mappings || mappings.length === 0) {
                    if (App.ui.mappingTableContainer) {
                        App.ui.mappingTableContainer.innerHTML = '<p class="text-center p-6 text-gray-500">No mappings defined.</p>';
                    }
                    return;
                }
                
                // Sort mappings by account number
                const sortedMappings = [...mappings].sort((a, b) => {
                    const accountA = String(a.accountNo || '').trim();
                    const accountB = String(b.accountNo || '').trim();
                    return accountA.localeCompare(accountB, undefined, { numeric: true });
                });
                
                const headerClass = "px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider";
                const cellClass = "px-6 py-4 whitespace-nowrap text-sm text-gray-800";
                
                const displayFields = App.state.displayFields;

                const headersHtml = displayFields.map(f => `<th class="${headerClass}">${f.header}</th>`).join('');
                const actionsHeader = App.state.isAdmin ? `<th class="${headerClass}">Actions</th>` : '';
                
                if (App.ui.mappingTableContainer) {
                    App.ui.mappingTableContainer.innerHTML = `
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-100">
                                <tr>
                                    ${headersHtml}
                                    ${actionsHeader}
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                            ${sortedMappings.map((row, index) => {
                                const cellsHtml = displayFields.map(f => {
                                    let value = row[f.key];
                                    // Replace database ID with sequential number
                                    if (f.key === 'id') {
                                        value = index + 1;
                                    }
                                    return `<td class="${cellClass} ${f.key === 'id' || f.key === 'accountNo' ? 'font-medium' : ''}">${value || '-'}</td>`;
                                }).join('');

                                return `
                                <tr class="hover:bg-gray-50">
                                    ${cellsHtml}
                                    ${App.state.isAdmin ? `
                                    <td class="${cellClass}">
                                        <button class="edit-btn text-green-600 hover:text-green-800 mr-4" data-id="${row.id}">Edit</button>
                                        <button class="delete-btn text-red-600 hover:text-red-800" data-id="${row.id}">Delete</button>
                                    </td>` : ''}
                                </tr>`;
                            }).join('')}
                            </tbody>
                        </table>`;
                }
            },
            
            openModal(modalId) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.remove('hidden');
                }
            },
            
            closeModal(modalId) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('hidden');
                }
            },
            
            showAlert(title, message, type, confirmCallback = null) {
                const modal = App.ui.alertModal;
                if (!modal) return;
                
                if (App.ui.alertTitle) App.ui.alertTitle.textContent = title;
                if (App.ui.alertMessage) App.ui.alertMessage.textContent = message;
                
                if (App.ui.alertIconContainer) {
                    App.ui.alertIconContainer.className = 'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10';
                }
                if (App.ui.alertIcon) {
                    App.ui.alertIcon.className = 'fas fa-2x';
                }
                
                let iconClass = '';
                let iconColor = '';
                let buttonsHtml = '';
                
                const buttonsDiv = document.getElementById('alert-buttons');
                App.state.currentConfirmCallback = null;

                switch (type) {
                    case 'success':
                        iconClass = 'fa-check-circle';
                        iconColor = 'bg-green-100 text-green-600';
                        buttonsHtml = `<button type="button" data-close-modal="alert-modal" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 main-button text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm">OK</button>`;
                        break;
                    case 'warning':
                        iconClass = 'fa-exclamation-triangle';
                        iconColor = 'bg-yellow-100 text-yellow-600';
                        buttonsHtml = `<button type="button" data-close-modal="alert-modal" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 main-button text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm">OK</button>`;
                        break;
                    case 'error':
                        iconClass = 'fa-times-circle';
                        iconColor = 'bg-red-100 text-red-600';
                        buttonsHtml = `<button type="button" data-close-modal="alert-modal" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 main-button text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm">Close</button>`;
                        break;
                    case 'confirm':
                        iconClass = 'fa-question-circle';
                        iconColor = 'bg-blue-100 text-blue-600';
                        buttonsHtml = `
                            <button id="alert-confirm-btn" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 main-button text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm">Confirm</button>
                            <button type="button" data-close-modal="alert-modal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
                        `;
                        App.state.currentConfirmCallback = confirmCallback;
                        break;
                }
                
                if (App.ui.alertIconContainer) {
                    App.ui.alertIconContainer.classList.add(...iconColor.split(' '));
                }
                if (App.ui.alertIcon) {
                    App.ui.alertIcon.classList.add(iconClass);
                }
                
                if (buttonsDiv) {
                    buttonsDiv.innerHTML = buttonsHtml;
                }
                
                App.render.openModal('alert-modal');

                if (type === 'confirm' && confirmCallback) {
                    setTimeout(() => {
                        const confirmBtn = document.getElementById('alert-confirm-btn');
                        if (confirmBtn) {
                            confirmBtn.addEventListener('click', () => {
                                App.render.closeModal('alert-modal');
                                confirmCallback();
                            }, { once: true });
                        }
                    }, 0);
                }
            }
        }
    };

    App.init();
});