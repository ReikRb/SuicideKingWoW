import { useMemo, useState } from 'react';
import './App.css';
import { AddMemberDialog } from './components/AddMemberDialog';
import { RaidMemberTable } from './components/RaidMemberTable';
import type { EnrichedRaidMember, Player, RaidMember, RaidTable, WowClass } from './types/wowTypes';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
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
    const existingPlayer = players.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existingPlayer) {
      // If player already exists, don't add again.
      // Optionally, you could add them to the current table if they aren't already in it.
      alert('A player with this name already exists.');
      return;
    }

    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      class: playerClass,
    };
    setPlayers([...players, newPlayer]);

    // Add the new player to all existing tables
    setTables(currentTables => currentTables.map(table => {
      const newMember: RaidMember = {
        id: newPlayer.id,
        status: 'present',
        order: table.members.length + 1
      };
      return { ...table, members: [...table.members, newMember] };
    }));
  };

  const handleDeleteMember = (playerId: string) => {
    // Remove the player from the global list
    setPlayers(players.filter(p => p.id !== playerId));

    // Remove the player from all tables
    setTables(tables.map(table => ({
      ...table,
      members: table.members.filter(m => m.id !== playerId)
    })));
  };

  const membersForActiveTable = useMemo((): EnrichedRaidMember[] => {
    if (!activeTable) return [];
    
    const enrichedMembers = activeTable.members.map(member => {
      const playerInfo = players.find(p => p.id === member.id);
      if (!playerInfo) return null; // Should not happen in normal operation
      return {
        ...member,
        name: playerInfo.name,
        class: playerInfo.class,
      };
    }).filter((m): m is EnrichedRaidMember => m !== null);

    return enrichedMembers.sort((a, b) => a.order - b.order);
  }, [activeTable, players]);

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
                        const newTables = tables.filter(t => t.id !== table.id);
                        setTables(newTables);
                        if (activeTableId === table.id && newTables.length > 0) {
                          setActiveTableId(newTables[0].id);
                        } else if (newTables.length === 0) {
                          // Optional: handle the case where no tables are left
                          // For example, create a default one or show a message.
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
                members={membersForActiveTable}
                onUpdateMembers={(updatedMembers) => {
                  const newTables = tables.map(table => {
                    if (table.id === activeTableId) {
                      // When updating, we only receive EnrichedRaidMember, 
                      // so we need to strip it back to RaidMember for storage.
                      const updatedPlainMembers: RaidMember[] = updatedMembers.map(m => ({
                        id: m.id,
                        order: m.order,
                        status: m.status,
                      }));
                      return { ...table, members: updatedPlainMembers };
                    }
                    return table;
                  });
                  setTables(newTables);
                }}
                onDeleteMember={handleDeleteMember}
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newTableName.trim()) {
                  const newTable: RaidTable = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: newTableName.trim(),
                    // When creating a new table, populate it with all existing players
                    members: players.map((player, index) => ({
                      id: player.id,
                      status: 'present',
                      order: index + 1,
                    })),
                  };
                  setTables([...tables, newTable]);
                  setActiveTableId(newTable.id);
                  setNewTableName('');
                  setIsAddingTable(false);
                }
              }}
            >
              <input
                style={styles.input}
                type="text"
                placeholder="Table Name"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                autoFocus
              />
              <div style={styles.dialogActions}>
                <button
                  style={styles.cancelButton}
                  type="button"
                  onClick={() => setIsAddingTable(false)}
                >
                  Cancel
                </button>
                <button
                  style={styles.submitButton}
                  type="submit"
                >
                  Add
                </button>
              </div>
            </form>
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
