import { Connection } from "typeorm";

export async function clearDataBase(connection: Connection): Promise<void> {
  await connection.query("DROP TABLE IF EXISTS statements");
  await connection.query("DROP TABLE IF EXISTS users");
  await connection.query("DROP TABLE IF EXISTS migrations");
}
