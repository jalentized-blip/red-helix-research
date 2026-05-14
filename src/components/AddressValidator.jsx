import React, { useState, useCallback, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddressValidator({ address, city, state, zip, onValidationComplete }) {
  const [validationState, setValidationState] = useState('idle'); // idle, validating, valid, invalid
  const [confidence, setConfidence] = useState(0);
  const [message, setMessage] = useState('');
  const [validatedData, setValidatedData] = useState(null);
  const debounceTimer = useRef(null);

  const validateAddress = useCallback(async () => {
    // Skip if any field is empty
    if (!address?.trim() || !city?.trim() || !state?.trim() || !zip?.trim()) {
      setValidationState('idle');
      setMessage('');
      return;
    }

    setValidationState('validating');
    setMessage('Verifying address...');

    try {
      const response = await base44.functions.invoke('validateAddressGeoapify', {
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim()
      });

      const result = response.data;
      setConfidence(result.confidence);

      if (result.valid) {
        setValidationState('valid');
        setMessage(`✓ Address verified (${(result.confidence * 100).toFixed(0)}% match)`);
        setValidatedData(result.details);
        onValidationComplete(true, result.details);
      } else {
        setValidationState('invalid');
        setMessage(result.reason);
        setValidatedData(null);
        onValidationComplete(false, null);
      }
    } catch (error) {
      setValidationState('invalid');
      setMessage('Address verification failed. Please check your connection.');
      setValidatedData(null);
      onValidationComplete(false, null);
    }
  }, [address, city, state, zip, onValidationComplete]);

  // Debounced validation on address change
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Only validate if all fields have content
    if (address?.trim() && city?.trim() && state?.trim() && zip?.trim()) {
      debounceTimer.current = setTimeout(() => {
        validateAddress();
      }, 1500); // 1.5 second debounce after user stops typing
    } else {
      setValidationState('idle');
      setMessage('');
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [address, city, state, zip, validateAddress]);

  return (
    <AnimatePresence>
      {validationState !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className={`mt-2 p-3 rounded-lg border flex items-start gap-3 text-sm ${
            validationState === 'validating'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : validationState === 'valid'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {validationState === 'validating' && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {validationState === 'valid' && (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {validationState === 'invalid' && (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">{message}</p>
            {validatedData && validationState === 'valid' && (
              <p className="text-xs opacity-75 mt-1">
                {validatedData.housenumber && `${validatedData.housenumber} `}
                {validatedData.street}, {validatedData.city}, {validatedData.state} {validatedData.postcode}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}