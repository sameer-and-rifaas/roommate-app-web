import React from 'react';

export default function CustomChart({ type = 'line', data = [], labels = [], title = '', color = '#00f0ff' }) {
  const width = 500;
  const height = 200;
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find max value for scaling
  const maxVal = Math.max(...data, 10);
  
  // Calculate coordinates
  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * chartWidth;
    const y = height - padding - (val / maxVal) * chartHeight;
    return { x, y, val };
  });

  // Create path for line chart
  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Grid lines
  const gridLines = [];
  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const ratio = i / gridCount;
    const y = padding + ratio * chartHeight;
    const val = ((gridCount - i) / gridCount) * maxVal;
    gridLines.push({ y, label: val.toFixed(1) });
  }

  const glowId = `glow-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="custom-chart-wrapper" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontFamily: 'var(--font-hud)', fontSize: '0.75rem', color: '#787a91', borderBottom: '1px solid rgba(0,240,255,0.1)', paddingBottom: '0.25rem' }}>
        <span>{title.toUpperCase()}</span>
        <span style={{ color }}>● ACTIVE MODE</span>
      </div>
      
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          {/* Cyber Neon Glow Filter */}
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <line 
              x1={padding} 
              y1={line.y} 
              x2={width - padding} 
              y2={line.y} 
              stroke="rgba(0, 240, 255, 0.05)" 
              strokeWidth="1" 
              strokeDasharray="4 4"
            />
            <text 
              x={padding - 8} 
              y={line.y + 4} 
              fill="#787a91" 
              fontSize="8" 
              fontFamily="var(--font-mono)" 
              textAnchor="end"
            >
              {line.label}
            </text>
          </g>
        ))}

        {/* X-axis Line */}
        <line 
          x1={padding} 
          y1={height - padding} 
          x2={width - padding} 
          y2={height - padding} 
          stroke="rgba(0, 240, 255, 0.15)" 
          strokeWidth="1" 
        />

        {/* LINE CHART RENDER */}
        {type === 'line' && (
          <>
            {/* Area under curve */}
            {points.length > 1 && (
              <path
                d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
                fill={`url(#area-${glowId})`}
                opacity="0.1"
              />
            )}
            <defs>
              <linearGradient id={`area-${glowId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Glowing line */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              filter={`url(#${glowId})`}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((p, idx) => (
              <g key={idx} className="chart-node" style={{ cursor: 'pointer' }}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#030308"
                  stroke={color}
                  strokeWidth="2"
                  filter={`url(#${glowId})`}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="7"
                  fill="transparent"
                  onMouseEnter={(e) => {
                    e.target.style.fill = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.fill = 'transparent';
                  }}
                />
              </g>
            ))}
          </>
        )}

        {/* BAR CHART RENDER */}
        {type === 'bar' && (
          <g>
            {points.map((p, idx) => {
              const barWidth = Math.min(25, chartWidth / data.length - 15);
              const barHeight = height - padding - p.y;
              return (
                <g key={idx}>
                  <rect
                    x={p.x - barWidth / 2}
                    y={p.y}
                    width={barWidth}
                    height={barHeight}
                    fill={color}
                    opacity="0.7"
                    filter={`url(#${glowId})`}
                    rx="2"
                  />
                  <rect
                    x={p.x - barWidth / 2}
                    y={p.y}
                    width={barWidth}
                    height={barHeight}
                    fill="transparent"
                    stroke={color}
                    strokeWidth="1.5"
                    rx="2"
                  />
                  <text
                    x={p.x}
                    y={p.y - 6}
                    fill="#fff"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                  >
                    {p.val}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* X Axis Labels */}
        {labels.map((label, idx) => {
          const x = padding + (idx / (labels.length - 1)) * chartWidth;
          return (
            <text
              key={idx}
              x={x}
              y={height - padding + 15}
              fill="#787a91"
              fontSize="8"
              fontFamily="var(--font-hud)"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
