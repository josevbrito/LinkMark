import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../database/database';

const authRouter = Router();
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'linkmark_secret_dev_key';
const SALT_ROUNDS = 10;

// Tipagem para dados de usuário no banco de dados
interface UserDB extends RowDataPacket {
    id: number;
    email: string;
    password_hash: string;
}

// Rota POST /auth/register - Cria um novo usuário
authRouter.post('/register', async (req, res) => {
    const { email, password } = req.body;
    
    // Validação básica
    if (!email || !password || email.trim() === '' || password.length < 6) {
        return (res as any).sendResponse(false, null, 'O email e a senha (mínimo 6 caracteres) são obrigatórios.', 400);
    }

    try {
        // 1. Verifica se o usuário já existe
        const [existingUserRows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUserRows.length > 0) {
            return (res as any).sendResponse(false, null, 'Email já cadastrado.', 409);
        }

        // 2. Criptografa a senha e insere
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const [result] = await pool.query<ResultSetHeader>('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hashedPassword]);
        const userId = result.insertId;

        // 3. Gera o token
        const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });

        return (res as any).sendResponse(true, { token, user: { id: userId, email } }, 'Usuário registrado com sucesso.', 201);
    } catch (error) {
        console.error('Erro durante o registro do usuário:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao registrar usuário.', 500);
    }
});

// Rota POST /auth/login - Autentica um usuário
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
        return (res as any).sendResponse(false, null, 'Email e senha são obrigatórios.', 400);
    }

    try {
        // 1. Busca o usuário pelo email
        const [userRows] = await pool.query<UserDB[]>('SELECT id, password_hash FROM users WHERE email = ?', [email]);
        const user = userRows[0];

        if (!user) {
            return (res as any).sendResponse(false, null, 'Credenciais inválidas.', 401);
        }

        // 2. Compara a senha
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return (res as any).sendResponse(false, null, 'Credenciais inválidas.', 401);
        }

        // 3. Gera o token
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

        return (res as any).sendResponse(true, { token, user: { id: user.id, email } }, 'Login realizado com sucesso.');
    } catch (error) {
        console.error('Erro durante o login do usuário:', error);
        return (res as any).sendResponse(false, null, 'Erro interno ao realizar login.', 500);
    }
});

export default authRouter;