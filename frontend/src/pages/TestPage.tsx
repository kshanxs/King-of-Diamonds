import React, { useState } from 'react';
import { RoundResultModal } from '../components/RoundResultModal';
import { LiveLeaderboard } from '../components/LiveLeaderboard';
import { NumberGrid } from '../components/NumberGrid';
import { GamePlaying } from '../components/GamePlaying';
import { ActiveRules } from '../components/ActiveRules';
import type { Player, RoundResult } from '../types/game';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  mockData: {
    players?: Player[];
    roundResult?: RoundResult;
    gameState?: string;
    roundHistory?: RoundResult[];
  };
}

const mockPlayers: Player[] = [
  { id: '1', name: 'Alice', score: 8, isBot: false, isEliminated: false, hasLeft: false },
  { id: '2', name: 'Bob', score: 6, isBot: true, isEliminated: false, hasLeft: false },
  { id: '3', name: 'Charlie', score: 4, isBot: false, isEliminated: false, hasLeft: false },
  { id: '4', name: 'Diana', score: 2, isBot: true, isEliminated: true, hasLeft: false },
  { id: '5', name: 'Eve', score: 0, isBot: false, isEliminated: false, hasLeft: true },
];

const testScenarios: TestScenario[] = [
  {
    id: 'normal-round',
    name: 'Normal Round Result',
    description: 'Standard round with winner, losers, and point deductions',
    mockData: {
      roundResult: {
        round: 3,
        target: 67,
        average: 83.75,
        players: mockPlayers,
        choices: [
          {
            name: 'Alice',
            choice: 65,
            timedOut: false,
            pointLosses: [{ reason: 'Not closest to target', points: 1 }]
          },
          {
            name: 'Bob',
            choice: 67,
            timedOut: false,
            pointLosses: []
          },
          {
            name: 'Charlie',
            choice: 70,
            timedOut: false,
            pointLosses: [{ reason: 'Not closest to target', points: 1 }]
          }
        ],
        winner: 'Bob',
        timeoutPlayers: [],
        eliminatedThisRound: []
      }
    }
  },
  {
    id: 'timeout-round',
    name: 'Timeout Round',
    description: 'Round with timeout penalties and eliminations',
    mockData: {
      roundResult: {
        round: 4,
        target: 45,
        average: 56.25,
        players: mockPlayers,
        choices: [
          {
            name: 'Alice',
            choice: 44,
            timedOut: false,
            pointLosses: [{ reason: 'Not closest to target', points: 1 }]
          },
          {
            name: 'Charlie',
            choice: 0,
            timedOut: true,
            pointLosses: [{ reason: 'Timeout penalty', points: 2 }]
          }
        ],
        winner: 'Alice',
        timeoutPlayers: ['Charlie'],
        eliminatedThisRound: []
      }
    }
  },
  {
    id: 'duplicate-round',
    name: 'Duplicate Numbers',
    description: 'Round with duplicate number penalties',
    mockData: {
      roundResult: {
        round: 5,
        target: 50,
        average: 62.5,
        players: mockPlayers,
        choices: [
          {
            name: 'Alice',
            choice: 48,
            timedOut: false,
            pointLosses: [
              { reason: 'Duplicate number', points: 1 },
              { reason: 'Not closest to target', points: 1 }
            ]
          },
          {
            name: 'Bob',
            choice: 48,
            timedOut: false,
            pointLosses: [
              { reason: 'Duplicate number', points: 1 },
              { reason: 'Not closest to target', points: 1 }
            ]
          },
          {
            name: 'Charlie',
            choice: 51,
            timedOut: false,
            pointLosses: []
          }
        ],
        winner: 'Charlie',
        timeoutPlayers: [],
        eliminatedThisRound: []
      }
    }
  },
  {
    id: 'elimination-round',
    name: 'Elimination Round',
    description: 'Round with player eliminations',
    mockData: {
      roundResult: {
        round: 6,
        target: 75,
        average: 93.75,
        players: mockPlayers,
        choices: [
          {
            name: 'Alice',
            choice: 74,
            timedOut: false,
            pointLosses: []
          },
          {
            name: 'Bob',
            choice: 0,
            timedOut: true,
            pointLosses: [{ reason: 'Second timeout - Eliminated', points: 0 }]
          }
        ],
        winner: 'Alice',
        timeoutPlayers: ['Bob'],
        eliminatedThisRound: ['Bob']
      }
    }
  },
  {
    id: 'final-round',
    name: 'Final Round (Game Winner)',
    description: 'Last round determining the game winner',
    mockData: {
      roundResult: {
        round: 10,
        target: 88,
        average: 110,
        players: mockPlayers,
        choices: [
          {
            name: 'Alice',
            choice: 89,
            timedOut: false,
            pointLosses: []
          },
          {
            name: 'Charlie',
            choice: 85,
            timedOut: false,
            pointLosses: [{ reason: 'Not closest to target', points: 1 }]
          }
        ],
        winner: 'Alice',
        timeoutPlayers: [],
        eliminatedThisRound: []
      },
      gameState: 'finished'
    }
  },
  {
    id: 'complex-round',
    name: 'Complex Multi-Penalty Round',
    description: 'Round with multiple types of penalties',
    mockData: {
      roundResult: {
        round: 7,
        target: 33,
        average: 41.25,
        players: mockPlayers,
        choices: [
          {
            name: 'Alice',
            choice: 35,
            timedOut: false,
            pointLosses: [
              { reason: 'Duplicate number', points: 1 },
              { reason: 'Someone hit exact target', points: 2 }
            ]
          },
          {
            name: 'Bob',
            choice: 33,
            timedOut: false,
            pointLosses: []
          },
          {
            name: 'Charlie',
            choice: 35,
            timedOut: false,
            pointLosses: [
              { reason: 'Duplicate number', points: 1 },
              { reason: 'Someone hit exact target', points: 2 }
            ]
          },
          {
            name: 'Diana',
            choice: 0,
            timedOut: true,
            pointLosses: [{ reason: 'Timeout penalty', points: 2 }]
          }
        ],
        winner: 'Bob',
        timeoutPlayers: ['Diana'],
        eliminatedThisRound: []
      }
    }
  }
];

const mockRoundHistory: RoundResult[] = [
  {
    round: 1,
    target: 42,
    average: 52.5,
    players: mockPlayers,
    choices: [
      { name: 'Alice', choice: 40, timedOut: false, pointLosses: [{ reason: 'Not closest to target', points: 1 }] },
      { name: 'Bob', choice: 43, timedOut: false, pointLosses: [] },
      { name: 'Charlie', choice: 45, timedOut: false, pointLosses: [{ reason: 'Not closest to target', points: 1 }] }
    ],
    winner: 'Bob',
    timeoutPlayers: [],
    eliminatedThisRound: []
  },
  {
    round: 2,
    target: 78,
    average: 97.5,
    players: mockPlayers,
    choices: [
      { name: 'Alice', choice: 0, timedOut: true, pointLosses: [{ reason: 'Timeout penalty', points: 2 }] },
      { name: 'Bob', choice: 77, timedOut: false, pointLosses: [{ reason: 'Not closest to target', points: 1 }] },
      { name: 'Charlie', choice: 79, timedOut: false, pointLosses: [] }
    ],
    winner: 'Charlie',
    timeoutPlayers: ['Alice'],
    eliminatedThisRound: []
  }
];

export const TestPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNumberGrid, setShowNumberGrid] = useState(false);
  const [showGamePlaying, setShowGamePlaying] = useState(false);
  const [showActiveRules, setShowActiveRules] = useState(false);

  const getCurrentScenario = () => {
    return testScenarios.find(s => s.id === selectedScenario);
  };

  const activeRules = [
    "No input within time limit → Lose 2 points",
    "Duplicate numbers → All choosing them lose 1 point",
    "Someone hits exact target → Others lose 2 points",
    "Reach -10 points → Get eliminated from the game"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🧪 Game Component Test Lab</h1>
          <p className="text-white/70">Test all possible game scenarios and UI components</p>
          <div className="mt-4">
            <a href="/" className="glass-button px-4 py-2 text-sm">
              ← Back to Game
            </a>
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">📋 Test Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {testScenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedScenario === scenario.id
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }`}
              >
                <h3 className="font-semibold mb-1">{scenario.name}</h3>
                <p className="text-sm opacity-75">{scenario.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Component Controls */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">🎮 Component Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setShowModal(!showModal)}
              className={`glass-button p-3 text-sm ${showModal ? 'ring-2 ring-blue-400' : ''}`}
            >
              Round Result Modal
            </button>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className={`glass-button p-3 text-sm ${showLeaderboard ? 'ring-2 ring-blue-400' : ''}`}
            >
              Live Leaderboard
            </button>
            <button
              onClick={() => setShowNumberGrid(!showNumberGrid)}
              className={`glass-button p-3 text-sm ${showNumberGrid ? 'ring-2 ring-blue-400' : ''}`}
            >
              Number Grid
            </button>
            <button
              onClick={() => setShowGamePlaying(!showGamePlaying)}
              className={`glass-button p-3 text-sm ${showGamePlaying ? 'ring-2 ring-blue-400' : ''}`}
            >
              Game Playing
            </button>
            <button
              onClick={() => setShowActiveRules(!showActiveRules)}
              className={`glass-button p-3 text-sm ${showActiveRules ? 'ring-2 ring-blue-400' : ''}`}
            >
              Active Rules
            </button>
          </div>
        </div>

        {/* Component Display Area */}
        <div className="space-y-6">
          {/* Live Leaderboard */}
          {showLeaderboard && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">📊 Live Leaderboard</h3>
              <LiveLeaderboard
                players={mockPlayers}
                playerId="1"
                roundHistory={mockRoundHistory}
              />
            </div>
          )}

          {/* Active Rules */}
          {showActiveRules && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">📜 Active Rules</h3>
              <ActiveRules activeRules={activeRules} />
            </div>
          )}

          {/* Number Grid */}
          {showNumberGrid && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">🔢 Number Grid</h3>
              <NumberGrid
                onNumberSelect={(num) => console.log('Selected:', num)}
                isExiting={false}
              />
            </div>
          )}

          {/* Game Playing */}
          {showGamePlaying && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">🎯 Game Playing Component</h3>
              <GamePlaying
                currentRound={3}
                timeLeft={25}
                isEliminated={false}
                selectedNumber={null}
                chosenCount={2}
                totalActivePlayers={4}
                lastChoiceUpdate={null}
                onNumberSelect={(num) => console.log('Selected:', num)}
                formatTime={(seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`}
              />
            </div>
          )}
        </div>

        {/* Round Result Modal */}
        {showModal && selectedScenario && getCurrentScenario()?.mockData.roundResult && (
          <RoundResultModal
            lastRoundResult={getCurrentScenario()!.mockData.roundResult!}
            nextRoundCountdown={15}
            readyCount={2}
            totalReadyPlayers={3}
            gameState={getCurrentScenario()?.mockData.gameState || 'playing'}
            onContinueClick={() => console.log('Continue clicked')}
          />
        )}
      </div>
    </div>
  );
};
