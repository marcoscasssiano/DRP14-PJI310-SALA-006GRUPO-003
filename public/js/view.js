// Funções de utilidade
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const log = console.log;

// Variáveis globais
const studyId = window.location.pathname.split('/').pop();
const token = sessionStorage.getItem('token');

// Função principal para carregar o estudo
async function loadStudy() {
    if (!token) {
        alert('Você precisa estar logado para buscar um estudo.');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch(`/api/studies/${studyId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar o estudo');
        }

        const study = await response.json();
        log('Estudo carregado:', study);

        populateStudyData(study);
        createTables(study.conditions);
        createComments('OBSERVAÇÕES:', study.comments);
        createApprovalSection(study);
        setupButtons();
    } catch (error) {
        log('Erro ao carregar o estudo:', error);
        alert('Erro ao carregar o estudo. Por favor, tente novamente.');
    }
}

// Popula os dados básicos do estudo
function populateStudyData(study) {
    $('#product').textContent = study.product;
    $('#lot').textContent = study.lot;
    $('#nature').textContent = study.nature;
    $('#startDate').textContent = new Date(study.startDate).toLocaleDateString('pt-BR');

    if (study.conditions?.estufa?.day0) {
        const day0 = study.conditions.estufa.day0;
        $('#aspect').textContent = day0.aspect || '';
        $('#color').textContent = day0.color || '';
        $('#odor').textContent = day0.odor || '';
        $('#pH').textContent = day0.pH || '';
        $('#viscosity').textContent = day0.viscosity || '';
    }
}

// Cria as tabelas de condições
function createTables(conditions) {
    const tableContainer = $('#conditionsTables');
    tableContainer.innerHTML = '';

    const conditionTitles = {
        'LUZ:': 'luz',
        'ESCURO:': 'escuro',
        'ESTUFA:': 'estufa',
        'GELADEIRA:': 'geladeira'
    };

    for (const [title, key] of Object.entries(conditionTitles)) {
        const conditionData = conditions[key];
        if (conditionData) {
            const tableData = Object.entries(conditionData)
                .filter(([day]) => day !== 'day0')
                .map(([day, data]) => ({ day, ...data }));
            createTable(title, tableData, key, tableContainer);
        }
    }
}

// Cria uma tabela individual
function createTable(title, data, conditionKey, container) {
    const tableDiv = document.createElement('div');
    tableDiv.innerHTML = `
        <h2>${title}</h2>
        <table border="1">
            <thead>
                <tr>
                    ${['Dia', 'Aspecto', 'Cor', 'Odor', 'pH', 'Viscosidade (cP)'].map(h => `<th>${h}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${data.map(entry => `
                    <tr>
                        <td>${entry.day.replace('day', 'Dia ')}</td>
                        ${['aspect', 'color', 'odor', 'pH', 'viscosity'].map(field => `
                            <td><input type="text" id="${conditionKey}.${entry.day}.${field}" value="${entry[field] || ''}"></td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.appendChild(tableDiv);
}

// Cria a seção de comentários
function createComments(title, comments = {}) {
    const container = $('#conditionsTables');
    const commentsSection = document.createElement('div');
    commentsSection.id = 'commentsSection';
    commentsSection.innerHTML = `
        <h2>${title}</h2>
        <div id="commentsList">
            ${Object.entries(comments).map(([key, comment]) => `
                <div class="comment-item">
                    <p>Data: ${new Date(comment.date).toLocaleDateString('pt-BR')}</p>
                    <input type="text" class="existing-comment" data-comment-id="${comment._id}" value="${comment.comment}">
                </div>
            `).join('')}
        </div>
        <button type="button" class="add-comment-button">Adicionar Comentário</button>
    `;
    container.appendChild(commentsSection);

    $('.add-comment-button').addEventListener('click', createNewCommentField);
}

// Cria um novo campo de comentário
function createNewCommentField() {
    const commentsList = $('#commentsList');
    const newCommentDiv = document.createElement('div');
    newCommentDiv.className = 'comment-item';
    newCommentDiv.innerHTML = `
        <input type="text" class="new-comment" placeholder="Digite seu comentário aqui">
    `;
    commentsList.appendChild(newCommentDiv);
}

// Cria a seção de aprovação
function createApprovalSection(study) {
    const container = $('#approvedAndResponsible');
    container.innerHTML = `
        <input type="radio" id="approvedRadio" name="approval" value="approved" ${study.approved ? 'checked' : ''}>
        <label for="approvedRadio">APROVADO</label>
        <input type="radio" id="rejectedRadio" name="approval" value="rejected" ${study.approved === false ? 'checked' : ''}>
        <label for="rejectedRadio">REPROVADO</label>
        <label for="responsibleInput">RESPONSÁVEL:</label>
        <input type="text" id="responsibleInput" placeholder="Nome do responsável" value="${study.responsible || ''}">
    `;
}

// Configura os botões
function setupButtons() {
    $('#backButton').addEventListener('click', () => window.location.href = '/studies');
    $('#saveButton').addEventListener('click', saveData);
    $('#deleteButton').addEventListener('click', deleteStudy);
}

// Função para salvar os dados
async function saveData() {
    const updatedData = {
        conditions: {},
        newComments: [],
        updatedComments: [],
        approved: $('#approvedRadio').checked,
        responsible: $('#responsibleInput').value.trim()
    };

    // Coleta mudanças nas condições
    $$('input[id*="."]').forEach(input => {
        if (input.value !== input.defaultValue) {
            const [condition, day, field] = input.id.split('.');
            if (!updatedData.conditions[condition]) {
                updatedData.conditions[condition] = {};
            }
            if (!updatedData.conditions[condition][day]) {
                updatedData.conditions[condition][day] = {};
            }
            updatedData.conditions[condition][day][field] = input.value;
        }
    });

    // Coleta novos comentários
    $$('.new-comment').forEach(input => {
        if (input.value.trim()) {
            updatedData.newComments.push({
                comment: input.value.trim(),
                date: new Date()
            });
        }
    });

    // Coleta comentários existentes modificados
    $$('.existing-comment').forEach(input => {
        if (input.value !== input.defaultValue) {
            updatedData.updatedComments.push({
                id: input.getAttribute('data-comment-id'),
                comment: input.value
            });
        }
    });

    if (Object.keys(updatedData.conditions).length === 0 &&
        updatedData.newComments.length === 0 &&
        updatedData.updatedComments.length === 0) {
        alert('Nenhuma mudança detectada.');
        return;
    }

    log('Dados a serem enviados:', updatedData);

    try {
        const saveResponse = await fetch(`/api/studies/${studyId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(updatedData)
        });

        log('Resposta do servidor:', saveResponse);

        if (saveResponse.ok) {
            const responseData = await saveResponse.json();
            log('Dados da resposta:', responseData);
            alert('Dados salvos com sucesso!');
            location.reload();
        } else {
            const errorData = await saveResponse.json();
            log('Erro do servidor:', errorData);
            alert(`Erro ao salvar os dados: ${errorData.message || 'Erro desconhecido'}`);
        }
    } catch (error) {
        log('Erro ao salvar:', error);
        alert('Erro ao salvar os dados. Por favor, tente novamente.');
    }
}

// Função para deletar o estudo
async function deleteStudy() {
    if (!confirm('Tem certeza que deseja deletar este estudo? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        const response = await fetch(`/api/studies/${studyId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });

        if (response.ok) {
            alert('Estudo deletado com sucesso!');
            window.location.href = '/studies';
        } else {
            const errorData = await response.json();
            alert(`Erro ao deletar o estudo: ${errorData.msg || 'Erro desconhecido'}`);
        }
    } catch (error) {
        log('Erro ao deletar:', error);
        alert('Erro ao deletar o estudo. Por favor, tente novamente.');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {

    const form = document.createElement('form');
    form.id = 'studyForm';
    document.body.appendChild(form);

    const conditionsTables = document.createElement('div');
    conditionsTables.id = 'conditionsTables';
    form.appendChild(conditionsTables);

    loadStudy();
});