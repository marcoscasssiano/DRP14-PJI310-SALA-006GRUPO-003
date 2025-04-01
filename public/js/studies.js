let allStudies = [];
let isTyping = false;

async function loadStudies() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado para buscar um estudo.');
        window.location.href = '/login';
        return;
    }

    const response = await fetch('/api/studies', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        }
    });
    allStudies = await response.json();
    renderStudies(allStudies);
    setupEventListeners();
}

function renderStudies(studies) {
    const studiesList = document.getElementById('studies-list');
    studiesList.innerHTML = '';

    studies.forEach(study => {
        const card = createStudyCard(study);
        studiesList.appendChild(card);
    });
}

function createStudyCard(study) {
    const card = document.createElement('div');
    card.className = 'study-card';
    const nextAnalysisDate = getNextAnalysisDate(study);
    const countdown = getCountdown(nextAnalysisDate);

    card.innerHTML = `
        <a href="/studies/${study._id}">
            <h2>${study.product}</h2>
            <p class="study-info">Lote: ${study.lot}</p>
            <p class="study-info">Natureza: ${study.nature}</p>
            <p class="countdown">Próxima análise em: ${countdown}</p>
        </a>
        <div class="pdf-buttons">
            <button class="pdf-button" data-study-id="${study._id}">Gerar PDF</button>
            <button class="pdf-button ia" data-study-id="${study._id}">IA</button>
        </div>
    `;

    // Atualiza o contador a cada segundo
    setInterval(() => {
        const updatedCountdown = getCountdown(nextAnalysisDate);
        card.querySelector('.countdown').textContent = `Próxima análise em: ${updatedCountdown}`;
    }, 1000);

    // Adiciona eventos de clique aos botões de PDF
    const pdfButtons = card.querySelectorAll('.pdf-button');
    pdfButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que o link do card seja acionado
            const studyId = button.getAttribute('data-study-id');

            if (button.classList.contains('ia')) {
                consultIA(studyId); // Chama a função de consulta à IA
            } else {
                generatePDF(studyId, false); // Gera o PDF normal
            }
        });
    });

    return card;
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');

    searchInput.addEventListener('input', filterAndSortStudies);
    sortSelect.addEventListener('change', filterAndSortStudies);
}

function filterAndSortStudies() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const sortMethod = document.getElementById('sort-select').value;

    let filteredStudies = allStudies.filter(study =>
        study.product.toLowerCase().includes(searchTerm)
    );

    filteredStudies.sort((a, b) => {
        switch (sortMethod) {
            case 'newest':
                return new Date(b.startDate) - new Date(a.startDate);
            case 'oldest':
                return new Date(a.startDate) - new Date(b.startDate);
            case 'next-analysis':
                const nextA = getNextAnalysisDate(a);
                const nextB = getNextAnalysisDate(b);
                if (!nextA && !nextB) return 0;
                if (!nextA) return 1;
                if (!nextB) return -1;
                return nextA - nextB;
        }
    });

    renderStudies(filteredStudies);
}

function getNextAnalysisDate(study) {
    const today = new Date();
    const startDate = new Date(study.startDate);
    const analysisDays = [0, 7, 15, 30, 60, 90];

    for (let days of analysisDays) {
        const analysisDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
        if (analysisDate > today) {
            return analysisDate;
        }
    }

    return null; // Retorna null se todas as análises já passaram
}

function getCountdown(date) {
    if (!date) return "Todas as análises concluídas";

    const now = new Date();
    const diff = date - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Função para mostrar o pop-up de carregamento
function showLoadingPopup() {
    const loadingPopup = document.getElementById('loading-popup');
    loadingPopup.style.display = 'flex';
}

// Função para esconder o pop-up de carregamento
function hideLoadingPopup() {
    const loadingPopup = document.getElementById('loading-popup');
    loadingPopup.style.display = 'none';
}

// Função para mostrar o pop-up de resposta da IA
function showResponsePopup(response) {
    const responsePopup = document.getElementById('response-popup');
    const responseText = document.getElementById('ia-response-text');
    responseText.textContent = response; // Insere a resposta da IA no pop-up
    responsePopup.style.display = 'flex';
}

// Função para esconder o pop-up de resposta da IA
function hideResponsePopup() {
    const responsePopup = document.getElementById('response-popup');
    responsePopup.style.display = 'none';
}

// Adiciona evento de clique ao botão "Fechar"
document.getElementById('close-popup')?.addEventListener('click', hideResponsePopup);

async function consultIA(studyId) {
    if (isTyping) return;

    try {
        showLoadingPopup();

        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para usar a IA.');
            window.location.href = '/login';
            hideLoadingPopup();
            return;
        }

        const study = allStudies.find(study => study._id === studyId);
        if (!study) {
            hideLoadingPopup();
            showResponsePopup("Estudo não encontrado.");
            return;
        }

        const studyData = formatStudyData(study); // Função separada para formatação

        const apiResponse = await fetch('/api/consulting-ia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: "Você é um técnico especializado em estabilidade de cosméticos. Sua tarefa é analisar dados de estudos técnicos e fornecer insights claros, concisos e baseados em evidências. Responda em português brasileiro, com linguagem técnica acessível, no máximo 1500 caracteres E al invés de markDown devolva com tags HTML."
                    },
                    {
                        role: "user",
                        content: `ANÁLISE ESTE ESTUDO E FORNEÇA:
1. Diagnóstico claro (ex: "oxidado", "pH instável")
2. Causas prováveis (ex: "falta de antioxidante", "emulsão fraca")
3. Soluções técnicas (ex: "Adicionar 0.5% de BHT", "Ajustar pH com citrato de sódio")

DADOS DO ESTUDO:
${studyData}`
                    }
                ]
            })
        });

        const responseData = await apiResponse.json();
        hideLoadingPopup();

        if (!apiResponse.ok) {
            throw new Error(responseData.error || "Erro na API");
        }

        const responsePopup = document.getElementById('response-popup');
        const responseText = document.getElementById('ia-response-text');
        
        responsePopup.style.display = 'flex';
        responseText.innerHTML = `
            <div class="ia-analysis">${responseData.response}</div>
            <button id="generate-ia-pdf" class="pdf-button">
                📄 Gerar PDF com esta Análise
            </button>
        `;

        // Evento para o novo botão
        document.getElementById('generate-ia-pdf').addEventListener('click', () => {
            generatePDF(studyId, true, responseData.response); // PDF com análise IA
        });

    } catch (error) {
        hideLoadingPopup();
        showResponsePopup(`⚠️ Erro: ${error.message}`);
        console.error("Erro na consulta IA:", error);
    }
}

// Função auxiliar para formatar dados do estudo
function formatStudyData(study) {
    return `
        Dados do Estudo:
        - Produto: ${study.product}
        - Lote: ${study.lot}
        - Natureza: ${study.nature}
        - Data de Início: ${new Date(study.startDate).toLocaleDateString()}
        - Responsável: ${study.responsible}
        - Número do Projeto: ${study.projectNumber}
        - Aprovado: ${study.approved ? "Sim" : "Não"}

        Condições:
        ${formatConditions(study.conditions)}

        Comentários:
        ${formatComments(study.comments)}
    `;
}

// Função para formatar as condições do estudo
function formatConditions(conditions) {
    let formattedConditions = '';
    for (const condition in conditions) {
        formattedConditions += `\n- Condição: ${condition.toUpperCase()}`;
        for (const day in conditions[condition]) {
            formattedConditions += `\n  - ${day}:`;
            for (const key in conditions[condition][day]) {
                if (key !== '_id') {
                    formattedConditions += `\n    - ${key}: ${conditions[condition][day][key]}`;
                }
            }
        }
    }
    return formattedConditions;
}

// Função para formatar os comentários do estudo
function formatComments(comments) {
    let formattedComments = '';
    for (const commentId in comments) {
        const comment = comments[commentId];
        formattedComments += `\n- Data: ${comment.date}`;
        formattedComments += `\n  - Comentário: ${comment.comment}`;
    }
    return formattedComments;
}

// Função para renderizar Markdown simples
function renderMarkdown(text) {
    return marked.parse(text);
}

// Função para mostrar texto com efeito de digitação
async function typeWriter(element, text, speed = 20) {
    isTyping = true;
    element.innerHTML = '';
    let i = 0;
    const htmlText = renderMarkdown(text);

    return new Promise((resolve) => {
        const timer = setInterval(() => {
            if (i < htmlText.length) {
                element.innerHTML = htmlText.substring(0, i + 1);
                i++;
                element.scrollTop = element.scrollHeight;
            } else {
                clearInterval(timer);
                element.classList.remove('typing-effect');
                isTyping = false;
                resolve();
            }
        }, speed);
    });
}

// Modifique a função showResponsePopup:
function showResponsePopup(response) {
    const responsePopup = document.getElementById('response-popup');
    const responseText = document.getElementById('ia-response-text');

    responsePopup.style.display = 'flex';
    responseText.classList.add('typing-effect');

    typeWriter(responseText, response).then(() => {
        responseText.classList.remove('typing-effect');
    });
}

// Evento para fechar o pop-up
document.getElementById('close-popup')?.addEventListener('click', () => {
    document.getElementById('response-popup').style.display = 'none';
});


loadStudies();