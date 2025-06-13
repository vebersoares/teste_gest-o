$(document).ready(function() {
    // Recupera usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || {});
    let precoTotal = 0;
    
    // Atualiza status dos botões com base no usuário
    function atualizarStatusBotoes() {
        $('.botao-item').each(function() {
            const $botao = $(this);
            const beneficioId = $botao.data('beneficio');
            const estaAtivo = usuarioLogado.beneficios && usuarioLogado.beneficios[beneficioId];
            
            $botao.toggleClass('ativo', estaAtivo);
            $botao.find('.status-premium').text(`(Premium: ${estaAtivo ? 'true' : 'false'})`);
            
            if (estaAtivo) {
                precoTotal += parseFloat($botao.data('valor'));
            }
        });
        
        $('#precoTotal').text(precoTotal.toFixed(2));
    }
    
    // Inicializa os botões
    atualizarStatusBotoes();
    
    // Configura clique nos botões
    $('.botao-item').click(function() {
        if (!usuarioLogado.id) {
            alert('Por favor, faça login antes de selecionar benefícios.');
            window.location.href = 'login.html';
            return;
        }
        
        const $botao = $(this);
        const beneficioId = $botao.data('beneficio');
        const valor = parseFloat($botao.data('valor'));
        const estaAtivo = $botao.hasClass('ativo');
        
        if (!estaAtivo) {
            // Ativa o benefício
            $botao.addClass('ativo');
            precoTotal += valor;
            
            if (!usuarioLogado.beneficios) {
                usuarioLogado.beneficios = {};
            }
            usuarioLogado.beneficios[beneficioId] = true;
        } else {
            // Desativa o benefício
            $botao.removeClass('ativo');
            precoTotal -= valor;
            delete usuarioLogado.beneficios[beneficioId];
        }
        
        // Atualiza visualização
        $botao.find('.status-premium').text(`(Premium: ${!estaAtivo ? 'true' : 'false'})`);
        $('#precoTotal').text(precoTotal.toFixed(2));
        
        // Atualiza no servidor
        atualizarUsuarioNoServidor();
    });
    
    // Botão "Marcar Todos"
    $('#marcarTodos').click(function() {
        if (!usuarioLogado.id) {
            alert('Por favor, faça login antes de selecionar benefícios.');
            window.location.href = 'login.html';
            return;
        }
        
        const todosAtivos = $('.botao-item.ativo').length === $('.botao-item').length;
        
        $('.botao-item').each(function() {
            const $botao = $(this);
            const beneficioId = $botao.data('beneficio');
            const valor = parseFloat($botao.data('valor'));
            
            if (!todosAtivos && !$botao.hasClass('ativo')) {
                $botao.addClass('ativo');
                precoTotal += valor;
                
                if (!usuarioLogado.beneficios) {
                    usuarioLogado.beneficios = {};
                }
                usuarioLogado.beneficios[beneficioId] = true;
            } else if (todosAtivos && $botao.hasClass('ativo')) {
                $botao.removeClass('ativo');
                precoTotal -= valor;
                delete usuarioLogado.beneficios[beneficioId];
            }
            
            $botao.find('.status-premium').text(`(Premium: ${!todosAtivos ? 'true' : 'false'})`);
        });
        
        $('#precoTotal').text(precoTotal.toFixed(2));
        atualizarUsuarioNoServidor();
    });
    
    // Botão Comprar
    $('#comprar').click(function() {
        if (!usuarioLogado.id) {
            alert('Por favor, faça login antes de comprar.');
            window.location.href = 'login.html';
            return;
        }
        
        if (precoTotal <= 0) {
            alert('Selecione pelo menos um benefício!');
            return;
        }
        
        // Atualiza o usuário como premium (opcional)
        usuarioLogado.premium = true;
        atualizarUsuarioNoServidor().then(() => {
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
            window.location.href = 'obrigado.html';
        });
    });
    
    // Função para atualizar usuário no JSON Server
    function atualizarUsuarioNoServidor() {
        return $.ajax({
            url: `http://localhost:3000/usuarios/${usuarioLogado.id}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(usuarioLogado)
        });
    }
});