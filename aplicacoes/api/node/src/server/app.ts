import express, { Request, Response } from 'express';
import cors from 'cors';

// Importando os middlewares
import { sendResponse, authenticateToken } from './middlewares';

// Importando os módulos das rotas
import authRoutes from './routes/auth';
import categoriesRoutes from './routes/categories';
import linksRoutes from './routes/links';

// --- CONFIGURAÇÃO INICIAL ---
const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Tipagem de Usuário (para ser adicionada na Request pelo middleware JWT)
declare global {
    namespace Express {
        interface Request {
            user?: { id: number };
        }
    }
}

// --- MIDDLEWARES GLOBAIS ---
// CORS configurado para permitir requisições do frontend pq alguns navegadores bloqueiam requisições de domínios diferentes
app.use(cors({ 
    origin: [FRONTEND_URL, 'http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Garante que requisições OPTIONS sejam respondidas
app.options('*', cors());

app.use(express.json());

// Adiciona a função de resposta globalmente 
app.use((_req: Request, res: Response, next) => {
    (res as any).sendResponse = (success: boolean, data: any = null, error: string | null = null, statusCode: number = 200) => {
        res.status(statusCode).json({ success, data, error });
    };
    next();
});

// --- ROTAS PÚBLICAS E DE AUTENTICAÇÃO ---
app.use('/auth', authRoutes);

// --- ROTAS PROTEGIDAS (CRUD) ---
// Aplica o middleware JWT a todas as rotas abaixo
app.use(authenticateToken);

app.use('/categories', categoriesRoutes);
app.use('/links', linksRoutes);

// --- ROTA DE SAÚDE E ERRO PADRÃO ---
app.get('/health', (_req: Request, res: Response) => {
    (res as any).sendResponse(true, { status: 'ok', time: new Date().toISOString() });
});

// Rota 404 Padrão (deve ser a última rota)
app.use((_req: Request, res: Response) => {
    (res as any).sendResponse(false, null, 'Not Found', 404);
});

export default app;