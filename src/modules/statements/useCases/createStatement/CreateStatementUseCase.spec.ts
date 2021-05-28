import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "./CreateStatementController";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

describe("Create Statement", () => {
  let createStatementUseCase: CreateStatementUseCase;
  let statementsRepositoryInMemory: InMemoryStatementsRepository;
  let usersRepositoryInMemory: InMemoryUsersRepository;

  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory,statementsRepositoryInMemory)
  })

  it("should be able to create a statement", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8),
    })

    const statement = await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 100,
      description: "Test statement",
      type: "deposit" as OperationType
    })

    expect(statement).toHaveProperty("id")
  })

  it("should not be able to create a statement for a non existing user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "Non existing user",
        amount: 100,
        description: "Test statement",
        type: "deposit" as OperationType
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should not be able to withdraw an amount higher than the user balance", async () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        name: "John Doe",
        email: "johndoe@test.com",
        password: await hash("123456", 8),
      })

      await createStatementUseCase.execute({
        user_id: String(user.id),
        amount: 100,
        description: "Test statement",
        type: "withdraw" as OperationType
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
