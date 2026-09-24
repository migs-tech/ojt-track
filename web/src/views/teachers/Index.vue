<template>
    <LoadingScreen :show="loading" />
    <div class="relative">
        <div v-if="!loading" class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <!-- Enhanced Header -->
            <div class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">Teacher Management</h3>
                        <p class="text-sm text-gray-600 mt-1">Manage and organize your teaching staff</p>
                    </div>
                    <button
                        class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                        @click="openAddModal"
                    >
                        <i class="fas fa-plus"></i>
                        <span>Add Teacher</span>
                    </button>
                </div>
            </div>

            <!-- Enhanced Table -->
            <div class="overflow-x-auto min-h-[400px]">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Teacher</th>
                            <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Birth Date</th>
                            <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr
                            v-for="(teacher, index) in teachers"
                            :key="index"
                            class="hover:bg-blue-50 transition-colors duration-150"
                        >
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-sm">
                                        {{ teacher.teacher_name.charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <div class="font-semibold text-gray-900">{{ teacher.teacher_name }}</div>
                                        <div class="text-xs text-gray-500">ID: #{{ teacher.teacher_id }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-gray-700">{{ teacher.birthdate }}</td>
                            <td class="px-6 py-4">
                                <span
                                    v-if="teacher.status == '1'"
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full border border-green-200"
                                >
                                    <i class="fas fa-check-circle"></i>
                                    Verified
                                </span>
                                <span
                                    v-else
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full border border-amber-200"
                                >
                                    <i class="fas fa-clock"></i>
                                    Pending
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right relative" data-row-menu>
                                <button
                                    @click="toggleMenu(index)"
                                    class="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-150 text-gray-600 hover:text-gray-900"
                                >
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <transition name="dropdown">
                                <div
                                    v-if="activeMenu === index"
                                    class="absolute right-8 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden"
                                >
                                    <button class="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors duration-150 flex items-center gap-2" @click="viewTeacher(teacher)">
                                        <i class="fas fa-eye text-blue-600"></i>
                                        View Details
                                    </button>
                                    <button class="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors duration-150 flex items-center gap-2" @click="editTeacher(teacher)">
                                        <i class="fas fa-edit text-gray-600"></i>
                                        Edit
                                    </button>
                                    <button v-if="teacher.status == '0'" class="w-full text-left px-4 py-3 text-sm hover:bg-green-50 transition-colors duration-150 flex items-center gap-2 text-green-600" @click="verifyTeacher(teacher)">
                                        <i class="fas fa-check-circle"></i>
                                        Verify
                                    </button>
                                    <div class="border-t border-gray-100"></div>
                                    <button class="w-full text-left px-4 py-3 text-sm hover:bg-red-50 transition-colors duration-150 flex items-center gap-2 text-red-600" @click="deleteTeacher(teacher)">
                                        <i class="fas fa-trash"></i>
                                        Delete
                                    </button>
                                </div>
                                </transition>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Enhanced Pagination -->
            <div
                v-if="pagination.totalPages > 1"
                class="flex justify-between items-center px-6 py-4 border-t bg-gray-50 text-sm"
            >
                <span class="text-gray-600 font-medium">
                    <span class="text-gray-900">{{ pagination.page }}</span> of <span class="text-gray-900">{{ pagination.totalPages }}</span> — 
                    <span class="text-gray-900">{{ pagination.total }}</span> total
                </span>
                <div class="flex gap-2">
                    <button 
                        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700" 
                        :disabled="pagination.page === 1" 
                        @click="changePage(pagination.page - 1)"
                    >
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button 
                        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700" 
                        :disabled="pagination.page === pagination.totalPages" 
                        @click="changePage(pagination.page + 1)"
                    >
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Enhanced View Modal -->
    <ModalComponent
        v-if="modal.view"
        :show="modal.view"
        title="Teacher Profile"
        @close="closeModal"
    >
        <div class="space-y-6">
            <!-- Enhanced Profile Header -->
            <div class="flex flex-col sm:flex-row items-center sm:items-start sm:gap-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <div class="relative">
                    <img
                        :src="selectedTeacher.avatar_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'"
                        alt="Teacher Avatar"
                        class="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div class="absolute bottom-0 right-0 w-7 h-7 bg-green-500 rounded-full border-4 border-white"></div>
                </div>
                <div class="text-center sm:text-left mt-3 sm:mt-0 flex-1">
                    <h2 class="text-2xl font-bold text-gray-800">
                        {{ selectedTeacher.teacher_name || 'Unnamed' }}
                    </h2>
                    <p class="text-sm text-gray-600 mt-1 flex items-center justify-center sm:justify-start gap-2">
                        <i class="fas fa-envelope text-gray-400"></i>
                        {{ selectedTeacher.email || 'No email provided' }}
                    </p>
                    <span
                        :class="[
                            'inline-flex items-center gap-1.5 mt-3 px-4 py-2 text-xs font-semibold rounded-full',
                            selectedTeacher.status == '1'
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                        ]"
                    >
                        <i :class="selectedTeacher.status == '1' ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
                        {{ selectedTeacher.status == '1' ? 'Verified Account' : 'Pending Verification' }}
                    </span>
                </div>
            </div>

            <!-- Enhanced Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                        <i class="fas fa-birthday-cake text-blue-500"></i>
                        Birthdate
                    </p>
                    <p class="mt-2 text-gray-900 font-semibold">
                        {{ selectedTeacher.birthdate || 'Not provided' }}
                    </p>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                        <i class="fas fa-calendar-plus text-green-500"></i>
                        Date Created
                    </p>
                    <p class="mt-2 text-gray-900 font-semibold">
                        {{ formatDate(selectedTeacher.created) }}
                    </p>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                        <i class="fas fa-clock text-purple-500"></i>
                        Last Modified
                    </p>
                    <p class="mt-2 text-gray-900 font-semibold">
                        {{ formatDate(selectedTeacher.modified) }}
                    </p>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                        <i class="fas fa-id-badge text-indigo-500"></i>
                        Teacher ID
                    </p>
                    <p class="mt-2 text-gray-900 font-semibold">
                        #{{ selectedTeacher.teacher_id }}
                    </p>
                </div>
            </div>

            <!-- Enhanced Footer -->
            <div class="pt-4 border-t text-right">
                <button
                    class="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl text-gray-700 font-semibold transition-all duration-150"
                    @click="closeModal"
                >
                    Close
                </button>
            </div>
        </div>
    </ModalComponent>

    <!-- Enhanced Add/Edit Modal -->
    <ModalComponent
        v-if="modal.add || modal.edit"
        :show="modal.add || modal.edit"
        :title="modal.add ? 'Add New Teacher' : 'Edit Teacher'"
        :showActions="true"
        :actions="[
            {
                label: modal.add ? 'Save Teacher' : 'Update Teacher',
                type: 'confirm',
                onClick: modal.add ? saveTeacher : saveEditTeacher
            },
            { label: 'Cancel', onClick: closeModal },
        ]"
        @close="closeModal"
    >
        <form class="space-y-5">
            <!-- Enhanced Avatar Section -->
            <div class="flex flex-col items-center space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <div class="relative">
                    <div class="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-xl bg-gray-100">
                        <img
                            v-if="avatarPreview"
                            :src="avatarPreview"
                            alt="Avatar Preview"
                            class="w-full h-full object-cover"
                        />
                        <div
                            v-else
                            class="flex flex-col items-center justify-center w-full h-full text-gray-400"
                        >
                            <i class="fas fa-user text-3xl mb-2"></i>
                            <span class="text-xs">No Image</span>
                        </div>
                    </div>
                    <div class="absolute bottom-0 right-0 bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
                        <i class="fas fa-camera text-sm"></i>
                    </div>
                </div>
                <label class="cursor-pointer bg-white text-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-50 font-semibold text-sm transition-all duration-150 border border-blue-200 shadow-sm">
                    <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleAvatar"
                    />
                    <i class="fas fa-upload mr-2"></i>
                    Choose Avatar
                </label>
            </div>

            <!-- Enhanced Input Fields -->
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-user text-gray-400 mr-2"></i>
                        Full Name
                    </label>
                    <input
                        v-model="form.teacher_name"
                        class="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-150"
                        placeholder="Enter full name"
                    />
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-at text-gray-400 mr-2"></i>
                        Username
                    </label>
                    <input
                        v-model="form.username"
                        class="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-150"
                        placeholder="Enter username"
                    />
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-lock text-gray-400 mr-2"></i>
                        Password
                    </label>
                    <input
                        v-model="form.password"
                        type="text"
                        class="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-150"
                        placeholder="Enter password"
                    />
                </div>
            </div>
        </form>
    </ModalComponent>

    <!-- Enhanced Delete Modal -->
    <ModalComponent
        v-if="modal.delete"
        :show="modal.delete"
        title="Delete Teacher"
        :showActions="true"
        :actions="[
            { label: 'Delete', type: 'danger', onClick: confirmDelete },
            { label: 'Cancel', onClick: closeModal },
        ]"
        @close="closeModal"
    >
        <div class="text-center py-4">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <p class="text-gray-700">Are you sure you want to delete</p>
            <p class="font-bold text-gray-900 text-lg mt-1">{{ selectedTeacher.teacher_name }}</p>
            <p class="text-sm text-gray-500 mt-3">This action cannot be undone.</p>
        </div>
    </ModalComponent>

    <!-- Enhanced Verify Modal -->
    <ModalComponent
        v-if="modal.verify"
        :show="modal.verify"
        title="Verify Teacher"
        :showActions="true"
        :actions="[
            { label: 'Verify', type: 'confirm', onClick: confirmVerify },
            { label: 'Cancel', onClick: closeModal },
        ]"
        @close="closeModal"
    >
        <div class="text-center py-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check-circle text-green-600 text-2xl"></i>
            </div>
            <p class="text-gray-700">Verify account for</p>
            <p class="font-bold text-gray-900 text-lg mt-1">{{ selectedTeacher.teacher_name }}</p>
        </div>
    </ModalComponent>
    <StatusModal :show="statusUpdating" :message="messageStatus" />
</template>

<script setup>
import { toast } from "@/ui/feedback";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import ModalComponent from "@/components/ModalComponent.vue";
import LoadingScreen from "@/components/LoadingScreen.vue";
import { useTeacherStore } from "@/stores/teacherStore";
import StatusModal from "@/components/StatusModal.vue";


const teacherStore = useTeacherStore();
const loading = ref(false);
const teachers = computed(() => teacherStore.teachers);
const pagination = computed(() => teacherStore.pagination);
const statusUpdating = ref(false);
const messageStatus = ref("");

const activeMenu = ref(null);
const modal = ref({ view: false, edit: false, delete: false, verify: false, add: false });
const selectedTeacher = ref({});
const form = ref({
    teacher_name: '',
    username: '',
    password: '',
    avatar: null
});

const avatarPreview = ref(null);

function handleAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        form.value.avatar = file;
        avatarPreview.value = URL.createObjectURL(file);
    }
}

const toggleMenu = (i) => (activeMenu.value = activeMenu.value === i ? null : i);
const closeModal = () => (modal.value = { view: false, edit: false, delete: false, verify: false, add: false });

// Start the add form empty (it may still hold the last teacher that was edited)
const openAddModal = () => {
    form.value = { teacher_name: '', username: '', password: '', avatar: null };
    avatarPreview.value = null;
    modal.value.add = true;
};

// Close the row menu when clicking outside it
const onDocClick = (e) => {
    if (activeMenu.value !== null && !e.target.closest('[data-row-menu]')) activeMenu.value = null;
};
onMounted(() => document.addEventListener('click', onDocClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));

const viewTeacher = (t) => {
    selectedTeacher.value = t;
    modal.value.view = true;
    activeMenu.value = null;
};

const editTeacher = (t) => {
    selectedTeacher.value = t;
    form.value = { ...t, password: '', avatar: null };
    avatarPreview.value = t.avatar_url || null;
    modal.value.edit = true;
    activeMenu.value = null;
};

const deleteTeacher = (t) => {
    selectedTeacher.value = t;
    modal.value.delete = true;
    activeMenu.value = null;
};

const verifyTeacher = (t) => {
    selectedTeacher.value = t;
    modal.value.verify = true;
    activeMenu.value = null;
};

const saveTeacher = async () => {
    if (!form.value.teacher_name?.trim() || !form.value.username?.trim() || !form.value.password) {
        toast('Please fill in the name, username and password.', 'error');
        return;
    }
    try {
        const fd = new FormData();
        fd.append("teacher_name", form.value.teacher_name);
        fd.append("username", form.value.username);
        fd.append("password", form.value.password);
        if (form.value.avatar) {
            fd.append("avatar", form.value.avatar);
        }
        closeModal();
        statusUpdating.value = true;
        messageStatus.value = "Saving teacher, please wait...";
        const res = await teacherStore.addTeacher(fd);
        if (res.success) {
            toast('Teacher saved successfully.', "success");
        } else {
            toast(res.message || 'Failed to save teacher.', "error");
        }
    } catch (err) {
        console.error("Error saving teacher:", err);
    }
    statusUpdating.value = false;
    messageStatus.value = "";
};

const saveEditTeacher = async () => {
    const formData = new FormData();
    formData.append("teacher_id", selectedTeacher.value.teacher_id);
    formData.append("teacher_name", form.value.teacher_name);
    formData.append("username", form.value.username);
    if (form.value.password) {
        formData.append("password", form.value.password);
    }
    if (form.value.avatar) {
        formData.append("avatar", form.value.avatar);
    }
    closeModal();
    statusUpdating.value = true;
    messageStatus.value = "Updating teacher, please wait...";
    const res = await teacherStore.updateTeacher(formData);
    if (res.success) {
        toast('Teacher updated successfully.', "success");
    } else {
        toast(res.message || 'Failed to update teacher.', "error");
    }
    statusUpdating.value = false;
    messageStatus.value = "";
};

const confirmDelete = async () => {
    closeModal();
    statusUpdating.value = true;
    messageStatus.value = "Deleting teacher, please wait...";
    const res = await teacherStore.deleteTeacher(selectedTeacher.value.teacher_id);
    if (res.success) {
        toast('Teacher deleted successfully.', "success");
    } else {
        toast(res.message || 'Failed to delete teacher.', "error");
    }
    statusUpdating.value = false;
    messageStatus.value = "";
};

const confirmVerify = async () => {
    closeModal();
    statusUpdating.value = true;
    messageStatus.value = "Verifying teacher, please wait...";
    const res = await teacherStore.verifyTeacherAccount(selectedTeacher.value.teacher_id);
    if (res.success) {
        toast('Teacher verified successfully.', "success");
    } else {
        toast(res.message || 'Failed to verify teacher.', "error");
    }
    statusUpdating.value = false;
};

const changePage = (p) => fetchData(p);

const fetchData = async (p = 1) => {
    loading.value = true;
    await teacherStore.fetchTeachers(p);
    loading.value = false;
};

onMounted(fetchData);

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
</script>