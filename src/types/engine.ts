export type NodeType = 'SLIDE' | 'TEXT' | 'SHAPE' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'GROUP' | 'SPREADSHEET';

export interface BaseNode {
  id: string;
  type: NodeType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  hidden: boolean;
  zIndex: number;
  parentId: string | null;
}

export interface TextProperties {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  letterSpacing: number;
  lineHeight: number;
}

export interface TextNode extends BaseNode {
  type: 'TEXT';
  textProps: TextProperties;
}

export interface ShapeProperties {
  shapeType: 'rectangle' | 'ellipse' | 'polygon' | 'star' | 'path';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  cornerRadius?: number;
  pathData?: string;
}

export interface ShapeNode extends BaseNode {
  type: 'SHAPE';
  shapeProps: ShapeProperties;
}

export interface ImageProperties {
  src: string;
  altText: string;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  blendMode?: string;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
}

export interface ImageNode extends BaseNode {
  type: 'IMAGE';
  imageProps: ImageProperties;
}

export interface SpreadsheetProperties {
  rowCount: number;
  colCount: number;
  data: Record<string, string>; // e.g. "A1": "Revenue", "B1": "=SUM(B2:B10)"
}

export interface SpreadsheetNode extends BaseNode {
  type: 'SPREADSHEET';
  sheetProps: SpreadsheetProperties;
}

export interface SlideNode extends Omit<BaseNode, 'x' | 'y'> {
  type: 'SLIDE';
  background: string;
  transition: string;
  duration: number;
  children: string[]; 
}

export type AnyNode = TextNode | ShapeNode | ImageNode | SpreadsheetNode | BaseNode;

export interface DeckState {
  slides: Record<string, SlideNode>;
  nodes: Record<string, AnyNode>;
  activeSlideId: string | null;
  selectedNodeIds: string[];
}
