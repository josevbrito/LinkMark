import express, {Request, Response} from 'express';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

app.use(cors({origin: FRONTEND_URL, credentials: true}));
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
    res.json({success: true, data: {status: 'ok', time: new Date().toISOString()}});
});

app.use((_req, res) => {
    res.status(404).json({success: false, error: 'Not Found'});
});

app.listen(PORT, () => {
    console.log(`Node API listening on http://localhost:${PORT}`);
});
