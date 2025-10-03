import { Router } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../database/database';
import { validateCategory } from '../middlewares';

const categoriesRouter = Router();

// Tipagem
interface Category {
    id: number;
    user_id: number;
    name: string;
}

// POST /categories - Cria uma nova categoria
categoriesRouter.post('/', async (req, res) => {
    const { name } = req.body;
    const userId = req.user!.id; // ID injetado pelo middleware JWT

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return (res as any).sendResponse(false, null, 'O nome da categoria é obrigatório.', 400);
    }

    try {
        const [result] = await pool.query<ResultSetHeader>('INSERT INTO categories (user_id, name) VALUES (?, ?)', [userId, name]);
        
        const newCategory: Category = { id: result.insertId, user_id: userId, name };
        return (res as any).sendResponse(true, newCategory, null, 201);
    } catch (error) {
        if ((error as any).code === 'ER_DUP_ENTRY') {
            return (res as any).sendResponse(false, null, 'Categoria com este nome já existe para este usuário.', 409);
        }
        console.error('Erro ao criar categoria:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao criar categoria.', 500);
    }
});

// GET /categories - Lista todas as categorias do usuário logado
categoriesRouter.get('/', async (req, res) => {
    const userId = req.user!.id;
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name FROM categories WHERE user_id = ? ORDER BY name ASC', [userId]);
        return (res as any).sendResponse(true, rows as Category[]);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao listar categorias.', 500);
    }
});

// PUT /categories/:categoryId - Atualiza uma categoria
categoriesRouter.put('/:categoryId', validateCategory, async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    const userId = req.user!.id;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return (res as any).sendResponse(false, null, 'O novo nome da categoria é obrigatório.', 400);
    }
    
    try {
        // validateCategory garante que a categoriaId existe E pertence ao userId
        const [result] = await pool.query<ResultSetHeader>('UPDATE categories SET name = ? WHERE id = ? AND user_id = ?', [name, categoryId, userId]);
        
        return (res as any).sendResponse(true, { id: categoryId, name }, 'Categoria atualizada com sucesso.');
    } catch (error) {
         if ((error as any).code === 'ER_DUP_ENTRY') {
            return (res as any).sendResponse(false, null, 'Categoria com este nome já existe para este usuário.', 409);
        }
        console.error('Erro ao atualizar categoria:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao atualizar categoria.', 500);
    }
});

// DELETE /categories/:categoryId - Deleta uma categoria
categoriesRouter.delete('/:categoryId', validateCategory, async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    const userId = req.user!.id;

    try {
        // O FOREIGN KEY com ON DELETE CASCADE deletará os links relacionados
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM categories WHERE id = ? AND user_id = ?', [categoryId, userId]);
        
        if (result.affectedRows === 0) {
            // Embora o validateCategory já tenha checado, é um fallback seguro
            return (res as any).sendResponse(false, null, 'Categoria não encontrada.', 404);
        }

        return res.status(204).send(); // 204 No Content para deleção bem-sucedida
    } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao deletar categoria.', 500);
    }
});

export default categoriesRouter;