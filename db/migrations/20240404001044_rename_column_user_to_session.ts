import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("meals", (table) => {
    table.renameColumn("user_id", "session_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("meals", (table) => {
    table.renameColumn("session_id", "user_id");
  });
}
