import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import pool from '../database/database';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'linkmark_secret_dev_key';

/**
 * Middleware para enviar as respostas de forma estruturada.
 */
export const sendResponse = (res: Response, success: boolean, data: any = null, error: string | null = null, statusCode: number = 200) => {
    res.status(statusCode).json({ success, data, error });
};


// --- MIDDLEWARE DE AUTENTICAÇÃO JWT ---

/**
 * Middleware para validar o token JWT e injetar o user.id na requisição.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    // Formato: Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // Envia resposta estruturada de 401
        return (res as any).sendResponse(false, null, 'Access token is required.', 401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Token inválido ou expirado
            return (res as any).sendResponse(false, null, 'Invalid or expired token.', 403);
        }
        
        // Se o token for válido, injeta o user_id na requisição
        req.user = user as { id: number };
        next();
    });
};


// --- MIDDLEWARE DE VALIDAÇÃO DE CATEGORIA ---

/**
 * Middleware para validar se a categoria existe e pertence ao usuário logado.
 */
export const validateCategory = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id; // Garante que o usuário está autenticado
    const categoryId = parseInt(req.params.categoryId || req.body.category_id);

    if (isNaN(categoryId)) {
        // Se a rota for PUT/DELETE e o ID estiver inválido nos params
        if (req.params.categoryId) {
            return (res as any).sendResponse(false, null, 'ID da categoria inválido.', 400);
        }
        // Se for criação/atualização de link e category_id for inválido ou não fornecido, apenas segue adiante
        return next();
    }
    
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM categories WHERE id = ? AND user_id = ?', 
            [categoryId, userId]
        );
        
        if (rows.length === 0) {
            // Se a categoria não existe ou não pertence ao usuário logado
            return (res as any).sendResponse(false, null, 'Categoria não encontrada ou acesso negado.', 404);
        }
    } catch (error) {
        console.error('Erro ao validar categoria no middleware:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao validar categoria.', 500);
    }

    next();
};