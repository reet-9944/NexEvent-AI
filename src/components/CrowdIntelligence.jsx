import React, { memo } from 'react';
import { GlassCard } from './Shared';

const CrowdIntelligence = memo(({ data, theme }) => {
  if (!data) return null;

  return (
    <section aria-labelledby="crowd-intelligence-heading" style={{ margin: '40px 0' }}>
      <h2 id="crowd-intelligence-heading" style={{ color: theme.text, fontFamily: "'Clash Display', sans-serif" }}>Venue Crowd Intelligence</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {data.map(event => (
          <GlassCard key={event.id} style={{ padding: '20px', flex: '1 1 300px' }}>
            <h3 style={{ color: theme.accent, margin: '0 0 10px 0' }}>{event.title}</h3>
            <p style={{ color: theme.muted, margin: '0 0 10px 0' }}>{event.venue}</p>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: theme.text, fontSize: '14px' }}>Expected Crowd Density</span>
                <span style={{ color: event.crowdDensity > 80 ? '#e63946' : event.crowdDensity > 60 ? '#f4a261' : '#2a9d8f' }}>
                  {event.crowdDensity}%
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  role="progressbar" 
                  aria-valuenow={event.crowdDensity} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                  style={{ 
                    height: '100%', 
                    width: `${event.crowdDensity}%`, 
                    background: event.crowdDensity > 80 ? '#e63946' : event.crowdDensity > 60 ? '#f4a261' : '#2a9d8f',
                    transition: 'width 0.5s ease'
                  }} 
                />
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: theme.text, fontSize: '12px', display: 'block', marginBottom: '4px' }}>AI Recommendation:</strong>
              <p style={{ color: theme.muted, margin: 0, fontSize: '14px' }}>{event.recommendation}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
});

export default CrowdIntelligence;
