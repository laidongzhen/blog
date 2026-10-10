<script setup lang="ts">
import { withBase } from "vitepress";
import { data as recentPosts } from "../../posts.data";

const posts = [...recentPosts];
</script>

<template>
  <div class="home">
    <section class="hero">
      <div class="orbs" aria-hidden="true">
        <span class="orb orb-a" />
        <span class="orb orb-b" />
        <span class="orb orb-c" />
      </div>
      <div class="hero-copy">
        <h1 class="name">laidongzhen</h1>
        <p class="position">前端笔记 · 页面解析 · 项目实操</p>
        <p class="tagline">把项目里的页面逻辑和踩过的坑记下来</p>
        <div class="actions">
          <a class="btn btn-brand" :href="withBase('/notes/')">看笔记</a>
          <a class="btn btn-alt" :href="withBase('/handbook/')">看项目手册</a>
        </div>
      </div>
    </section>

    <section class="grid">
      <a class="card" :href="withBase('/notes/')">
        <span class="kicker">笔记</span>
        <span class="card-desc">前端体系、专题问题</span>
        <span class="go">开始阅读</span>
      </a>
      <a class="card" :href="withBase('/handbook/')">
        <span class="kicker">项目手册</span>
        <span class="card-desc">页面解析、无人机和智巡实操</span>
        <span class="go">进入手册</span>
      </a>
      <article class="card card-recent">
        <h2 class="kicker">最近更新</h2>
        <ul v-if="posts.length" class="recent">
          <li v-for="post in posts" :key="post.url">
            <a :href="withBase(post.url)">
              <span class="recent-title">{{ post.title }}</span>
              <time :datetime="post.date">{{ post.date }}</time>
            </a>
          </li>
        </ul>
        <p v-else class="card-desc">暂时没有文章</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  max-width: 1120px;
  margin: 0 auto;
  padding: 12px 24px 88px;
}

.hero {
  position: relative;
  overflow: hidden;
  min-height: 340px;
  display: flex;
  align-items: center;
  padding: 48px 8px 20px;
}

.orbs {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(36px);
  opacity: 0.55;
  animation: drift 14s ease-in-out infinite;
}

.orb-a {
  width: 280px;
  height: 280px;
  left: -40px;
  top: 10px;
  background: #60a5fa;
}

.orb-b {
  width: 240px;
  height: 240px;
  right: 6%;
  top: 24px;
  background: #c4b5fd;
  animation-delay: -4s;
}

.orb-c {
  width: 180px;
  height: 180px;
  left: 38%;
  bottom: -40px;
  background: #67e8f9;
  animation-delay: -8s;
}

.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 760px;
  animation: fade-in 0.6s ease both;
}

.name {
  margin: 0;
  font-size: clamp(3rem, 8vw, 5.4rem);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 1.05;
  background: linear-gradient(120deg, #2563eb 0%, #7c3aed 42%, #0891b2 72%, #2563eb 100%);
  background-size: 220% 220%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shimmer 10s ease-in-out infinite;
}

.name::after {
  content: "";
  display: block;
  width: 72px;
  height: 4px;
  margin-top: 18px;
  border-radius: 999px;
  background: linear-gradient(90deg, #2563eb, #7c3aed, #0891b2);
}

.position {
  margin: 22px 0 0;
  font-size: 1.35rem;
  font-weight: 650;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
}

.tagline {
  margin: 10px 0 0;
  font-size: 1.05rem;
  color: var(--vp-c-text-2);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 112px;
  height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-brand {
  color: #fff;
  background: var(--vp-c-brand-1);
}

.btn-brand:hover {
  color: #fff;
  background: var(--vp-c-brand-2);
}

.btn-alt {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.card {
  display: flex;
  flex-direction: column;
  min-height: 168px;
  padding: 22px 22px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 88%, transparent);
  text-decoration: none;
  color: var(--vp-c-text-1);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

a.card:hover,
.card-recent:hover {
  transform: translateY(-4px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 16px 40px rgba(37, 99, 235, 0.12);
}

.kicker {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 650;
  letter-spacing: -0.02em;
}

.card-desc {
  margin-top: 10px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.go {
  margin-top: auto;
  padding-top: 18px;
  color: var(--vp-c-brand-1);
  font-size: 14px;
  font-weight: 600;
}

.go::after {
  content: " →";
}

.recent {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
}

.recent a {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 0;
  border-top: 1px solid var(--vp-c-divider);
  text-decoration: none;
  color: var(--vp-c-text-1);
}

.recent a:hover .recent-title {
  color: var(--vp-c-brand-1);
}

.recent-title {
  font-size: 14px;
  line-height: 1.45;
}

.recent time {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

:global(.dark) .name {
  background-image: linear-gradient(120deg, #93c5fd 0%, #d8b4fe 45%, #67e8f9 75%, #93c5fd 100%);
}

:global(.dark) .orb {
  opacity: 0.28;
}

:global(.dark) a.card:hover,
:global(.dark) .card-recent:hover {
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
}

@keyframes shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(28px, -22px, 0) scale(1.08);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 960px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .hero {
    min-height: 280px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .name,
  .orb,
  .hero-copy,
  .card,
  .btn {
    animation: none;
    transition: none;
  }
}
</style>
