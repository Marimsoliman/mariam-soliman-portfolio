// components/about/MilestoneCard.tsx
"use client";

import React from 'react';
import { JourneyMilestone } from '@/lib/journeyData';

interface MilestoneCardProps {
  milestone: JourneyMilestone;
  index: number;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, index }) => {
  return (
    <div 
      className="milestone-card"
      data-index={index}
    >
      <div className="milestone-card-inner">
        <div className="milestone-year">
          {milestone.year}
        </div>
        
        <div className="milestone-content">
          <h3 className="milestone-title">
            {milestone.title}
          </h3>
          
          <p className="milestone-description">
            {milestone.description}
          </p>
          
          <div className="milestone-meta">
            <div className="milestone-avatar">
              <div className="avatar-placeholder" />
            </div>
            <div className="milestone-info">
              {milestone.handle && (
                <span className="milestone-handle">{milestone.handle}</span>
              )}
              <span className="milestone-metadata">{milestone.metadata}</span>
            </div>
          </div>
          
          {milestone.link && (
            <button className="milestone-read-more">
              Read more
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};