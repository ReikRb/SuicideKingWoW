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

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2 className="dialog-title">Add New Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="class">Class:</label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as WowClass)}
              style={{ color: classColors[selectedClass] }}
            >
              {wowClasses.map((className) => (
                <option
                  key={className}
                  value={className}
                  style={{ color: classColors[className], backgroundColor: '#1a150f' }}
                >
                  {className}
                </option>
              ))}
            </select>
          </div>
          <div className="dialog-actions">
            <button type="submit" className="dialog-button submit">
              Add Member
            </button>
            <button type="button" onClick={onClose} className="dialog-button cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}