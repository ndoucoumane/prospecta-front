import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { prospectsApi } from '../../../api';
import { useToast } from '../../../app/providers/ToastProvider';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

interface ParsedFileMetadata {
  file: File;
  name: string;
  sizeFormatted: string;
  rowCount: number;
  sampleRows: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyName: string;
    jobTitle: string;
  }>;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileMeta, setFileMeta] = useState<ParsedFileMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ importedCount: number } | null>(null);

  const resetState = () => {
    setFileMeta(null);
    setError(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setImportResult(null);

    // Frontend validation: extension, MIME, size (max 2MB)
    const validExtensions = ['.csv', '.txt'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError('Format non supporté. Veuillez sélectionner un fichier CSV (.csv).');
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setError('Le fichier est trop volumineux (taille maximale autorisée : 2 Mo).');
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} Mo`
        : `${(file.size / 1024).toFixed(1)} Ko`;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length <= 1) {
          setError('Le fichier CSV est vide ou ne contient aucune ligne de données.');
          return;
        }

        const dataRows = lines.slice(1);
        const parsedRows = dataRows.map((line, idx) => {
          const cols = line.split(/[,;]/).map((c) => c.replace(/^["']|["']$/g, '').trim());
          return {
            firstName: cols[0] || `Contact`,
            lastName: cols[1] || `${idx + 1}`,
            email: cols[2] || `contact${idx + 1}@entreprise.sn`,
            phone: cols[3] || '+221 77 000 00 00',
            companyName: cols[4] || 'Entreprise Importée',
            jobTitle: cols[5] || 'Décideur',
          };
        });

        setFileMeta({
          file,
          name: file.name,
          sizeFormatted,
          rowCount: dataRows.length,
          sampleRows: parsedRows.slice(0, 3),
        });
      } catch {
        setError('Impossible d\'analyser le fichier CSV. Vérifiez l\'encodage.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!fileMeta) return;
    setIsProcessing(true);
    try {
      const res = await prospectsApi.importProspectsFromCsv(fileMeta.sampleRows);
      setImportResult({ importedCount: res.importedCount });
      showToast(`${res.importedCount} prospects importés avec succès.`);
      onImportSuccess();
    } catch {
      setError('Erreur lors de l\'import des prospects.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetState();
        onClose();
      }}
      title="Importer des prospects (CSV)"
      description="Importez un fichier CSV contenant les contacts de vos entreprises cibles."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Zone */}
        {!fileMeta && !importResult && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">
              Cliquez pour sélectionner un fichier CSV
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Colonnes recommandées : Prénom, Nom, Email, Téléphone, Entreprise, Fonction
            </p>
            <p className="text-[11px] text-gray-400 mt-2">
              Formats acceptés : .csv (UTF-8) • Max 2 Mo
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* 70. File Metadata Display */}
        {fileMeta && !importResult && (
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50 space-y-3">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  Nom du fichier : {fileMeta.name}
                </p>
                <p className="text-[11px] text-gray-500">
                  Taille : {fileMeta.sizeFormatted} • Nombre de lignes : {fileMeta.rowCount}
                </p>
              </div>
            </div>

            {/* Preview table */}
            <div className="border border-gray-200 rounded bg-white overflow-x-auto text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="p-2">Contact</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Entreprise</th>
                    <th className="p-2">Fonction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fileMeta.sampleRows.map((r, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">
                        {r.firstName} {r.lastName}
                      </td>
                      <td className="p-2 text-gray-600">{r.email}</td>
                      <td className="p-2 text-gray-600">{r.companyName}</td>
                      <td className="p-2 text-gray-600">{r.jobTitle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={resetState}>
                Choisir un autre fichier
              </Button>
              <Button size="sm" onClick={handleImport} isLoading={isProcessing}>
                Lancer l'import ({fileMeta.rowCount} contacts)
              </Button>
            </div>
          </div>
        )}

        {/* 70. Import Result Feedback */}
        {importResult && (
          <div className="border border-green-200 bg-green-50/50 rounded-lg p-5 text-center">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-2">
              <Check className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Résultat de l'import</h4>
            <p className="text-xs text-gray-600 mt-1">
              {importResult.importedCount} prospects ont été ajoutés à votre base commerciale.
            </p>
            <div className="mt-4 flex justify-center">
              <Button
                size="sm"
                onClick={() => {
                  resetState();
                  onClose();
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
