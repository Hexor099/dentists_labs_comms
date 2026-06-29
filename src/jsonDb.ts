import { db } from './db/index';
import { appState } from './db/schema';
import { eq } from 'drizzle-orm';

export async function createJsonDb<T>(id: string, initialData: T): Promise<{ data: T; save: () => Promise<void> }> {
  let data: T;

  try {
    const result = await db.select().from(appState).where(eq(appState.id, id)).limit(1);
    if (result && result.length > 0) {
      data = JSON.parse(result[0].data) as T;
    } else {
      data = initialData;
      await db.insert(appState).values({
        id,
        data: JSON.stringify(data)
      });
    }
  } catch (err) {
    console.error("Error loading app_state from DB:", err);
    data = initialData;
  }

  return {
    data,
    save: async () => {
      try {
        await db.update(appState).set({ data: JSON.stringify(data) }).where(eq(appState.id, id));
      } catch (err) {
        console.error("Error saving app_state to DB:", err);
      }
    }
  };
}
