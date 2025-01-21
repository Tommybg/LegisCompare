export async function extractTextFromFile(file: File): Promise<string> {
    try {
        if (file.type === 'text/plain') {
            return await file.text();
        }
        
        throw new Error('Please upload a text file (.txt)');
    } catch (error) {
        console.error('Error extracting text:', error);
        throw error;
    }
}