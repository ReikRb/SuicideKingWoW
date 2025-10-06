import { useMemo, useState, useEffect } from 'react';
import './App.css';
import { AddMemberDialog } from './components/AddMemberDialog';
import { RaidMemberTable } from './components/RaidMemberTable';
import type { EnrichedRaidMember, Player, RaidMember, RaidTable, WowClass } from './types/wowTypes';
import { db } from './firebase';
import { collection, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tables, setTables] = useState<RaidTable[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const playersSnapshot = await getDocs(collection(db, 'players'));
        const fetchedPlayers = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
        setPlayers(fetchedPlayers);

        const tablesSnapshot = await getDocs(collection(db, 'tables'));
        const fetchedTables = await Promise.all(tablesSnapshot.docs.map(async (tableDoc) => {
          const membersSnapshot = await getDocs(collection(db, `tables/${tableDoc.id}/members`));
          const members = membersSnapshot.docs.map(memberDoc => ({ id: memberDoc.id, ...memberDoc.data() } as RaidMember));
          return { id: tableDoc.id, name: tableDoc.data().name, members } as RaidTable;
        }));
        setTables(fetchedTables);

        if (fetchedTables.length > 0) {
          setActiveTableId(fetchedTables[0].id);
        }

      } catch (error) {
        console.error("Error fetching data from Firestore: ", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const activeTable = tables.find(table => table.id === activeTableId);

  const handleAddMember = async (name: string, playerClass: WowClass) => {
    const existingPlayer = players.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existingPlayer) {
      alert('A player with this name already exists.');
      return;
    }

    const newPlayerRef = doc(collection(db, 'players'));
    const newPlayer: Player = {
      id: newPlayerRef.id,
      name,
      class: playerClass,
    };

    try {
      const batch = writeBatch(db);
      batch.set(newPlayerRef, { name: newPlayer.name, class: newPlayer.class });

      tables.forEach(table => {
        const newMember: RaidMember = {
          id: newPlayer.id,
          status: 'present',
          order: table.members.length + 1
        };
        const memberRef = doc(db, `tables/${table.id}/members`, newPlayer.id);
        batch.set(memberRef, { status: newMember.status, order: newMember.order });
      });

      await batch.commit();

      setPlayers([...players, newPlayer]);
      setTables(currentTables => currentTables.map(table => ({
        ...table,
        members: [...table.members, { id: newPlayer.id, status: 'present', order: table.members.length + 1 }]
      })));

    } catch (error) {
      console.error("Error adding new member: ", error);
    }
  };

  const handleDeleteMember = async (playerId: string) => {
    try {
      const batch = writeBatch(db);
      
      // Delete player from global players collection
      const playerRef = doc(db, 'players', playerId);
      batch.delete(playerRef);

      // Delete player from all table sub-collections
      tables.forEach(table => {
        const memberRef = doc(db, `tables/${table.id}/members`, playerId);
        batch.delete(memberRef);
      });

      await batch.commit();

      setPlayers(players.filter(p => p.id !== playerId));
      setTables(tables.map(table => ({
        ...table,
        members: table.members.filter(m => m.id !== playerId)
      })));

    } catch (error) {
      console.error("Error deleting member: ", error);
    }
  };

  const handleUpdateMembers = async (updatedMembers: EnrichedRaidMember[]) => {
    if (!activeTableId) return;

    const updatedPlainMembers: RaidMember[] = updatedMembers.map(m => ({
      id: m.id,
      order: m.order,
      status: m.status,
    }));

    try {
      const batch = writeBatch(db);
      updatedPlainMembers.forEach(member => {
        const memberRef = doc(db, `tables/${activeTableId}/members`, member.id);
        batch.update(memberRef, { order: member.order, status: member.status });
      });
      await batch.commit();

      const newTables = tables.map(table => 
        table.id === activeTableId 
          ? { ...table, members: updatedPlainMembers } 
          : table
      );
      setTables(newTables);
    } catch (error) {
      console.error("Error updating members: ", error);
    }
  };

  const handleAddTable = async (tableName: string) => {
    if (!tableName.trim()) return;

    const newTableRef = doc(collection(db, 'tables'));
    const newTable: RaidTable = {
      id: newTableRef.id,
      name: tableName.trim(),
      members: players.map((player, index) => ({
        id: player.id,
        status: 'present',
        order: index + 1,
      })),
    };

    try {
      const batch = writeBatch(db);
      batch.set(newTableRef, { name: newTable.name });

      newTable.members.forEach(member => {
        const memberRef = doc(db, `tables/${newTable.id}/members`, member.id);
        batch.set(memberRef, { status: member.status, order: member.order });
      });

      await batch.commit();

      setTables([...tables, newTable]);
      setActiveTableId(newTable.id);
      setNewTableName('');
      setIsAddingTable(false);
    } catch (error) {
      console.error("Error adding new table: ", error);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      // Firestore doesn't support deleting collections from the client-side SDK directly.
      // For a production app, this should be handled by a Cloud Function.
      // For now, we'll just delete the table document. The sub-collection will be orphaned.
      await deleteDoc(doc(db, 'tables', tableId));

      const newTables = tables.filter(t => t.id !== tableId);
      setTables(newTables);
      if (activeTableId === tableId && newTables.length > 0) {
        setActiveTableId(newTables[0].id);
      } else if (newTables.length === 0) {
        setActiveTableId(null);
      }
    } catch (error) {
      console.error("Error deleting table: ", error);
    }
  };

  const membersForActiveTable = useMemo((): EnrichedRaidMember[] => {
    if (!activeTable) return [];
    
    const enrichedMembers = activeTable.members.map(member => {
      const playerInfo = players.find(p => p.id === member.id);
      if (!playerInfo) return null;
      return {
        ...member,
        name: playerInfo.name,
        class: playerInfo.class,
      };
    }).filter((m): m is EnrichedRaidMember => m !== null);

    return enrichedMembers.sort((a, b) => a.order - b.order);
  }, [activeTable, players]);

  if (loading) {
    return <div className="loading-screen">Loading Raid Data...</div>;
  }

  return (
    <div className="container">
      <div className="content">
        <h1 className="title">Suicide King WoW</h1>
        <div className="card">
          <div className="tab-header">
            <div className="tab-container">
              {tables.map((table) => (
                <button
                  key={table.id}
                  className={`tab ${activeTableId === table.id ? 'active' : ''}`}
                  onClick={() => setActiveTableId(table.id)}
                >
                  <span>{table.name}</span>
                  {tables.length > 0 && (
                    <button
                      className="remove-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete the table "${table.name}"?`)) {
                          handleDeleteTable(table.id);
                        }
                      }}
                    >
                      ✕
                    </button>
                  )}
                </button>
              ))}
              {isAddingTable ? (
                <div className="add-table-form">
                  <input
                    type="text"
                    className="add-table-input"
                    placeholder="Table Name"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTable(newTableName)}
                    autoFocus
                  />
                  <button className="add-table-confirm" onClick={() => handleAddTable(newTableName)}>✓</button>
                  <button className="add-table-cancel" onClick={() => setIsAddingTable(false)}>✕</button>
                </div>
              ) : (
                <button
                  className="tab add-new-tab-button"
                  onClick={() => setIsAddingTable(true)}
                >
                  +
                </button>
              )}
            </div>
          </div>

          {activeTable && (
            <>
              <button
                className="add-member-button"
                onClick={() => setIsAddDialogOpen(true)}
              >
                + Add Member
              </button>
              <RaidMemberTable
                members={membersForActiveTable}
                onUpdateMembers={handleUpdateMembers}
                onDeleteMember={handleDeleteMember}
              />
            </>
          )}
          {!activeTable && !loading && (
            <div className="no-tables-message">
              <h2>No Raid Tables Found</h2>
              <p>Click "+ Add Table" to create your first raid list.</p>
            </div>
          )}
        </div>
      </div>

      <AddMemberDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddMember}
      />
  
      <div className="footer">
        <p>Developed by ReikRb</p>
        
      </div>
    </div>
  );
}

export default App;
