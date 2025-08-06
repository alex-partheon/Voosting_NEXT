'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, Archive, Trash2, Clock, MoreVertical } from 'lucide-react';

interface EmailItem {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  isImportant?: boolean;
  category?: 'meeting' | 'work' | 'important' | 'personal';
}

interface InboxProps {
  emails?: EmailItem[];
  className?: string;
}

const defaultEmails: EmailItem[] = [
  {
    id: '1',
    sender: 'William Smith',
    subject: 'Meeting Tomorrow',
    preview: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.",
    time: 'almost 2 years ago',
    category: 'meeting'
  },
  {
    id: '2',
    sender: 'Alice Smith',
    subject: 'Re: Project Update',
    preview: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done a fantastic job, and I appreciate the hard work everyone has put in.",
    time: 'almost 2 years ago',
    category: 'work'
  },
  {
    id: '3',
    sender: 'Bob Johnson',
    subject: 'Weekend Plans',
    preview: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we had some outdoor fun. If you're interested, let me know, and we can plan the details.",
    time: 'over 2 years ago',
    category: 'personal'
  },
  {
    id: '4',
    sender: 'Emily Davis',
    subject: 'Re: Question about Budget',
    preview: "I have a question about the budget for the upcoming project. It seems like there's a discrepancy in the allocation of resources. I've reviewed the budget report and found some areas where we might be able to optimize our spending without compromising on quality.",
    time: 'over 2 years ago',
    category: 'work'
  },
  {
    id: '5',
    sender: 'Michael Wilson',
    subject: 'Important Announcement',
    preview: "I have an important announcement to make during our team meeting. It pertains to a strategic shift in our approach to the upcoming product launch. We've received feedback from our stakeholders, and I believe it's time to make some adjustments to our plan.",
    time: 'over 2 years ago',
    category: 'important'
  }
];

const categoryColors = {
  meeting: 'bg-green-100 text-green-700',
  work: 'bg-blue-100 text-blue-700',
  important: 'bg-orange-100 text-orange-700',
  personal: 'bg-purple-100 text-purple-700'
};

export function Inbox({ emails = defaultEmails, className }: InboxProps) {
  const [selectedEmail, setSelectedEmail] = useState<string>(emails[0]?.id);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedEmailData = emails.find(email => email.id === selectedEmail);

  return (
    <div className={cn("rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden", className)}>
      <div className="flex h-[600px]">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                128
              </span>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => setSelectedEmail(email.id)}
                className={cn(
                  "w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                  selectedEmail === email.id && "bg-blue-50 border-l-2 border-l-blue-500"
                )}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate pr-2">
                    {email.sender}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {email.time}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {email.subject}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {email.preview}
                </p>
                {email.category && (
                  <span className={cn(
                    "inline-block mt-2 rounded-full px-2 py-0.5 text-xs font-medium",
                    categoryColors[email.category]
                  )}>
                    {email.category}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-around">
            <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900">
              <Archive size={20} />
              <span className="text-xs">Archive</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900">
              <Trash2 size={20} />
              <span className="text-xs">Trash</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900">
              <Clock size={20} />
              <span className="text-xs">Junk</span>
            </button>
          </div>
        </div>

        {/* Email Content */}
        {selectedEmailData && (
          <div className="flex-1 flex flex-col">
            {/* Email Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedEmailData.subject}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{selectedEmailData.sender}</span>
                    <span>•</span>
                    <span>{selectedEmailData.time}</span>
                  </div>
                </div>
                <button className="p-1 rounded hover:bg-gray-100">
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Reply-To: {selectedEmailData.sender.toLowerCase().replace(' ', '.')}@example.com
              </p>
            </div>

            {/* Email Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">
                {selectedEmailData.preview}
              </p>
              
              <p className="mt-4 text-gray-700">
                Please come prepared with any questions or insights you may have. Looking forward to our meeting!
              </p>
              
              <p className="mt-4 text-gray-700">
                Best regards,<br />
                {selectedEmailData.sender}
              </p>
            </div>

            {/* Reply Section */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                  U
                </div>
                <input
                  type="text"
                  placeholder="Reply William Smith..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-600">Mute this thread</span>
                </label>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}