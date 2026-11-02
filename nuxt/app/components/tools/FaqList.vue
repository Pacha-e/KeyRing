<script setup lang="ts">
// --- Internal imports ---
import { faqs } from '../../data/faqs';
</script>

<template>
  <section class="faq">
    <NuxtLink to="/tools">All tools</NuxtLink>
    <h1>Frequently asked questions</h1>
    <p>Answers to common questions about KeyRing and rental yield.</p>
    <details v-for="faq in faqs" :key="faq.question">
      <summary>{{ faq.question }}</summary>
      <p>{{ faq.answer }}</p>
    </details>
  </section>
</template>

<style scoped>
.faq {
  max-width: 760px;
  margin: 0 auto;
  padding: 3rem 1.25rem;
}
a {
  color: #276455;
}
h1 {
  font-size: clamp(2rem, 5vw, 3rem);
}
details {
  border-bottom: 1px solid #cddbd5;
  padding: 1rem 0;
}
summary {
  cursor: pointer;
  font-weight: 700;
}
details p {
  line-height: 1.6;
}
</style>
