import { atom } from "recoil";

export const logQueueState = atom<MessageType[]>({
  key: "logQueue",
  default: [],
});
