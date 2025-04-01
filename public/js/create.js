document.getElementById('create-study-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const initialConditions = {
        aspect: formData.get('initialConditions[aspect]'),
        color: formData.get('initialConditions[color]'),
        odor: formData.get('initialConditions[odor]'),
        pH: formData.get('initialConditions[pH]'),
        viscosity: formData.get('initialConditions[viscosity]')
    };

    // Criar uma condição vazia para os outros dias
    const emptyCondition = {
        aspect: ' ',
        color: ' ',
        odor: ' ',
        pH: ' ',
        viscosity: ' '
    };

    // Lista de todos os dias que precisamos
    const days = ['day0', 'day7', 'day15', 'day30', 'day60', 'day90'];
    
    // Criar a estrutura de condições para cada ambiente
    const createConditions = () => {
        const conditions = {};
        days.forEach(day => {
            conditions[day] = day === 'day0' ? {...initialConditions} : {...emptyCondition};
        });
        return conditions;
    };

    const data = {
        product: formData.get('product'),
        lot: formData.get('lot'),
        nature: formData.get('nature'),
        startDate: formData.get('startDate'),
        responsible: formData.get('responsible'),
        approved: formData.get('approved') ? true : false,
        conditions: {
            estufa: createConditions(),
            luz: createConditions(),
            escuro: createConditions(),
            geladeira: createConditions()
        }
    };

    const commentText = formData.get('comment');
    if (commentText) {
        data.comments = new Map();
        data.comments.set('initial', {
            date: new Date(),
            comment: commentText
        });
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado para criar um estudo.');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/api/studies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Estudo criado com sucesso!');
            window.location.href = '/studies';
        } else {
            alert('Falha ao criar o estudo: ' + result.msg);
        }
    } catch (error) {
        console.error('Erro ao criar estudo:', error);
        alert('Erro ao criar estudo. Por favor, tente novamente.');
    }
});

// Função para verificar a expiração do token
function checkTokenExpiration() {
    const expirationTime = sessionStorage.getItem('tokenExpiration');
    if (expirationTime && new Date().getTime() > expirationTime) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('tokenExpiration');
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        window.location.href = '/login';
    }
}

window.onload = checkTokenExpiration;