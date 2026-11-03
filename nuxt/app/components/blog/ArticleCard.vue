<script setup lang="ts">
// --- Internal imports ---
import type { Article } from '../../interfaces/Article';

// --- Types ---
defineProps<{ article: Article }>();
</script>

<template>
  <article class="card">
    <p class="date">
      <time :datetime="article.publishedAt">{{ article.publishedAt }}</time> ·
      {{ article.readingMinutes }} min read
    </p>
    <h2>
      <NuxtLink :to="`/blog/${article.slug}`">{{ article.title }}</NuxtLink>
    </h2>
    <p>{{ article.summary }}</p>
  </article>
</template>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: var(--color-surface);
  box-shadow: 0 0.5rem 1.5rem rgb(38 36 32 / 5%);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}
.card:hover,
.card:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0.75rem 1.75rem rgb(38 36 32 / 9%);
}
.date {
  color: var(--color-muted);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
h2 {
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
}
h2 a {
  color: var(--color-ink);
  text-decoration: none;
}
h2 a:hover {
  color: var(--color-primary);
}
p {
  line-height: 1.6;
}
p:last-child {
  margin-bottom: 0;
}
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}
</style>
