import  { CreateConnection } from "../../../../database";
import { Connection } from "typeorm"
import request from "supertest";
import { app } from "../../../../app";
import { hash } from "bcryptjs";
import { clearDataBase } from "../../../../tests/utils/clearDatabase";
import authConfig from '../../../../config/auth';
import { sign } from "jsonwebtoken";
import {v4 as uuidV4 } from 'uuid';
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { User } from "../../../users/entities/User";


describe("Create User Controller", () => {
  let connection: Connection;
  let usersRepository: UsersRepository;
  let user: User;
  let receiver: User;

  beforeAll(async () => {
    connection = await CreateConnection();

    await clearDataBase(connection)

    await connection.runMigrations()

    usersRepository = new UsersRepository();

    user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8)
    })

    receiver = await usersRepository.create({
      name: "Lucas Keller",
      email: "ave@acujuc.cz",
      password: await hash("123456", 8)
    })
  })

  afterAll(async () => {
    await connection.close();
  })

  it("should be able to create a statement", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "johndoe@test.com",
        password: "123456"
      });

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test statement"
      })
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
  })

  it("should be able to create a transfer statement", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "johndoe@test.com",
        password: "123456"
      });

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test statement"
      })
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${receiver.id}`)
      .send({
        amount: 100,
        description: "Test transfer"
      })
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
  })

  it("should not be able to create a new statement of a non existing user", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: uuidV4(),
      expiresIn,
    });

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test statement"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(404)
  })

  it("should not be able to create a new statement of a non existing user", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: uuidV4(),
      expiresIn,
    });

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test statement"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(404)
  })

  it("should not be able to withdraw an amount higher than the user balance", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "johndoe@test.com",
        password: "123456"
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 101,
        description: "Test statement"
      })
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(response.status).toBe(400)
  })

  it("should not be able to transfer an amount higher than the user balance", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "johndoe@test.com",
        password: "123456"
      });

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${receiver.id}`)
      .send({
        amount: 101,
        description: "Test transfer"
      })
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(response.status).toBe(400)
  })

  it("should not be able to transfer to the same user", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "johndoe@test.com",
        password: "123456"
      });

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${user.id}`)
      .send({
        amount: 10,
        description: "Test transfer"
      })
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(response.status).toBe(400)
  })

  it("should not be able to transfer to a non existing user", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "johndoe@test.com",
        password: "123456"
      });

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${uuidV4()}`)
      .send({
        amount: 10,
        description: "Test transfer"
      })
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(response.status).toBe(404);
  })
})
