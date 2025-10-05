import { useState } from 'react'
import './App.css'
import { AddMemberDialog } from './components/AddMemberDialog'
import { RaidMemberTable } from './components/RaidMemberTable'
import type { RaidMember, RaidTable, WowClass } from './types/wowTypes'

function App() {
  const [tables, setTables] = useState<RaidTable[]>([
    {
      id: '1',
      name: 'Main Raid',
      members: []
    }
  ]);

  const [activeTableId, setActiveTableId] = useState<string>(tables[0].id);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');

  const activeTable = tables.find(table => table.id === activeTableId);

  const handleAddMember = (name: string, playerClass: WowClass) => {
    setTables(tables.map(table => {
      if (table.id === activeTableId) {
        const newMember: RaidMember = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          class: playerClass,
          status: 'present',
          order: table.members.length + 1
        };
        return { ...table, members: [...table.members, newMember] };
      }
      return table;
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>WoW Raid Manager</h1>
        <div style={styles.card}>
          <div style={styles.tabHeader}>
            <div style={styles.tabContainer}>
              {tables.map((table) => (
                <button
                  key={table.id}
                  style={{
                    ...styles.tab,
                    ...(activeTableId === table.id ? styles.activeTab : {})
                  }}
                  onClick={() => setActiveTableId(table.id)}
                >
                  <span>{table.name}</span>
                  {tables.length > 1 && (
                    <button
                      style={styles.removeButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTables(tables.filter(t => t.id !== table.id));
                        if (activeTableId === table.id) {
                          setActiveTableId(tables[0].id);
                        }
                      }}
                    >
                      ✕
                    </button>
                  )}
                </button>
              ))}
            </div>
            <button
              style={styles.addTableButton}
              onClick={() => setIsAddingTable(true)}
            >
              Add Table
            </button>
          </div>

          {activeTable && (
            <>
              <button
                style={styles.addMemberButton}
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add Member
              </button>
              <RaidMemberTable
                members={activeTable.members}
                onUpdateMembers={(members) => {
                  setTables(tables.map(table => 
                    table.id === activeTableId 
                      ? { ...table, members } 
                      : table
                  ));
                }}
              />
            </>
          )}
        </div>
      </div>

      <AddMemberDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddMember}
      />

      {isAddingTable && (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <h2 style={styles.dialogTitle}>Add New Table</h2>
            <div style={styles.dialogContent}>
              <input
                style={styles.input}
                type="text"
                placeholder="Table Name"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                autoFocus
              />
            </div>
            <div style={styles.dialogActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setIsAddingTable(false)}
              >
                Cancel
              </button>
              <button
                style={styles.submitButton}
                onClick={() => {
                  if (newTableName.trim()) {
                    setTables([...tables, {
                      id: Math.random().toString(36).substr(2, 9),
                      name: newTableName.trim(),
                      members: []
                    }]);
                    setNewTableName('');
                    setIsAddingTable(false);
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    minHeight: '100vh',
    backgroundColor: '#121212',
    color: 'white',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    marginBottom: '24px',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    padding: '24px',
  },
  tabHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid #333',
    paddingBottom: '16px',
  },
  tabContainer: {
    display: 'flex',
    flex: 1,
    gap: '8px',
  },
  tab: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #444',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  activeTab: {
    backgroundColor: '#333',
    borderColor: '#666',
  },
  removeButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: '12px',
  },
  addTableButton: {
    padding: '8px 16px',
    backgroundColor: '#2196f3',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    marginLeft: '16px',
  },
  addMemberButton: {
    padding: '8px 16px',
    backgroundColor: '#4caf50',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    marginBottom: '16px',
  },
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
  dialogTitle: {
    marginTop: 0,
    marginBottom: '24px',
    color: 'white',
  },
  dialogContent: {
    marginBottom: '24px',
  },
  input: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: 'white',
  },
  dialogActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #666',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '8px 16px',
    backgroundColor: '#4caf50',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
  },
};

export default App;
