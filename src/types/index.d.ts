export declare global {
  interface Window {
    originLog: Console["log"];
    originError: Console["error"];
  }
  type Messages = string | Error;
  type MessageType = {
    message: Messages[];
    timestamp: string;
  };
}
