import  {CreateConnection}  from "../../../../database";
import { Connection } from "typeorm"
import request from "supertest";
import { app } from "../../../../app";
import { UsersRepository } from "../../repositories/UsersRepository";
import { hash } from "bcryptjs";
import { clearDataBase } from "../../../../tests/utils/clearDatabase";


describe("Authenticate User Controller", () => {
  let connection: Connection;
  let usersRepository: UsersRepository;

  beforeAll(async () => {
    connection = await CreateConnection();

    await clearDataBase(connection)

    await connection.runMigrations()
  })

  beforeEach(() => {
    usersRepository = new UsersRepository()
  })

  afterAll(async () => {
    await connection.close();
  })

  it("should be able to authenticate a user", async () => {
    await usersRepository.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8)
    })

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "johndoe@test.com",
        password: "123456"
      });

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("token")
  })

  it("should not be able to authenticate a non existing user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "nonexistinguser@test.com",
        password: "123456"
      });

    expect(response.status).toBe(401)
  })

  it("should not be able to authenticate a user with wrong password", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "johndoe@test.com",
        password: "wrongPassword"
      });

    expect(response.status).toBe(401)
  })
})
