import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class addReceiverIdToStatements1625434624662 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.addColumn("statements", new TableColumn({
        name: "receiver_id",
        type: "uuid",
        isNullable: true
      }))

      await queryRunner.createForeignKey("statements", new TableForeignKey({
        name: "FKStatementsReceiverUsers",
        columnNames: ["receiver_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey("statements", "FKStatementsReceiverUsers");

      await queryRunner.dropColumn("statements", "receiver_id");
    }

}
