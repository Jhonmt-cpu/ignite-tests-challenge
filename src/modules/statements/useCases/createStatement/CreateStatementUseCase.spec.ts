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

  it("should be able to create a transfer", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8),
    })

    const receiver = await usersRepositoryInMemory.create({
      name: "Darrell Munoz",
      email: "pise@luzi.mz",
      password: await hash("123456", 8),
    })

    await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 100,
      description: "Test statement",
      type: "deposit" as OperationType
    })

    const transfer = await createStatementUseCase.execute({
      user_id: String(user.id),
      receiver_id: receiver.id,
      amount: 100,
      description: "Test transfer",
      type: "transfer" as OperationType
    })

    expect(transfer).toHaveProperty("id")
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
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8),
    })

    await expect(
      createStatementUseCase.execute({
        user_id: String(user.id),
        amount: 100,
        description: "Test statement",
        type: "withdraw" as OperationType
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

  it("should not be able to transfer an amount higher than the user balance", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8),
    })

    const receiver = await usersRepositoryInMemory.create({
      name: "Darrell Munoz",
      email: "pise@luzi.mz",
      password: await hash("123456", 8),
    })

    await expect(
        createStatementUseCase.execute({
          user_id: String(user.id),
          receiver_id: receiver.id,
          amount: 100,
          description: "Test statement",
          type: "transfer" as OperationType
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

  it("should not be able to transfer to itself", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8),
    })

    await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 100,
      description: "Test statement",
      type: "deposit" as OperationType
    })

    await expect(
        createStatementUseCase.execute({
          user_id: String(user.id),
          receiver_id: user.id,
          amount: 100,
          description: "Test statement",
          type: "transfer" as OperationType
      })
    ).rejects.toBeInstanceOf(CreateStatementError.TransferenceFromUserToItself)
  })

  it("should not be able to transfer to a non existing receiver", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8),
    })

    await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 100,
      description: "Test statement",
      type: "deposit" as OperationType
    })

    await expect(
        createStatementUseCase.execute({
          user_id: String(user.id),
          receiver_id: "Non existing receiver",
          amount: 100,
          description: "Test statement",
          type: "transfer" as OperationType
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })
})
