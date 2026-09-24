<template>
  <header class="bg-gradient-to-r primary-bg text-white px-6 py-4 shadow-md flex justify-between items-center">
    <div class="flex items-center gap-4">
      <!-- Emit toggle event -->
      <button @click="$emit('toggle')" class="text-white text-xl focus:outline-none">
        <i class="fas fa-bars"></i>
      </button>
      <h2 class="text-2xl font-semibold topbar-title">Dashboard</h2>
    </div>
    <div class="relative">
    <div
      class="flex items-center gap-3 cursor-pointer"
      @click="dropdownOpen = !dropdownOpen"
    >
      <span class="text-sm">{{ authStore.user?.username || 'Guest' }}</span>
      <img
        class="w-9 h-9 rounded-full ring-2 ring-white"
        :src="authStore.user?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'"
        :alt="authStore.user?.username || 'User Avatar'"
      />
    </div>

    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded shadow-lg z-50"
    >
      <a href="#" @click.prevent="view" class="block px-4 py-2 hover:bg-gray-100">View Profile</a>
      <!-- <a href="#" @click.prevent="editTeacher" class="block px-4 py-2 hover:bg-gray-100">Edit Profile</a> -->
    </div>
  </div>
  </header>
  <ModalComponent
        v-if="modal.view"
        :show="modal.view"
        title="Profile Details"
        @close="closeModal"
    >
        <div class="space-y-6">
            <!-- Profile Header -->
            <div class="flex flex-col sm:flex-row items-center sm:items-start sm:gap-6 border-b pb-5">
                <img
                    :src="authStore.user?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'"
                    alt="Teacher Avatar"
                    class="w-28 h-28 rounded-full object-cover border shadow-sm bg-gray-50"
                />
                <div class="text-center sm:text-left mt-3 sm:mt-0">
                    <h2 class="text-xl font-semibold text-gray-800">
                        {{ authStore.user?.complete_name || 'Unnamed' }}
                    </h2>
                    <p class="text-sm text-gray-500">{{ authStore.user?.email || 'No email provided' }}</p>
                    <span
                        :class="[
                            'inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full',
                            authStore.user?.status == '1'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                        ]"
                    >
                        {{ authStore.user?.status == '1' ? 'Verified' : 'Pending' }}
                    </span>
                </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 text-gray-700">
                <div>
                    <p class="text-sm font-semibold text-gray-600">Birthdate</p>
                    <p class="mt-1 text-gray-800">
                        {{ authStore.user?.birthdate || 'Not provided' }}
                    </p>
                </div>
                <div>
                    <p class="text-sm font-semibold text-gray-600">Teacher ID</p>
                    <p class="mt-1 text-gray-800">
                        #{{ authStore.user?.id }}
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div class="pt-4 border-t text-right">
                <button
                    class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
                    @click="closeModal"
                >
                    Close
                </button>
            </div>
        </div>
    </ModalComponent>
  <ModalComponent
        v-if="modal.edit"
        :show="modal.edit"
        title="Edit Profile"
        @close="modal.edit = false"
        :showActions="true"
        :actions="[
            {
                label: 'Update',
                type: 'confirm',
                onClick: updateProfile
            },
            { label: 'Cancel', onClick: closeModal },
        ]"
    > 
     <form class="space-y-4">
            <!-- Avatar Preview -->
            <div class="flex flex-col items-center space-y-2">
                <div class="w-28 h-28 rounded-full border-2 border-gray-300 overflow-hidden shadow-sm bg-gray-50">
                    <img
                        v-if="avatarPreview"
                        :src="avatarPreview"
                        alt="Avatar Preview"
                        class="w-full h-full object-cover"
                    />
                    <div
                        v-else
                        class="flex items-center justify-center w-full h-full text-gray-400 text-sm"
                    >
                        No Image
                    </div>
                </div>
                <label class="cursor-pointer text-blue-600 hover:underline text-sm font-medium">
                    <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleAvatar"
                    />
                    Choose Avatar
                </label>
            </div>

            <!-- Inputs -->
            <div class="grid grid-cols-1 gap-3 mt-3">
                <input
                    v-model="form.teacher_name"
                    class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Full Name"
                />
                <input
                    v-model="form.username"
                    class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Username"
                />
                <input
                    v-model="form.password"
                    type="text"
                    class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Password"
                />
            </div>
        </form>
        
    </ModalComponent>
</template>
 <script setup>
    import { ref } from 'vue';
    import { useAuthStore } from '@/stores/useAuthStore';
    import ModalComponent from "@/components/ModalComponent.vue";
    import { useTeacherStore } from "@/stores/teacherStore";
    const authStore = useAuthStore();
    const dropdownOpen = ref(false);
    const modal = ref({
        view: false,
        edit: false
    });

    const form = ref({
        teacher_name: authStore.user?.complete_name || '',
        username: authStore.user?.username || '',
        password: ''
    });

const teacherStore = useTeacherStore();

    const avatarPreview = ref(null);

function handleAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        form.value.avatar = file;
        avatarPreview.value = URL.createObjectURL(file);
    }
}

    const view = () => {
      modal.value.view = true;
      dropdownOpen.value = false;
    };

    const closeModal = () => (modal.value = { view: false, edit: false });

    const editTeacher = () => {
      dropdownOpen.value = false;
      modal.value.edit = true;
    };

    const updateProfile = async () => {
        const formData = new FormData();
        formData.append("teacher_id", authStore.user?.id);
        formData.append('teacher_name', form.value.teacher_name);
        formData.append('username', form.value.username);
        if (form.value.password) {
            formData.append('password', form.value.password);
        }
        if (form.value.avatar) {
            formData.append('avatar', form.value.avatar);
        }

        try {
           const res = await teacherStore.updateTeacher(formData);
           console.log(res);
            alert('Profile updated successfully!');
            closeModal();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

</script>
