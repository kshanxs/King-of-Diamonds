import React from 'react';

interface ActiveRulesProps {
  activeRules: string[];
}

export const ActiveRules: React.FC<ActiveRulesProps> = ({ activeRules }) => {
  if (activeRules.length === 0) return null;

  return (
    <div className="glass-card p-6">
      <h3 className="text-white font-semibold mb-3">📜 Active Rules:</h3>
      <div className="space-y-2">
        {activeRules.map((rule, index) => (
          <div key={index} className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-200 text-sm">{rule}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
