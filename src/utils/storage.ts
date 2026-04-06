export const Storage = {
    async set(key: string, value: string): Promise<void> {
        localStorage.setItem(key, value);
    },

    async get(key: string): Promise<string | null> {
        return localStorage.getItem(key);
    },

    async remove(key: string): Promise<void> {
        localStorage.removeItem(key);
    },
};
