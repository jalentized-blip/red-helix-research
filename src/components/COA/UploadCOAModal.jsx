import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UploadCOAModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: upload, 2: verify, 3: details
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [peptideName, setPeptideName] = useState('');
  const [peptideStrength, setPeptideStrength] = useState('');
  const [coaLink, setCoaLink] = useState('');

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsVerifying(true);

    try {
      // Upload file first
      const uploadResponse = await base44.integrations.Core.UploadFile({
        file: selectedFile
      });
      
      setFileUrl(uploadResponse.file_url);

      // Verify COA
      const verifyResponse = await base44.functions.invoke('verifyCOA', {
        file_url: uploadResponse.file_url
      });

      setVerificationResult(verifyResponse.data);
      
      if (verifyResponse.data.is_valid_coa && verifyResponse.data.confidence >= 70) {
        setStep(2);
      } else {
        setStep(2); // Show verification result anyway
      }
    } catch (error) {
      setVerificationResult({
        is_valid_coa: false,
        confidence: 0,
        reason: 'Error verifying file: ' + error.message
      });
      setStep(2);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProceedToDetails = () => {
    if (verificationResult?.is_valid_coa && verificationResult?.confidence >= 70) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!peptideName || !peptideStrength || !fileUrl) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    try {
      await base44.entities.UserCOA.create({
        peptide_name: peptideName,
        peptide_strength: peptideStrength,
        coa_image_url: fileUrl,
        coa_link: coaLink,
        verified: true,
        uploaded_by: (await base44.auth.me()).email,
        approved: false
      });

      onSuccess?.();
      handleReset();
    } catch (error) {
      alert('Error uploading COA: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setFileUrl(null);
    setVerificationResult(null);
    setPeptideName('');
    setPeptideStrength('');
    setCoaLink('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="bg-stone-900 border-stone-800 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-amber-50 text-xl">Upload Your COA</DialogTitle>
          <DialogDescription className="text-stone-400">
            Share your Certificate of Analysis to help the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-700 rounded-lg cursor-pointer hover:bg-stone-800/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isVerifying ? (
                    <Loader2 className="w-8 h-8 text-barn-brown animate-spin mb-2" />
                  ) : (
                    <Upload className="w-8 h-8 text-barn-brown mb-2" />
                  )}
                  <p className="text-sm text-amber-50 font-semibold">Click to upload COA</p>
                  <p className="text-xs text-stone-400">PNG, JPG, PDF (Max 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  disabled={isVerifying}
                />
              </label>
              {file && <p className="text-sm text-stone-300">Selected: {file.name}</p>}
            </div>
          )}

          {/* Step 2: Verification Result */}
          {step === 2 && verificationResult && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                verificationResult.is_valid_coa && verificationResult.confidence >= 70
                  ? 'bg-green-900/20 border-green-700/50'
                  : 'bg-red-900/20 border-red-700/50'
              }`}>
                <div className="flex items-start gap-3">
                  {verificationResult.is_valid_coa && verificationResult.confidence >= 70 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-semibold ${
                      verificationResult.is_valid_coa && verificationResult.confidence >= 70
                        ? 'text-green-100'
                        : 'text-red-100'
                    }`}>
                      {verificationResult.is_valid_coa && verificationResult.confidence >= 70
                        ? 'Valid COA Detected'
                        : 'Invalid or Undetectable COA'}
                    </p>
                    <p className="text-sm text-stone-300 mt-1">{verificationResult.reason}</p>
                    <p className="text-xs text-stone-400 mt-2">
                      Confidence: {verificationResult.confidence}%
                    </p>
                  </div>
                </div>
              </div>

              {verificationResult.is_valid_coa && verificationResult.confidence >= 70 ? (
                <Button
                  onClick={handleProceedToDetails}
                  className="w-full bg-barn-brown hover:bg-barn-dark text-amber-50"
                >
                  Continue to Details
                </Button>
              ) : (
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="w-full border-stone-700 text-amber-50"
                >
                  Try Another File
                </Button>
              )}
            </div>
          )}

          {/* Step 3: Details Form */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-amber-50 mb-2">
                  Peptide Name *
                </label>
                <Input
                  value={peptideName}
                  onChange={(e) => setPeptideName(e.target.value)}
                  placeholder="e.g., BPC-157, TB-500"
                  className="bg-stone-800 border-stone-700 text-amber-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-50 mb-2">
                  Peptide Strength *
                </label>
                <Input
                  value={peptideStrength}
                  onChange={(e) => setPeptideStrength(e.target.value)}
                  placeholder="e.g., 5mg, 10mg/vial"
                  className="bg-stone-800 border-stone-700 text-amber-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-50 mb-2">
                  COA Link (Optional)
                </label>
                <Input
                  value={coaLink}
                  onChange={(e) => setCoaLink(e.target.value)}
                  placeholder="Direct link to COA document"
                  className="bg-stone-800 border-stone-700 text-amber-50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 border-stone-700 text-amber-50"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="flex-1 bg-barn-brown hover:bg-barn-dark text-amber-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload COA'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}