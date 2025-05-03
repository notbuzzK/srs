import { defineStore } from 'pinia';

export const useNameStore = defineStore('name', {
  state: () => ({
    name: 'default',
  }),
  actions: {
    setName(name) {
      this.name = name;
    }
  },
});