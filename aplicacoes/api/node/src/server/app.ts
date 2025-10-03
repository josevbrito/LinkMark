import express, { Request, Response } from 'express';
import cors from 'cors';

// Importando os middlewares
import { sendResponse, authenticateToken } from './middlewares';

// Importando os módulos das rotas
import authRoutes from './routes/auth';
import categoriesRoutes from './routes/categories';
import linksRoutes from './routes/links';
import statsRoutes from './routes/stats';
import exportRoutes from './routes/export';


// --- CONFIGURAÇÃO INICIAL ---
const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Armazena o momento de inicialização da aplicação
const APP_START_TIME = new Date();

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

// --- ROTAS PÚBLICAS ---

// Rota de saúde da API
app.get('/health', (_req: Request, res: Response) => {
  const now = new Date();
  const uptime = Math.floor((now.getTime() - APP_START_TIME.getTime()) / 1000);
  
  // Calcula o uptime em formato legível
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  
  const healthData = {
    status: 'healthy',
    message: 'API está funcionando corretamente',
    timestamp: now.toISOString(),
    uptime: {
      seconds: uptime,
      formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`
    },
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version
    }
  };
  
  (res as any).sendResponse(true, healthData);
});

// Rotas de autenticação (login e register)
app.use('/auth', authRoutes);

// --- ROTAS PROTEGIDAS (CRUD) ---
// A partir daqui, todas as rotas precisam de autenticação JWT
app.use(authenticateToken);

app.use('/categories', categoriesRoutes);
app.use('/links', linksRoutes);
app.use('/stats', statsRoutes);
app.use('/export', exportRoutes);

// Rota 404 Padrão
app.use((_req: Request, res: Response) => {
  (res as any).sendResponse(false, null, 'Not Found', 404);
});

export default app;