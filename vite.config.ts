import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const root = dirname(fileURLToPath(import.meta.url))

/**
 * 把 index.html 里的 __NOTE_COUNT__ 换成真实的笔记篇数。
 * 数字来自 scripts/fetch-stats.mjs 拉取的博客统计，构建时注入，
 * 不会像写死的数字那样在下一次发文章后变成假的；统计缺失时退回模糊表述。
 */
function noteCountPlugin() {
  return {
    name: 'inject-note-count',
    transformIndexHtml(html: string) {
      let count = '一百多'
      try {
        const stats = JSON.parse(readFileSync(resolve(root, 'src/data/blog-stats.json'), 'utf8'))
        if (Number.isFinite(stats.posts) && stats.posts > 0) count = String(stats.posts)
      } catch {
        // 统计文件缺失或损坏时不要让构建失败
      }
      return html.replace(/__NOTE_COUNT__/g, count)
    },
  }
}

export default defineConfig({
  plugins: [vue(), noteCountPlugin()],
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
})
