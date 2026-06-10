/**
 * @description 渐进式渲染钩子，用于对长列表或重渲染组件进行分批次异步渲染，避免阻塞主线程导致动画卡顿
 * @date 2026-06-10
 */
import { useState, useEffect } from 'react';

interface ProgressiveRenderOptions {
  /** 数据总长度 */
  total: number;
  /** 初始挂载渲染的数量，如果不传默认等于 batchSize，实现初次渲染无需等待 */
  initialCount?: number;
  /** 每一批次追加渲染的数量 */
  batchSize?: number;
  /** 批次渲染间隔时间 (ms)，默认 100ms */
  delay?: number;
}

export function useProgressiveRender({
  total,
  initialCount,
  batchSize = 2,
  delay = 100
}: ProgressiveRenderOptions) {
  const initCount = initialCount !== undefined ? initialCount : batchSize;
  const [renderedCount, setRenderedCount] = useState(initCount);

  // 当总数变为0或发生变化时，如果当前渲染数超出总数，或者总数为0，进行安全重置
  useEffect(() => {
    if (total === 0) {
      setRenderedCount(initCount);
    } else if (renderedCount > total) {
      setRenderedCount(total);
    }
  }, [total, initCount]);

  useEffect(() => {
    if (total > 0 && renderedCount < total) {
      const timer = setTimeout(() => {
        setRenderedCount(prev => Math.min(prev + batchSize, total));
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [renderedCount, total, batchSize, delay]);

  return renderedCount;
}
