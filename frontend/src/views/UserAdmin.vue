<script setup lang="ts">
// --- External imports ---
import { computed, onMounted, reactive, ref } from 'vue';

// --- Internal imports ---
import FilterBar from '../components/FilterBar.vue';
import FilterSelect from '../components/FilterSelect.vue';
import PageHeader from '../components/PageHeader.vue';
import SelectField from '../components/SelectField.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { USER_ROLE_TONE } from '../enums/badge-tones';
import { UserRole, UserRoleLabel } from '../enums/UserRole';
import type { SelectOption } from '../interfaces/SelectOption';
import type { SessionUser } from '../services/auth.service';
import { UserService as userService } from '../services/user.service';
import { useAuthStore } from '../stores/auth';
import { DateFormatter } from '../utils/format';
import { HttpClient } from '../utils/HttpClient';

// --- Types ---
interface UserTableRow {
  city: string;
  email: string;
  fullName: string;
  id: string;
  memberSince: string;
  phone: string;
  role: UserRole;
  roleLabel: string;
}

type UserForm = Omit<SessionUser, 'id'> & { password: string };

// --- Stores ---
const authStore = useAuthStore();

// --- State ---
const allUsers = ref<SessionUser[]>([]);
const editingUserId = ref<string | null>(null);
const feedbackMessage = ref('');
const isFormVisible = ref(false);
const selectedRole = ref('');
const userForm = reactive<UserForm>(buildEmptyUser());

// --- Computed ---
const adminIds = computed(() =>
  allUsers.value.filter((user) => user.role === UserRole.ADMIN).map((user) => user.id),
);

const currentUserId = computed(() => authStore.user?.id ?? '');

const roleFilterOptions: SelectOption[] = Object.values(UserRole).map((role) => ({
  value: role,
  label: UserRoleLabel[role],
}));

const tableRows = computed<UserTableRow[]>(() =>
  allUsers.value
    .filter((user) => !selectedRole.value || user.role === selectedRole.value)
    .map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      memberSince: user.memberSince,
      role: user.role,
      roleLabel: UserRoleLabel[user.role] ?? user.role,
    })),
);

const undeletableIds = computed(
  () =>
    new Set<string>([currentUserId.value, ...(adminIds.value.length <= 1 ? adminIds.value : [])]),
);

// --- Methods ---
/** Empty user with owner role by default. */
function buildEmptyUser(): UserForm {
  return {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    memberSince: DateFormatter.bogotaDate(),
    role: UserRole.USER,
  };
}

/** Closes the form discarding changes. */
function cancelEditing(): void {
  isFormVisible.value = false;
  editingUserId.value = null;
  feedbackMessage.value = '';
}

/** Deletes a user if integrity guards allow it. */
async function deleteUser(userId: string, fullName: string): Promise<void> {
  feedbackMessage.value = '';
  let blockingReason;
  try {
    blockingReason = await userService.blockedFromRemoval(userId, currentUserId.value);
  } catch (error) {
    feedbackMessage.value = HttpClient.apiErrorMessage(error);
    return;
  }
  if (blockingReason) {
    feedbackMessage.value = blockingReason;
    return;
  }
  if (!window.confirm(`Delete user "${fullName}"? This action cannot be undone.`)) {
    return;
  }
  try {
    await userService.remove(userId);
  } catch (error) {
    feedbackMessage.value = HttpClient.apiErrorMessage(error);
    return;
  }
  await reloadFromApi();
}

/** Returns the first validation error, or null if the form is valid. */
async function findValidationError(): Promise<string | null> {
  if (!userForm.fullName.trim()) return 'Full name is required.';
  if (!userForm.email.trim()) return 'Email is required.';
  if (await userService.emailTaken(userForm.email, editingUserId.value ?? undefined)) {
    return 'Another user is already registered with this email.';
  }
  if (!editingUserId.value && !userForm.password) {
    return 'Assign an initial password to the new user.';
  }
  return null;
}

/** Reloads the full user list (no passwords). */
async function reloadFromApi(): Promise<void> {
  try {
    allUsers.value = await userService.findAll();
  } catch (error) {
    feedbackMessage.value = HttpClient.apiErrorMessage(error);
  }
}

/** Validates and saves the user, then reloads the table. */
async function saveUser(): Promise<void> {
  let validationError;
  try {
    validationError = await findValidationError();
  } catch (error) {
    feedbackMessage.value = HttpClient.apiErrorMessage(error);
    return;
  }
  if (validationError) {
    feedbackMessage.value = validationError;
    return;
  }
  try {
    if (editingUserId.value) {
      const { password, ...changes } = userForm;
      await userService.update(editingUserId.value, password ? { ...changes, password } : changes);
    } else {
      await userService.create({ ...userForm });
    }
  } catch (error) {
    feedbackMessage.value = HttpClient.apiErrorMessage(error);
    return;
  }
  cancelEditing();
  await reloadFromApi();
}

/** Opens the empty form to register a new user. */
function startCreating(): void {
  editingUserId.value = null;
  feedbackMessage.value = '';
  Object.assign(userForm, buildEmptyUser());
  isFormVisible.value = true;
}

/** Opens the form loaded with an existing user. */
function startEditing(userId: string): void {
  const existing = allUsers.value.find((user) => user.id === userId);
  if (!existing) return;
  editingUserId.value = existing.id;
  feedbackMessage.value = '';
  Object.assign(userForm, buildEmptyUser(), existing);
  isFormVisible.value = true;
}

/** Toggles role between admin and owner. */
async function toggleRole(userId: string, currentRole: UserRole): Promise<void> {
  feedbackMessage.value = '';
  const admins = allUsers.value.filter((user) => user.role === UserRole.ADMIN).length;
  if (currentRole === UserRole.ADMIN && admins <= 1) {
    feedbackMessage.value = 'You cannot remove the role from the last administrator.';
    return;
  }
  try {
    await userService.update(userId, {
      role: currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN,
    });
  } catch (error) {
    feedbackMessage.value = HttpClient.apiErrorMessage(error);
    return;
  }
  await reloadFromApi();
}

// --- Lifecycle ---
onMounted(() => void reloadFromApi());
</script>

<template>
  <section>
    <PageHeader
      title="User administration"
      :subtitle="`${allUsers.length} account(s) registered · admin only`"
    >
      <template #actions>
        <button
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
          type="button"
          @click="startCreating"
        >
          + New user
        </button>
      </template>
    </PageHeader>

    <form
      v-if="isFormVisible"
      class="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      @submit.prevent="saveUser"
    >
      <h2 class="font-brand col-span-full m-0 text-lg font-semibold text-ink">
        {{ editingUserId ? 'Edit user' : 'New user' }}
      </h2>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Full name</span>
        <input v-model="userForm.fullName" class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Email</span>
        <input v-model="userForm.email" type="email" class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Password</span>
        <input
          v-model="userForm.password"
          type="password"
          autocomplete="new-password"
          class="field-input"
        />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Phone</span>
        <input v-model="userForm.phone" class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">City</span>
        <input v-model="userForm.city" class="field-input" />
      </label>
      <SelectField v-model="userForm.role" label="Role" :options="roleFilterOptions" />

      <div class="col-span-full mt-2 flex gap-3 border-t border-slate-200 pt-5">
        <button
          class="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
          type="submit"
        >
          Save
        </button>
        <button
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          type="button"
          @click="cancelEditing"
        >
          Cancel
        </button>
      </div>
    </form>

    <FilterBar>
      <FilterSelect v-model="selectedRole" label="Role" :options="roleFilterOptions" />
    </FilterBar>

    <p
      v-if="feedbackMessage"
      aria-live="polite"
      class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {{ feedbackMessage }}
    </p>

    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-sidebar/[0.04]">
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Name
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Email
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Phone
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              City
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Role
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Member since
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in tableRows"
            :key="String(row.id ?? index)"
            class="transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-primary/[0.06]"
          >
            <td class="border-b border-slate-100 px-4 py-3">{{ row.fullName }}</td>
            <td class="border-b border-slate-100 px-4 py-3">{{ row.email }}</td>
            <td class="border-b border-slate-100 px-4 py-3">{{ row.phone }}</td>
            <td class="border-b border-slate-100 px-4 py-3">{{ row.city }}</td>
            <td class="border-b border-slate-100 px-4 py-3">
              <StatusBadge :label="row.roleLabel" :tone="USER_ROLE_TONE[row.role as UserRole]" />
            </td>
            <td
              class="border-b border-slate-100 px-4 py-3 text-right tabular-nums whitespace-nowrap"
            >
              {{ row.memberSince }}
            </td>
            <td class="border-b border-slate-100 px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <button
                  class="text-primary hover:underline"
                  type="button"
                  @click="startEditing(String(row.id))"
                >
                  Edit
                </button>
                <button
                  class="text-primary hover:underline"
                  type="button"
                  @click="toggleRole(String(row.id), row.role as UserRole)"
                >
                  Toggle role
                </button>
                <button
                  v-if="!undeletableIds.has(String(row.id))"
                  class="text-red-600 hover:underline"
                  type="button"
                  @click="deleteUser(String(row.id), String(row.fullName))"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="tableRows.length === 0">
            <td class="px-4 py-12 text-center" colspan="7">
              <p class="m-0 text-sm font-medium text-slate-500">
                {{ selectedRole ? 'No users with that role' : 'No users yet' }}
              </p>
              <p class="mt-1 mb-0 text-sm text-slate-400">
                Create an account with the “New user” button.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
