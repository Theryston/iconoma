const db = new Map<string, Map<number, any>>();

export function table<T>(tableName: string = "default") {
  let data = db.get(tableName);

  if (!data) {
    data = new Map<number, any>();
    db.set(tableName, data);
  }

  return {
    create: (value: T) => {
      const size = data.size;
      const id = size + 1;
      data.set(id, value);
      return id;
    },
    get: (id: number): T | undefined => data.get(id),
    update: (id: number, value: T) => data.set(id, value),
    delete: (id: number) => data.delete(id),
    getAll: (): (T & { id: number })[] =>
      Array.from(data.values()).map((value, id) => ({ ...value, id })),
  };
}

export type Table<T> = ReturnType<typeof table<T>>;
