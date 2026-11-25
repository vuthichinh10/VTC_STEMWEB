import type { BoardProfile, ModuleInstance, ModuleSpec } from './compatibility';

export interface CircuitBuilderProps {
  board: BoardProfile;
  moduleIds: string[];
  specs: ModuleSpec[];
  value: ModuleInstance[];
  onChange: (modules: ModuleInstance[]) => void;
}
