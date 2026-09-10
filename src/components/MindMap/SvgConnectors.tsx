import React, { useEffect, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface ConnectorLine {
  id: string;
  from: Point;
  to: Point;
  isActive: boolean;
  color: string;
}

interface SvgConnectorsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  selectedPhaseId: string | null;
  selectedEntryId: string | null;
  entryIds: string[];
  sessionIds: string[];
}

export const SvgConnectors: React.FC<SvgConnectorsProps> = ({
  containerRef,
  selectedPhaseId,
  selectedEntryId,
  entryIds,
  sessionIds,
}) => {
  const [lines, setLines] = useState<ConnectorLine[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 1400, height: 800 });

  const calculateLines = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: ConnectorLine[] = [];

    const getElementAnchor = (elementId: string, side: 'left' | 'right'): Point | null => {
      const el = document.getElementById(elementId);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const x = (side === 'left' ? rect.left : rect.right) - containerRect.left + containerRef.current!.scrollLeft;
      const y = rect.top + rect.height / 2 - containerRect.top + containerRef.current!.scrollTop;
      return { x, y };
    };

    // 1. Root Node -> Active Phase Node
    const rootAnchor = getElementAnchor('mindmap-root-node', 'right');
    const activePhaseAnchor = selectedPhaseId
      ? getElementAnchor(
          selectedPhaseId === 'today' ? 'phase-node-today' : `phase-node-${selectedPhaseId}`,
          'left'
        )
      : null;

    if (rootAnchor && activePhaseAnchor) {
      newLines.push({
        id: 'line-root-to-phase',
        from: rootAnchor,
        to: activePhaseAnchor,
        isActive: true,
        color: selectedPhaseId === 'today' ? '#6FB8AA' : '#E3B04B',
      });
    }

    // 2. Active Phase Node -> Each Entry Node
    const activePhaseRightAnchor = selectedPhaseId
      ? getElementAnchor(
          selectedPhaseId === 'today' ? 'phase-node-today' : `phase-node-${selectedPhaseId}`,
          'right'
        )
      : null;

    if (activePhaseRightAnchor) {
      entryIds.forEach((entryId) => {
        const entryLeftAnchor = getElementAnchor(`entry-node-${entryId}`, 'left');
        if (entryLeftAnchor) {
          const isCurrentSelectedEntry = selectedEntryId === entryId;
          newLines.push({
            id: `line-phase-to-${entryId}`,
            from: activePhaseRightAnchor,
            to: entryLeftAnchor,
            isActive: isCurrentSelectedEntry,
            color: isCurrentSelectedEntry ? '#E3B04B' : 'rgba(236, 231, 218, 0.25)',
          });
        }
      });
    }

    // 3. Active Entry Node -> Each Session Node
    const activeEntryRightAnchor = selectedEntryId
      ? getElementAnchor(`entry-node-${selectedEntryId}`, 'right')
      : null;

    if (activeEntryRightAnchor) {
      sessionIds.forEach((sessionId) => {
        const sessionLeftAnchor = getElementAnchor(`session-node-${sessionId}`, 'left');
        if (sessionLeftAnchor) {
          newLines.push({
            id: `line-entry-to-${sessionId}`,
            from: activeEntryRightAnchor,
            to: sessionLeftAnchor,
            isActive: true,
            color: '#6FB8AA',
          });
        }
      });
    }

    setLines(newLines);
    setSvgSize({
      width: Math.max(containerRef.current.scrollWidth, 1400),
      height: Math.max(containerRef.current.scrollHeight, 800),
    });
  };

  useEffect(() => {
    calculateLines();
    // Run after DOM render/animations settle
    const timer = setTimeout(calculateLines, 100);
    const timer2 = setTimeout(calculateLines, 300);

    const handleResize = () => calculateLines();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedPhaseId, selectedEntryId, entryIds, sessionIds]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        width: `${svgSize.width}px`,
        height: `${svgSize.height}px`,
      }}
    >
      <defs>
        <filter id="chalk-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {lines.map((line) => {
        const dx = Math.max(40, Math.abs(line.to.x - line.from.x) * 0.5);
        const pathData = `M ${line.from.x} ${line.from.y} C ${line.from.x + dx} ${line.from.y}, ${line.to.x - dx} ${line.to.y}, ${line.to.x} ${line.to.y}`;

        return (
          <g key={line.id}>
            {/* Background shadow stroke for chalkboard texture */}
            <path
              d={pathData}
              fill="none"
              stroke="rgba(0, 0, 0, 0.4)"
              strokeWidth={line.isActive ? 4 : 2}
              strokeLinecap="round"
            />
            {/* Foreground chalk line */}
            <path
              d={pathData}
              fill="none"
              stroke={line.color}
              strokeWidth={line.isActive ? 2.5 : 1.5}
              strokeDasharray={line.isActive ? undefined : '5, 4'}
              strokeLinecap="round"
              className={line.isActive ? 'chalk-connector-active' : 'chalk-connector'}
              filter={line.isActive ? 'url(#chalk-glow)' : undefined}
            />
          </g>
        );
      })}
    </svg>
  );
};
