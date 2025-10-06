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
        const statusOrder = ['present', 'absent'] as const;
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
    if (window.confirm('Are you sure you want to permanently delete this player from all tables?')) {
      onDeleteMember(memberId);
    }
  };

  return (
    <div className="table-container">
      <table className="raid-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Class</th>
            <th>Status</th>
            <th>Actions</th>
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
              className={`
                ${dragOverId === member.id ? 'drag-over' : ''}
                ${draggedMember?.id === member.id ? 'dragging' : ''}
              `}
            >
              <td>{member.order}</td>
              <td style={{ color: classColors[member.class] }}>
                {member.name}
              </td>
              <td style={{ color: classColors[member.class] }}>
                {member.class}
              </td>
              <td
                className="status-cell"
                onClick={() => toggleStatus(member.id)}
              >
                <span className={`status-badge status-${member.status}`}>
                  {member.status}
                </span>
              </td>
              <td className="actions-cell">
                <button
                  className="action-button sk-button"
                  onClick={() => handleSuicideKing(member.id)}
                  title="Suicide King"
                  disabled={member.status !== 'present'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
                <button
                  className="action-button delete-button"
                  onClick={() => handleDelete(member.id)}
                  title="Delete Member"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}