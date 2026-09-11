import React, { useEffect, useRef } from 'react';

export default function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio; canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d'); ctx.scale(ratio, ratio); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#172332';
  }, []);
  const point = e => { const r = canvasRef.current.getBoundingClientRect(); const p = e.touches?.[0] || e; return { x:p.clientX-r.left, y:p.clientY-r.top }; };
  const start = e => { e.preventDefault(); drawing.current=true; const p=point(e); const c=canvasRef.current.getContext('2d'); c.beginPath(); c.moveTo(p.x,p.y); };
  const move = e => { if(!drawing.current)return; e.preventDefault(); const p=point(e); const c=canvasRef.current.getContext('2d'); c.lineTo(p.x,p.y); c.stroke(); };
  const end = e => { if(!drawing.current)return; drawing.current=false; onChange?.(canvasRef.current.toDataURL('image/png')); };
  const clear = () => { const c=canvasRef.current.getContext('2d'); c.clearRect(0,0,canvasRef.current.width,canvasRef.current.height); onChange?.(''); };
  return <div className="signature-wrap"><div className="signature-head"><strong>Customer signature</strong><button type="button" className="text-btn" onClick={clear}>Clear</button></div><canvas ref={canvasRef} className="signature-pad" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end}/><p className="signature-hint">Sign inside the box using a finger, stylus or mouse.</p></div>;
}
