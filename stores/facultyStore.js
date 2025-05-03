import { defineStore } from 'pinia';

export const useFacultyStore = defineStore('faculty', {
  state: () => ({
    facultyId: 'default',
  }),
  actions: {
    setFacultyId(id) {
      this.facultyId = id;
    }
  },
});