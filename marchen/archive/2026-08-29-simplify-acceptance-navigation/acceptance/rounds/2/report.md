上轮人工反馈指出大图预览被限制为窄竖框。根因是 shadcn Dialog 默认的 `sm:max-w-sm` 在桌面断点覆盖了调用处的基础 `max-w` class。本轮沿用现有 Base UI Dialog，在调用处显式设置全视口尺寸和 `sm:max-w-none`，图片按视口宽度展开。
