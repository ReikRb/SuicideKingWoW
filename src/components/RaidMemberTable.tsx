import { useState } from 'react';
import type { EnrichedRaidMember } from '../types/wowTypes';
import { classColors } from '../types/wowTypes';

interface RaidMemberTableProps {
  members: EnrichedRaidMember[];
  onUpdateMembers: (members: EnrichedRaidMember[]) => void;
  onDeleteMember: (memberId: string) => void;
}

export function RaidMemberTable({ members, onUpdateMembers, onDeleteMember }: RaidMemberTableProps) {
  const [draggedMember, setDraggedMember] = useState<EnrichedRaidMember | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (member: EnrichedRaidMember) => {
    setDraggedMember(member);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetMember: EnrichedRaidMember) => {
    if (!draggedMember || draggedMember.id === targetMember.id) return;

    const newMembers = [...members];
    const draggedIndex = members.findIndex(m => m.id === draggedMember.id);
    const targetIndex = members.findIndex(m => m.id === targetMember.id);

    // Swap order values
    const tempOrder = newMembers[draggedIndex].order;
    newMembers[draggedIndex].order = newMembers[targetIndex].order;
    newMembers[targetIndex].order = tempOrder;

    // Sort by order
    newMembers.sort((a, b) => a.order - b.order);
    
    onUpdateMembers(newMembers);
    setDraggedMember(null);
    setDragOverId(null);
  };

  const toggleStatus = (memberId: string) => {
    const newMembers = members.map(member => {
      if (member.id === memberId) {
        const statusOrder = ['present', 'absent', 'missing'] as const;
        const currentIndex = statusOrder.indexOf(member.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        return { ...member, status: statusOrder[nextIndex] };
      }
      return member;
    });
    onUpdateMembers(newMembers);
  };

  const handleSuicideKing = (memberId: string) => {
    const memberToMove = members.find(m => m.id === memberId);
    if (!memberToMove || memberToMove.status !== 'present') return;

    // 1. Get the list of members who are present
    const presentMembers = members.filter(m => m.status === 'present');
    
    // 2. Find the member to move, remove them, and add them to the end of the present list
    const memberToMoveIndex = presentMembers.findIndex(m => m.id === memberId);
    if (memberToMoveIndex === -1) return; // Should not happen if logic is correct
    
    const [movedMember] = presentMembers.splice(memberToMoveIndex, 1);
    presentMembers.push(movedMember);

    // 3. Reconstruct the list, preserving non-present members' positions
    let presentIndex = 0;
    const newMembers = members.map(originalMember => {
      if (originalMember.status === 'present') {
        // If the original member was present, take the next from the newly ordered list
        return presentMembers[presentIndex++];
      }
      // Otherwise, it's an absent/missing member, so keep them in place
      return originalMember;
    });

    // 4. Update the order property for all members
    const finalMembers = newMembers.map((member, index) => ({
      ...member,
      order: index + 1,
    }));

    onUpdateMembers(finalMembers);
  };

  const handleDelete = (memberId: string) => {
    // This now calls the global delete function
    onDeleteMember(memberId);
  };

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Order</th>
          <th style={styles.th}>Name</th>
          <th style={styles.th}>Class</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr
            key={member.id}
            draggable
            onDragStart={() => handleDragStart(member)}
            onDragOver={(e) => {
              handleDragOver(e);
              setDragOverId(member.id);
            }}
            onDragLeave={() => setDragOverId(null)}
            onDragEnd={() => {
              setDraggedMember(null);
              setDragOverId(null);
            }}
            onDrop={() => handleDrop(member)}
            style={{
              ...styles.tr,
              backgroundColor: dragOverId === member.id ? '#2a2a2a' : undefined,
              opacity: draggedMember?.id === member.id ? 0.5 : 1,
            }}
          >
            <td style={styles.td}>{member.order}</td>
            <td style={styles.td}>{member.name}</td>
            <td style={{ ...styles.td, color: classColors[member.class] }}>
              {member.class}
            </td>
            <td 
              style={{ ...styles.td, cursor: 'pointer' }}
              onClick={() => toggleStatus(member.id)}
              data-clickable="true"
            >
              <span style={{
                ...styles.status,
                backgroundColor: member.status === 'present' ? '#4CAF50' :
                                member.status === 'absent' ? '#f44336' : '#FF9800'
              }}>
                {member.status}
              </span>
            </td>
            <td style={styles.td}>
              <button onClick={() => handleDelete(member.id)} style={styles.actionButton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
              </button>
              <button onClick={() => handleSuicideKing(member.id)} style={styles.actionButton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: '#1a1a1a',
    color: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #444',
  },
  th: {
    padding: '12px',
    textAlign: 'left' as const,
    backgroundColor: '#333',
    borderBottom: '2px solid #444',
    fontWeight: 'normal',
    fontSize: '0.9em',
    color: '#aaa',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #444',
    transition: 'background-color 0.2s',
  },
  tr: {
    cursor: 'move',
    transition: 'all 0.2s',
  },
  status: {
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9em',
    display: 'inline-block',
    minWidth: '60px',
    textAlign: 'center' as const,
    transition: 'all 0.2s',
    '&:hover': {
      filter: 'brightness(1.1)',
    },
  },
  actionButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '4px',
  }
};