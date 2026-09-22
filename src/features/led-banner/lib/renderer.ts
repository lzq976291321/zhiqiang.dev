import { formatTime, type BannerLiveData, type BannerSettings } from "./settings"

type Glyph = { text: string; x: number; width: number }
type TextLine = {
  glyphs: Glyph[]
  width: number
  height: number
  fontSize: number
  font: string
  x: number
  y: number
  secondary?: boolean
  dots: Map<string, Path2D>
}
type Composition = { lines: TextLine[]; width: number; height: number }

const layouts = new Map<string, Composition>()
const measuredGlyphs = new Map<string, number>()
const segmenter = typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null
const TILE_WIDTH = 768
const TAU = Math.PI * 2
const fonts = {
  sans: '"Arial Black", "PingFang SC", "Microsoft YaHei", sans-serif',
  serif: 'Georgia, "Songti SC", "SimSun", serif',
  mono: '"SFMono-Regular", Consolas, "PingFang SC", monospace',
}

function graphemes(value: string): string[] {
  return segmenter ? Array.from(segmenter.segment(value), ({ segment }) => segment) : Array.from(value)
}

function fontString(size: number, font: BannerSettings["font"]): string {
  return `900 ${size}px ${fonts[font]}`
}

function glyphWidth(ctx: CanvasRenderingContext2D, glyph: string): number {
  const key = `${ctx.font}|${glyph}`
  const cached = measuredGlyphs.get(key)
  if (cached !== undefined) return cached
  const width = ctx.measureText(glyph).width
  if (measuredGlyphs.size >= 6000) measuredGlyphs.clear()
  measuredGlyphs.set(key, width)
  return width
}

function makeLine(ctx: CanvasRenderingContext2D, text: string, size: number, settings: BannerSettings, secondary = false): TextLine {
  const font = fontString(size, settings.font)
  ctx.font = font
  const spacing = secondary ? settings.letterSpacing * 0.4 : settings.letterSpacing
  let width = 0
  const glyphs = graphemes(text).map((value) => {
    const glyph = { text: value, x: width, width: glyphWidth(ctx, value) }
    width += glyph.width + spacing
    return glyph
  })
  return { glyphs, width: Math.max(0, width - (glyphs.length ? spacing : 0)), height: size * 1.35, fontSize: size, font, x: 0, y: 0, secondary, dots: new Map() }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, size: number, width: number, settings: BannerSettings): string[] {
  ctx.font = fontString(size, settings.font)
  const lines: string[] = []
  for (const paragraph of text.split("\n")) {
    let line = ""
    let used = 0
    for (const glyph of graphemes(paragraph)) {
      const advance = glyphWidth(ctx, glyph) + settings.letterSpacing
      if (line && used + advance > width) {
        lines.push(line.trimEnd())
        line = ""
        used = 0
      }
      line += glyph
      used += advance
    }
    lines.push(line)
  }
  return lines
}

function fitLine(ctx: CanvasRenderingContext2D, text: string, size: number, available: number, settings: BannerSettings, secondary = false): TextLine {
  let line = makeLine(ctx, text, size, settings, secondary)
  if (line.width > available) {
    // 字距同样参与缩放，保证极长静态横幅完整落在画布内。
    const scale = available / line.width
    line = makeLine(ctx, text, size * scale, { ...settings, letterSpacing: settings.letterSpacing * scale }, secondary)
  }
  return line
}

function getComposition(ctx: CanvasRenderingContext2D, width: number, height: number, settings: BannerSettings, live?: BannerLiveData): Composition {
  let text = settings.uppercase ? settings.text.toLocaleUpperCase() : settings.text
  let subtitle = settings.uppercase ? settings.subtext.toLocaleUpperCase() : settings.subtext
  if (settings.mode === "countdown") {
    subtitle = subtitle || text
    text = formatTime(live?.countdown ?? settings.duration)
  }
  const matchTime = settings.mode === "scoreboard" ? formatTime(live?.countdown ?? settings.duration) : ""
  const key = JSON.stringify([width, height, settings.mode, text, subtitle, settings.font, settings.fontSize, settings.letterSpacing, settings.autoFit, settings.motion, settings.teamA, settings.teamB, live?.scoreA, live?.scoreB, live?.period, matchTime])
  const cached = layouts.get(key)
  if (cached) return cached
  const padding = Math.max(12, Math.min(width, height) * 0.075)
  const available = Math.max(1, width - padding * 2)
  const availableHeight = Math.max(1, height - padding * 2)
  const lines: TextLine[] = []

  if (settings.mode === "scoreboard") {
    const scoreSize = Math.min(settings.fontSize * 1.35, availableHeight * (text.trim() ? 0.38 : 0.43), available * 0.22)
    const labelSize = Math.max(12, scoreSize * 0.26)
    const fieldWidth = available * 0.38
    const teamA = settings.uppercase ? settings.teamA.toLocaleUpperCase() : settings.teamA
    const teamB = settings.uppercase ? settings.teamB.toLocaleUpperCase() : settings.teamB
    for (const [index, team] of [teamA, teamB].entries()) {
      const x = available * (index ? 0.76 : 0.24)
      const label = fitLine(ctx, team, labelSize, fieldWidth, settings, true)
      label.x = x - label.width / 2
      const score = fitLine(ctx, String(index ? (live?.scoreB ?? 0) : (live?.scoreA ?? 0)), scoreSize, fieldWidth, settings)
      score.x = x - score.width / 2
      score.y = labelSize * 1.9
      lines.push(label, score)
    }
    const separator = makeLine(ctx, ":", scoreSize * 0.65, settings)
    separator.x = (available - separator.width) / 2
    separator.y = labelSize * 1.9 + scoreSize * 0.15
    lines.push(separator)
    const period = fitLine(ctx, `${matchTime}  ·  第 ${live?.period ?? 1} 节`, labelSize * 0.8, available, settings, true)
    period.x = (available - period.width) / 2
    period.y = labelSize * 1.9 + scoreSize * 1.45
    lines.push(period)
    if (text.trim()) {
      const title = fitLine(ctx, text, labelSize * 0.8, available, settings, true)
      const titleSpace = title.height * 1.45
      for (const line of lines) line.y += titleSpace
      title.x = (available - title.width) / 2
      lines.unshift(title)
    }
    const composition = { lines, width: available, height: period.y + period.height }
    cacheLayout(key, composition)
    return composition
  }

  const teleprompter = settings.mode === "teleprompter"
  const vertical = settings.motion === "up" || settings.motion === "down"
  const subtitleVisible = Boolean(subtitle.trim()) && ["airport", "wedding", "countdown"].includes(settings.mode)
  let size = Math.max(2, Math.min(settings.fontSize, availableHeight * (subtitleVisible ? 0.56 : 0.75)))
  let spacing = settings.letterSpacing
  let rows = teleprompter || vertical ? wrapText(ctx, text, size, available, settings) : text.split("\n")
  const staticFit = settings.autoFit && !teleprompter && !vertical
  if (staticFit && !teleprompter && !vertical) {
    const naturalWidths = rows.map((row) => makeLine(ctx, row, size, settings).width)
    const horizontalSize = size * Math.min(1, available / Math.max(1, ...naturalWidths))
    if (horizontalSize < 18 && text.length > 40) {
      // 极长静态文案按面积换行，避免数千字缩成不可见的一条亚像素细线。
      const units = naturalWidths.reduce((sum, rowWidth) => sum + rowWidth / size, 0)
      const wrappedSize = Math.min(size, Math.sqrt(available * availableHeight / Math.max(1, units * 1.5)))
      spacing *= wrappedSize / size
      size = wrappedSize
      rows = wrapText(ctx, text, size, available, { ...settings, letterSpacing: spacing })
    }
  }
  let lineSize = size
  let letterSpacing = spacing
  const constrainWidth = teleprompter || vertical || staticFit || settings.mode === "countdown"
  if (staticFit) {
    const subtitleHeight = subtitleVisible ? size * 0.5 : 0
    const maxWidth = Math.max(1, ...rows.map((row) => makeLine(ctx, row, size, { ...settings, letterSpacing }).width))
    const scale = Math.min(1, available / maxWidth, availableHeight / (rows.length * size * 1.35 + subtitleHeight))
    lineSize *= scale
    letterSpacing *= scale
  } else if (!teleprompter && !vertical && rows.length > 1) {
    const scale = Math.min(1, availableHeight / (rows.length * size * 1.35 + (subtitleVisible ? size * 0.5 : 0)))
    lineSize *= scale
    letterSpacing *= scale
  }
  const lineSettings = { ...settings, letterSpacing }
  let y = 0
  for (const row of rows) {
    const line = constrainWidth ? fitLine(ctx, row, lineSize, available, lineSettings) : makeLine(ctx, row, lineSize, lineSettings)
    line.y = y
    y += line.height
    lines.push(line)
  }
  if (subtitleVisible) {
    const subtitleLine = fitLine(ctx, subtitle, Math.min(36, Math.max(10, lineSize * 0.3)), available, settings, true)
    subtitleLine.y = y + lineSize * 0.12
    lines.push(subtitleLine)
    y = subtitleLine.y + subtitleLine.height
  }
  const contentWidth = Math.max(1, ...lines.map((line) => line.width))
  for (const line of lines) line.x = teleprompter ? 0 : (contentWidth - line.width) / 2
  const composition = { lines, width: contentWidth, height: y }
  cacheLayout(key, composition)
  return composition
}

function cacheLayout(key: string, composition: Composition): void {
  if (layouts.size >= 8) layouts.delete(layouts.keys().next().value!)
  layouts.set(key, composition)
}

function paintGlyphs(ctx: CanvasRenderingContext2D, line: TextLine, start: number, end: number, stroke = false): void {
  ctx.font = line.font
  ctx.textBaseline = "middle"
  for (const glyph of line.glyphs) {
    if (glyph.x + glyph.width < start - line.fontSize * 0.2) continue
    if (glyph.x > end + line.fontSize * 0.2) break
    if (stroke) ctx.strokeText(glyph.text, glyph.x, line.height * 0.49)
    else ctx.fillText(glyph.text, glyph.x, line.height * 0.49)
  }
}

function dotPath(line: TextLine, tile: number, pitch: number, shape: BannerSettings["dotShape"]): Path2D {
  const key = `${tile}:${pitch}:${shape}`
  const cached = line.dots.get(key)
  if (cached) return cached
  const start = tile * TILE_WIDTH
  const end = Math.min(line.width + line.fontSize * 0.2, start + TILE_WIDTH)
  const canvas = document.createElement("canvas")
  canvas.width = Math.ceil(TILE_WIDTH + pitch * 2)
  canvas.height = Math.ceil(line.height + pitch * 2)
  const mask = canvas.getContext("2d", { willReadFrequently: true })!
  mask.fillStyle = "#ffffff"
  mask.translate(-start + pitch, pitch)
  paintGlyphs(mask, line, start - pitch, end + pitch)
  const data = mask.getImageData(0, 0, canvas.width, canvas.height).data
  const path = new Path2D()
  const radius = pitch * 0.34
  // 全部块共用同一网格原点，滚动时灯珠不会抖动，块边界也不会出现断缝。
  for (let x = Math.ceil(start / pitch) * pitch; x < end; x += pitch) {
    for (let y = pitch * 0.5; y < line.height; y += pitch) {
      const index = (Math.floor(y + pitch) * canvas.width + Math.floor(x - start + pitch)) * 4 + 3
      if (data[index] < 90) continue
      if (shape === "square") path.rect(x - radius, y - radius, radius * 2, radius * 2)
      else if (shape === "diamond") {
        path.moveTo(x, y - radius * 1.25)
        path.lineTo(x + radius * 1.25, y)
        path.lineTo(x, y + radius * 1.25)
        path.lineTo(x - radius * 1.25, y)
        path.closePath()
      } else {
        path.moveTo(x + radius, y)
        path.arc(x, y, radius, 0, TAU)
      }
    }
  }
  if (line.dots.size >= 32) line.dots.delete(line.dots.keys().next().value!)
  line.dots.set(key, path)
  return path
}

function paintLine(ctx: CanvasRenderingContext2D, line: TextLine, settings: BannerSettings, elapsed: number, viewportStart: number, viewportEnd: number): void {
  const effect = line.secondary ? "clean" : settings.effect
  ctx.fillStyle = settings.color
  ctx.strokeStyle = settings.color
  ctx.shadowColor = settings.color
  ctx.shadowBlur = 0
  if (line.secondary) ctx.globalAlpha *= 0.72
  if (effect === "led" || effect === "digital") {
    const pitch = Math.max(0.7, Math.min(settings.dotSize, line.fontSize / (effect === "digital" ? 22 : 12)))
    const shape = effect === "digital" ? "square" : settings.dotShape
    const firstTile = Math.max(0, Math.floor(viewportStart / TILE_WIDTH))
    const lastTile = Math.floor(Math.min(line.width, viewportEnd) / TILE_WIDTH)
    ctx.shadowBlur = settings.glow * (effect === "digital" ? 0.045 : 0.08)
    for (let tile = firstTile; tile <= lastTile; tile++) ctx.fill(dotPath(line, tile, pitch, shape))
    return
  }
  if (effect === "rainbow") {
    const gradient = ctx.createLinearGradient(viewportStart, 0, Math.max(viewportStart + 1, viewportEnd), line.height)
    for (let stop = 0; stop <= 6; stop++) gradient.addColorStop(stop / 6, `hsl(${(stop * 60 + elapsed * 18) % 360} 100% 64%)`)
    ctx.fillStyle = gradient
    ctx.shadowBlur = settings.glow * 0.08
  } else if (effect === "neon") {
    ctx.lineJoin = "round"
    ctx.lineWidth = Math.max(1, line.fontSize * 0.035)
    ctx.shadowBlur = settings.glow * 0.35
    paintGlyphs(ctx, line, viewportStart, viewportEnd, true)
    ctx.shadowBlur = settings.glow * 0.1
    ctx.fillStyle = "#fff9ec"
  } else if (effect === "glow") {
    ctx.shadowBlur = settings.glow * 0.5
    paintGlyphs(ctx, line, viewportStart, viewportEnd)
    ctx.shadowBlur = settings.glow * 0.18
  } else if (effect === "glowstick") {
    ctx.lineJoin = "round"
    ctx.lineWidth = Math.max(2, line.fontSize * 0.055)
    ctx.shadowBlur = settings.glow * 0.4
    paintGlyphs(ctx, line, viewportStart, viewportEnd, true)
    const gradient = ctx.createLinearGradient(0, 0, 0, line.height)
    gradient.addColorStop(0, "#ffffff")
    gradient.addColorStop(0.35, settings.color)
    gradient.addColorStop(0.5, "#ffffff")
    gradient.addColorStop(0.68, settings.color)
    gradient.addColorStop(1, settings.color)
    ctx.fillStyle = gradient
  }
  paintGlyphs(ctx, line, viewportStart, viewportEnd)
}

/** elapsed 为当前播放累计的秒数；所有尺寸均为 CSS 像素。 */
export function drawBanner(ctx: CanvasRenderingContext2D, width: number, height: number, settings: BannerSettings, elapsed: number, live?: BannerLiveData): void {
  if (width <= 0 || height <= 0) return
  ctx.save()
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
  ctx.fillStyle = settings.background
  if (settings.gradient) {
    const background = ctx.createLinearGradient(0, 0, width, height)
    background.addColorStop(0, settings.background)
    background.addColorStop(1, settings.secondaryColor)
    ctx.fillStyle = background
  }
  if (settings.mode === "glowstick") {
    const light = ctx.createRadialGradient(width * 0.5, height * 0.45, 0, width * 0.5, height * 0.45, Math.max(width, height) * 0.85)
    light.addColorStop(0, settings.color)
    light.addColorStop(0.58, settings.color)
    light.addColorStop(1, settings.background)
    ctx.fillStyle = light
  }
  ctx.fillRect(0, 0, width, height)
  if (settings.mode === "glowstick" && settings.motion === "pulse") {
    ctx.fillStyle = `rgba(0,0,0,${0.12 + 0.1 * Math.sin(elapsed * Math.min(0.8, settings.speed * 0.08) * TAU)})`
    ctx.fillRect(0, 0, width, height)
  }
  ctx.beginPath()
  ctx.rect(0, 0, width, height)
  ctx.clip()
  if (settings.mirror) {
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
  }
  // 低频柔和明暗变化，每秒一个周期，不做全屏高频黑白切换。
  if (settings.blink) ctx.globalAlpha = 0.66 + 0.34 * Math.cos(Math.max(0, elapsed) * TAU)
  const composition = getComposition(ctx, width, height, settings, live)
  const { width: textWidth, height: textHeight } = composition
  const time = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0)
  const speed = settings.speed * 24
  const motion = settings.mode === "teleprompter" && settings.motion !== "still" ? "up" : settings.motion
  const gap = Math.max(64, width * 0.16)
  let x = (width - textWidth) / 2
  let y = (height - textHeight) / 2
  let scale = 1
  const copies: Array<{ x: number; y: number }> = []
  if (motion === "left" || motion === "right") {
    const travel = textWidth + gap
    const offset = (time * speed) % travel
    const initial = textWidth <= width ? (width - textWidth) / 2 : width * 0.06
    x = initial + (motion === "left" ? -offset : offset)
    for (let copy = -2; copy <= Math.ceil(width / travel) + 1; copy++) copies.push({ x: x + copy * travel, y })
  } else if (motion === "up" || motion === "down") {
    const travel = textHeight + height * 0.65
    const offset = (time * speed * (settings.mode === "teleprompter" ? 0.35 : 1)) % travel
    const initial = textHeight > height ? height * 0.13 : (height - textHeight) / 2
    y = initial + (motion === "up" ? -offset : offset)
    for (let copy = -1; copy <= Math.ceil(height / travel) + 1; copy++) copies.push({ x, y: y + copy * travel })
  } else if (motion === "bounce") {
    const room = Math.abs(width - textWidth) * 0.5
    x += Math.sin((time * speed) / Math.max(80, room)) * room
  } else if (motion === "pulse") {
    scale = 0.93 + Math.cos(time * Math.min(0.8, settings.speed * 0.08) * TAU) * 0.07
  }
  if (!copies.length) copies.push({ x, y })
  if (scale !== 1) {
    ctx.translate(width / 2, height / 2)
    ctx.scale(scale, scale)
    ctx.translate(-width / 2, -height / 2)
  }
  for (const copy of copies) {
    if (copy.x > width + 50 || copy.x + textWidth < -50 || copy.y > height + 50 || copy.y + textHeight < -50) continue
    for (const line of composition.lines) {
      const left = copy.x + line.x
      const top = copy.y + line.y
      if (top > height + 50 || top + line.height < -50) continue
      ctx.save()
      ctx.translate(left, top)
      paintLine(ctx, line, settings.mode === "glowstick" ? { ...settings, color: "#ffffff", effect: "clean" } : settings, time, -left - 24, width - left + 24)
      ctx.restore()
    }
  }
  ctx.restore()
}
