<!-- --- Template --- -->
<template>
  <div>
    <header class="site-header">
      <NuxtLink class="site-brand" to="/">KeyRing</NuxtLink>
      <nav class="site-nav" aria-label="Main navigation">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/blog">Blog</NuxtLink>
        <NuxtLink to="/properties">Properties</NuxtLink>
        <NuxtLink to="/tools">Tools</NuxtLink>
      </nav>
    </header>
    <main><slot /></main>
  </div>
</template>
