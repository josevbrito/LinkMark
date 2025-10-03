import { Router } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../database/database';
import { validateCategory } from '../middlewares';

const linksRouter = Router();

// Tipagem
interface Link {
    id: number;
    user_id: number;
    category_id: number;
    url: string;
    title: string | null;
    description: string | null;
}

// POST /links - Cria um novo link. Requer category_id e url.
// Uso o validateCategory para garantir que a category_id exista E pertença ao usuário.
linksRouter.post('/', validateCategory, async (req, res) => {
    const { category_id, url, title, description } = req.body;
    const userId = req.user!.id; 
    const catId = parseInt(category_id);

    // Validação básica do corpo
    if (isNaN(catId) || !url || typeof url !== 'string' || url.trim() === '') {
        return (res as any).sendResponse(false, null, 'O ID da categoria e a URL do link são obrigatórios.', 400);
    }
    
    try {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO links (user_id, category_id, url, title, description) VALUES (?, ?, ?, ?, ?)', 
            [userId, catId, url, title || null, description || null]
        );
        
        const newLink: Link = { 
            id: result.insertId, 
            user_id: userId,
            category_id: catId, 
            url, 
            title: title || null, 
            description: description || null
        };

        return (res as any).sendResponse(true, newLink, null, 201);
    } catch (error) {
        console.error('Erro ao criar link:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao criar link.', 500);
    }
});

// GET /links - Lista todos os links do usuário logado (opcionalmente filtrados)
linksRouter.get('/', async (req, res) => {
    const userId = req.user!.id;
    const categoryId = req.query.category_id ? parseInt(req.query.category_id as string) : null;

    // Query para juntar links e categorias para facilitar a exibição no front-end
    let query = `
        SELECT 
            l.id, l.url, l.title, l.description, l.created_at, 
            c.id AS category_id, c.name AS category_name 
        FROM links l 
        JOIN categories c ON l.category_id = c.id
        WHERE l.user_id = ?
    `;
    const params: (string | number)[] = [userId];

    if (categoryId && !isNaN(categoryId)) {
        query += ' AND l.category_id = ?';
        params.push(categoryId);
    }

    query += ' ORDER BY l.created_at DESC';

    try {
        const [rows] = await pool.query<RowDataPacket[]>(query, params);
        return (res as any).sendResponse(true, rows);
    } catch (error) {
        console.error('Erro ao buscar links:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao listar links.', 500);
    }
});

// PUT /links/:linkId - Atualiza um link
linksRouter.put('/:linkId', validateCategory, async (req, res) => {
    const linkId = parseInt(req.params.linkId);
    const userId = req.user!.id;
    const { category_id, url, title, description } = req.body;

    if (isNaN(linkId)) {
        return (res as any).sendResponse(false, null, 'ID do link inválido.', 400);
    }
    
    const newCategoryId = category_id ? parseInt(category_id) : null;
    
    // Valida se o link pertence ao usuário antes de atualizar
    const [existingLinkRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM links WHERE id = ? AND user_id = ?', 
        [linkId, userId]
    );

    if (existingLinkRows.length === 0) {
        return (res as any).sendResponse(false, null, 'Link não encontrado ou acesso negado.', 404);
    }

    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (newCategoryId !== null && !isNaN(newCategoryId)) { updates.push('category_id = ?'); params.push(newCategoryId); }
    if (url) { updates.push('url = ?'); params.push(url); }
    // O uso de 'undefined' permite que o cliente envie null ou string vazia para limpar o campo
    if (title !== undefined) { updates.push('title = ?'); params.push(title || null); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description || null); }
    
    if (updates.length === 0) {
         return (res as any).sendResponse(false, null, 'Pelo menos um campo deve ser fornecido para atualização.', 400);
    }

    // Executa a atualização do link
    const query = `UPDATE links SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
    params.push(linkId, userId);

    try {
        const [result] = await pool.query<ResultSetHeader>(query, params);

        if (result.affectedRows === 0) {
            // Este caso só acontece se o link foi deletado logo após a verificação acima (razoávelmente improvável)
            return (res as any).sendResponse(false, null, 'Link não encontrado.', 404);
        }

        return (res as any).sendResponse(true, { id: linkId }, 'Link atualizado com sucesso.');
    } catch (error) {
        console.error('Erro ao atualizar o link:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao atualizar link.', 500);
    }
});

// DELETE /links/:linkId - Deleta um link
linksRouter.delete('/:linkId', async (req, res) => {
    const linkId = parseInt(req.params.linkId);
    const userId = req.user!.id;

    if (isNaN(linkId)) {
        return (res as any).sendResponse(false, null, 'ID do link inválido.', 400);
    }
    
    try {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM links WHERE id = ? AND user_id = ?', [linkId, userId]);
        
        if (result.affectedRows === 0) {
            return (res as any).sendResponse(false, null, 'Link não encontrado ou acesso negado.', 404);
        }

        return res.status(204).send(); // 204 aqui para mostrar que foi bem-sucedida
    } catch (error) {
        console.error('Erro ao deletar link:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao deletar link.', 500);
    }
});

export default linksRouter;