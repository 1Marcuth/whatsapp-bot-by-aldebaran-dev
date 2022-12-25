import { IBotData } from "../interfaces/IBotData";

export default async ({ reply }: IBotData) => {
  await reply("Pong!");
};
