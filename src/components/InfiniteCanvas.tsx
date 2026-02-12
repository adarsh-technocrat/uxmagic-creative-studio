"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedNodeId, updateNode } from "@/store/studioSlice";
import type { RootState } from "@/store";
import type { CreativeNode } from "@/types/jsonCanvas";

const RULER_SIZE = 24;
const MAJOR_INTERVAL = 100;
const MINOR_INTERVAL = 20;
const RULER_BG = "#e8e9ec";
const TICK_COLOR = "#374151";
const BORDER_COLOR = "#d1d5db";

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform vec2 u_pan;
  uniform float u_zoom;
  uniform float u_aspect;
  uniform vec2 u_worldPixelSize;

  void main() {
    vec2 ndc = (v_uv - 0.5) * 2.0;
    ndc.x *= u_aspect;
    vec2 world = u_pan + ndc / u_zoom;

    float gridSize = 40.0;
    float pixelW = length(u_worldPixelSize) / gridSize;
    vec2 grid = abs(fract(world / gridSize - 0.5) - 0.5) / pixelW;
    float line = min(grid.x, grid.y);
    float gridAlpha = 1.0 - min(line, 1.0);

    vec3 gridColor = vec3(0.2, 0.2, 0.22);
    vec3 bgColor = vec3(0.0, 0.0, 0.0);
    vec3 color = mix(bgColor, gridColor, gridAlpha * 0.6);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function drawTopRuler(
  canvas: HTMLCanvasElement,
  contentWidth: number,
  contentHeight: number,
  pan: { x: number; y: number },
  zoom: number,
) {
  const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
  const aspect = contentWidth / contentHeight;
  const worldLeft = pan.x - aspect / zoom;
  const worldRight = pan.x + aspect / zoom;
  const worldWidth = worldRight - worldLeft;

  const w = Math.floor(canvas.clientWidth * dpr);
  const h = Math.floor(canvas.clientHeight * dpr);
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(dpr, dpr);
  const rw = canvas.clientWidth;
  const rh = canvas.clientHeight;

  ctx.fillStyle = RULER_BG;
  ctx.fillRect(0, 0, rw, rh);

  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(rw, 0);
  ctx.stroke();

  ctx.fillStyle = TICK_COLOR;
  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const worldToX = (worldX: number) => ((worldX - worldLeft) / worldWidth) * rw;

  let start = Math.floor(worldLeft / MINOR_INTERVAL) * MINOR_INTERVAL;
  if (start < worldLeft) start += MINOR_INTERVAL;

  for (
    let worldX = start;
    worldX <= worldRight + MINOR_INTERVAL;
    worldX += MINOR_INTERVAL
  ) {
    const x = worldToX(worldX);
    if (x < -1 || x > rw + 1) continue;
    const isMajor = worldX % MAJOR_INTERVAL === 0;
    const tickLen = isMajor ? 10 : 5;
    ctx.strokeStyle = TICK_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, rh);
    ctx.lineTo(x, rh - tickLen);
    ctx.stroke();
    if (isMajor) {
      ctx.fillText(String(worldX), x, 1);
    }
  }
}

function drawLeftRuler(
  canvas: HTMLCanvasElement,
  contentWidth: number,
  contentHeight: number,
  pan: { x: number; y: number },
  zoom: number,
) {
  const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
  const worldTop = pan.y + 1 / zoom;
  const worldBottom = pan.y - 1 / zoom;
  const worldHeight = worldTop - worldBottom;

  const w = Math.floor(canvas.clientWidth * dpr);
  const h = Math.floor(canvas.clientHeight * dpr);
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(dpr, dpr);
  const rw = canvas.clientWidth;
  const rh = canvas.clientHeight;

  ctx.fillStyle = RULER_BG;
  ctx.fillRect(0, 0, rw, rh);

  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(rw, 0);
  ctx.lineTo(rw, rh);
  ctx.stroke();

  ctx.fillStyle = TICK_COLOR;
  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  const worldToY = (worldY: number) => ((worldTop - worldY) / worldHeight) * rh;

  let start = Math.floor(worldBottom / MINOR_INTERVAL) * MINOR_INTERVAL;
  if (start < worldBottom) start += MINOR_INTERVAL;

  for (
    let worldY = start;
    worldY <= worldTop + MINOR_INTERVAL;
    worldY += MINOR_INTERVAL
  ) {
    const y = worldToY(worldY);
    if (y < -1 || y > rh + 1) continue;
    const isMajor = worldY % MAJOR_INTERVAL === 0;
    const tickLen = isMajor ? 10 : 5;
    ctx.strokeStyle = TICK_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rw, y);
    ctx.lineTo(rw - tickLen, y);
    ctx.stroke();
    if (isMajor) {
      ctx.fillText(String(worldY), rw - 6, y);
    }
  }
}

function worldToScreen(
  node: CreativeNode,
  pan: { x: number; y: number },
  zoom: number,
  width: number,
  height: number,
) {
  const aspect = width / height;
  const left = width / 2 + (node.x - pan.x) * zoom * (width / (2 * aspect));
  const top = height / 2 - (node.y - pan.y) * zoom * (height / 2);
  const pixelW = node.width * zoom * (width / (2 * aspect));
  const pixelH = node.height * zoom * (height / 2);
  return { left, top, width: pixelW, height: pixelH };
}

export default function InfiniteCanvas() {
  const dispatch = useDispatch();
  const doc = useSelector((s: RootState) => s.studio.document);
  const variants = useSelector((s: RootState) => s.studio.variants);
  const selectedNodeId = useSelector((s: RootState) => s.studio.selectedNodeId);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const topRulerRef = useRef<HTMLCanvasElement>(null);
  const leftRulerRef = useRef<HTMLCanvasElement>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const targetPanRef = useRef({ x: 0, y: 0 });
  const targetZoomRef = useRef(1);
  const zoomRafRef = useRef<number>(0);
  const momentumRafRef = useRef<number>(0);
  const zoomCenterWorldRef = useRef({ x: 0, y: 0 });
  const zoomCenterNdcRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const lastMoveTimeRef = useRef(0);
  const velocityRef = useRef({ x: 0, y: 0 });

  const [viewState, setViewState] = useState({ pan: { x: 0, y: 0 }, zoom: 1 });
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const draggingNodeIdRef = useRef<string | null>(null);
  const dragStartPointerRef = useRef({ x: 0, y: 0 });
  const dragStartWorldRef = useRef({ x: 0, y: 0 });

  const ZOOM_MIN = 0.001;
  const ZOOM_MAX = 50;
  const ZOOM_SMOOTH = 0.22;
  const ZOOM_EPS = 0.0001;
  const ZOOM_WHEEL_SENSITIVITY = 0.0012;
  const PAN_MOMENTUM_FRICTION = 0.92;
  const PAN_MOMENTUM_MULTIPLIER = 0.42;
  const PAN_VELOCITY_MIN = 0.05;
  const ZOOM_TO_FIT_PADDING = 20;

  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  const zoomToFitTrigger = useSelector(
    (s: RootState) => s.studio.zoomToFitTrigger,
  );

  const updateRulers = useCallback(() => {
    const canvas = canvasRef.current;
    const topRuler = topRulerRef.current;
    const leftRuler = leftRulerRef.current;
    if (!canvas || !topRuler || !leftRuler) return;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw <= 0 || ch <= 0) return;
    drawTopRuler(topRuler, cw, ch, panRef.current, zoomRef.current);
    drawLeftRuler(leftRuler, cw, ch, panRef.current, zoomRef.current);
  }, []);

  const render = useCallback(
    (gl: WebGLRenderingContext, program: WebGLProgram) => {
      const canvas = gl.canvas as HTMLCanvasElement;
      const width = canvas.width;
      const height = canvas.height;
      const aspect = width / height;

      gl.viewport(0, 0, width, height);
      gl.useProgram(program);

      const resLoc = gl.getUniformLocation(program, "u_resolution");
      const panLoc = gl.getUniformLocation(program, "u_pan");
      const zoomLoc = gl.getUniformLocation(program, "u_zoom");
      const aspectLoc = gl.getUniformLocation(program, "u_aspect");
      const worldPixelSizeLoc = gl.getUniformLocation(
        program,
        "u_worldPixelSize",
      );

      const worldPixelSizeX = (2 * aspect) / (zoomRef.current * width);
      const worldPixelSizeY = 2 / (zoomRef.current * height);

      gl.uniform2f(resLoc, width, height);
      gl.uniform2f(panLoc, panRef.current.x, panRef.current.y);
      gl.uniform1f(zoomLoc, zoomRef.current);
      gl.uniform1f(aspectLoc, aspect);
      gl.uniform2f(worldPixelSizeLoc, worldPixelSizeX, worldPixelSizeY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      updateRulers();
    },
    [updateRulers],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let rafId = 0;
    let last = 0;
    const throttleMs = 50;
    const tick = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvasSizeRef.current = { width: w, height: h };
      const now = performance.now();
      if (now - last >= throttleMs) {
        last = now;
        setViewState({
          pan: { ...panRef.current },
          zoom: zoomRef.current,
        });
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (zoomToFitTrigger <= 0) return;
    const creatives = doc.nodes.filter(
      (n): n is CreativeNode => n.type === "creative",
    );
    if (creatives.length === 0) return;
    const canvas = canvasRef.current;
    const gl = glRef.current;
    const program = programRef.current;
    if (!canvas || !gl || !program) return;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw <= 0 || ch <= 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of creatives) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    }
    const pad = ZOOM_TO_FIT_PADDING;
    const boundsW = maxX - minX + 2 * pad;
    const boundsH = maxY - minY + 2 * pad;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const aspect = cw / ch;
    const zoomW = (2 * aspect) / boundsW;
    const zoomH = 2 / boundsH;
    const zoom = Math.min(zoomW, zoomH, ZOOM_MAX);
    const zoomClamped = Math.max(ZOOM_MIN, zoom);

    panRef.current.x = centerX;
    panRef.current.y = centerY;
    zoomRef.current = zoomClamped;
    targetZoomRef.current = zoomClamped;
    setViewState({ pan: { x: centerX, y: centerY }, zoom: zoomClamped });
    render(gl, program);
    // Only run when user triggers zoom-to-fit, not when doc changes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- doc read from closure on trigger
  }, [zoomToFitTrigger, render]);

  const handleNodePointerMove = useCallback(
    (e: PointerEvent) => {
      const id = draggingNodeIdRef.current;
      if (!id) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ch = canvas.clientHeight;
      const cw = canvas.clientWidth;
      const zoom = zoomRef.current;
      if (ch <= 0) return;
      const scale = 2 / (zoom * ch);
      const totalDeltaX = e.clientX - dragStartPointerRef.current.x;
      const totalDeltaY = e.clientY - dragStartPointerRef.current.y;
      const worldDeltaX = totalDeltaX * scale;
      const worldDeltaY = -totalDeltaY * scale;
      const newX = dragStartWorldRef.current.x + worldDeltaX;
      const newY = dragStartWorldRef.current.y + worldDeltaY;
      dispatch(updateNode({ id, patch: { x: newX, y: newY } }));
    },
    [dispatch],
  );

  const handleNodePointerUp = useCallback(
    (e: PointerEvent) => {
      const id = draggingNodeIdRef.current;
      draggingNodeIdRef.current = null;
      window.removeEventListener("pointermove", handleNodePointerMove);
      window.removeEventListener("pointerup", handleNodePointerUp);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      const totalDeltaX = e.clientX - dragStartPointerRef.current.x;
      const totalDeltaY = e.clientY - dragStartPointerRef.current.y;
      const dist = Math.sqrt(
        totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY,
      );
      if (dist < 5 && id) {
        dispatch(setSelectedNodeId(id));
      }
    },
    [dispatch, handleNodePointerMove],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl", { antialias: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = createProgram(gl, vs, fs);
    if (!program) return;

    glRef.current = gl;
    programRef.current = program;

    const positionLoc = gl.getAttribLocation(program, "a_position");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const resize = () => {
      const dpr = window.devicePixelRatio ?? 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      render(gl, program);
    };

    resize();
    window.addEventListener("resize", resize);

    const handlePointerDown = (e: PointerEvent) => {
      isPanningRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      lastMoveTimeRef.current = performance.now();
      if (momentumRafRef.current) {
        cancelAnimationFrame(momentumRafRef.current);
        momentumRafRef.current = 0;
      }
      velocityRef.current = { x: 0, y: 0 };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPanningRef.current) return;
      const now = performance.now();
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      const dt = now - lastMoveTimeRef.current;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w > 0 && h > 0) {
        const scale = 2 / (zoomRef.current * h);
        panRef.current.x -= dx * scale;
        panRef.current.y += dy * scale;
      }

      if (dt > 0 && dt < 150 && w > 0 && h > 0) {
        const worldScale = 2 / (zoomRef.current * h);
        velocityRef.current = {
          x: -dx * worldScale * PAN_MOMENTUM_MULTIPLIER,
          y: dy * worldScale * PAN_MOMENTUM_MULTIPLIER,
        };
      }

      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      lastMoveTimeRef.current = now;
      render(gl, program);
    };

    const handlePointerUp = () => {
      isPanningRef.current = false;
      const v = velocityRef.current;
      if (
        Math.abs(v.x) < PAN_VELOCITY_MIN &&
        Math.abs(v.y) < PAN_VELOCITY_MIN
      ) {
        return;
      }

      const momentumTick = () => {
        const v = velocityRef.current;
        panRef.current.x += v.x;
        panRef.current.y += v.y;
        velocityRef.current = {
          x: v.x * PAN_MOMENTUM_FRICTION,
          y: v.y * PAN_MOMENTUM_FRICTION,
        };
        render(gl, program);

        const next = velocityRef.current;
        if (
          Math.abs(next.x) < PAN_VELOCITY_MIN &&
          Math.abs(next.y) < PAN_VELOCITY_MIN
        ) {
          momentumRafRef.current = 0;
          return;
        }
        momentumRafRef.current = requestAnimationFrame(momentumTick);
      };
      momentumRafRef.current = requestAnimationFrame(momentumTick);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = canvas.getBoundingClientRect();

      if (e.shiftKey) {
        const scale = 2 / (zoomRef.current * rect.height);
        if (rect.height > 0) {
          panRef.current.x += e.deltaX * scale;
          panRef.current.y -= e.deltaY * scale;
        }
        render(gl, program);
        return;
      }

      const cursorX = (e.clientX - rect.left) / rect.width;
      const cursorY = 1 - (e.clientY - rect.top) / rect.height;
      const aspect = rect.width / rect.height;
      const ndcX = (cursorX * 2 - 1) * aspect;
      const ndcY = cursorY * 2 - 1;
      const worldX = panRef.current.x + ndcX / zoomRef.current;
      const worldY = panRef.current.y + ndcY / zoomRef.current;

      zoomCenterWorldRef.current = { x: worldX, y: worldY };
      zoomCenterNdcRef.current = { x: ndcX, y: ndcY };

      const currentLevel = Math.log(targetZoomRef.current);
      const deltaLevel = -e.deltaY * ZOOM_WHEEL_SENSITIVITY;
      const newLevel = Math.max(
        Math.log(ZOOM_MIN),
        Math.min(Math.log(ZOOM_MAX), currentLevel + deltaLevel),
      );
      targetZoomRef.current = Math.exp(newLevel);

      const tick = () => {
        const dz = targetZoomRef.current - zoomRef.current;
        if (Math.abs(dz) < ZOOM_EPS) {
          zoomRafRef.current = 0;
          return;
        }
        zoomRef.current += dz * ZOOM_SMOOTH;
        const w = zoomCenterWorldRef.current;
        const n = zoomCenterNdcRef.current;
        panRef.current.x = w.x - n.x / zoomRef.current;
        panRef.current.y = w.y - n.y / zoomRef.current;
        render(gl, program);
        zoomRafRef.current = requestAnimationFrame(tick);
      };
      if (!zoomRafRef.current) {
        zoomRafRef.current = requestAnimationFrame(tick);
      }
    };

    const handleContainerWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleWheel(e);
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    container.addEventListener("wheel", handleContainerWheel, {
      passive: false,
    });
    canvas.addEventListener("wheel", handleContainerWheel, { passive: false });

    return () => {
      glRef.current = null;
      programRef.current = null;
      if (zoomRafRef.current) cancelAnimationFrame(zoomRafRef.current);
      if (momentumRafRef.current) cancelAnimationFrame(momentumRafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      container.removeEventListener("wheel", handleContainerWheel);
      canvas.removeEventListener("wheel", handleContainerWheel);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [render]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ touchAction: "none" }}
    >
      <div
        className="absolute left-0 top-0 z-20 shrink-0 pointer-events-none"
        style={{
          width: RULER_SIZE,
          height: RULER_SIZE,
          backgroundColor: RULER_BG,
          borderRight: `1px solid ${BORDER_COLOR}`,
          borderBottom: `1px solid ${BORDER_COLOR}`,
        }}
      />
      <canvas
        ref={topRulerRef}
        className="absolute top-0 z-20 block shrink-0 pointer-events-none"
        style={{
          left: RULER_SIZE,
          right: 0,
          height: RULER_SIZE,
          width: `calc(100% - ${RULER_SIZE}px)`,
          backgroundColor: RULER_BG,
          borderBottom: `1px solid ${BORDER_COLOR}`,
        }}
      />
      <canvas
        ref={leftRulerRef}
        className="absolute left-0 z-20 block shrink-0 pointer-events-none"
        style={{
          top: RULER_SIZE,
          bottom: 0,
          width: RULER_SIZE,
          height: `calc(100% - ${RULER_SIZE}px)`,
          backgroundColor: RULER_BG,
          borderRight: `1px solid ${BORDER_COLOR}`,
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute cursor-grab active:cursor-grabbing touch-none"
        style={{
          left: RULER_SIZE,
          top: RULER_SIZE,
          right: 0,
          bottom: 0,
          width: `calc(100% - ${RULER_SIZE}px)`,
          height: `calc(100% - ${RULER_SIZE}px)`,
        }}
      />
      <div
        className="absolute pointer-events-none z-10"
        style={{
          left: RULER_SIZE,
          top: RULER_SIZE,
          right: 0,
          bottom: 0,
          width: `calc(100% - ${RULER_SIZE}px)`,
          height: `calc(100% - ${RULER_SIZE}px)`,
        }}
      >
        {doc.nodes
          .filter((n): n is CreativeNode => n.type === "creative")
          .map((node) => {
            const { width: cw, height: ch } = canvasSizeRef.current;
            if (cw <= 0 || ch <= 0) return null;
            const rect = worldToScreen(
              node,
              viewState.pan,
              viewState.zoom,
              cw,
              ch,
            );
            const isSelected = selectedNodeId === node.id;
            const variant = node.variantId
              ? variants.find((v) => v.id === node.variantId)
              : null;
            return (
              <div
                key={node.id}
                className="pointer-events-auto absolute cursor-move rounded border-2 bg-white shadow-md transition-shadow hover:shadow-lg active:cursor-grabbing"
                style={{
                  left: rect.left,
                  top: rect.top,
                  width: Math.max(1, rect.width),
                  height: Math.max(1, rect.height),
                  borderColor: isSelected ? "#8b5cf6" : "#e5e7eb",
                  backgroundColor: node.color ?? "#f9fafb",
                  backgroundImage: node.asset
                    ? `url(${node.asset})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  draggingNodeIdRef.current = node.id;
                  dragStartPointerRef.current = { x: e.clientX, y: e.clientY };
                  dragStartWorldRef.current = { x: node.x, y: node.y };
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  window.addEventListener("pointermove", handleNodePointerMove);
                  window.addEventListener("pointerup", handleNodePointerUp);
                }}
              >
                <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
                  {variant?.copy && (
                    <span className="line-clamp-3 text-[10px] text-gray-700">
                      {variant.copy}
                    </span>
                  )}
                  {node.sizeLabel && (
                    <span className="text-xs font-medium text-gray-500">
                      {node.sizeLabel}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">
                    {Math.round(node.width * 50)}×{Math.round(node.height * 50)}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
