import React from 'react';
import { BengaluruCity } from '../game/BengaluruCity';

interface OpenWorldProps {
  timeOfDay?: 'day' | 'sunset' | 'night' | 'cyber';
  playerZ?: number;
}

export const OpenWorld: React.FC<OpenWorldProps> = ({
  timeOfDay = 'sunset',
  playerZ = 0,
}) => {
  return <BengaluruCity timeOfDay={timeOfDay} playerZ={playerZ} />;
};

export default OpenWorld;
