(function () {
    const apiUrl = window.__CONFIG__?.API_URL || 'http://localhost:8000';

    // Debug: para verificar se a API URL está correta
    console.log('[LinkMark] API URL configurada:', apiUrl);
    
    // Estado da aplicação
    const state = {
        token: localStorage.getItem('linkmark_token'),
        user: JSON.parse(localStorage.getItem('linkmark_user') || 'null'),
        categories: [],
        links: [],
        isLogin: true
    };

    // Elementos DOM
    const elements = {
        authScreen: document.getElementById('authScreen'),
        appScreen: document.getElementById('appScreen'),
        headerActions: document.getElementById('headerActions'),
        userEmail: document.getElementById('userEmail'),
        logoutBtn: document.getElementById('logoutBtn'),
        
        // Autenticação
        authForm: document.getElementById('authForm'),
        authTitle: document.getElementById('authTitle'),
        authEmail: document.getElementById('authEmail'),
        authPassword: document.getElementById('authPassword'),
        authSubmitBtn: document.getElementById('authSubmitBtn'),
        authStatus: document.getElementById('authStatus'),
        authToggleText: document.getElementById('authToggleText'),
        authToggleLink: document.getElementById('authToggleLink'),

        // Categorias
        categoryInput: document.getElementById('categoryInput'),
        addCategoryBtn: document.getElementById('addCategoryBtn'),
        categoryStatus: document.getElementById('categoryStatus'),
        categoriesList: document.getElementById('categoriesList'),
        
        // Links
        linkCategorySelect: document.getElementById('linkCategorySelect'),
        linkUrl: document.getElementById('linkUrl'),
        linkTitle: document.getElementById('linkTitle'),
        linkDescription: document.getElementById('linkDescription'),
        addLinkBtn: document.getElementById('addLinkBtn'),
        linkStatus: document.getElementById('linkStatus'),
        filterCategorySelect: document.getElementById('filterCategorySelect'),
        linksList: document.getElementById('linksList')
    };

    // === HELPERS ===
    function showStatus(element, message, isError = false) {
        element.textContent = message;
        element.className = `status show ${isError ? 'error' : 'success'}`;
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }

    async function apiRequest(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (state.token && !options.noAuth) {
            headers['Authorization'] = `Bearer ${state.token}`;
        }

        const url = `${apiUrl}${endpoint}`;
        console.log('[API Request]', options.method || 'GET', url);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                mode: 'cors'
            });

            console.log('[API Response]', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erro de conexão' }));
                throw new Error(errorData.error || `Erro HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erro desconhecido');
            }

            return data.data;
        } catch (error) {
            console.error('[API Error]', error);
            if (error.message === 'Failed to fetch') {
                throw new Error('Não foi possível conectar ao servidor. Verifique se a API está rodando.');
            }
            throw error;
        }
    }

    // === AUTENTICAÇÃO ===
    function showAuthScreen() {
        elements.authScreen.style.display = 'flex';
        elements.appScreen.style.display = 'none';
        elements.headerActions.style.display = 'none';
    }

    function showAppScreen() {
        elements.authScreen.style.display = 'none';
        elements.appScreen.style.display = 'block';
        elements.headerActions.style.display = 'flex';
        elements.userEmail.textContent = state.user?.email || '';
        loadCategories();
        loadLinks();
    }

    function toggleAuthMode() {
        state.isLogin = !state.isLogin;
        if (state.isLogin) {
            elements.authTitle.textContent = 'Entrar no LinkMark';
            elements.authSubmitBtn.textContent = 'Entrar';
            elements.authToggleText.textContent = 'Não tem conta?';
            elements.authToggleLink.textContent = 'Criar conta';
        } else {
            elements.authTitle.textContent = 'Criar conta';
            elements.authSubmitBtn.textContent = 'Registrar';
            elements.authToggleText.textContent = 'Já tem conta?';
            elements.authToggleLink.textContent = 'Fazer login';
        }
        elements.authStatus.classList.remove('show');
    }

    async function handleAuth(e) {
        e.preventDefault();
        const email = elements.authEmail.value.trim();
        const password = elements.authPassword.value;

        elements.authSubmitBtn.disabled = true;

        try {
            const endpoint = state.isLogin ? '/auth/login' : '/auth/register';
            const data = await apiRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                noAuth: true
            });

            state.token = data.token;
            state.user = data.user;
            localStorage.setItem('linkmark_token', data.token);
            localStorage.setItem('linkmark_user', JSON.stringify(data.user));

            showAppScreen();
        } catch (error) {
            showStatus(elements.authStatus, error.message, true);
        } finally {
            elements.authSubmitBtn.disabled = false;
        }
    }

    function logout() {
        state.token = null;
        state.user = null;
        state.categories = [];
        state.links = [];
        localStorage.removeItem('linkmark_token');
        localStorage.removeItem('linkmark_user');
        elements.authEmail.value = '';
        elements.authPassword.value = '';
        showAuthScreen();
    }

    // === CATEGORIAS ===
    async function loadCategories() {
        try {
            state.categories = await apiRequest('/categories');
            renderCategories();
            updateCategorySelects();
        } catch (error) {
            showStatus(elements.categoryStatus, error.message, true);
        }
    }

    function renderCategories() {
        elements.categoriesList.innerHTML = '';
        
        state.categories.forEach(category => {
            const item = document.createElement('div');
            item.className = 'item';
            item.innerHTML = `
                <div class="item-content">
                    <div class="item-title">${escapeHtml(category.name)}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" data-id="${category.id}">Editar</button>
                    <button class="btn-delete" data-id="${category.id}">Excluir</button>
                </div>
            `;
            
            item.querySelector('.btn-edit').addEventListener('click', () => editCategory(category));
            item.querySelector('.btn-delete').addEventListener('click', () => deleteCategory(category.id));
            
            elements.categoriesList.appendChild(item);
        });
    }

    async function addCategory() {
        const name = elements.categoryInput.value.trim();
        if (!name) {
            showStatus(elements.categoryStatus, 'Digite o nome da categoria', true);
            return;
        }

        elements.addCategoryBtn.disabled = true;

        try {
            await apiRequest('/categories', {
                method: 'POST',
                body: JSON.stringify({ name })
            });

            elements.categoryInput.value = '';
            showStatus(elements.categoryStatus, 'Categoria criada com sucesso!');
            await loadCategories();
        } catch (error) {
            showStatus(elements.categoryStatus, error.message, true);
        } finally {
            elements.addCategoryBtn.disabled = false;
        }
    }

    async function editCategory(category) {
        const newName = prompt('Novo nome da categoria:', category.name);
        if (!newName || newName === category.name) return;

        try {
            await apiRequest(`/categories/${category.id}`, {
                method: 'PUT',
                body: JSON.stringify({ name: newName })
            });

            showStatus(elements.categoryStatus, 'Categoria atualizada!');
            await loadCategories();
            await loadLinks();
        } catch (error) {
            showStatus(elements.categoryStatus, error.message, true);
        }
    }

    async function deleteCategory(categoryId) {
        if (!confirm('Excluir esta categoria? Todos os links dela serão removidos.')) return;

        try {
            await apiRequest(`/categories/${categoryId}`, { method: 'DELETE' });
            showStatus(elements.categoryStatus, 'Categoria excluída!');
            await loadCategories();
            await loadLinks();
        } catch (error) {
            showStatus(elements.categoryStatus, error.message, true);
        }
    }

    function updateCategorySelects() {
        const options = state.categories.map(cat => 
            `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`
        ).join('');

        elements.linkCategorySelect.innerHTML = '<option value="">Selecione uma categoria</option>' + options;
        elements.filterCategorySelect.innerHTML = '<option value="">Todas as categorias</option>' + options;
    }

    // === LINKS ===
    async function loadLinks(categoryId = null) {
        try {
            const endpoint = categoryId ? `/links?category_id=${categoryId}` : '/links';
            state.links = await apiRequest(endpoint);
            renderLinks();
        } catch (error) {
            showStatus(elements.linkStatus, error.message, true);
        }
    }

    function renderLinks() {
        elements.linksList.innerHTML = '';
        
        state.links.forEach(link => {
            const item = document.createElement('div');
            item.className = 'item';
            item.innerHTML = `
                <div class="item-content">
                    <div class="item-title">
                        ${link.title ? escapeHtml(link.title) : 'Sem título'}
                        <span class="badge">${escapeHtml(link.category_name)}</span>
                    </div>
                    <a href="${escapeHtml(link.url)}" target="_blank" class="item-url">${escapeHtml(link.url)}</a>
                    ${link.description ? `<div class="item-description">${escapeHtml(link.description)}</div>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn-delete" data-id="${link.id}">Excluir</button>
                </div>
            `;
            
            item.querySelector('.btn-delete').addEventListener('click', () => deleteLink(link.id));
            
            elements.linksList.appendChild(item);
        });
    }

    async function addLink() {
        const category_id = elements.linkCategorySelect.value;
        const url = elements.linkUrl.value.trim();
        const title = elements.linkTitle.value.trim();
        const description = elements.linkDescription.value.trim();

        if (!category_id || !url) {
            showStatus(elements.linkStatus, 'Selecione uma categoria e digite a URL', true);
            return;
        }

        elements.addLinkBtn.disabled = true;

        try {
            await apiRequest('/links', {
                method: 'POST',
                body: JSON.stringify({ 
                    category_id: parseInt(category_id), 
                    url, 
                    title: title || null, 
                    description: description || null 
                })
            });

            elements.linkUrl.value = '';
            elements.linkTitle.value = '';
            elements.linkDescription.value = '';
            showStatus(elements.linkStatus, 'Link adicionado com sucesso!');
            
            const currentFilter = elements.filterCategorySelect.value;
            await loadLinks(currentFilter || null);
        } catch (error) {
            showStatus(elements.linkStatus, error.message, true);
        } finally {
            elements.addLinkBtn.disabled = false;
        }
    }

    async function deleteLink(linkId) {
        if (!confirm('Excluir este link?')) return;

        try {
            await apiRequest(`/links/${linkId}`, { method: 'DELETE' });
            showStatus(elements.linkStatus, 'Link excluído!');
            
            const currentFilter = elements.filterCategorySelect.value;
            await loadLinks(currentFilter || null);
        } catch (error) {
            showStatus(elements.linkStatus, error.message, true);
        }
    }

    // === UTILITÁRIO ===
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // === EVENT LISTENERS ===
    elements.authForm.addEventListener('submit', handleAuth);
    elements.authToggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });
    elements.logoutBtn.addEventListener('click', logout);
    elements.addCategoryBtn.addEventListener('click', addCategory);
    elements.categoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCategory();
    });
    elements.addLinkBtn.addEventListener('click', addLink);
    elements.filterCategorySelect.addEventListener('change', (e) => {
        const categoryId = e.target.value ? parseInt(e.target.value) : null;
        loadLinks(categoryId);
    });

    // === INÍCIO ===
    if (state.token) {
        showAppScreen();
    } else {
        showAuthScreen();
    }
})();