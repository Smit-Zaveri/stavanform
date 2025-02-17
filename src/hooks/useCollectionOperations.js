import { useState } from 'react';
import { firestore, auth } from '../firebase';
import { logActivity, formatStorageSize } from '../utils/analyticsUtils';

export const useCollectionOperations = (onOperationComplete = () => {}) => {
  const [exportInProgress, setExportInProgress] = useState(false);
  const [importInProgress, setImportInProgress] = useState(false);
  const [error, setError] = useState(null);

  const handleCollectionExport = async (collectionName, format = 'json') => {
    setExportInProgress(true);
    try {
      const songs = await firestore.collection(collectionName).get();
      const songsData = songs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      let content;
      let mimeType;
      let extension;

      if (format === 'csv') {
        const headers = ['id', 'title', 'artist', 'artistName', 'content', 'newFlag', 'newTts', 'order', 'publishDate', 'tags', 'tirthankarId', 'youtube'];
        const csvContent = [
          headers.join(','),
          ...songsData.map(song => 
            headers.map(header => 
              JSON.stringify(song[header] || '')
            ).join(',')
          )
        ].join('\n');
        content = csvContent;
        mimeType = 'text/csv';
        extension = 'csv';
      } else {
        content = JSON.stringify({ 
          type: 'collection',
          name: collectionName,
          timestamp: new Date().toISOString(),
          data: songsData 
        }, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const filename = `stavanform-${collectionName}-${new Date().toISOString()}.${extension}`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await logActivity(`Exported collection ${collectionName}`, auth.currentUser?.uid, {
        format,
        count: songsData.length,
        fileSize: formatStorageSize(blob.size)
      });

      setError(null);
    } catch (error) {
      console.error('Export error:', error);
      setError(`Failed to export collection ${collectionName}`);
    } finally {
      setExportInProgress(false);
    }
  };

  const handleCollectionImport = async (event, collectionName) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportInProgress(true);
    try {
      const content = await file.text();
      let importData;

      if (file.name.endsWith('.csv')) {
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        importData = {
          type: 'collection',
          name: collectionName,
          data: lines.slice(1).map(line => {
            const values = line.split(',').map(v => {
              try {
                return JSON.parse(v);
              } catch {
                return v;
              }
            });
            return headers.reduce((obj, header, i) => {
              obj[header] = values[i];
              return obj;
            }, {});
          })
        };
      } else {
        importData = JSON.parse(content);
      }

      if (importData.type !== 'collection' || importData.name !== collectionName) {
        throw new Error('Invalid import file type or collection name mismatch');
      }

      const batch = firestore.batch();
      for (const song of importData.data) {
        const docRef = firestore.collection(collectionName).doc(song.id || firestore.collection(collectionName).doc().id);
        batch.set(docRef, {
          ...song,
          updatedAt: new Date(),
          importedAt: new Date()
        });
      }

      await batch.commit();
      await logActivity(`Imported to collection ${collectionName}`, auth.currentUser?.uid, {
        format: file.name.endsWith('.csv') ? 'csv' : 'json',
        count: importData.data.length,
        fileSize: formatStorageSize(file.size)
      });

      setError(null);
      onOperationComplete();

    } catch (error) {
      console.error('Import error:', error);
      setError(`Failed to import to collection ${collectionName}. Make sure the file format is correct.`);
    } finally {
      setImportInProgress(false);
    }
  };

  return {
    exportInProgress,
    importInProgress,
    error,
    handleCollectionExport,
    handleCollectionImport
  };
};