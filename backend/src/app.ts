import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

import { calcularTF, calcularIDF, calcularTFIDF, similaridadCoseno } from './utils/tfidf.js'
import { eliminarStopWords, lematizarTokens, tokenizarTexto } from './utils/procesamientoTexto.js';

interface DatosEntrada {
    documentos: Array<{
        id: string;
        contenido: string;
    }>;
    stopWords: string;
    lematizacion: string;
}

dotenv.config();
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.post('/api/resultados', (req, res) => {
    try {
        const datosEntrada = req.body as DatosEntrada;
        const stopWordsSet = new Set(datosEntrada.stopWords.split(/\r?\n/));
        const lematizacion = new Map<string, string>(Object.entries(JSON.parse(datosEntrada.lematizacion)));
        const documentos = datosEntrada.documentos.map(doc => {
            let docTokens = tokenizarTexto(doc.contenido);
            docTokens = eliminarStopWords(docTokens, stopWordsSet);
            docTokens = lematizarTokens(docTokens, lematizacion);
            return {
                id: doc.id,
                contenido: docTokens
            };
        });
        const idf = calcularIDF(documentos.map(doc => doc.contenido));
        // Construir resultados por documento y guardar los vectores TF-IDF originales
        const tfidfVectors: Record<string, number>[] = [];
        const resultados = documentos.map(doc => {
            const tf = calcularTF(doc.contenido);
            const tfidf = calcularTFIDF(tf, idf);
            tfidfVectors.push(tfidf);
            const terms = Object.keys(tf)
                .sort((a, b) => a.localeCompare(b))
                .map((term, index) => ({
                    indice: index + 1,
                    termino: term,
                    tf: tf[term],
                    idf: idf[term],
                    tfidf: tfidf[term]
                }))
            return {
                id: doc.id,
                terms: terms
            };
        }).sort((a, b) => a.id.localeCompare(b.id));

        // Calcular similitud de coseno entre cada par de documentos
        const similaridades: Array<{ documentoA: string; documentoB: string; similaridad: number }> = [];
        for (let i = 0; i < resultados.length; i++) {
            for (let j = i + 1; j < resultados.length; j++) {
                const sim = similaridadCoseno(tfidfVectors[i], tfidfVectors[j]);
                similaridades.push({ documentoA: resultados[i].id, documentoB: resultados[j].id, similaridad: sim });
            }
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.log(`[${new Date().toISOString()}] ${req.ip} - Resultados generados para ${documentos.length} documentos.`);
        res.json({ resultados, similaridades });
    } catch (e: any) {
        res.status(500).json({ error: 'Error al procesar la solicitud', details: e.message });
    }
});

app.use((_, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto ${port}...`);
});
