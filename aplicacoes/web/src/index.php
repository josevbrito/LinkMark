<?php
$apiUrl = getenv('API_URL') ?: 'http://localhost:8000';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>LinkMark</title>
    <link rel="stylesheet" href="/assets/css/app.css"/>
</head>
<body>
<header class="header">
    <div class="logo"></div>
    <div class="title">LinkMark · Web</div>
    <div class="header-actions" id="headerActions" style="display: none;">
        <span id="userEmail" class="user-email"></span>
        <button id="logoutBtn" class="btn-logout">Sair</button>
    </div>
</header>

<div class="container">
    <!-- Tela de Login/Registro -->
    <div id="authScreen" class="auth-screen">
        <div class="panel auth-panel">
            <h2 id="authTitle">Entrar no LinkMark</h2>
            <form id="authForm">
                <input type="email" id="authEmail" placeholder="E-mail" required autocomplete="email"/>
                <input type="password" id="authPassword" placeholder="Senha (mín. 6 caracteres)" required minlength="6" autocomplete="current-password"/>
                <button type="submit" id="authSubmitBtn">Entrar</button>
                <div class="status" id="authStatus"></div>
            </form>
            <div class="auth-toggle">
                <span id="authToggleText">Não tem conta?</span>
                <a href="#" id="authToggleLink">Criar conta</a>
            </div>
        </div>
    </div>

    <!-- Tela Principal (App) -->
    <div id="appScreen" style="display: none;">
        <!-- Painel de Categorias -->
        <div class="panel">
            <h3>Categorias</h3>
            <div class="row">
                <input type="text" id="categoryInput" placeholder="Nome da categoria"/>
                <button id="addCategoryBtn">Adicionar</button>
            </div>
            <div class="status" id="categoryStatus"></div>
            <div class="list" id="categoriesList"></div>
        </div>

        <!-- Painel de Links -->
        <div class="panel" style="margin-top: 16px;">
            <h3>Links</h3>
            <div class="form-group">
                <select id="linkCategorySelect">
                    <option value="">Selecione uma categoria</option>
                </select>
            </div>
            <div class="form-group">
                <input type="url" id="linkUrl" placeholder="URL do link"/>
            </div>
            <div class="row">
                <input type="text" id="linkTitle" placeholder="Título (opcional)"/>
                <input type="text" id="linkDescription" placeholder="Descrição (opcional)"/>
            </div>
            <button id="addLinkBtn" style="width: 100%; margin-top: 8px;">Adicionar Link</button>
            <div class="status" id="linkStatus"></div>

            <!-- Filtro de links -->
            <div class="filter-section">
                <label class="small">Filtrar por categoria:</label>
                <select id="filterCategorySelect">
                    <option value="">Todas as categorias</option>
                </select>
            </div>

            <div class="list" id="linksList"></div>
        </div>

        <div class="footer">
            API URL: <code><?php echo htmlspecialchars($apiUrl, ENT_QUOTES); ?></code>
        </div>
    </div>
</div>

<script>
    window.__CONFIG__ = {API_URL: <?php echo json_encode($apiUrl); ?> };
</script>
<script src="/assets/js/app.js"></script>
</body>
</html>