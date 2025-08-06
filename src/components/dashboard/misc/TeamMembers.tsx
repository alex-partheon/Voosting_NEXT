'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'Owner' | 'Developer' | 'Billing';
}

interface TeamMembersProps {
  members?: TeamMember[];
  className?: string;
}

const defaultMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sofia Davis',
    email: 'm@example.com',
    role: 'Owner'
  },
  {
    id: '2',
    name: 'Jackson Lee',
    email: 'p@example.com',
    role: 'Developer'
  },
  {
    id: '3',
    name: 'Isabella Nguyen',
    email: 'i@example.com',
    role: 'Billing'
  }
];

export function TeamMembers({ members = defaultMembers, className }: TeamMembersProps) {
  return (
    <div className={cn("rounded-xl bg-white p-6 shadow-sm border border-gray-100", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Team Members</h3>
      <p className="text-sm text-gray-600 mb-6">Invite your team members to collaborate.</p>

      <div className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium",
              member.id === '1' && "bg-gray-200 text-gray-700",
              member.id === '2' && "bg-gray-200 text-gray-700",
              member.id === '3' && "bg-gray-200 text-gray-700"
            )}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-500">{member.email}</p>
            </div>
            <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {member.role}
              <ChevronDown size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}