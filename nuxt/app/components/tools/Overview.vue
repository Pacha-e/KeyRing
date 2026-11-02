<template>
  <section class="tools">
    <p class="eyebrow">KeyRing resources</p>
    <h1>Tools for informed decisions</h1>
    <p>Explore free resources for managing your rental property.</p>
    <div class="links">
      <NuxtLink to="/tools/rent-calculator"
        ><strong>Rental yield calculator</strong
        ><span>Estimate annual income and returns.</span></NuxtLink
      >
      <NuxtLink to="/tools/faq"
        ><strong>Frequently asked questions</strong><span>Learn how to use KeyRing.</span></NuxtLink
      >
    </div>
  </section>
</template>

<style scoped>
.tools {
  max-width: 960px;
  margin: 0 auto;
  padding: 3rem 1.25rem;
}
.eyebrow {
  color: #276455;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  margin: 0.5rem 0;
}
.links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}
a {
  display: grid;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #cddbd5;
  border-radius: 0.75rem;
  color: #173d35;
  text-decoration: none;
}
a:hover,
a:focus-visible {
  border-color: #276455;
  background: #f0f8f4;
}
</style>
