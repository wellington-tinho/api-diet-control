import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("meals", (table) => {
    table.renameColumn("created_at", "date");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("meals", (table) => {
    table.renameColumn("date", "created_at");
  });
}
