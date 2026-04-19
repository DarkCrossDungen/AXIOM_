import React, { useRef, useState } from 'react';
import { useSyncEngine } from '../store/syncEngine';
import type { AnyNode, TextNode, ShapeNode, ImageNode, SpreadsheetNode } from '../types/engine';

interface Props { node: AnyNode; }

export const DraggableNode: React.FC<Props> = ({ node }) => {
  const { applyManualEdit, setSelectedNode, selectedNodeIds } = useSyncEngine();
  const { x, y, width, height, type } = node;
  
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const isSelected = selectedNodeIds.includes(node.id);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedNode(node.id);
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: x || 0, initialY: y || 0 };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    applyManualEdit(node.id, { x: dragRef.current.initialX + dx, y: dragRef.current.initialY + dy });
  };

  // Render logic based on node type
  let content = null;
  if (type === 'TEXT') {
    const textNode = node as TextNode;
    content = (
      <div style={{
        fontFamily: textNode.textProps.fontFamily,
        fontSize: `${textNode.textProps.fontSize}px`,
        fontWeight: textNode.textProps.fontWeight,
        color: textNode.textProps.color,
        textAlign: textNode.textProps.textAlign,
        letterSpacing: `${textNode.textProps.letterSpacing}px`,
        lineHeight: textNode.textProps.lineHeight,
      }}>
        {textNode.textProps.text}
      </div>
    );
  } else if (type === 'SHAPE') {
    const shapeNode = node as ShapeNode;
    content = (
      <div style={{
        width: '100%', height: '100%',
        background: shapeNode.shapeProps.fillColor,
        border: `${shapeNode.shapeProps.strokeWidth}px solid ${shapeNode.shapeProps.strokeColor}`,
        borderRadius: shapeNode.shapeProps.shapeType === 'ellipse' ? '50%' : `${shapeNode.shapeProps.cornerRadius || 0}px`
      }} />
    );
  } else if (type === 'IMAGE') {
    const imgNode = node as ImageNode;
    const { src, altText, brightness, contrast, saturation, hue, blur } = imgNode.imageProps;
    content = (
      <img 
        src={src} 
        alt={altText} 
        style={{
            width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none',
            filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px)`
        }} 
      />
    );
  } else if (type === 'SPREADSHEET') {
    const sheetNode = node as SpreadsheetNode;
    const { rowCount, colCount, data } = sheetNode.sheetProps;
    content = (
      <div style={{ width: '100%', height: '100%', background: '#fff', border: '1px solid #ccc', color: '#333', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#f2f2f4', padding: '4px 8px', borderBottom: '1px solid #ccc', fontSize: '0.65rem', fontWeight: 600, color: '#555', display: 'flex', gap: '10px' }}>
          <span>fx</span>
          <input readOnly value="=SUM(Q3:2026)" style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)`, gridTemplateRows: `repeat(${rowCount}, 1fr)`, flex: 1 }}>
            {Array.from({ length: rowCount * colCount }).map((_, i) => (
                <div key={i} style={{ borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '4px', fontSize: '0.6rem', display: 'flex', alignItems: 'center' }}>
                    {data[`cell_${i}`] || ''}
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => { setIsDragging(false); e.currentTarget.releasePointerCapture(e.pointerId); }}
      style={{
        position: 'absolute', left: x, top: y, width, height,
        zIndex: node.zIndex,
        opacity: node.opacity,
        cursor: isDragging ? 'grabbing' : 'grab',
        outline: isSelected ? '2px solid #00d2ff' : 'none',
        outlineOffset: '2px',
        userSelect: 'none', touchAction: 'none'
      }}
    >
      {content}
    </div>
  );
};
