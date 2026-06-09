/**
 * @description 工具函数集合
 * @date 2026-06-09
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名
 * 使用 clsx 支持条件类名，并用 tailwind-merge 解决样式冲突
 * 
 * @param inputs 支持多个类名、对象或数组形式的参数
 * @returns 最终合成的安全类名字符串
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
