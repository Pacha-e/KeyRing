<script setup lang="ts">
// --- Internal imports ---
import type { Article } from '../../interfaces/Article';

// --- Types ---
defineProps<{ article: Article }>();
</script>

<template>
  <article class="article">
    <NuxtLink to="/blog">← All articles</NuxtLink>
    <h1>{{ article.title }}</h1>
    <p class="metadata">
      By {{ article.author }} ·
      <time :datetime="article.publishedAt">{{ article.publishedAt }}</time> ·
      {{ article.readingMinutes }} min read
    </p>
    <p v-for="paragraph in article.body" :key="paragraph">{{ paragraph }}</p>
  </article>
</template>

<style scoped>
.article {
  margin: 0 auto;
  max-width: 46rem;
  padding: 2rem 1rem 4rem;
}
a {
  color: #155e45;
}
h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.15;
}
p {
  line-height: 1.75;
}
.metadata {
  color: #52645d;
}
</style>
