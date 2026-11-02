<script setup lang="ts">
// --- Internal imports ---
import { ArticleRepository } from '../../utils/ArticleRepository';

// --- Constants ---
const route = useRoute();
const article = ArticleRepository.findBySlug(String(route.params.slug));

if (!article) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found' });
}

// --- Page metadata ---
useHead({ title: `${article.title} | KeyRing` });
</script>

<template>
  <section><BlogArticleContent :article="article" /></section>
</template>
