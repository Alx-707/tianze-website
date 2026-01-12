/**
 * 浏览器模式（Vitest v4 Browser）测试环境轻量设置
 * 仅保留断言扩展与最小全局配置，避免与手动 Mock 解析冲突
 */

import "@testing-library/jest-dom/vitest";

// 在部分浏览器环境中，matchMedia 可能不存在，补充最小 stub
if (typeof window !== "undefined" && !("matchMedia" in window)) {
  // @ts-expect-error - 测试环境 stub
  window.matchMedia = () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// 避免 anchor 导航触发真实跳转
if (typeof HTMLAnchorElement !== "undefined") {
  HTMLAnchorElement.prototype.click = function handleClick(
    this: HTMLAnchorElement,
  ) {
    const evt = new MouseEvent("click", { bubbles: true, cancelable: true });
    this.dispatchEvent(evt);
    // 不调用原始 click，避免真实跳转
  } as any;
}
