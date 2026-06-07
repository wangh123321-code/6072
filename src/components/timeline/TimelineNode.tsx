import React from 'react';
import { Stethoscope, Syringe, Pill, FileText, Scissors, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HealthRecord, RecordType } from '@/types';
import { RECORD_TYPE_LABELS, RECORD_TYPE_COLORS } from '@/types';
import { formatDateCN } from '@/utils/dateUtils';

interface TimelineNodeProps {
  record: HealthRecord;
  isSelected: boolean;
  position: number;
  onClick: () => void;
}

const getRecordIcon = (type: RecordType) => {
  const icons = {
    checkup: Stethoscope,
    vaccine: Syringe,
    prescription: Pill,
    lab: FileText,
    surgery: Scissors,
    other: MoreHorizontal,
  };
  return icons[type] || MoreHorizontal;
};

export const TimelineNode: React.FC<TimelineNodeProps> = ({
  record,
  isSelected,
  position,
  onClick,
}) => {
  const Icon = getRecordIcon(record.type);
  const color = RECORD_TYPE_COLORS[record.type];

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 cursor-pointer group"
      style={{ left: `${position}%` }}
      onClick={onClick}
    >
      <div
        className={cn(
          'relative flex items-center justify-center w-10 h-10 rounded-full border-3 transition-all duration-200',
          'hover:scale-110 active:scale-95',
          isSelected ? 'scale-110 z-10' : 'z-0'
        )}
        style={{
          backgroundColor: 'white',
          borderColor: color,
          boxShadow: isSelected ? `0 0 0 4px ${color}20, 0 4px 12px ${color}40` : '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
        
        {isSelected && (
          <div
            className="absolute -inset-1 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
      
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-200',
          'opacity-0 group-hover:opacity-100',
          isSelected && 'opacity-100'
        )}
        style={{ top: '100%', marginTop: '8px' }}
      >
        <div className="bg-white rounded-lg shadow-lg px-3 py-2 text-xs">
          <div className="font-medium text-gray-800">{record.title}</div>
          <div className="text-gray-500">{formatDateCN(record.date)}</div>
          <div
            className="text-xs mt-1"
            style={{ color }}
          >
            {RECORD_TYPE_LABELS[record.type]}
          </div>
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-1"
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '6px solid white',
          }}
        />
      </div>
    </div>
  );
};
