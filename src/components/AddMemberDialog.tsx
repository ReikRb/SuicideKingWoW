import { useState } from 'react';
import type { WowClass } from '../types/wowTypes';
import { classColors } from '../types/wowTypes';

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, playerClass: WowClass) => void;
}

export function AddMemberDialog({ isOpen, onClose, onAdd }: AddMemberDialogProps) {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<WowClass>('Warrior');
  const wowClasses = Object.keys(classColors) as WowClass[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), selectedClass);
      setName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectStyle = {
    ...styles.select,
    color: classColors[selectedClass],
  };

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
              autoFocus
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="class" style={styles.label}>Class:</label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as WowClass)}
              style={selectStyle}
            >
              {wowClasses.map((className) => (
                <option
                  key={className}
                  value={className}
                  style={{ color: classColors[className], backgroundColor: '#2a2a2a' }}
                >
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
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: '#1e1e1e',
    padding: '32px',
    borderRadius: '8px',
    width: '400px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
  },
  title: {
    color: 'white',
    marginTop: 0,
    marginBottom: '24px',
    textAlign: 'center' as const,
    fontSize: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    color: '#aaa',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  input: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: 'white',
    fontSize: '1rem',
  },
  select: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: 'white',
    fontSize: '1rem',
    appearance: 'none' as const,
    background: `url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>') no-repeat right 12px center`,
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  submitButton: {
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  cancelButton: {
    padding: '10px 20px',
    borderRadius: '4px',
    border: '1px solid #666',
    backgroundColor: 'transparent',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};