export type Direction = 'md-to-rich' | 'rich-to-md';

export type OutputTab = 'rich' | 'html' | 'plain';

export interface ConverterState {
  direction: Direction;
  input: string; // markdown source (md-to-rich) or captured HTML (rich-to-md)
  activeTab: OutputTab;
}
