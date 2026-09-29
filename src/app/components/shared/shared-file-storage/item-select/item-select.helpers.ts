export const getMousePosition = (event: MouseEvent): any => ({
  x: event.clientX,
  y: event.clientY,
});

export const updateSelectCoverDiv = (
  _point,
  startMouseX,
  startMouseY
): any => ({
  left: (_point.x - startMouseX <= 0 ? _point.x : startMouseX) + 'px',
  top: (_point.y - startMouseY <= 0 ? _point.y : startMouseY) + 'px',
  width: Math.abs(_point.x - startMouseX) + 'px',
  height: Math.abs(_point.y - startMouseY) + 'px',
});

export const boxIntersects = (boxA: any, boxB: any): boolean =>
  boxA.left <= boxB.left + boxB.width &&
  boxA.left + boxA.width >= boxB.left &&
  boxA.top <= boxB.top + boxB.height &&
  boxA.top + boxA.height >= boxB.top;
