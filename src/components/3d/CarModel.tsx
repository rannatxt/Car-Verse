import React, { Suspense } from 'react';
import { Vehicle, CustomizationState } from '../../types/car';
import { GLTFCar } from './GLTFCar';
import { ProceduralCar } from './ProceduralCar';

interface CarModelProps {
  vehicle: Vehicle;
  customization: CustomizationState;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.info('GLTF asset loading note, rendering aerodynamic procedural model:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const CarModel: React.FC<CarModelProps> = ({ vehicle, customization }) => {
  const modelPath = vehicle.modelPath;

  return (
    <ModelErrorBoundary
      fallback={<ProceduralCar vehicle={vehicle} customization={customization} />}
    >
      <Suspense fallback={<ProceduralCar vehicle={vehicle} customization={customization} />}>
        {modelPath ? (
          <GLTFCar
            key={`${vehicle.id}-${modelPath}`}
            vehicle={vehicle}
            customization={customization}
            modelPath={modelPath}
          />
        ) : (
          <ProceduralCar vehicle={vehicle} customization={customization} />
        )}
      </Suspense>
    </ModelErrorBoundary>
  );
};
