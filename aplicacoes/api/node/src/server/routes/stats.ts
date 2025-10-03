import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../../database/database';

const statsRouter = Router();

// GET /stats - Retorna estatísticas do usuário
statsRouter.get('/', async (req, res) => {
    const userId = req.user!.id;
    
    try {
        // Total de categorias
        const [categoriesCount] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM categories WHERE user_id = ?',
            [userId]
        );
        
        // Total de links
        const [linksCount] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM links WHERE user_id = ?',
            [userId]
        );
        
        // Links por categoria
        const [linksByCategory] = await pool.query<RowDataPacket[]>(
            `SELECT c.name, COUNT(l.id) as count 
             FROM categories c 
             LEFT JOIN links l ON c.id = l.category_id 
             WHERE c.user_id = ? 
             GROUP BY c.id, c.name 
             ORDER BY count DESC`,
            [userId]
        );
        
        // Categoria mais popular
        const mostPopularCategory = linksByCategory.length > 0 && linksByCategory[0].count > 0
            ? linksByCategory[0]
            : null;
        
        // Links adicionados nos últimos 7 dias
        const [recentLinks] = await pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) as total 
             FROM links 
             WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
            [userId]
        );
        
        const stats = {
            totalCategories: categoriesCount[0].total,
            totalLinks: linksCount[0].total,
            linksByCategory: linksByCategory,
            mostPopularCategory: mostPopularCategory,
            recentLinksCount: recentLinks[0].total
        };
        
        return (res as any).sendResponse(true, stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao buscar estatísticas.', 500);
    }
});

export default statsRouter;