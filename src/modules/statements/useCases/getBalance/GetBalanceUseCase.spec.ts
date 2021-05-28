import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../createStatement/CreateStatementController";
import { GetBalanceError } from "./GetBalanceError";

import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("Create Statement", () => {
  let getBalanceUseCase: GetBalanceUseCase;
  let statementsRepositoryInMemory: InMemoryStatementsRepository;
  let usersRepositoryInMemory: InMemoryUsersRepository;

  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory,usersRepositoryInMemory)
  })

  it("should be able to get user balance", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8),
    })

    await statementsRepositoryInMemory.create({
      user_id: String(user.id),
      amount: 100,
      description: "Test statement",
      type: "deposit" as OperationType
    })

    await statementsRepositoryInMemory.create({
      user_id: String(user.id),
      amount: 40,
      description: "Test statement",
      type: "withdraw" as OperationType
    })

    const userBalance = await getBalanceUseCase.execute({user_id: String(user.id)})

    expect(userBalance.balance).toBe(60)
    expect(userBalance.statement.length).toBe(2)
  })

  it("should not be able to get a non exiting user balance", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({user_id: "Non existing user"})
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
