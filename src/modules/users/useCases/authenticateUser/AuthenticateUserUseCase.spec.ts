import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("Authenticate User", () => {
  let usersRepositoryInMemory: InMemoryUsersRepository;
  let authenticateUserUseCase: AuthenticateUserUseCase;

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory)
  })

  it("should be able to authenticate a user", async () => {
    await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8),
    })

    const authenticateUser = await authenticateUserUseCase.execute({
      email: "johndoe@test.com",
      password: "123456"
    })

    expect(authenticateUser).toHaveProperty("token")
  })

  it("should not be able to authenticate a now existing user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "johndoe@test.com",
        password: "123456"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("should not be able to authenticate a user with wrong password", async () => {
    expect(async () => {
      await usersRepositoryInMemory.create({
        name: "John Doe",
        email: "johndoe@test.com",
        password: await hash("123456", 8),
      })

      await authenticateUserUseCase.execute({
        email: "johndoe@test.com",
        password: "Wrong Password"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
