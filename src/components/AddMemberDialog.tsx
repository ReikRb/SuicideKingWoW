import { useState } from 'react';
import type { WowClass } from '../types/wowTypes';

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, playerClass: WowClass) => void;
}

export function AddMemberDialog({ isOpen, onClose, onAdd }: AddMemberDialogProps) {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<WowClass>('Warrior');
  const wowClasses = [
    'Death Knight', 'Demon Hunter', 'Druid', 'Evoker', 'Hunter',
    'Mage', 'Monk', 'Paladin', 'Priest', 'Rogue', 'Shaman',
    'Warlock', 'Warrior'
  ] as WowClass[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), selectedClass);
      setName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <h2 style={styles.title}>Add New Member</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="class" style={styles.label}>Class:</label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as WowClass)}
              style={styles.select}
            >
              {wowClasses.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.submitButton}>
              Add Member
            </button>
            <button 
              type="button" 
              onClick={onClose}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    backgroundColor: '#1a1a1a',
    padding: '24px',
    borderRadius: '8px',
    minWidth: '300px',
  },
  title: {
    color: 'white',
    marginTop: 0,
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    color: 'white',
    fontSize: '14px',
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: 'white',
  },
  select: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: 'white',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  submitButton: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #666',
    backgroundColor: 'transparent',
    color: 'white',
    cursor: 'pointer',
  },
};