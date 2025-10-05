import { useState } from 'react';
import type { RaidMember } from '../types/wowTypes';
import { classColors } from '../types/wowTypes';

interface RaidMemberTableProps {
  members: RaidMember[];
  onUpdateMembers: (members: RaidMember[]) => void;
}

export function RaidMemberTable({ members, onUpdateMembers }: RaidMemberTableProps) {
  const [draggedMember, setDraggedMember] = useState<RaidMember | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (member: RaidMember) => {
    setDraggedMember(member);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetMember: RaidMember) => {
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

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Order</th>
          <th style={styles.th}>Name</th>
          <th style={styles.th}>Class</th>
          <th style={styles.th}>Status</th>
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
};