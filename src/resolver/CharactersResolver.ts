import {
  Arg,
  Query,
  Resolver,
  createUnionType,
  Int,
  ObjectType,
  Field,
} from "type-graphql";
import { Characters } from "../entities/Characters";
import { Sentences } from "../entities/Sentences";
import { Words } from "../entities/Words";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import TEconcat from "../utility/te-semigroup";
import { Options } from "./input-types/CharsInputs";
import { getRepository } from "typeorm";

export const charResponse = createUnionType({
  name: "charResponse",
  types: () => [Characters, Words, Sentences] as const,
  resolveType: (value) => {
    if ("word" in value) {
      return "Words";
    }
    if ("variant" in value) {
      return "Characters";
    }

    if ("chengyu" in value) {
      return "Sentences";
    }

    return null;
  },
});

@ObjectType()
class PaginatedCharResponse {
  @Field(() => [charResponse])
  charResponse!: typeof charResponse[];
  @Field({ defaultValue: false })
  hasMoreChar!: boolean;
  @Field({ defaultValue: false })
  hasMoreWord!: boolean;
  @Field({ defaultValue: false })
  hasMoreSentence!: boolean;
}

const queryDB = (
  query: string[],
  options: string[],
  cnIndex: boolean[],
  limitCursor: any[]
) => {
  const optLength = options.length;
  const optionList = {
    ["characters" as string]: Characters,
    ["words" as string]: Words,
    ["sentences" as string]: Sentences,
  };
  const taskArray = [];

  const searchCN = query.filter((v, i) => cnIndex[i]);
  const searchPY = query.filter((v, i) => !cnIndex[i]);
  const combineCN =
    searchCN.length > 1
      ? searchCN.reduce((prev, next) => {
          return `${prev}%${next}`;
        })
      : searchCN[0];
  const combinePY =
    searchPY.length > 1
      ? searchPY.reduce((prev, next) => {
          return `${prev}%${next}`;
        })
      : searchPY[0];

  for (let i = 0; optLength > i; i += 1) {
    if (searchCN.length > 0 && searchPY.length > 0)
      taskArray.push(
        TE.tryCatch<string, typeof charResponse[]>(
          () => {
            const queryDB = getRepository(optionList[options[i]])
              .createQueryBuilder()
              .where(`unaccent("charDetailCharacter") Like unaccent(:char)`, {
                char: `%${combineCN}%`,
              })
              .orWhere(
                `unaccent(REGEXP_REPLACE("charDetailPinyin",'\s','','g')) Like unaccent(:char)`,
                { char: `%${combinePY}%` }
              );
            if (limitCursor[1])
              queryDB.andWhere(`id > :cursor`, { cursor: limitCursor[1] });

            return queryDB.orderBy(`id`).take(limitCursor[0]).getMany();
          },
          (reason) => "findChar Resolver search error"
        )
      );
    else if (searchCN.length > 0)
      taskArray.push(
        TE.tryCatch<string, typeof charResponse[]>(
          () => {
            const queryDB = getRepository(optionList[options[i]])
              .createQueryBuilder()
              .where(`unaccent("charDetailCharacter") Like unaccent(:char)`, {
                char: `%${combineCN}%`,
              });

            if (limitCursor[1])
              queryDB.andWhere(`id > :cursor`, { cursor: limitCursor[1] });

            return queryDB.orderBy(`id`).take(limitCursor[0]).getMany();
          },
          (reason) => "findChar Resolver search error"
        )
      );
    else if (searchPY.length > 0)
      taskArray.push(
        TE.tryCatch<string, typeof charResponse[]>(
          () => {
            const queryDB = getRepository(optionList[options[i]])
              .createQueryBuilder()
              .where(
                `unaccent(REGEXP_REPLACE("charDetailPinyin",'\s','','g')) Like unaccent(:char)`,
                { char: `%${combinePY}%` }
              );
            if (limitCursor[1])
              queryDB.andWhere(`id > :cursor`, { cursor: limitCursor[1] });

            return queryDB.orderBy(`id`).take(limitCursor[0]).getMany();
          },
          (reason) => "findChar Resolver search error"
        )
      );
  }

  return taskArray.length > 1
    ? taskArray.reduce((prev, next) => {
        return TEconcat(prev)(next);
      })
    : taskArray[0];
};

function searchDB(chars: string[], options: Options, limitCursor: any[]) {
  const searchCharacters = chars;
  const REGEX_CHINESE =
    /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
  const arrayIsChineseIndex = searchCharacters.map((v) =>
    REGEX_CHINESE.test(v)
  );
  let optionsArray: string[] = [];
  for (const [key, boolean] of Object.entries(options)) {
    if (boolean) optionsArray.push(key);
  }

  const position = (function () {
    let _primaryPos = 0;
    let _secondaryPos = 1;

    const resetSecondary = (): void => {
      _secondaryPos = _primaryPos + 1;
    };
    const incrementPrimary = () => {
      if (_secondaryPos - _primaryPos >= 2) {
        return (_primaryPos = _secondaryPos - 1);
      } else {
        _primaryPos += 1;
      }
    };
    const incrementSecondary = () => (_secondaryPos += 1);
    const getPosition = (sec: Boolean = false) => {
      if (sec) {
        return _secondaryPos;
      }
      return _primaryPos;
    };
    return {
      resetPos: resetSecondary,
      incPrimary: incrementPrimary,
      incSecondary: incrementSecondary,
      getPos: getPosition,
    };
  })();

  return (function findCharRecursion(results: typeof charResponse[] = []) {
    const rerunSearch = (
      x: typeof charResponse[]
    ): TE.TaskEither<string, typeof charResponse[]> => {
      if (!x.length) {
        position.incPrimary();
        position.resetPos();
        return searchCharacters.length > position.getPos()
          ? findCharRecursion(x)
          : TE.of(x);
      } else {
        position.incSecondary();
        return searchCharacters.length >= position.getPos(true)
          ? findCharRecursion(x)
          : TE.of(x);
      }
    };
    const searchArray = searchCharacters.slice(
      position.getPos(),
      position.getPos(true)
    );
    const cnIndex = arrayIsChineseIndex.slice(
      position.getPos(),
      position.getPos(true)
    );

    return pipe(
      queryDB(searchArray, optionsArray, cnIndex, limitCursor),
      TE.orElse<string, typeof charResponse[], never>((error) => TE.of([])),
      TE.chain<string, typeof charResponse[], typeof charResponse[]>(
        rerunSearch
      ),
      TEconcat(TE.of(results))
    );
  })();
}
@Resolver()
export class CharacterResolver {
  @Query((returns) => PaginatedCharResponse)
  async findChar(
    @Arg("char", (type) => [String]) char: string[],
    @Arg("options", (type) => Options) options: Options,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => Int, { nullable: true }) cursor: number | null
  ): Promise<PaginatedCharResponse> {
    const maxLimit = Math.min(10, limit);
    const maxLimitPlusOne = maxLimit + 1;
    const limitCursor: any[] = [maxLimitPlusOne];
    let hasMore = {
      hasMoreChar: false,
      hasMoreWord: false,
      hasMoreSentence: false,
    };
    if (cursor) limitCursor.push(cursor);
    const trimCharArray = char
      .filter((v) => v != "")
      .map((v) => v.toLowerCase());
    if (trimCharArray.length === 0)
      return {
        charResponse: [],
        hasMoreChar: false,
        hasMoreWord: false,
        hasMoreSentence: false,
      };
    const charResults: typeof charResponse[] = [];
    const searchResults = await searchDB(trimCharArray, options, limitCursor)();
    pipe(
      searchResults,
      E.map((v) => charResults.push(...v))
    );

    const seperatedResults: {
      [key: string]: (Characters | Words | Sentences)[];
    } = {
      chars: charResults.filter((v) => {
        if ("variant" in v && !("word" in v)) return true;
      }),
      words: charResults.filter((v) => {
        if ("word" in v) return true;
      }),
      sentences: charResults.filter((v) => {
        if ("chengyu" in v) return true;
      }),
    };

    const setHasMore = (key: string) => {
      switch (key[0]) {
        case "c":
          hasMore.hasMoreChar = true;
          break;
        case "w":
          hasMore.hasMoreWord = true;
          break;
        case "s":
          hasMore.hasMoreSentence = true;
          break;
      }
    };

    const reducePlusOneLength = (charResults: typeof seperatedResults) => {
      for (const key in charResults) {
        if (charResults[key].length === maxLimitPlusOne) {
          setHasMore(key);
          charResults[key].pop();
        }
      }
      return charResults;
    };

    const createReturnResults = (charResults: typeof seperatedResults) => {
      let results: (Characters | Words | Sentences)[] = [];
      for (const key in charResults) {
        results = results.concat(charResults[key]);
      }

      return { charResponse: results, ...hasMore };
    };

    return pipe(seperatedResults, reducePlusOneLength, createReturnResults);
  }
}
