<script setup lang="ts">
// --- Internal imports ---
import AppIcon, { type IconName } from '../components/AppIcon.vue';
import { APP_NAME } from '../config/app.config';

// --- Types ---
interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

// --- State ---
const features: Feature[] = [
  {
    icon: 'home',
    title: 'Properties',
    description:
      'Register every property with its rental mode, estimated rent and fixed costs. Filter by city and type.',
  },
  {
    icon: 'contract',
    title: 'Contracts',
    description:
      'Keep track of tenants, rent and dates. The dashboard shows which contracts expire first.',
  },
  {
    icon: 'income',
    title: 'Income and expenses',
    description:
      'Record each movement indicating whether it comes from Airbnb or a fixed contract, and compare them month by month.',
  },
  {
    icon: 'balance',
    title: 'Reports',
    description:
      'Profit by city, income distribution by source and summary by property, with filters by type and month range.',
  },
  {
    icon: 'map',
    title: 'Map',
    description:
      'Locate the full portfolio on the map and check the status of each property from its marker.',
  },
  {
    icon: 'users',
    title: 'Roles',
    description:
      'Owners see only their properties. Administrators access global reports and user management.',
  },
];

const team = ['Emmanuel Hernández', 'Paula Arroyave', 'Juan Andrés Salcedo'];
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
      <div>
        <p class="mb-4 text-sm font-medium tracking-widest text-primary uppercase">
          Properties in balance
        </p>
        <h1 class="font-brand m-0 text-4xl leading-tight font-semibold text-ink md:text-5xl">
          Your whole rental portfolio, on a single screen
        </h1>
        <p class="mt-5 mb-8 max-w-prose text-lg text-slate-600">
          {{ APP_NAME }} brings properties, contracts and income together and tells you how much
          each property really yields after administration and expenses.
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <router-link
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white no-underline transition hover:bg-primary-dark"
            :to="{ name: 'login' }"
          >
            Sign in
            <AppIcon name="arrow" :size="18" />
          </router-link>
          <a
            class="rounded-lg border border-slate-300 px-6 py-3 font-medium text-ink no-underline transition hover:bg-white"
            href="#features"
          >
            See what it does
          </a>
        </div>
      </div>

      <img
        class="mx-auto w-full max-w-md"
        src="/logo-keyring.png"
        :alt="`${APP_NAME} — properties in balance`"
      />
    </section>

    <!-- Features -->
    <section id="features" class="scroll-mt-20 border-t border-slate-200 py-14">
      <h2 class="font-brand m-0 text-2xl font-semibold text-ink">What it does</h2>
      <p class="mt-2 mb-8 text-slate-600">Six fronts of the operation, in a single board.</p>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="feature in features"
          :key="feature.title"
          class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <span class="inline-flex rounded-lg bg-page p-2.5 text-primary">
            <AppIcon :name="feature.icon" :size="22" />
          </span>
          <h3 class="mt-4 mb-2 text-base font-semibold text-ink">{{ feature.title }}</h3>
          <p class="m-0 text-sm leading-relaxed text-slate-600">{{ feature.description }}</p>
        </article>
      </div>
    </section>

    <!-- Team -->
    <section id="team" class="scroll-mt-20 border-t border-slate-200 py-14">
      <h2 class="font-brand m-0 text-2xl font-semibold text-ink">Team</h2>
      <p class="mt-2 mb-8 text-slate-600">Course project for Web Development Engineering.</p>

      <ul class="grid list-none gap-4 p-0 sm:grid-cols-3">
        <li
          v-for="member in team"
          :key="member"
          class="rounded-xl border border-slate-200 bg-white px-5 py-4 text-center font-medium text-ink shadow-sm"
        >
          {{ member }}
        </li>
      </ul>
    </section>
  </div>
</template>
