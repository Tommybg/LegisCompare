'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Upload, Loader2 } from 'lucide-react';
import { compareDocuments } from '@/lib/services/comparisonService';
import type { ComparisonResult } from '@/types/comparison';
import { extractTextFromFile } from '@/lib/utils/Processor';

interface FileInfo {
  text: string;
  name: string;
  type: string;
}

interface Difference {
  type: 'addition' | 'deletion' | 'modification';
  content: string;
  startIndex?: number;
  endIndex?: number;
  location: string;
  significance: string;
}

const DocumentContent = ({ content }: { content: string }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <pre className="whitespace-pre-wrap font-mono text-sm break-words">
      {content}
    </pre>
  );
};

export default function Home() {
  const [doc1, setDoc1] = useState<FileInfo | null>(null);
  const [doc2, setDoc2] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileUpload = async (docNumber: 1 | 2, file: File) => {
    try {
      setError(null);
      
      if (!file.type.match(/(text\/plain|application\/pdf)/)) {
        throw new Error('Por favor, sube un archivo PDF o de texto');
      }

      const text = await extractTextFromFile(file);
      
      const fileInfo: FileInfo = {
        text,
        name: file.name,
        type: file.type
      };

      if (docNumber === 1) {
        setDoc1(fileInfo);
        setComparison(null);
      } else {
        setDoc2(fileInfo);
        setComparison(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading file');
      console.error('File upload error:', err);
    }
  };

  const handleComparison = async () => {
    if (!doc1?.text || !doc2?.text) {
      setError('Por favor, sube ambos documentos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await compareDocuments(doc1.text, doc2.text);
      setComparison(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error comparing documents');
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderDocument = (doc: FileInfo | null, isOriginal: boolean = true) => {
    if (!doc) {
      return (
        <div className="flex items-center justify-center h-full text-gray-600">
          Ningún documento subido
        </div>
      );
    }
  
    if (!comparison) {
      return (
        <div className="overflow-auto h-full">
          <pre className="whitespace-pre-wrap font-mono text-sm break-words text-gray-500">
            {doc.text}
          </pre>
        </div>
      );
    }
  
    const textPieces: JSX.Element[] = [];
    let lastIndex = 0;
    
    // Filter differences based on which document we're rendering
    const relevantDiffs = comparison.differences.filter(diff => {
      if (isOriginal) {
        // Left panel: only show deletions
        return diff.type === 'deletion';
      } else {
        // Right panel: show additions and modifications
        return ['addition', 'modification'].includes(diff.type);
      }
    });
  
    // Sort differences by their position in the document
    const sortedDiffs = [...relevantDiffs].sort((a, b) => {
      const indexA = doc.text.indexOf(a.content);
      const indexB = doc.text.indexOf(b.content);
      return indexA - indexB;
    });
  
    for (const diff of sortedDiffs) {
      let index = -1;
      
      if (diff.type === 'addition' && !isOriginal) {
        // For additions in the second document, find the new text
        index = doc.text.indexOf(diff.content, lastIndex);
      } else if (diff.type === 'deletion' && isOriginal) {
        // For deletions in the first document, find the old text
        index = doc.text.indexOf(diff.content, lastIndex);
      } else if (diff.type === 'modification') {
        // For modifications, find the appropriate version of the text
        index = doc.text.indexOf(diff.content, lastIndex);
      }
  
      if (index !== -1) {
        // Add text before the difference
        if (index > lastIndex) {
          textPieces.push(
            <span key={`text-${lastIndex}`} className="text-gray-500">
              {doc.text.slice(lastIndex, index)}
            </span>
          );
        }
  
        // Add the highlighted difference
        const highlightClass = {
          addition: 'bg-green-100 text-green-800',
          deletion: 'bg-red-100 text-red-800',
          modification: 'bg-yellow-100 text-yellow-800'
        }[diff.type];
  
        textPieces.push(
          <span
            key={`diff-${index}`}
            className={`${highlightClass} px-1 rounded relative group`}
          >
            {diff.content}
            <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 w-64 bg-gray-900 text-white text-xs rounded p-2 mb-2 z-10">
              {diff.significance}
            </span>
          </span>
        );
  
        lastIndex = index + diff.content.length;
      }
    }
  
    // Add remaining text
    if (lastIndex < doc.text.length) {
      textPieces.push(
        <span key={`text-final`} className="text-gray-500">
          {doc.text.slice(lastIndex)}
        </span>
      );
    }
  
    return (
      <div className="overflow-auto h-full">
        <pre className="whitespace-pre-wrap font-mono text-sm break-words">
          {textPieces}
        </pre>
      </div>
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-6">
      <main className="flex h-[calc(100vh-6rem)] mx-auto max-w-[1400px] gap-6 overflow-hidden bg-white/10 backdrop-blur-md rounded-xl border-2 border-blue-400/50 border-white/10 shadow-xl p-6 relative before:absolute before:inset-0 before:rounded-xl before:border-2 before:border-blue-400/20 before:animate-pulse">
        {/* Left Document Panel */}
        <div className="flex-[1.2] flex flex-col gap-4 min-h-0">
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              onClick={() => document.getElementById('doc1-upload')?.click()}
              variant="outline"
              className="w-full bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Subir Documento 1
            </Button>
            {doc1 && (
              <div className="relative group">
                <span className="text-sm text-white truncate max-w-[200px] bg-black/20 px-2 py-1 rounded-md">
                  {doc1.name}
                </span>
                <button
                  onClick={() => {
                    setDoc1(null);
                    setComparison(null);
                  }}
                  className="hidden group-hover:flex absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-5 h-5 items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  title="Eliminar documento"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <input
            id="doc1-upload"
            type="file"
            accept=".txt,.pdf"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(1, e.target.files[0])}
            className="hidden"
          />
          <Card className="flex-1 min-h-0 max-h-[calc(100vh-12rem)] bg-white/80 backdrop-blur-sm">
            <CardContent className="h-full overflow-auto text-gray-600">
              {renderDocument(doc1, true)}
            </CardContent>
          </Card>
        </div>

        {/* Right Document Panel */}
        <div className="flex-[1.2] flex flex-col gap-4 min-h-0">
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              onClick={() => document.getElementById('doc2-upload')?.click()}
              variant="outline"
              className="w-full bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Subir Documento 2
            </Button>
            {doc2 && (
              <div className="relative group">
                <span className="text-sm text-white truncate max-w-[200px] bg-black/20 px-2 py-1 rounded-md">
                  {doc2.name}
                </span>
                <button
                  onClick={() => {
                    setDoc2(null);
                    setComparison(null);
                  }}
                  className="hidden group-hover:flex absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-5 h-5 items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  title="Eliminar documento"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <input
            id="doc2-upload"
            type="file"
            accept=".txt,.pdf"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(2, e.target.files[0])}
            className="hidden"
          />
          <Card className="flex-1 min-h-0 max-h-[calc(100vh-12rem)] bg-white/80 backdrop-blur-sm">
            <CardContent className="h-full overflow-auto text-gray-600">
              {renderDocument(doc2, false)}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Panel */}
        <div className="flex-1 flex flex-col gap-4 min-h-0 max-w-md">
          <Button 
            onClick={handleComparison} 
            disabled={!doc1 || !doc2 || loading}
            variant="default"
            className="w-full shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Comparar Documentos
          </Button>

          <Card className="flex-1 min-h-0 max-h-[calc(100vh-12rem)] bg-white/80 backdrop-blur-sm">
            <CardContent className="h-full overflow-auto">
              <div className="space-y-4">
                {(comparison || error) && (
                  <h3 className="font-semibold text-gray-800">Análisis</h3>
                )}
                {error && (
                  <div className="text-red-500 bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}
                {comparison && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-gray-800">Resumen</h4>
                      <p className="text-gray-800 text-sm">{comparison.summary}</p>
                    </div>

                    {comparison.impactAnalysis && (
                      <div>
                        <h4 className="font-medium mb-2 text-gray-800">Análisis de Impacto</h4>
                        <p className="text-gray-800 text-sm">{comparison.impactAnalysis}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2 text-gray-800">Diferencias Detalladas</h4>
                      <div className="space-y-3">
                        {comparison.differences.map((diff, index) => (
                          <div 
                            key={index} 
                            className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                          >
                            <div className={`text-sm font-medium mb-1 ${
                              diff.type === 'addition' ? 'text-green-600' :
                              diff.type === 'deletion' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {diff.type === 'addition' ? 'Adición' :
                               diff.type === 'deletion' ? 'Eliminación' :
                               'Modificación'}
                            </div>
                            <div className="text-sm mb-1 text-gray-800">
                              <span className="font-medium">Contenido:</span> "{diff.content}"
                            </div>
                            <div className="text-sm mb-1 text-gray-800">
                              <span className="font-medium">Ubicación:</span> {diff.location}
                            </div>
                            <div className="text-sm text-gray-800">
                              <span className="font-medium">Importancia:</span> {diff.significance}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
);
}