export function tokenizarTexto(texto: string): string[] {
    return texto
        .toLowerCase()
        .split(/\W+/)
        .filter(token => token.length > 0);
}

export function eliminarStopWords(tokens: string[], stopWords: Set<string>): string[] {
    return tokens.filter(token => !stopWords.has(token.toLowerCase()));
}

export function lematizarTokens(tokens: string[], lemmatizationMap: Map<string, string>): string[] {
    return tokens.map(token => lemmatizationMap.get(token.toLowerCase()) || token);
}
