// --- External imports ---
import { createPinia } from 'pinia';
import { watch } from 'vue';

// --- Exported members ---
export class PiniaConfig {
  static init() {
    const pinia = createPinia();
    if (typeof window === 'undefined') return pinia;

    try {
      const savedState = window.localStorage.getItem('piniaState');
      if (savedState) {
        const state: unknown = JSON.parse(savedState);
        if (state && typeof state === 'object' && !Array.isArray(state)) {
          pinia.state.value = state as typeof pinia.state.value;
        }
      }
    } catch (error) {
      // Invalid or unreadable storage: keep the default store state instead of failing startup.
      console.warn('Could not restore stored state; using defaults.', error);
    }

    watch(
      pinia.state,
      (state) => {
        try {
          window.localStorage.setItem('piniaState', JSON.stringify(state));
        } catch (error) {
          // Persisting is best effort: the in-memory state keeps the application usable.
          console.warn('Could not persist store state.', error);
        }
      },
      { deep: true },
    );
    return pinia;
  }
}
