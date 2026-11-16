export { cn } from "cn";

import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator";

export const generateSlug = () => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: "-",
    length: 2,
  });
};
