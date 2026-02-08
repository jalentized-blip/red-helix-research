import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export default function UploadCOAModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: upload, 2: verify, 3: details
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(null);
  
  const [peptideName, setPeptideName] = useState('');
  const [peptideStrength, setPeptideStrength] = useState('');
  const [coaLink, setCoaLink] = useState('');
  const [isFromBarn, setIsFromBarn] = useState(null);
  const [batchNumber, setBatchNumber] = useState('');

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

  const handleProceedToDetails = async () => {
    if (verificationResult?.is_valid_coa && verificationResult?.confidence >= 70) {
      setIsExtracting(true);
      setExtractionError(null);
      
      try {
        const extractionResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `You are analyzing a Certificate of Analysis (COA) image. Extract the following information from the COA:
1. Peptide/Compound Name (the name of the substance being analyzed)
2. Peptide Strength/Dosage (the concentration, mg, or strength information)

Return ONLY a JSON object with these fields: {"peptide_name": "...", "peptide_strength": "..."}
If you cannot find either field, set it to null.`,
          file_urls: fileUrl,
          response_json_schema: {
            type: "object",
            properties: {
              peptide_name: { type: "string" },
              peptide_strength: { type: "string" }
            }
          }
        });

        // Auto-fill the fields if extraction was successful
        if (extractionResponse.peptide_name) {
          setPeptideName(extractionResponse.peptide_name);
        }
        if (extractionResponse.peptide_strength) {
          setPeptideStrength(extractionResponse.peptide_strength);
        }

        // Show error if required fields are missing
        if (!extractionResponse.peptide_name || !extractionResponse.peptide_strength) {
          setExtractionError('Could not auto-detect all required fields. Please fill them in manually.');
        }

        setStep(3);
      } catch (error) {
        setExtractionError('Error analyzing document. Please fill in the fields manually.');
        setStep(3);
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!peptideName || !peptideStrength || !fileUrl || isFromBarn === null) {
      alert('Please fill in all required fields');
      return;
    }

    if (!isFromBarn) {
      alert('This COA must be for Red Helix Research products. Please try again with a valid COA for Red Helix-related products.');
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
        approved: false,
        is_from_barn: isFromBarn,
        batch_number: batchNumber || null
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
    setExtractionError(null);
    setIsFromBarn(null);
    setBatchNumber('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="bg-white border-slate-200 max-w-lg rounded-[32px] overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-slate-900 text-2xl font-black uppercase tracking-tighter">
            Submit <span className="text-red-600">COA Report</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Contribute to the clinical database of verified research materials.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-[24px] cursor-pointer hover:bg-slate-50 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isVerifying ? (
                    <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-white transition-colors">
                      <Upload className="w-8 h-8 text-red-600" />
                    </div>
                  )}
                  <p className="text-base text-slate-900 font-bold uppercase tracking-wide">Click to upload COA</p>
                  <p className="text-sm text-slate-500 mt-1">PNG, JPG, PDF (Max 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  disabled={isVerifying}
                />
              </label>
              {file && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-slate-600 font-medium truncate">Selected: {file.name}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Verification Result */}
          {step === 2 && verificationResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className={`p-6 rounded-[24px] border ${
                verificationResult.is_valid_coa && verificationResult.confidence >= 70
                  ? 'bg-green-50 border-green-100'
                  : 'bg-red-50 border-red-100'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    verificationResult.is_valid_coa && verificationResult.confidence >= 70
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {verificationResult.is_valid_coa && verificationResult.confidence >= 70 ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <AlertCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className={`text-lg font-black uppercase tracking-tight ${
                      verificationResult.is_valid_coa && verificationResult.confidence >= 70
                        ? 'text-green-900'
                        : 'text-red-900'
                    }`}>
                      {verificationResult.is_valid_coa && verificationResult.confidence >= 70
                        ? 'Protocol Verified'
                        : 'Verification Failed'}
                    </p>
                    <p className="text-slate-600 font-medium mt-1 leading-tight">{verificationResult.reason}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            verificationResult.confidence >= 70 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${verificationResult.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        {verificationResult.confidence}% Confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {verificationResult.is_valid_coa && verificationResult.confidence >= 70 ? (
                 <Button
                   onClick={handleProceedToDetails}
                   disabled={isExtracting}
                   className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-full font-black uppercase tracking-wider text-sm shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
                 >
                   {isExtracting ? (
                     <>
                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                       Analyzing Lab Data...
                     </>
                   ) : (
                     <>
                       <Zap className="w-4 h-4 mr-2" />
                       Proceed to Classification
                     </>
                   )}
                 </Button>
                ) : (
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="w-full border-slate-200 text-slate-900 h-12 rounded-full font-black uppercase tracking-wider text-sm hover:bg-slate-50"
                  >
                    Resubmit Document
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Details Form */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
              {extractionError && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-900 font-medium">{extractionError}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Peptide Name *
                  </label>
                  <Input
                    value={peptideName}
                    onChange={(e) => setPeptideName(e.target.value)}
                    placeholder="e.g., BPC-157"
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-xl focus:ring-red-600/20 focus:border-red-600 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Concentration *
                  </label>
                  <Input
                    value={peptideStrength}
                    onChange={(e) => setPeptideStrength(e.target.value)}
                    placeholder="e.g., 5mg"
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-xl focus:ring-red-600/20 focus:border-red-600 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Reference Link (Optional)
                </label>
                <Input
                  value={coaLink}
                  onChange={(e) => setCoaLink(e.target.value)}
                  placeholder="Direct link to lab result"
                  className="bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-xl focus:ring-red-600/20 focus:border-red-600 font-bold"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Red Helix Research Verified? *
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFromBarn(true)}
                    className={`flex-1 h-12 rounded-xl font-black uppercase tracking-wider text-xs transition-all ${
                      isFromBarn === true
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                        : 'bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    Verified
                  </button>
                  <button
                    onClick={() => setIsFromBarn(false)}
                    className={`flex-1 h-12 rounded-xl font-black uppercase tracking-wider text-xs transition-all ${
                      isFromBarn === false
                        ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                        : 'bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    Third-Party
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Batch ID (Optional)
                </label>
                <Input
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g., LOT-2024-001"
                  className="bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-xl focus:ring-red-600/20 focus:border-red-600 font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 border-slate-200 text-slate-400 h-12 rounded-full font-black uppercase tracking-wider text-xs hover:bg-slate-50 hover:text-slate-900"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="flex-2 bg-red-600 hover:bg-red-700 text-white h-12 rounded-full font-black uppercase tracking-wider text-xs shadow-lg shadow-red-200"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    'Publish Report'
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
