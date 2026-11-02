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
  border: 1px solid #d6dedb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}
.date {
  color: #52645d;
  font-size: 0.9rem;
}
h2 {
  font-size: 1.25rem;
}
a {
  color: #155e45;
}
p {
  line-height: 1.6;
}
</style>
