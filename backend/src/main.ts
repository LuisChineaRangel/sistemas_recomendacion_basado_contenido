import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.use(function (_, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/api/recomendacion', (req, res) => {
});

app.use((_, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

const port = process.env.PORT || 5000;
await app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}...`);
});
