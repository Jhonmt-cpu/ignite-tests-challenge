import  {CreateConnection}  from "../../../../database";
import { Connection } from "typeorm"
import request from "supertest";
import { app } from "../../../../app";
import { UsersRepository } from "../../repositories/UsersRepository";
import { hash } from "bcryptjs";
import { clearDataBase } from "../../../../tests/utils/clearDatabase";
import authConfig from '../../../../config/auth';
import { sign } from "jsonwebtoken";
import {v4 as uuidV4 } from 'uuid';


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

  it("should be able to show a user profile", async () => {
    await usersRepository.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8)
    })

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "johndoe@test.com",
        password: "123456"
      });

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("id")
  })

  it("should not be able to show a profile of a non existing user", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: uuidV4(),
      expiresIn,
    });

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(response.status).toBe(404)
  })
})
