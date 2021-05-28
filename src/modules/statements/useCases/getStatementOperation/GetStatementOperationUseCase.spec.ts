import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../createStatement/CreateStatementController";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe("Create Statement", () => {
  let getStatementOperationUseCase: GetStatementOperationUseCase;
  let statementsRepositoryInMemory: InMemoryStatementsRepository;
  let usersRepositoryInMemory: InMemoryUsersRepository;

  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
  })

  it("should be able to get user statement operation", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8),
    })

    const statement = await statementsRepositoryInMemory.create({
      user_id: String(user.id),
      amount: 100,
      description: "Test statement",
      type: "deposit" as OperationType
    })

    const statementOperation = await getStatementOperationUseCase.execute({user_id: String(user.id), statement_id: String(statement.id)})

    expect(statementOperation).toEqual(statement)
  })

  it("should not be able to get non existing user statement operation", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({user_id: "Non existing user", statement_id: "Non existing statement"})
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should not be able to get non existing statement operation", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8),
    })

    expect(async () => {
      await getStatementOperationUseCase.execute({user_id: String(user.id), statement_id: "Non existing statement"})
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
