import randomstring from "randomstring";

export const randomize = (input: string): string => {
    const randomText = randomstring.generate({
      length: 10,
    });

    return `${input}_${randomText}`;
};
