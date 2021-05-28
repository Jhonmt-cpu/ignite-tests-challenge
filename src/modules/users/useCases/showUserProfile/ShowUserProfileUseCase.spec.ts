import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show User Profile", () => {
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let usersRepositoryInMemory: InMemoryUsersRepository;

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory)
  })

  it("should be able to show a user profile", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@test.com",
      password: await hash("123456", 8),
    })

    const userProfile = await showUserProfileUseCase.execute(String(user.id))

    expect(userProfile).toEqual(user)
  })

  it("should not be able to show a non user profile", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("Non existing user")
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
