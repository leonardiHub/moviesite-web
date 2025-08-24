import React from 'react';
import type { Overlay } from './types';
import { Track } from '../lib/track'; // 复用你的埋点库

type Props = {
  overlays?: Overlay[];
  currentTime: number; // 秒
};

const posClass = (p: Overlay['placement']) => {
  switch (p) {
    case 'tl': return 'top-3 left-3';
    case 'tr': return 'top-3 right-3';
    case 'bl': return 'bottom-3 left-3';
    case 'br': return 'bottom-3 right-3';
    case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    default: return 'top-3 right-3';
  }
};

export default function OverlayRenderer({ overlays = [], currentTime }: Props) {
  const active = overlays.filter(o => 
    (o.start === undefined || currentTime >= o.start) && 
    (o.end === undefined || currentTime <= o.end)
  );
  if (!active.length) return null;

  return (
    <>
      {active.map((o, idx) => {
        const common = `absolute z-30 ${posClass(o.placement)} shadow-lg`;
        const sizeStyle: React.CSSProperties = {
          width: o.width ? `${o.width}px` : undefined,
          height: o.height ? `${o.height}px` : undefined
        };
        const onClick = () => {
          if (o.clickUrl) {
            Track.sponsorClick(`player_${o.placement}`, 'overlay');
            window.open(o.clickUrl, '_blank', 'noopener');
          }
        };

        if (o.type === 'image' || o.type === 'sponsor') {
          return (
            <img
              key={idx}
              className={`${common} cursor-pointer rounded`}
              src={o.url}
              style={sizeStyle}
              onClick={onClick}
              alt="sponsor"
              loading="lazy"
              decoding="async"
            />
          );
        }
        if (o.type === 'html' && o.html) {
          return (
            <div
              key={idx}
              className={`${common} bg-black/40 rounded`}
              style={sizeStyle}
              dangerouslySetInnerHTML={{ __html: o.html }}
              onClick={onClick}
            />
          );
        }
        return null;
      })}
    </>
  );
}
