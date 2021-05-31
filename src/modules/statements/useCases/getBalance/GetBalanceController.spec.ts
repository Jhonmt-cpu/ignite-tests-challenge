import  {CreateConnection}  from "../../../../database";
import { Connection } from "typeorm"
import request from "supertest";
import { app } from "../../../../app";
import { hash } from "bcryptjs";
import { clearDataBase } from "../../../../tests/utils/clearDatabase";
import authConfig from '../../../../config/auth';
import { sign } from "jsonwebtoken";
import {v4 as uuidV4 } from 'uuid';
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { StatementsRepository } from "../../repositories/StatementsRepository";
import { OperationType } from "../createStatement/CreateStatementController";


describe("Get Balance Controller", () => {
  let connection: Connection;
  let usersRepository: UsersRepository;
  let statementsRepository: StatementsRepository;

  beforeAll(async () => {
    connection = await CreateConnection();

    await clearDataBase(connection)

    await connection.runMigrations()
  })

  beforeEach(() => {
    usersRepository = new UsersRepository()
    statementsRepository = new StatementsRepository()
  })

  afterAll(async () => {
    await connection.close();
  })

  it("should be able to create a statement", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8)
    })

    await statementsRepository.create({
      amount: 100,
      description: "Test description",
      user_id: String(user.id),
      type: "deposit" as OperationType
    })

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "johndoe@test.com",
        password: "123456"
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(response.status).toBe(200)
    expect(response.body.balance).toBe(100)
    expect(response.body.statement.length).toBe(1)
  })

  it("should not be able to get a non exiting user balance", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: uuidV4(),
      expiresIn,
    });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(404)
  })
})
