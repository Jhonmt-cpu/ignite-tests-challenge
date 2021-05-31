import  {CreateConnection}  from "../../../../database";
import { Connection } from "typeorm"
import request from "supertest";
import { app } from "../../../../app";
import { clearDataBase } from "../../../../tests/utils/clearDatabase";


describe("Create User Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await CreateConnection();

    await clearDataBase(connection)

    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.close();
  })

  it("should be able to create a new user", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "John Doe",
        email: "johndoe@test.com",
        password: "123456"
      });

    expect(response.status).toBe(201)
  })

  it("should not be able to create a new user with existing email", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "John Doe",
        email: "johndoe@test.com",
        password: "123456"
      });

    expect(response.status).toBe(400)
  })
})
