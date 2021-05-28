import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

describe("Create User", () => {
  let createUserUseCase: CreateUserUseCase;
  let usersRepositoryInMemory: InMemoryUsersRepository;

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
  })

  it("should be able to create a user", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@test.com",
      password: "123456"
    })

    expect(user).toHaveProperty("id")
  })

  it("should not be able to create a new user with existing email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@test.com",
        password: "123456"
      })

      await createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@test.com",
        password: "123456"
      })
    }).rejects.toBeInstanceOf(CreateUserError);
  })
})
