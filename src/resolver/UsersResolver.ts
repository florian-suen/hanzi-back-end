import {
  Arg,
  Query,
  Resolver,
  Ctx,
  Mutation,
  createUnionType,
  FieldResolver,
  Root,
} from "type-graphql";
import { validator } from "../utility/validator";
import Context from "../types/context";
import { Users } from "../entities/Users";
import { hash, verify } from "argon2";
import * as TE from "fp-ts/lib/TaskEither";
import * as T from "fp-ts/lib/Task";
import { flow, pipe, identity } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import {
  RegInputs,
  LoginInputs,
  EmailInput,
  PasswordInput,
} from "./input-types/UsersInputs";
import { DatabaseError, ValidationErrors } from "./object-types/UsersObject";
import { sendEmail } from "../utility/sendEmail";
import { v4 } from "uuid";
import { NodeError } from "../types/node-error";
import { Flashcards } from "../entities/Flashcards";
import { FlashcardWords } from "../entities/FlashCardWords";
import { FlashcardSentences } from "../entities/FlashCardSentences";
import { Characters } from "../entities/Characters";
import { Words } from "../entities/Words";
import { Sentences } from "./../entities/Sentences";
type Options = "characters" | "words" | "sentences";

export const flashResponse = createUnionType({
  name: "flashResponse",
  types: () => [Flashcards, FlashcardWords, FlashcardSentences] as const,
  resolveType: (val) => {
    if ("characters" in val) {
      return Flashcards;
    }
    if ("words" in val) {
      return FlashcardWords;
    }
    if ("sentences" in val) {
      return FlashcardSentences;
    }
    return undefined;
  },
});

const regResponse = createUnionType({
  name: "regResponse",
  types: () => [Users, DatabaseError, ValidationErrors] as const,
  resolveType: (val) => {
    if ("responses" in val) {
      return ValidationErrors;
    }
    if ("type" in val) {
      return DatabaseError;
    }
    if ("username" in val) {
      return Users;
    }
    return undefined;
  },
});

@Resolver((of) => Users)
export class UserResolver {
  @FieldResolver(() => [flashResponse], { nullable: false })
  async flashcard(@Root() users: Users) {
    const charResponse = await Flashcards.createQueryBuilder("flashcard")
      .leftJoinAndSelect("flashcard.characters", "characters")
      .where("flashcard.usersId = :id", { id: users.id })
      .getMany();
    const wordResponse = await FlashcardWords.createQueryBuilder("flashcard")
      .leftJoinAndSelect("flashcard.words", "words")
      .where("flashcard.usersId = :id", { id: users.id })
      .getMany();
    const sentenceResponse = await FlashcardSentences.createQueryBuilder(
      "flashcard"
    )
      .leftJoinAndSelect("flashcard.sentences", "sentence")
      .where("flashcard.usersId = :id", { id: users.id })
      .getMany();
    return [...charResponse, ...wordResponse, ...sentenceResponse];
  }

  @Mutation((returns) => Boolean)
  async addFavourite(
    @Arg("id") id: number,
    @Arg("options") options: Options,
    @Ctx() { req }: Context
  ) {
    let findChar: Characters | Words | Sentences | undefined;

    switch (options) {
      case "characters":
        findChar = await Characters.findOne(id);
        break;
      case "words":
        findChar = await Words.findOne(id);
        break;
      case "sentences":
        findChar = await Sentences.findOne(id);
        break;
    }

    const checkUser = TE.tryCatch(
      () => {
        return req.session.userId
          ? Users.findOne({
              where: { id: req.session.userId },
              relations: [options],
            })
          : Promise.reject(null);
      },
      (error) => {
        return error;
      }
    );
    const addFavourite = (val: Users | false | undefined) => {
      if (!val) return false;
      findChar && val && val[options].push(findChar as any);
      val.save();
      return findChar && val ? true : false;
    };

    return await pipe(
      checkUser,
      TE.map(addFavourite),
      TE.fold((error) => T.of(false), T.of)
    )();
  }

  @Mutation((returns) => Boolean)
  async delFavourite(
    @Arg("id") id: number,
    @Arg("options") options: Options,
    @Ctx() { req }: Context
  ) {
    let findChar: Characters | Words | Sentences | undefined;

    switch (options) {
      case "characters":
        findChar = await Characters.findOne(id);
        break;
      case "words":
        findChar = await Words.findOne(id);
        break;
      case "sentences":
        findChar = await Sentences.findOne(id);
        break;
    }

    const checkUser = TE.tryCatch(
      () => {
        return req.session.userId
          ? Users.findOne({
              where: { id: req.session.userId },
              relations: [options],
            })
          : Promise.reject(null);
      },
      (error) => {
        return error;
      }
    );

    const delFavourite = (val: Users | false | undefined) => {
      if (!val) return false;
      const filteredChar =
        findChar &&
        val &&
        (val[options] as Array<Characters | Words | Sentences>).filter(
          (options: Characters | Words | Sentences) => options.id !== id
        );
      if (filteredChar)
        (val[options] as Array<Characters | Words | Sentences>) = filteredChar;
      val.save();
      return findChar && val ? true : false;
    };

    return await pipe(
      checkUser,
      TE.map(delFavourite),
      TE.fold((error) => T.of(false), T.of)
    )();
  }

  @Mutation((returns) => Boolean)
  async forgotPass(
    @Arg("emailInput") emailInput: EmailInput,
    @Ctx() { redis }: Context
  ) {
    const validationResults = await validator(emailInput);
    if (validationResults.responses[0]) {
      return validationResults;
    }

    const token = v4();
    const findUser = TE.tryCatch(
      () => Users.findOne({ where: { email: emailInput.email } }),
      (error) => `Finduser forgot pass error: ${(error as Error).stack}`
    );
    const setTemp = (user: Users | undefined) =>
      user
        ? E.right(
            (): T.Task<"OK" | null> => () =>
              redis.set(token, user.id, "EX", 1000 * 60 * 60 * 2)
          )
        : E.left(null);
    const runSetRedis = (v: () => T.Task<"OK" | null>) => v()();
    const sendMail: T.Task<void> = () =>
      sendEmail(
        emailInput.email,
        `<p>You have a couple of hours to <a href="http://localhost:4000/password-change/${token}">change your password</a> </p>
    <p> If the key has expired. Please try <a href="http://localhost:4000/password-reset/">resetting your password</a> again</p>`
      );

    pipe(
      findUser,
      TE.map(setTemp),
      TE.map(E.map(flow(runSetRedis, sendMail)))
    )();

    return true;
  }

  @Mutation((returns) => regResponse)
  async changePass(
    @Arg("token") token: string,
    @Arg("password") password: PasswordInput,
    @Ctx() { req, redis }: Context
  ): Promise<typeof regResponse> {
    const validationResults = await validator(password);
    if (validationResults.responses[0]) {
      return validationResults;
    }

    const userId: T.Task<string | null> = () => redis.get(token);
    const findUser =
      (userId: string | null): T.Task<Users | undefined | DatabaseError> =>
      () =>
        userId
          ? Users.findOne(userId)
          : Promise.resolve({
              type: "token",
              message: "Your token has expired.",
            });
    const errorCheck = (val: Users | undefined | DatabaseError) =>
      val
        ? val instanceof Users
          ? E.right(val)
          : E.left(val)
        : E.left({ type: "User", message: "Can not find user." });
    const updateDatabase = (user: Users) => (pass: string) => {
      user.password = pass;
      user.save();
      return user;
    };
    const hashPass: T.Task<string> = async () => await hash(password.password);
    const handleUser = async (user: T.Task<Users>) => {
      const currentUser = await user();
      req.session.userId = currentUser.id;
      redis.del(token);
      return currentUser;
    };
    const userIdError = await pipe(
      userId,
      T.chain(findUser),
      T.map(errorCheck),
      TE.map(flow(updateDatabase, T.of)),
      TE.map(T.ap(hashPass))
    )();
    return E.fold<DatabaseError, T.Task<Users>, DatabaseError | Promise<Users>>(
      identity,
      handleUser
    )(userIdError);
  }

  @Query((returns) => Users, { nullable: true })
  async isLogged(@Ctx() { req }: Context) {
    return req.session.userId ? Users.findOne(req.session.userId) : null;
  }

  @Mutation((returns) => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {
    const results: T.Task<boolean> = () =>
      new Promise((resolve) => {
        req.session.destroy((error) => {
          if (error) {
            resolve(false);
            return;
          }
          res.clearCookie("ceid");
          resolve(true);
        });
      });

    return results();
  }

  @Mutation((returns) => regResponse)
  async login(
    @Arg("logInputs") logInputs: LoginInputs,
    @Ctx() { req }: Context
  ): Promise<typeof regResponse> {
    const validationResults = await validator(logInputs);
    if (validationResults.responses[0]) {
      return validationResults;
    }

    const findUser = TE.tryCatch(
      () => Users.findOne({ where: { username: logInputs.username } }),
      (error) => `findUser login Error: ${(error as Error).stack}`
    );
    const checkPassword =
      (user: Users | undefined): T.Task<Users | null> =>
      async () =>
        user
          ? (await verify(user.password, logInputs.password))
            ? user
            : null
          : null;
    const setSession = (val: T.Task<Users | null>) => {
      pipe(
        val,
        T.map((v: Users | null) => (v ? (req.session.userId = v.id) : null))
      )();
      return val;
    };
    const findError = (error: string) =>
      T.of({ type: "Finduser database Error", message: error });
    const handleFind = (val: T.Task<Users | null>) =>
      pipe(
        val,
        T.map((v: Users | null) =>
          v
            ? v
            : {
                type: "No Match",
                message:
                  "There are no users that matches the details you have entered",
              }
        )
      );

    return await pipe(
      findUser,
      TE.map(checkPassword),
      TE.map(setSession),
      TE.fold<string, T.Task<null | Users>, DatabaseError | Users>(
        findError,
        handleFind
      )
    )();
  }

  @Mutation((returns) => regResponse)
  async register(
    @Arg("regInputs") regInputs: RegInputs,
    @Ctx() { req }: Context
  ): Promise<typeof regResponse> {
    const validationResults = await validator(regInputs);
    if (validationResults.responses[0]) {
      return validationResults;
    }

    const hashedPassword = await hash(regInputs.password);
    const insertNewUser = () =>
      Users.create({
        username: regInputs.username,
        password: hashedPassword,
        email: regInputs.email,
      }).save();
    const handleError = (error: unknown) => {
      const dbError = error as NodeError;
      const COLUMNREGEX = /(?<=\()\w+/;
      const columnError = dbError.detail.match(COLUMNREGEX);
      return dbError.code === "23505"
        ? {
            type: "duplicate",
            message: `This ${
              columnError![0]
            } already exists. Please choose another ${columnError![0]}`,
          }
        : { type: "default", message: "Registration Error" };
    };
    const insertUser = await TE.tryCatch(insertNewUser, handleError)();
    const handleResults = E.fold<DatabaseError, Users, DatabaseError | Users>(
      identity,
      (val) => {
        req.session.userId = val.id;
        return val;
      }
    );
    return pipe(insertUser, handleResults);
  }
}
