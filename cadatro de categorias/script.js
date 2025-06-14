// Captura o formulário e a tabela HTML
const form = document.getElementById('categoriaForm');
const tabela = document.getElementById('categoriaTabela');

let categorias = []; // Armazena as categorias no cliente
let categoriaEditandoId = null; // Guarda o ID da categoria que está sendo editada

// Evento ao submeter o formulário
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const data = document.getElementById('data').value;

    // Verifica se já existe uma categoria com o mesmo nome E descrição (ignora maiúsculas/minúsculas),
    // e que não seja a categoria que está sendo editada
    const existeDuplicado = categorias.some(cat =>
        cat.nome.toLowerCase() === nome.toLowerCase() &&
        cat.descricao.toLowerCase() === descricao.toLowerCase() &&
        cat.id !== categoriaEditandoId
    );
    if (existeDuplicado) {
        alert("Já existe uma categoria com esse nome e descrição.");
        return; // Interrompe o envio para evitar duplicação
    }

    const categoria = {
        nome,
        descricao,
        data,
        vinculada: Math.random() < 0.5
    };

    if (categoriaEditandoId) {
        // Atualizar categoria existente (PUT)
        fetch(`http://localhost:3000/categoria/${categoriaEditandoId}`, {
            method: "PUT",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(categoria)
        })
            .then(res => res.json())
            .then(dataAtualizada => {
                // Atualiza o item no array local
                categorias = categorias.map(cat => cat.id === categoriaEditandoId ? dataAtualizada : cat);
                atualizarTabela();
                form.reset();
                categoriaEditandoId = null; // Resetar edição
            })
            .catch(err => {
                console.error("Erro ao atualizar categoria no servidor:", err);
                alert("Erro ao atualizar categoria. Tente novamente.");
            });
    } else {
        // Criar nova categoria (POST)
        fetch("http://localhost:3000/categoria", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(categoria)
        })
            .then(res => res.json())
            .then(dataSalva => {
                categorias.push(dataSalva); // Esse dataSalva terá o ID do servidor!
                atualizarTabela();
                form.reset();
            })
            .catch(err => {
                console.error("Erro ao salvar categoria no servidor:", err);
                alert("Erro ao salvar categoria. Tente novamente.");
            });
    }
});

function atualizarTabela() {
    tabela.innerHTML = ''; // Limpa a tabela antes de atualizar

    categorias.forEach((cat) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${cat.nome}</td>
            <td>${cat.descricao}</td>
            <td>${cat.data}</td>
            <td>
                <button onclick="editarCategoria('${cat.id}')">Editar</button>
                <button onclick="excluirCategoria('${cat.id}')" class="excluir">Excluir</button>
            </td>
        `;

        tabela.appendChild(tr);
    });
}

// Função para excluir uma categoria (sem restrição no campo 'vinculada')
function excluirCategoria(id) {
    const categoria = categorias.find(c => c.id === id);

    if (!categoria) {
        alert("Categoria não encontrada.");
        return;
    }

    fetch(`http://localhost:3000/categoria/${id}`, {
        method: 'DELETE'
    })
        .then(() => {
            // Atualiza o array local e tabela somente após confirmação do servidor
            categorias = categorias.filter(cat => cat.id !== id);
            atualizarTabela();
        })
        .catch(err => {
            console.error("Erro ao excluir categoria:", err);
            alert("Erro ao excluir categoria. Tente novamente.");
        });
}

// Função para editar uma categoria
function editarCategoria(id) {
    const categoria = categorias.find(cat => cat.id === id);

    if (categoria) {
        document.getElementById('nome').value = categoria.nome;
        document.getElementById('descricao').value = categoria.descricao;
        document.getElementById('data').value = categoria.data;

        categoriaEditandoId = id; // Define que está editando essa categoria
    }
}

// Carrega as categorias salvas no servidor ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    fetch("http://localhost:3000/categoria")
        .then(response => response.json())
        .then(data => {
            categorias = data;
            atualizarTabela();
        })
        .catch(error => console.error("Erro ao carregar categorias:", error));
});
