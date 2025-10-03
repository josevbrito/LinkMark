<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkMark - Organize seus links</title>
    <link rel="stylesheet" href="/assets/css/app.css"/>
</head>
<body>
    <!-- Header com informações do usuário -->
    <header class="header">
        <div class="header-content">
            <div class="logo-section">
                <div class="logo">L</div>
                <span class="brand">LinkMark</span>
            </div>
            <div class="user-info hidden" id="userInfo">
                <span class="user-email" id="userEmail"></span>
                <button class="btn btn-danger" id="logoutBtn">Sair</button>
            </div>
        </div>
    </header>

    <!-- Tela de autenticação (Login/Registro) -->
    <div id="authScreen" class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1 id="authTitle">Bem-vindo</h1>
                <p id="authSubtitle">Entre para organizar seus links</p>
            </div>
            
            <form id="authForm">
                <div class="form-group">
                    <label>E-mail</label>
                    <input type="email" id="authEmail" required autocomplete="email" placeholder="seu@email.com">
                </div>
                
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" id="authPassword" required minlength="6" autocomplete="current-password" placeholder="••••••••">
                </div>
                
                <button type="submit" class="btn btn-primary btn-block" id="authSubmitBtn">
                    Entrar
                </button>
                
                <div class="alert" id="authAlert"></div>
            </form>
            
            <div class="auth-link">
                <span id="authToggleText">Não tem conta?</span>
                <a href="#" id="authToggleLink">Criar conta</a>
            </div>
        </div>
    </div>

    <!-- Tela principal do app -->
    <div id="appScreen" class="container hidden">
        <!-- Card de Categorias -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">📁 Categorias</h2>
            </div>
            
            <form id="categoryForm" class="grid grid-2">
                <input type="text" id="categoryInput" placeholder="Nome da categoria" required>
                <button type="submit" class="btn btn-success">Adicionar Categoria</button>
            </form>
            
            <div class="alert" id="categoryAlert"></div>
            
            <div class="items-list" id="categoriesList">
                <div class="empty-state">
                    <div class="empty-state-icon">📁</div>
                    <p>Nenhuma categoria ainda. Crie sua primeira!</p>
                </div>
            </div>
        </div>

        <!-- Card de Links -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">🔗 Links</h2>
            </div>
            
            <form id="linkForm">
                <div class="form-group">
                    <label>Categoria</label>
                    <select id="linkCategory" required>
                        <option value="">Selecione uma categoria</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>URL</label>
                    <input type="url" id="linkUrl" placeholder="https://exemplo.com" required>
                </div>
                
                <div class="grid grid-2">
                    <div class="form-group">
                        <label>Título (opcional)</label>
                        <input type="text" id="linkTitle" placeholder="Nome do link">
                    </div>
                    
                    <div class="form-group">
                        <label>Descrição (opcional)</label>
                        <input type="text" id="linkDescription" placeholder="Descrição breve">
                    </div>
                </div>
                
                <button type="submit" class="btn btn-success btn-block">Adicionar Link</button>
            </form>
            
            <div class="alert" id="linkAlert"></div>
            
            <div class="form-group" style="margin-top: 2rem;">
                <label>Filtrar por categoria</label>
                <select id="filterCategory">
                    <option value="">Todas as categorias</option>
                </select>
            </div>
            
            <div class="items-list" id="linksList">
                <div class="empty-state">
                    <div class="empty-state-icon">🔗</div>
                    <p>Nenhum link ainda. Adicione o primeiro!</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Editar Categoria -->
    <div id="editCategoryModal" class="modal-overlay hidden">
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">Editar Categoria</h3>
                <p class="modal-subtitle">Altere o nome da categoria</p>
            </div>
            <form id="editCategoryForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label>Nome da Categoria</label>
                        <input type="text" id="editCategoryName" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('editCategoryModal')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Salvar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Editar Link -->
    <div id="editLinkModal" class="modal-overlay hidden">
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">Editar Link</h3>
                <p class="modal-subtitle">Atualize as informações do link</p>
            </div>
            <form id="editLinkForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label>Categoria</label>
                        <select id="editLinkCategory" required>
                            <option value="">Selecione uma categoria</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>URL</label>
                        <input type="url" id="editLinkUrl" required>
                    </div>
                    <div class="form-group">
                        <label>Título (opcional)</label>
                        <input type="text" id="editLinkTitle">
                    </div>
                    <div class="form-group">
                        <label>Descrição (opcional)</label>
                        <textarea id="editLinkDescription"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('editLinkModal')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Salvar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Confirmar Exclusão -->
    <div id="confirmDeleteModal" class="modal-overlay hidden">
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">Confirmar Exclusão</h3>
                <p class="modal-subtitle" id="deleteMessage">Tem certeza que deseja excluir?</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('confirmDeleteModal')">
                    Cancelar
                </button>
                <button type="button" class="btn btn-danger" id="confirmDeleteBtn">
                    Excluir
                </button>
            </div>
        </div>
    </div>

    <!-- Modal Confirmar Logout -->
    <div id="confirmLogoutModal" class="modal-overlay hidden">
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">Confirmar Saída</h3>
                <p class="modal-subtitle">Deseja realmente sair da sua conta?</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('confirmLogoutModal')">
                    Cancelar
                </button>
                <button type="button" class="btn btn-danger" id="confirmLogoutBtn">
                    Sair
                </button>
            </div>
        </div>
    </div>

    </script>
    <script src="/assets/js/app.js"></script>

</body>
</html>