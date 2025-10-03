
// ==================== CONFIGURAÇÃO ====================
const API_URL = 'http://localhost:8000';

// Estado global da aplicação
const state = {
    token: null,              // Token de autenticação JWT
    user: null,               // Dados do usuário logado
    categories: [],           // Lista de categorias
    links: [],                // Lista de links
    isLogin: true,            // Modo de autenticação (true = login, false = registro)
    editingCategoryId: null,  // ID da categoria sendo editada
    editingLinkId: null,      // ID do link sendo editado
    deleteCallback: null      // Callback para confirmar exclusão
};

// Referências para elementos do DOM
const el = {
    authScreen: document.getElementById('authScreen'),
    appScreen: document.getElementById('appScreen'),
    userInfo: document.getElementById('userInfo'),
    userEmail: document.getElementById('userEmail'),
    authTitle: document.getElementById('authTitle'),
    authSubtitle: document.getElementById('authSubtitle'),
    authForm: document.getElementById('authForm'),
    authEmail: document.getElementById('authEmail'),
    authPassword: document.getElementById('authPassword'),
    authSubmitBtn: document.getElementById('authSubmitBtn'),
    authAlert: document.getElementById('authAlert'),
    authToggleText: document.getElementById('authToggleText'),
    authToggleLink: document.getElementById('authToggleLink'),
    logoutBtn: document.getElementById('logoutBtn'),
    categoryForm: document.getElementById('categoryForm'),
    categoryInput: document.getElementById('categoryInput'),
    categoryAlert: document.getElementById('categoryAlert'),
    categoriesList: document.getElementById('categoriesList'),
    linkForm: document.getElementById('linkForm'),
    linkCategory: document.getElementById('linkCategory'),
    linkUrl: document.getElementById('linkUrl'),
    linkTitle: document.getElementById('linkTitle'),
    linkDescription: document.getElementById('linkDescription'),
    linkAlert: document.getElementById('linkAlert'),
    filterCategory: document.getElementById('filterCategory'),
    linksList: document.getElementById('linksList'),
    editCategoryModal: document.getElementById('editCategoryModal'),
    editCategoryName: document.getElementById('editCategoryName'),
    editCategoryForm: document.getElementById('editCategoryForm'),
    editLinkModal: document.getElementById('editLinkModal'),
    editLinkCategory: document.getElementById('editLinkCategory'),
    editLinkUrl: document.getElementById('editLinkUrl'),
    editLinkTitle: document.getElementById('editLinkTitle'),
    editLinkDescription: document.getElementById('editLinkDescription'),
    editLinkForm: document.getElementById('editLinkForm'),
    confirmDeleteModal: document.getElementById('confirmDeleteModal'),
    deleteMessage: document.getElementById('deleteMessage'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn')
};

// ==================== FUNÇÕES UTILITÁRIAS ====================

/**
 * Exibe uma mensagem de alerta temporária
 * @param {HTMLElement} element - Elemento onde mostrar o alerta
 * @param {string} message - Mensagem a exibir
 * @param {boolean} isError - Se é mensagem de erro (true) ou sucesso (false)
 */
function showAlert(element, message, isError = false) {
    element.textContent = message;
    element.className = `alert show ${isError ? 'alert-error' : 'alert-success'}`;
    setTimeout(() => element.classList.remove('show'), 5000);
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Realiza requisição para a API
 * @param {string} endpoint - Endpoint da API
 * @param {object} options - Opções da requisição (method, body, etc)
 * @returns {Promise} Promessa com os dados da resposta
 */
async function apiRequest(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    
    // Adiciona token de autenticação se disponível
    if (state.token && !options.noAuth) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        mode: 'cors'
    });

    const text = await response.text();
    
    // Tenta parsear a resposta como JSON
    let data;
    try {
        data = text ? JSON.parse(text) : { success: true, data: null };
    } catch (e) {
        throw new Error('Resposta inválida do servidor');
    }
    
    // Verifica se houve erro na resposta
    if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
    }

    return data.data;
}

// ==================== FUNÇÕES DE MODAL ====================

/**
 * Abre um modal
 * @param {string} modalId
 */
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

/**
 * Fecha um modal
 * @param {string} modalId
 */
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// ==================== AUTENTICAÇÃO ====================

/**
 * Alterna entre modo de login e registro
 */
function toggleAuthMode() {
    state.isLogin = !state.isLogin;
    if (state.isLogin) {
        el.authTitle.textContent = 'Bem-vindo';
        el.authSubtitle.textContent = 'Entre para organizar seus links';
        el.authSubmitBtn.textContent = 'Entrar';
        el.authToggleText.textContent = 'Não tem conta?';
        el.authToggleLink.textContent = 'Criar conta';
    } else {
        el.authTitle.textContent = 'Criar conta';
        el.authSubtitle.textContent = 'Comece a organizar seus links';
        el.authSubmitBtn.textContent = 'Registrar';
        el.authToggleText.textContent = 'Já tem conta?';
        el.authToggleLink.textContent = 'Fazer login';
    }
    el.authAlert.classList.remove('show');
}

/**
 * Processa o formulário de autenticação (login/registro)
 * @param {Event} e
 */
async function handleAuth(e) {
    e.preventDefault();
    const email = el.authEmail.value.trim();
    const password = el.authPassword.value;

    // Desabilita botão durante o processamento
    el.authSubmitBtn.disabled = true;
    el.authSubmitBtn.innerHTML = '<span class="spinner"></span> Processando...';

    try {
        const endpoint = state.isLogin ? '/auth/login' : '/auth/register';
        const data = await apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            noAuth: true
        });

        // Salva token e dados do usuário
        state.token = data.token;
        state.user = data.user;

        showApp();
    } catch (error) {
        showAlert(el.authAlert, error.message, true);
    } finally {
        el.authSubmitBtn.disabled = false;
        el.authSubmitBtn.textContent = state.isLogin ? 'Entrar' : 'Registrar';
    }
}

/**
 * Faz logout do usuário
 */
function logout() {
    state.token = null;
    state.user = null;
    state.categories = [];
    state.links = [];
    el.authEmail.value = '';
    el.authPassword.value = '';
    showAuth();
}

/**
 * Exibe a tela de autenticação
 */
function showAuth() {
    el.authScreen.classList.remove('hidden');
    el.appScreen.classList.add('hidden');
    el.userInfo.classList.add('hidden');
}

/**
 * Exibe a tela principal do app
 */
function showApp() {
    el.authScreen.classList.add('hidden');
    el.appScreen.classList.remove('hidden');
    el.userInfo.classList.remove('hidden');
    el.userEmail.textContent = state.user?.email || '';
    loadCategories();
    loadLinks();
}

// ==================== CATEGORIAS ====================

/**
 * Carrega as categorias do servidor
 */
async function loadCategories() {
    try {
        state.categories = await apiRequest('/categories');
        renderCategories();
        updateCategorySelects();
    } catch (error) {
        showAlert(el.categoryAlert, error.message, true);
    }
}

/**
 * Renderiza a lista de categorias
 */
function renderCategories() {
    if (state.categories.length === 0) {
        el.categoriesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📁</div>
                <p>Nenhuma categoria ainda. Crie sua primeira!</p>
            </div>
        `;
        return;
    }

    el.categoriesList.innerHTML = state.categories.map(cat => `
        <div class="item">
            <div class="item-header">
                <div class="item-title">${escapeHtml(cat.name)}</div>
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="openEditCategory(${cat.id}, '${escapeHtml(cat.name)}')">
                        Editar
                    </button>
                    <button class="btn btn-danger" onclick="confirmDeleteCategory(${cat.id})">
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Processa o formulário de criar categoria
 * @param {Event} e
 */
async function handleCategorySubmit(e) {
    e.preventDefault();
    const name = el.categoryInput.value.trim();

    try {
        await apiRequest('/categories', {
            method: 'POST',
            body: JSON.stringify({ name })
        });

        el.categoryInput.value = '';
        showAlert(el.categoryAlert, 'Categoria criada com sucesso! 🎉');
        await loadCategories();
    } catch (error) {
        showAlert(el.categoryAlert, error.message, true);
    }
}

/**
 * Abre o modal de editar categoria
 * @param {number} id
 * @param {string} name
 */
function openEditCategory(id, name) {
    state.editingCategoryId = id;
    el.editCategoryName.value = name;
    openModal('editCategoryModal');
}

/**
 * Processa o formulário de editar categoria
 * @param {Event} e
 */
async function handleEditCategory(e) {
    e.preventDefault();
    const newName = el.editCategoryName.value.trim();

    try {
        await apiRequest(`/categories/${state.editingCategoryId}`, {
            method: 'PUT',
            body: JSON.stringify({ name: newName })
        });

        closeModal('editCategoryModal');
        showAlert(el.categoryAlert, 'Categoria atualizada! ✅');
        await loadCategories();
        await loadLinks();
    } catch (error) {
        showAlert(el.categoryAlert, error.message, true);
    }
}

/**
 * Confirma exclusão de uma categoria
 * @param {number} id - ID da categoria a excluir
 */
function confirmDeleteCategory(id) {
    el.deleteMessage.textContent = 'Excluir esta categoria e todos os seus links?';
    state.deleteCallback = async () => {
        try {
            await apiRequest(`/categories/${id}`, { method: 'DELETE' });
            closeModal('confirmDeleteModal');
            showAlert(el.categoryAlert, 'Categoria excluída! 🗑️');
            await loadCategories();
            await loadLinks();
        } catch (error) {
            showAlert(el.categoryAlert, error.message, true);
        }
    };
    openModal('confirmDeleteModal');
}

/**
 * Atualiza os selects de categoria com as categorias disponíveis
 */
function updateCategorySelects() {
    const options = state.categories.map(cat => 
        `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`
    ).join('');

    el.linkCategory.innerHTML = '<option value="">Selecione uma categoria</option>' + options;
    el.filterCategory.innerHTML = '<option value="">Todas as categorias</option>' + options;
    el.editLinkCategory.innerHTML = '<option value="">Selecione uma categoria</option>' + options;
}

// ==================== LINKS ====================

/**
 * Carrega os links do servidor
 * @param {number|null} categoryId - ID da categoria para filtrar (null = todos)
 */
async function loadLinks(categoryId = null) {
    try {
        const endpoint = categoryId ? `/links?category_id=${categoryId}` : '/links';
        state.links = await apiRequest(endpoint);
        renderLinks();
    } catch (error) {
        showAlert(el.linkAlert, error.message, true);
    }
}

/**
 * Renderiza a lista de links
 */
function renderLinks() {
    if (state.links.length === 0) {
        el.linksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔗</div>
                <p>Nenhum link ainda. Adicione o primeiro!</p>
            </div>
        `;
        return;
    }

    el.linksList.innerHTML = state.links.map(link => `
        <div class="item">
            <div class="item-header">
                <div class="item-title">
                    ${link.title ? escapeHtml(link.title) : '📄 Sem título'}
                    <span class="badge">${escapeHtml(link.category_name)}</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="openEditLink(${link.id})">
                        Editar
                    </button>
                    <button class="btn btn-danger" onclick="confirmDeleteLink(${link.id})">
                        Excluir
                    </button>
                </div>
            </div>
            <a href="${escapeHtml(link.url)}" target="_blank" class="item-url" rel="noopener noreferrer">
                🔗 ${escapeHtml(link.url)}
            </a>
            ${link.description ? `<div class="item-description">💬 ${escapeHtml(link.description)}</div>` : ''}
        </div>
    `).join('');
}

/**
 * Processa o formulário de criar link
 * @param {Event} e
 */
async function handleLinkSubmit(e) {
    e.preventDefault();

    try {
        await apiRequest('/links', {
            method: 'POST',
            body: JSON.stringify({
                category_id: parseInt(el.linkCategory.value),
                url: el.linkUrl.value.trim(),
                title: el.linkTitle.value.trim() || null,
                description: el.linkDescription.value.trim() || null
            })
        });

        el.linkForm.reset();
        showAlert(el.linkAlert, 'Link adicionado com sucesso! 🎉');
        
        const filter = el.filterCategory.value;
        await loadLinks(filter || null);
    } catch (error) {
        showAlert(el.linkAlert, error.message, true);
    }
}

/**
 * Abre o modal de editar link
 * @param {number} id
 */
function openEditLink(id) {
    const link = state.links.find(l => l.id === id);
    if (!link) return;

    state.editingLinkId = id;
    el.editLinkCategory.value = link.category_id;
    el.editLinkUrl.value = link.url;
    el.editLinkTitle.value = link.title || '';
    el.editLinkDescription.value = link.description || '';
    openModal('editLinkModal');
}

/**
 * Processa o formulário de editar link
 * @param {Event} e
 */
async function handleEditLink(e) {
    e.preventDefault();

    try {
        await apiRequest(`/links/${state.editingLinkId}`, {
            method: 'PUT',
            body: JSON.stringify({
                category_id: parseInt(el.editLinkCategory.value),
                url: el.editLinkUrl.value.trim(),
                title: el.editLinkTitle.value.trim() || null,
                description: el.editLinkDescription.value.trim() || null
            })
        });

        closeModal('editLinkModal');
        showAlert(el.linkAlert, 'Link atualizado! ✅');
        
        const filter = el.filterCategory.value;
        await loadLinks(filter || null);
    } catch (error) {
        showAlert(el.linkAlert, error.message, true);
    }
}

/**
 * Confirma exclusão de um link
 * @param {number} id
 */
function confirmDeleteLink(id) {
    el.deleteMessage.textContent = 'Tem certeza que deseja excluir este link?';
    state.deleteCallback = async () => {
        try {
            await apiRequest(`/links/${id}`, { method: 'DELETE' });
            closeModal('confirmDeleteModal');
            showAlert(el.linkAlert, 'Link excluído! 🗑️');
            
            const filter = el.filterCategory.value;
            await loadLinks(filter || null);
        } catch (error) {
            showAlert(el.linkAlert, error.message, true);
        }
    };
    openModal('confirmDeleteModal');
}

// ==================== EVENT LISTENERS ====================

// Autenticação
el.authForm.addEventListener('submit', handleAuth);
el.authToggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthMode();
});
el.logoutBtn.addEventListener('click', logout);

// Categorias
el.categoryForm.addEventListener('submit', handleCategorySubmit);
el.editCategoryForm.addEventListener('submit', handleEditCategory);

// Links
el.linkForm.addEventListener('submit', handleLinkSubmit);
el.editLinkForm.addEventListener('submit', handleEditLink);
el.filterCategory.addEventListener('change', (e) => {
    const categoryId = e.target.value ? parseInt(e.target.value) : null;
    loadLinks(categoryId);
});

// Modal de confirmação de exclusão
el.confirmDeleteBtn.addEventListener('click', () => {
    if (state.deleteCallback) {
        state.deleteCallback();
    }
});

// Fechar modais ao clicar fora
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(overlay.id);
        }
    });
});

// ==================== INICIALIZAÇÃO ====================

// Verifica se há token salvo e exibe a tela apropriada
if (state.token) {
    showApp();
} else {
    showAuth();
}
