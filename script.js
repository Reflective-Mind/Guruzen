let textData = [];
let searchResults = [];

function createButtonWithIcon(text) {
    return `${text}`;
}

function createTabs() {
    const tabButtonsContainer = document.getElementById('tabButtons');
    tabButtonsContainer.innerHTML = '';
    textData.forEach((tab, index) => {
        const button = document.createElement('button');
        button.classList.add('tab-button', `tab-custom-${index}`);
        button.dataset.tabId = tab.id;
        button.textContent = tab.label;
        button.draggable = true;
        button.addEventListener('dragstart', (event) => dragStart(event, tab.id, 'tab'));
        button.addEventListener('dragover', (event) => dragOver(event));
        button.addEventListener('drop', (event) => drop(event, tab.id, 'tab'));
        button.addEventListener('dragenter', (event) => dragEnter(event, button));
        button.addEventListener('dragleave', (event) => dragLeave(event, button));
        button.addEventListener('click', () => showTab(tab.id));
        tabButtonsContainer.appendChild(button);
    });
}

function createTextAreas(tab) {
    const tabContent = document.createElement('div');
    tabContent.id = tab.id;
    tabContent.classList.add('tab-content');

    const addTextButton = document.createElement('button');
    addTextButton.textContent = "Add Text";
    addTextButton.classList.add('add-remove-button');
    addTextButton.addEventListener('click', () => addTextSnippet(tab.id));
    tabContent.appendChild(addTextButton);

    if (tab.texts && Array.isArray(tab.texts)) {
        tab.texts.forEach(item => {
            const container = document.createElement('div');
            container.classList.add('copy-container');
            container.dataset.textId = item.id;
            container.draggable = true;
            container.addEventListener('dragstart', (event) => dragStart(event, item.id, 'text', tab.id));
            container.addEventListener('dragover', (event) => dragOver(event));
            container.addEventListener('drop', (event) => drop(event, item.id, 'text', tab.id));
            container.addEventListener('dragenter', (event) => dragEnter(event, container));
            container.addEventListener('dragleave', (event) => dragLeave(event, container));

            const editContainer = document.createElement('div');
            editContainer.classList.add('edit-button-container');

            const removeButton = document.createElement('button');
            removeButton.classList.add('remove-button');
            removeButton.textContent = 'X';
            removeButton.addEventListener('click', () => removeTextSnippet(tab.id, item.id));
            container.appendChild(removeButton);

            const textarea = document.createElement('textarea');
            textarea.id = item.id;
            textarea.classList.add('hidden-textarea');
            textarea.value = item.text;
            textarea.addEventListener('input', () => saveTextEdit(item.id, 'text'));

            const button = document.createElement('button');
            button.classList.add('copy-button');
            button.innerHTML = createButtonWithIcon(item.buttonText);
            button.dataset.target = item.id;
            container.appendChild(button);

            const editButton = document.createElement('button');
            editButton.textContent = "✏️";
            editButton.classList.add('edit-button');
            editButton.addEventListener('click', () => toggleEdit(item.id, container));
            editContainer.appendChild(editButton);

            const input = document.createElement('input');
            input.type = 'text';
            input.id = item.id + '-input';
            input.classList.add('hidden-input');
            input.value = item.buttonText;
            input.addEventListener('input', () => saveTextEdit(item.id, 'buttonText'));

            const successSpan = document.createElement('span');
            successSpan.id = `success-${item.id}`;
            successSpan.classList.add('copy-success');
            successSpan.textContent = 'Copied!';

            editContainer.appendChild(input);
            editContainer.appendChild(textarea);

            container.appendChild(editContainer);
            container.appendChild(successSpan);

            tabContent.appendChild(container);
        });
    }
    return tabContent;
}

function loadTextEdits() {
    textData.forEach(tab => {
        if (tab && tab.texts) {
            tab.texts.forEach(item => {
                const textArea = document.getElementById(item.id);
                if (textArea) {
                    textArea.value = item.text;
                }
                const input = document.getElementById(item.id + '-input');
                const button = document.querySelector(`[data-target="${item.id}"]`);
                if (input) {
                    input.value = item.buttonText;
                    if (button) {
                        button.innerHTML = createButtonWithIcon(item.buttonText);
                    }
                }
            });
        }
    });
}

function createTabContents() {
    const tabContentsContainer = document.getElementById('tabContents');
    tabContentsContainer.innerHTML = '';
    textData.forEach(tab => {
        const content = createTextAreas(tab);
        tabContentsContainer.appendChild(content);
    });
}

function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(button => button.classList.remove('active'));
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    const activeTabButton = document.querySelector(`.tab-button[data-tab-id="${tabId}"]`);
    if (activeTabButton) {
        activeTabButton.classList.add('active');
    }

    localStorage.setItem('activeTab', tabId);
}

function toggleEdit(itemId, container) {
    const input = document.getElementById(itemId + '-input');
    const textArea = document.getElementById(itemId);
    if (input) {
        if (input.style.display === 'none' || input.style.display === '') {
            input.classList.remove('edit-mode');
            input.style.display = 'block';
        } else {
            input.classList.add('edit-mode');
            input.style.display = 'none';
        }
    }
    if (textArea) {
        if (textArea.style.display === 'none' || textArea.style.display === '') {
            textArea.classList.remove('edit-mode');
            textArea.style.display = 'block';
        } else {
            textArea.classList.add('edit-mode');
            textArea.style.display = 'none';
        }
    }
    const button = container.querySelector(`[data-target="${itemId}"]`);
    if (input && button && input.style.display === 'none') {
        button.innerHTML = createButtonWithIcon(input.value);
    }
}

function copyToClipboard(elementId, successId) {
    const textElement = document.getElementById(elementId);
    if (textElement) {
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = textElement.value;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        const successMessage = document.getElementById(successId);
        if (successMessage) {
            successMessage.classList.add('show-success');
            setTimeout(() => {
                successMessage.classList.remove('show-success');
            }, 2000);
        }
    }
}

function saveTextEdit(elementId, type) {
    const element = document.getElementById(elementId + (type === 'text' ? '' : '-input'));
    if (!element) return;

    if (type === 'text') {
        textData.forEach(tab => {
            if (tab && tab.texts) {
                tab.texts.forEach(item => {
                    if (item.id === elementId) {
                        item.text = element.value;
                    }
                });
            }
        });
    } else if (type === 'buttonText') {
        textData.forEach(tab => {
            if (tab && tab.texts) {
                tab.texts.forEach(item => {
                    if (item.id === elementId) {
                        item.buttonText = element.value;
                    }
                });
            }
        });
        const button = document.querySelector(`[data-target="${elementId}"]`);
        if (button) {
            button.innerHTML = createButtonWithIcon(element.value);
        }
    }
    saveData();
}

function loadActiveTab() {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
        showTab(savedTab);
    }
}

function addTextSnippet(tabId) {
    const tab = textData.find(tab => tab.id === tabId);
    if (tab) {
        const newTextId = `text-${tabId}-${Date.now()}`;
        if (!tab.texts) {
            tab.texts = [];
        }
        tab.texts.push({
            id: newTextId,
            buttonText: "Copy",
            text: "Text",
        });
        saveData();
        createTabContents();
        showTab(tabId);
    }
}

function removeTextSnippet(tabId, textId) {
    const tab = textData.find(tab => tab.id === tabId);
    if (tab && tab.texts) {
        tab.texts = tab.texts.filter(item => item.id !== textId);
        saveData();
        createTabContents();
        showTab(tabId);
    }
}

function addSection() {
    const newSectionName = document.getElementById('newSectionName').value || `Section ${textData.length + 1}`;
    const newSectionId = `section-${Date.now()}`;
    const newSection = {
        id: newSectionId,
        label: newSectionName,
        className: 'tab-custom',
        texts: [{
            id: `text-${newSectionId}-${Date.now()}`,
            buttonText: "Copy",
            text: "Text",
        }]
    };
    textData.push(newSection);
    document.getElementById('newSectionName').value = '';
    saveData();
    createTabs();
    createTabContents();
    showTab(newSectionId);
}

function openRemoveSectionModal() {
    const modal = document.getElementById('removeSectionModal');
    const sectionList = document.getElementById('sectionList');
    sectionList.innerHTML = '';
    textData.forEach(section => {
        const listItem = document.createElement('li');
        listItem.classList.add('section-list-item');
        listItem.textContent = section.label;
        listItem.addEventListener('click', () => removeSection(section.id));
        sectionList.appendChild(listItem);
    });
    modal.style.display = 'block';
}

function closeRemoveSectionModal() {
    const modal = document.getElementById('removeSectionModal');
    modal.style.display = 'none';
}

function removeSection(sectionId) {
    textData = textData.filter(tab => tab.id !== sectionId);
    saveData();
    createTabs();
    createTabContents();
    if (textData.length > 0) {
        showTab(textData[0].id);
    }
    closeRemoveSectionModal();
}

function saveData() {
    localStorage.setItem('textData', JSON.stringify(textData));
}

function loadData() {
    const storedData = localStorage.getItem('textData');
    if (storedData) {
        textData = JSON.parse(storedData);
    } else {
        const sectionId = `section-${Date.now()}`;
        textData = [{
            id: sectionId,
            label: `Section 1`,
            className: `tab-custom-0`,
            texts: [{
                id: `text-${sectionId}-${Date.now()}`,
                buttonText: "Copy",
                text: "Text",
            }]
        }];
        saveData();
    }
}

function exportData() {
    loadTextEdits();
    const jsonString = JSON.stringify(textData);
    const exportTextarea = document.getElementById('export-textarea');
    exportTextarea.value = jsonString;
    exportTextarea.style.display = 'block';
    exportTextarea.select();
    alert("Copy the text with CTRL+C or COMMAND+C. Then close this textbox to continue");
}

function importData() {
    const importTextarea = document.getElementById('import-textarea');
    try {
        const importedData = JSON.parse(importTextarea.value);
        if (Array.isArray(importedData)) {
            textData = importedData;
            saveData();
            createTabs();
            createTabContents();
            loadTextEdits();
            if (textData.length > 0) {
                showTab(textData[0].id);
            }
            alert('Data imported successfully!');
            importTextarea.value = '';
        } else {
            alert('Invalid data format. Please make sure it is valid.');
        }
    } catch (e) {
        alert('Failed to parse JSON data. Please make sure it is valid.');
        console.error("JSON parse error:", e);
        importTextarea.value = '';
    }
}

let draggedElement = null;
let draggedType = null;
let draggedTabId = null;

function dragStart(event, id, type, tabId = null) {
    draggedElement = id;
    draggedType = type;
    draggedTabId = tabId;
    event.dataTransfer.setData('text/plain', id);
}

function dragOver(event) {
    event.preventDefault();
}

function dragEnter(event, element) {
    if (element) {
        if (element.classList.contains('copy-container')) {
            element.classList.add('drag-over');
        }
    }
}

function dragLeave(event, element) {
    if (element) {
        if (element.classList.contains('copy-container')) {
            element.classList.remove('drag-over');
        }
    }
}

function drop(event, targetId, type, targetTabId = null) {
    event.preventDefault();
    if (draggedElement === null) return;

    if (draggedType === type && draggedType === 'tab') {
        reorderTabs(draggedElement, targetId);
    } else if (draggedType === type && draggedType === 'text' && draggedTabId === targetTabId) {
        reorderText(draggedElement, targetId, targetTabId);
    }
    draggedElement = null;
    draggedType = null;
    draggedTabId = null;
}

function reorderTabs(draggedId, targetId) {
    if (draggedId === targetId) return;

    const draggedIndex = textData.findIndex(tab => tab.id === draggedId);
    const targetIndex = textData.findIndex(tab => tab.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedItem] = textData.splice(draggedIndex, 1);
    textData.splice(targetIndex, 0, draggedItem);
    saveData();
    createTabs();
    createTabContents();
    showTab(draggedItem.id);
}

function reorderText(draggedId, targetId, tabId) {
    if (draggedId === targetId) return;

    const tab = textData.find(tab => tab.id === tabId);
    if (!tab || !tab.texts) return;
    const draggedIndex = tab.texts.findIndex(text => text.id === draggedId);
    const targetIndex = tab.texts.findIndex(text => text.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedItem] = tab.texts.splice(draggedIndex, 1);
    tab.texts.splice(targetIndex, 0, draggedItem);
    saveData();
    createTabContents();
    showTab(tabId);
}

function searchSnippets() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    textData.forEach(tab => {
        if (tab && tab.texts) {
            tab.texts.forEach(item => {
                const container = document.querySelector(`[data-text-id="${item.id}"]`);
                if (container) {
                    if (searchTerm === "" || item.text.toLowerCase().includes(searchTerm) || item.buttonText.toLowerCase().includes(searchTerm)) {
                        container.classList.remove('hidden-text-filtered');
                    } else {
                        container.classList.add('hidden-text-filtered');
                    }
                }
            });
        }
    });
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('copy-button')) {
        const targetId = event.target.dataset.target;
        copyToClipboard(targetId, `success-${targetId}`);
    }
});

window.onclick = function(event) {
    const modal = document.getElementById('removeSectionModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    createTabs();
    createTabContents();
    loadTextEdits();
    loadActiveTab();
    if (!localStorage.getItem('activeTab') && textData.length > 0) {
        showTab(textData[0].id);
    }
}); 