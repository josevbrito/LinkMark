import mysql, { Pool, RowDataPacket } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURAÇÃO DO POOL ---
const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER || 'linkmark_api',
    password: process.env.DB_PASSWORD || 'linkmark',
    database: process.env.DB_NAME || 'linkmark',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true, // Necessário para rodar múltiplos comandos SQL juntos (usando para as migrações)
});


/**
 * Roda o script de migração inicial (migration.sql) para criar as tabelas.
 */
export async function runMigrations() {
    try {
        // Determina o diretório atual (usando ES Modules)
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // Constrói o caminho absoluto para o migration.sql
        const migrationPath = path.resolve(__dirname, 'migration.sql');

        // Lê o conteúdo do arquivo SQL
        const sql = fs.readFileSync(migrationPath, 'utf-8');
        
        await pool.query(sql);

        console.log('[INFO] Migração do banco de dados (tabelas) concluída com sucesso.');
    } catch (error) {
        // Se a migração falhar, encerra o servidor
        console.error('[FATAL] Erro ao executar migrações de banco de dados:', error);
        throw new Error('Falha ao executar migrações de banco de dados.');
    }
}

/**
 * Exporta o pool para ser usado em queries da API.
 */
export default pool;