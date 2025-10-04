import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../../database/database';

const exportRouter = Router();

// GET /export - Exporta todos os links do usuário com suas categorias
exportRouter.get('/', async (req, res) => {
    const userId = req.user!.id;
    
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                l.id,
                c.name as categoria,
                l.url,
                l.title as titulo,
                l.description as descricao,
                DATE_FORMAT(l.created_at, '%d/%m/%Y %H:%i:%s') as criado_em
             FROM links l
             JOIN categories c ON l.category_id = c.id
             WHERE l.user_id = ?
             ORDER BY c.name, l.created_at DESC`,
            [userId]
        );
        
        return (res as any).sendResponse(true, rows);
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao exportar dados.', 500);
    }
});

export default exportRouter;