import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function EditableText({ textKey, defaultValue, as = 'span', className = '', multiline = false }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [editValue, setEditValue] = useState(defaultValue);
  const [editModeEnabled, setEditModeEnabled] = useState(true);
  const inputRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Use cached admin status to avoid rate limits
    if (window.__adminStatusCache !== undefined) {
      setIsAdmin(window.__adminStatusCache);
    } else {
      const checkAdmin = async () => {
        try {
          const user = await base44.auth.me();
          const isAdminUser = user?.role === 'admin';
          setIsAdmin(isAdminUser);
          window.__adminStatusCache = isAdminUser;
        } catch {
          setIsAdmin(false);
          window.__adminStatusCache = false;
        }
      };
      checkAdmin();
    }

    // Load edit mode preference
    const savedEditMode = localStorage.getItem('adminEditModeEnabled');
    if (savedEditMode !== null) {
      setEditModeEnabled(savedEditMode === 'true');
    }

    // Fetch saved text for this key
    const fetchSavedText = async () => {
      try {
        const texts = await base44.entities.SiteText.filter({ text_key: textKey });
        if (texts.length > 0) {
          setValue(texts[0].text_value);
        }
      } catch (err) {
        // No saved text yet
      }
    };
    fetchSavedText();

    // Listen for edit mode changes
    const handleEditModeChange = (event) => {
      setEditModeEnabled(event.detail);
    };
    window.addEventListener('editModeChanged', handleEditModeChange);
    return () => window.removeEventListener('editModeChanged', handleEditModeChange);
  }, [textKey]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (multiline) {
        inputRef.current.selectionStart = editValue.length;
      } else {
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline, editValue.length]);

  const handleSave = async () => {
    try {
      // Check if text already exists
      const existing = await base44.entities.SiteText.filter({ text_key: textKey });
      
      if (existing.length > 0) {
        await base44.entities.SiteText.update(existing[0].id, { text_value: editValue });
      } else {
        await base44.entities.SiteText.create({ text_key: textKey, text_value: editValue, page: 'home' });
      }
      
      setValue(editValue);
      setIsEditing(false);
      toast.success('Text updated successfully');
    } catch (err) {
      toast.error('Failed to save text');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const Component = as;

  if (!isAdmin || !editModeEnabled) {
    return <Component className={className}>{value}</Component>;
  }

  if (isEditing) {
    return (
      <div className="relative inline-block w-full">
        {multiline ? (
          <Textarea
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-stone-900 border-red-600 text-amber-50 min-h-[100px]"
          />
        ) : (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-stone-900 border-red-600 text-amber-50"
          />
        )}
        <div className="flex gap-2 mt-2">
          <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
            <Check className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button onClick={handleCancel} size="sm" variant="outline" className="border-stone-600">
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative inline-block group/editable pr-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Component className={className}>{value}</Component>
      <button
        onClick={() => {
          setEditValue(value);
          setIsEditing(true);
        }}
        onMouseEnter={() => setIsHovered(true)}
        className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 bg-red-600/80 hover:bg-red-600 rounded-md shadow-lg transition-all opacity-0 group-hover/editable:opacity-100"
      >
        <Pencil className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}