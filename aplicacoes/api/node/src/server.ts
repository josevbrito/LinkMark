import app from './server/app';
import pool, { runMigrations } from './database/database';
import { runSeed } from './database/seed';

const PORT = Number(process.env.PORT || 3000);
const MAX_RETRIES = 10;
const RETRY_DELAY = 3000; // 3 segundos

// Função para tentar conectar ao banco com o retry
async function connectWithRetry(retries = MAX_RETRIES): Promise<boolean> {
    for (let i = 1; i <= retries; i++) {
        try {
            await pool.query('SELECT 1');
            console.log('[INFO] Conexão com o banco de dados estabelecida.');
            return true;
        } catch (error) {
            console.log(`[WARN] Tentativa de conexão com o banco de dados ${i}/${retries} falhou. Retentando em ${RETRY_DELAY/1000}s...`);
            if (i === retries) {
                console.error('[ERROR] Falha ao conectar ao banco de dados após o número máximo de tentativas.');
                console.error('Detalhes do erro:', error);
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
    return false;
}

// Inicialização do Servidor
async function startServer() {
    try {
        // 1. Tenta conectar ao BD com retry
        const connected = await connectWithRetry();
        if (!connected) {
            console.error('[FATAL] Servidor falhou ao iniciar devido a erro de conexão com o banco de dados.');
            process.exit(1);
        }
        
        // 2. Roda as migrações e o seeding
        console.log('[INFO] Executando migrações...');
        await runMigrations();

        console.log('[INFO] Executando seeding...');
        await runSeed(pool);
        
        // 3. Inicia o servidor Express
        app.listen(PORT, () => {
            console.log(`[INFO] API Node está em http://localhost:${PORT} (exposto em http://localhost:8000)`);
            console.log(`[INFO] Conexão com o banco de dados bem-sucedida. Aplicação pronta.`);
        });
    } catch (error) {
        console.error('[FATAL] O servidor falhou ao iniciar devido a erro de banco de dados ou problemas de configuração.')
        console.error('Detalhes do erro:', error);
        process.exit(1);
    }
}

// Inicia o processo
startServer();