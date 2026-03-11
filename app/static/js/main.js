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
// app/static/js/main.js
// app/static/js/main.js
// app/static/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const App = {
        state: {
            isAdmin: document.body.dataset.isAdmin === 'true',
            currentFile: null, 
            processedData: null, 
            currentConfirmCallback: null, 
            
            // NEW: State for Search and Sort
            mappingsData: [], 
            mappingSearchQuery: '',
            mappingSortConfig: { key: 'accountNo', direction: 'asc' },

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
            this.bindEvents();
            if (this.ui.bankSelect) this.handlers.handleBankSelection();
        },

        cacheDOMElements() {
            this.ui.bankSelect = document.getElementById('bank-select');
            this.ui.accountTypeSelect = document.getElementById('account-type-select');
            this.ui.dropZone = document.getElementById('drop-zone');
            this.ui.fileInput = document.getElementById('statement-file');
            this.ui.processBtn = document.getElementById('process-btn');
            this.ui.clearFileBtn = document.getElementById('clear-file-btn');
            this.ui.downloadBtn = document.getElementById('download-btn');
            this.ui.downloadExcelBtn = document.getElementById('download-excel-btn');
            this.ui.pushSapBtn = document.getElementById('push-sap-btn'); 
            this.ui.fileNameDisplay = document.getElementById('file-name');
            this.ui.bankNameDisplay = document.getElementById('bank-name-display');
            this.ui.uploadInitialState = document.getElementById('upload-initial-state');
            this.ui.uploadSelectedState = document.getElementById('upload-selected-state');
            this.ui.processingState = document.getElementById('processing-state');
            this.ui.resultsContainer = document.getElementById('results-container');
            this.ui.dataTableBody = document.getElementById('data-table-body');
            this.ui.dataTableHead = document.getElementById('data-table-head');
            this.ui.statusText = document.getElementById('status-text');
            
            this.ui.manageMappingsBtn = document.getElementById('manage-mappings-btn');
            this.ui.mappingModal = document.getElementById('mapping-modal');
            this.ui.mappingTableContainer = document.getElementById('mapping-table-container');
            this.ui.addNewMappingBtn = document.getElementById('add-new-mapping-btn');
            this.ui.mappingSearch = document.getElementById('mapping-search'); // NEW: Search Input
            
            this.ui.mappingFormModal = document.getElementById('mapping-form-modal');
            this.ui.mappingForm = document.getElementById('mapping-form');
            this.ui.formModalTitle = document.getElementById('form-modal-title');
            
            this.ui.alertModal = document.getElementById('alert-modal');
            this.ui.alertTitle = document.getElementById('alert-title');
            this.ui.alertMessage = document.getElementById('alert-message');
            this.ui.alertIcon = document.getElementById('alert-icon');
            this.ui.alertIconContainer = document.getElementById('alert-icon-container');
        },

        bindEvents() {
            this.ui.manageMappingsBtn?.addEventListener('click', () => this.handlers.openMappingModal());
            this.ui.addNewMappingBtn?.addEventListener('click', () => this.handlers.openMappingForm(null));
            this.ui.mappingForm?.addEventListener('submit', (e) => this.handlers.saveMapping(e));
            this.ui.mappingTableContainer?.addEventListener('click', (e) => this.handlers.handleMappingTableClicks(e));
            this.ui.bankSelect?.addEventListener('change', () => this.handlers.handleBankSelection());

            // NEW: Search and Sort Event Listeners
            this.ui.mappingSearch?.addEventListener('input', (e) => this.handlers.handleMappingSearch(e));
            document.addEventListener('sort-mapping', (e) => this.handlers.handleMappingSort(e.detail));

            this.ui.dropZone?.addEventListener('click', () => this.ui.fileInput.click()); 
            this.ui.fileInput?.addEventListener('change', (e) => this.handlers.handleFileSelect(e.target.files)); 
            this.ui.clearFileBtn?.addEventListener('click', () => this.handlers.clearFile()); 
            this.ui.processBtn?.addEventListener('click', () => this.handlers.processStatement()); 
            this.ui.downloadBtn?.addEventListener('click', () => this.handlers.downloadResults()); 
            this.ui.downloadExcelBtn?.addEventListener('click', () => this.handlers.downloadExcel());
            this.ui.pushSapBtn?.addEventListener('click', () => this.handlers.pushToSAP()); 

            this.ui.dropZone?.addEventListener('dragover', (e) => this.handlers.handleDragOver(e));
            this.ui.dropZone?.addEventListener('dragleave', (e) => this.handlers.handleDragLeave(e));
            this.ui.dropZone?.addEventListener('drop', (e) => this.handlers.handleDrop(e));
            
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
            },
            async pushToSAP(payload) {
                const response = await fetch('/push-to-sap', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(payload) 
                });
                return response.json();
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
            
            async processStatement(selectedAccount = null) {
                const file = App.state.currentFile;
                const bank = App.ui.bankSelect?.value;
                const accountType = App.ui.accountTypeSelect?.value;

                if (!bank || !file) {
                    return App.render.showAlert('Missing Information', 'Please select a bank and a statement file to process.', 'warning');
                }

                App.render.updateUploadState('processing');

                try {
                    const formData = new FormData();
                    formData.append('statement', file);
                    formData.append('bank', bank);
                    formData.append('account_type', accountType);
                    
                    if (selectedAccount) {
                        formData.append('selected_account', selectedAccount);
                    }

                    const result = await App.api.processFile(formData);
                    
                    if (!result) throw new Error('Empty response from server');

                    if (result.status === 'multiple_accounts') {
                        App.render.updateUploadState('selected'); 
                        App.render.showAccountSelectionModal(result.accounts, (chosenAccount) => {
                            App.handlers.processStatement(chosenAccount);
                        });
                        return; 
                    }
                    
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
                    return App.render.showAlert('Download Error', 'No processed data available.', 'warning');
                }
                
                const headers = data.headers; 
                const groups = {};
                
                data.rows.forEach(row => {
                    const accNo = row[row.length - 1] || 'Report';
                    if (!groups[accNo]) groups[accNo] = [];
                    groups[accNo].push(row);
                });

                const accountNumbers = Object.keys(groups);
                
                accountNumbers.forEach((accNo, index) => {
                    setTimeout(() => {
                        const groupRows = groups[accNo];
                        
                        const rowStrings = groupRows.map(row => 
                            row.slice(0, -1).map(cell => (cell === null || cell === undefined) ? '' : String(cell)).join('|') + '|'
                        );
                        
                        let fileContent;
                        if (headers && headers.length > 0) {
                            const headerString = headers.join('|') + '|'; 
                            fileContent = [headerString, ...rowStrings].join('\n');
                        } else {
                            fileContent = rowStrings.join('\n');
                        }
                        
                        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Statement_${accNo}_${new Date().toISOString().slice(0, 10)}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                    }, index * 1000); 
                });
            },

            downloadExcel() {
                const data = App.state.processedData;
                if (!data || !data.rows || data.rows.length === 0) {
                    return App.render.showAlert('Download Error', 'No processed data available to download.', 'warning');
                }
                
                const headers = data.headers;
                const groups = {};
                
                data.rows.forEach(row => {
                    const accNo = row[row.length - 1] || 'Report';
                    if (!groups[accNo]) groups[accNo] = [];
                    groups[accNo].push(row);
                });

                const accountNumbers = Object.keys(groups);

                accountNumbers.forEach((accNo, index) => {
                    setTimeout(() => {
                        const groupRows = groups[accNo];
                        
                        const csvRows = groupRows.map(row => 
                            row.slice(0, -1).map(cell => {
                                const cellStr = (cell === null || cell === undefined) ? '' : String(cell);
                                if (/^\d{10,}$/.test(cellStr)) {
                                    return `="${cellStr}"`;
                                }
                                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                                    return `"${cellStr.replace(/"/g, '""')}"`;
                                }
                                return cellStr;
                            }).join(',') 
                        );

                        let csvContent;
                        if (headers && headers.length > 0) {
                            csvContent = [headers.join(','), ...csvRows].join('\n');
                        } else {
                            csvContent = csvRows.join('\n');
                        }

                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Statement_${accNo}_${new Date().toISOString().slice(0, 10)}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                    }, index * 1000); 
                });
                
                if (accountNumbers.length > 1) {
                    App.render.showAlert('Downloads Started', `Downloading ${accountNumbers.length} files...`, 'success');
                }
            },

            async pushToSAP() {
                const data = App.state.processedData;
                if (!data || !data.rows || data.rows.length === 0) {
                    return App.render.showAlert('Error', 'No processed data available.', 'warning');
                }
                
                const headers = data.headers; 
                const groups = {};
                
                data.rows.forEach(row => {
                    const accNo = row[row.length - 1] || 'Report';
                    if (!groups[accNo]) groups[accNo] = [];
                    groups[accNo].push(row);
                });

                const filesToPush = [];
                const accountNumbers = Object.keys(groups);

                accountNumbers.forEach((accNo) => {
                    const groupRows = groups[accNo];
                    const rowStrings = groupRows.map(row => 
                        row.slice(0, -1).map(cell => (cell === null || cell === undefined) ? '' : String(cell)).join('|') + '|'
                    );
                    
                    let fileContent;
                    if (headers && headers.length > 0) {
                        const headerString = headers.join('|') + '|'; 
                        fileContent = [headerString, ...rowStrings].join('\n');
                    } else {
                        fileContent = rowStrings.join('\n');
                    }
                    
                    const fileName = `Statement_${accNo}_${new Date().toISOString().slice(0, 10)}.txt`;
                    filesToPush.push({ fileName, fileContent });
                });

                try {
                    const result = await App.api.pushToSAP({ files: filesToPush });
                    if (result.success) {
                        App.render.showAlert('Success', result.message, 'success');
                    } else {
                        throw new Error(result.error || 'Failed to push files.');
                    }
                } catch (error) {
                    App.render.showAlert('Push Failed', error.message, 'error');
                }
            },
            
            // NEW: Search and Sort Handlers
            handleMappingSearch(e) {
                App.state.mappingSearchQuery = e.target.value.toLowerCase();
                App.render.renderMappingTable();
            },

            handleMappingSort(key) {
                let direction = 'asc';
                if (App.state.mappingSortConfig.key === key && App.state.mappingSortConfig.direction === 'asc') {
                    direction = 'desc';
                }
                App.state.mappingSortConfig = { key, direction };
                App.render.renderMappingTable();
            },

            async openMappingModal() {
                try {
                    const mappings = await App.api.getMappings();
                    
                    // Reset search and sort when opening
                    App.state.mappingsData = mappings;
                    App.state.mappingSearchQuery = '';
                    if (App.ui.mappingSearch) App.ui.mappingSearch.value = '';
                    App.state.mappingSortConfig = { key: 'accountNo', direction: 'asc' };
                    
                    App.render.renderMappingTable();
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
                    
                    // Refresh internal data state
                    const mappings = await App.api.getMappings();
                    App.state.mappingsData = mappings;
                    App.render.renderMappingTable();
                    
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
                            
                            // Refresh internal data state
                            const mappings = await App.api.getMappings();
                            App.state.mappingsData = mappings;
                            App.render.renderMappingTable();
                            
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
                    if (App.ui.pushSapBtn) App.ui.pushSapBtn.disabled = true;
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
                        if (App.ui.pushSapBtn) App.ui.pushSapBtn.disabled = false;
                        break;
                }
            },
            
            renderResults(data) {
                const headers = data.headers;

                if (App.ui.dataTableHead) {
                    if (headers && headers.length > 0) {
                        App.ui.dataTableHead.innerHTML = `
                            <tr class="bg-gray-100 sticky top-0 z-10">
                                ${headers.map(header => 
                                    `<th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">${header}</th>`
                                ).join('')}
                            </tr>
                        `;
                    } else {
                        App.ui.dataTableHead.innerHTML = '';
                    }
                }
                
                if (App.ui.dataTableBody) {
                    App.ui.dataTableBody.innerHTML = data.rows.map(row => {
                        const visibleCells = row.slice(0, headers.length);
                        return `
                            <tr class="hover:bg-gray-50">
                                ${visibleCells.map(cell => 
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
            
            // NEW: Upgraded to support Search Filtering and Column Sorting
            renderMappingTable() {
                const mappings = App.state.mappingsData;
                
                if (!mappings || mappings.length === 0) {
                    if (App.ui.mappingTableContainer) {
                        App.ui.mappingTableContainer.innerHTML = '<p class="text-center p-6 text-gray-500">No mappings defined in database.</p>';
                    }
                    return;
                }
                
                // 1. Apply Search Filter
                const query = App.state.mappingSearchQuery;
                let filteredMappings = mappings;
                
                if (query) {
                    filteredMappings = mappings.filter(row => {
                        return Object.values(row).some(val => 
                            String(val || '').toLowerCase().includes(query)
                        );
                    });
                }
                
                // 2. Apply Sorting
                const sortConfig = App.state.mappingSortConfig;
                filteredMappings.sort((a, b) => {
                    const valA = String(a[sortConfig.key] || '').trim().toLowerCase();
                    const valB = String(b[sortConfig.key] || '').trim().toLowerCase();
                    
                    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                });
                
                const headerClass = "px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 select-none transition-colors duration-150";
                const cellClass = "px-6 py-4 whitespace-nowrap text-sm text-gray-800";
                const displayFields = App.state.displayFields;

                // Build Table Headers with Sort Arrows
                const headersHtml = displayFields.map(f => {
                    if (f.key === 'id') {
                        return `<th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">${f.header}</th>`;
                    }
                    
                    let sortIcon = '<span class="text-gray-400 opacity-0 group-hover:opacity-50 ml-1"><i class="fas fa-sort"></i></span>';
                    if (sortConfig.key === f.key) {
                        sortIcon = sortConfig.direction === 'asc' 
                            ? '<span class="text-green-600 ml-1"><i class="fas fa-sort-up"></i></span>' 
                            : '<span class="text-green-600 ml-1"><i class="fas fa-sort-down"></i></span>';
                    }
                    
                    return `<th class="${headerClass} group" onclick="document.dispatchEvent(new CustomEvent('sort-mapping', {detail: '${f.key}'}))">
                                <div class="flex items-center">${f.header} ${sortIcon}</div>
                            </th>`;
                }).join('');
                
                const actionsHeader = App.state.isAdmin ? `<th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>` : '';
                
                if (App.ui.mappingTableContainer) {
                    if (filteredMappings.length === 0) {
                        App.ui.mappingTableContainer.innerHTML = `<p class="text-center p-8 text-gray-500 font-medium">No records match your search.</p>`;
                        return;
                    }
                
                    App.ui.mappingTableContainer.innerHTML = `
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-100 sticky top-0 z-10">
                                <tr>
                                    ${headersHtml}
                                    ${actionsHeader}
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                            ${filteredMappings.map((row, index) => {
                                const cellsHtml = displayFields.map(f => {
                                    let value = row[f.key];
                                    if (f.key === 'id') value = index + 1;
                                    return `<td class="${cellClass} ${f.key === 'id' || f.key === 'accountNo' ? 'font-medium' : ''}">${value || '-'}</td>`;
                                }).join('');

                                return `
                                <tr class="hover:bg-blue-50 transition-colors">
                                    ${cellsHtml}
                                    ${App.state.isAdmin ? `
                                    <td class="${cellClass}">
                                        <button class="edit-btn text-blue-600 hover:text-blue-800 mr-4 font-medium" data-id="${row.id}"><i class="fas fa-edit mr-1"></i> Edit</button>
                                        <button class="delete-btn text-red-600 hover:text-red-800 font-medium" data-id="${row.id}"><i class="fas fa-trash-alt mr-1"></i> Delete</button>
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
            },

            showAccountSelectionModal(accounts, callback) {
                const existing = document.getElementById('dynamic-account-modal');
                if (existing) existing.remove();

                const optionsHtml = accounts.map(acc => `<option value="${acc}">${acc}</option>`).join('');

                const modalHtml = `
                    <div id="dynamic-account-modal" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div class="sm:flex sm:items-start">
                                        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <i class="fas fa-list text-blue-600"></i>
                                        </div>
                                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Masked Account Conflict</h3>
                                            <div class="mt-2">
                                                <p class="text-sm text-gray-500 mb-4">The file contains a masked account number that matches multiple mappings in your database. Please select the correct account:</p>
                                                <select id="dynamic-account-select" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                                    ${optionsHtml}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="button" id="dynamic-account-confirm" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Process Data</button>
                                    <button type="button" id="dynamic-account-cancel" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                document.body.insertAdjacentHTML('beforeend', modalHtml);

                document.getElementById('dynamic-account-confirm').addEventListener('click', () => {
                    const selected = document.getElementById('dynamic-account-select').value;
                    document.getElementById('dynamic-account-modal').remove();
                    callback(selected); 
                });

                document.getElementById('dynamic-account-cancel').addEventListener('click', () => {
                    document.getElementById('dynamic-account-modal').remove();
                });
            }
        }
    };

    App.init();
});