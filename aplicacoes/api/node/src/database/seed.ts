import { Pool } from 'mysql2/promise';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const TEST_USER_EMAIL = 'teste@linkmark.com';
const TEST_USER_PASSWORD = 'password';

/**
 * Roda o script de povoamento (seeding) no banco de dados.
 * @param pool Pool de conexão com o banco de dados.
 */
export async function runSeed(pool: Pool) {
    try {
        // 1. CHECA SE O USUÁRIO PADRÃO JÁ EXISTE
        const [userRowsRaw] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [TEST_USER_EMAIL]
        );
        const userRows = userRowsRaw as { id: number }[];

        if (userRows.length > 0) {
            console.log(`[INFO] Seeding ignorado: usuário de teste (${TEST_USER_EMAIL}) já existe.`);
            return userRows[0].id;
        }

        // 2. CRIA O USUÁRIO PADRÃO
        const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, SALT_ROUNDS);
        const [userResult] = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            [TEST_USER_EMAIL, hashedPassword]
        );
        const userId = (userResult as any).insertId;
        console.log(`[INFO] Usuário de teste criado com ID: ${userId} (Email: ${TEST_USER_EMAIL} / Senha: ${TEST_USER_PASSWORD})`);
        
        // 3. CRIA CATEGORIAS INICIAIS
        const [cat1Result] = await pool.query(
            'INSERT INTO categories (user_id, name) VALUES (?, ?)',
            [userId, 'Desenvolvimento Web']
        );
        const catId1 = (cat1Result as any).insertId;

        const [cat2Result] = await pool.query(
            'INSERT INTO categories (user_id, name) VALUES (?, ?)',
            [userId, 'Leitura Tarde']
        );
        const catId2 = (cat2Result as any).insertId;

        // 4. CRIA LINKS INICIAIS
        await pool.query(
            'INSERT INTO links (user_id, category_id, url, title, description) VALUES (?, ?, ?, ?, ?)',
            [userId, catId1, 'https://expressjs.com/', 'Express.js', 'Framework web minimalista e flexível para Node.js.']
        );

        await pool.query(
            'INSERT INTO links (user_id, category_id, url, title, description) VALUES (?, ?, ?, ?, ?)',
            [userId, catId1, 'https://www.typescriptlang.org/', 'TypeScript Docs', 'JavaScript com sintaxe para tipos.']
        );
        
        await pool.query(
            'INSERT INTO links (user_id, category_id, url, title, description) VALUES (?, ?, ?, ?, ?)',
            [userId, catId2, 'https://dynamos.tech/', 'Dynamos Tecnologia', 'Site da empresa que está aplicando o teste.']
        );

        console.log('[INFO] O seeding do banco de dados foi concluído com sucesso.');
        return userId;
    } catch (error) {
        console.error('[FATAL] Erro ao executar o seeding do banco de dados:', error);
        throw new Error('Falha ao executar o seeding do banco de dados.');
    }
}