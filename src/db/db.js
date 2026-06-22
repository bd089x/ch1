import Dexie from "dexie"

export const db = new Dexie("chalk")

db.version(1).stores({
  notes: "++id,title,content,updatedAt"
})
