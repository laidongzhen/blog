<script setup lang="ts">
import { reactive } from "vue";
import { navGroups } from "../nav-links";

const palette = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706", "#e11d48", "#4f46e5"];
const broken = reactive<Record<string, boolean>>({});

function hostname(link: string) {
  try {
    return new URL(link).hostname;
  } catch {
    return "";
  }
}

function favicon(link: string) {
  const host = hostname(link);
  return host ? `https://favicon.im/${host}?larger=true` : "";
}

function initial(title: string) {
  return title.trim().charAt(0).toUpperCase();
}

function tint(title: string) {
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
}

function markBroken(link: string) {
  broken[link] = true;
}
</script>

<template>
  <div class="nav-board">
    <header class="intro">
      <h1>前端导航链接</h1>
      <p>常用文档、博客和面试站点。点卡片即可打开。</p>
    </header>

    <section v-for="group in navGroups" :key="group.title" class="group">
      <h2>{{ group.title }}</h2>
      <div class="grid">
        <a
          v-for="item in group.items"
          :key="item.title + item.link"
          class="card no-icon"
          :href="item.link"
          target="_blank"
          rel="noreferrer"
        >
          <span class="icon" :style="{ background: tint(item.title) }">
            <img
              v-if="!broken[item.link]"
              :src="favicon(item.link)"
              alt=""
              @error="markBroken(item.link)"
            />
            <span v-else>{{ initial(item.title) }}</span>
          </span>
          <span class="text">
            <span class="title">{{ item.title }}</span>
            <span class="desc">{{ item.desc }}</span>
          </span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.nav-board {
  max-width: 1120px;
  margin: 0 auto;
  padding: 36px 24px 96px;
}

.intro h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.intro p {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
}

.group {
  margin-top: 36px;
}

.group h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 1.15rem;
  font-weight: 650;
  letter-spacing: -0.02em;
}

.group h2::before {
  content: "";
  width: 4px;
  height: 16px;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 76px;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
}

.card:hover {
  transform: translateY(-3px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.12);
  color: var(--vp-c-text-1);
}

.icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  color: #fff;
  font-weight: 700;
}

.icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #fff;
}

.text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
}

.title {
  font-size: 15px;
  font-weight: 650;
  line-height: 1.3;
}

.desc {
  font-size: 12px;
  line-height: 1.45;
  color: var(--vp-c-text-2);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

:global(.dark) .card:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}
</style>
