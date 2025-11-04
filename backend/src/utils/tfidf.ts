export function calcularTF(tokens: string[]): Record<string, number> {
    const tf: Record<string, number> = {};
    const totalTokens = tokens.length;

    tokens.forEach(token => {
        tf[token] = (tf[token] || 0) + 1;
    });

    for (const token in tf)
        tf[token] != 0 ? tf[token] = 1 + Math.log10(tf[token]) : tf[token] = 0;
    return tf;
}

export function calcularIDF(documentos: string[][]): Record<string, number> {
    const idf: Record<string, number> = {};
    const totalDocumentos = documentos.length;
    const vocabulario = new Set(documentos.flat().sort());

    vocabulario.forEach(token => {
        const contador = documentos.filter(doc => doc.includes(token)).length;
        idf[token] = Math.log(totalDocumentos / contador);
    });

    return idf;
}

export function calcularTFIDF(tf: Record<string, number>, idf: Record<string, number>): Record<string, number> {
    const tfidf: Record<string, number> = {};
    for (const term in tf)
        tfidf[term] = tf[term] * (idf[term] || 0);
    return tfidf;
}

export function similaridadCoseno(vecA: Record<string, number>, vecB: Record<string, number>): number {
    const interseccion = Object.keys(vecA).filter(term => term in vecB);
    let productoPunto = 0;
    let magnitudA = 0;
    let magnitudB = 0;
    interseccion.forEach(term => {
        productoPunto += vecA[term] * vecB[term];
    });
    for (const term in vecA) {
        magnitudA += vecA[term] ** 2;
    }
    for (const term in vecB) {
        magnitudB += vecB[term] ** 2;
    }
    magnitudA = Math.sqrt(magnitudA);
    magnitudB = Math.sqrt(magnitudB);
    if (magnitudA === 0 || magnitudB === 0) return 0;
    return productoPunto / (magnitudA * magnitudB);
}
