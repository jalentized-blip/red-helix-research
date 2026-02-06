import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function InteractiveQuiz({ onBack }) {
  return (
    <div>
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div className="mt-8 text-center text-stone-400">
        Quiz component - Coming soon
      </div>
    </div>
  );
}