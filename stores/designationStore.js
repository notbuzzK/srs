import { defineStore } from 'pinia';

export const useDesignationStore = defineStore('designation', {
  state: () => ({
    designation: 'default',
  }),
  actions: {
    setDesignation(name) {
      this.name = name;
    }
  },
});