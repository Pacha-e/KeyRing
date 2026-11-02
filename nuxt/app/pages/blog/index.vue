<script setup lang="ts">
// --- Internal imports ---
import { ArticleRepository } from '../../utils/ArticleRepository';

// --- Constants ---
const articles = ArticleRepository.findAll();

// --- Page metadata ---
useHead({ title: 'Blog | KeyRing' });
</script>

<template>
  <section class="blog">
    <h1>Property management blog</h1>
    <p>Practical guidance for managing rental properties.</p>
    <div class="articles">
      <BlogArticleCard v-for="article in articles" :key="article.slug" :article="article" />
    </div>
  </section>
</template>

<style scoped>
.blog {
  margin: 0 auto;
  max-width: 70rem;
  padding: 2rem 1rem 4rem;
}
.articles {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  margin-top: 2rem;
}
</style>
