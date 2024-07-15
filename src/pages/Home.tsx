import {
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { logQueueState } from "../recoils/log.atom";

function Home() {
  const logQueue = useRecoilValue(logQueueState);
  const setLogQueue = useSetRecoilState(logQueueState);
  const logger = useRef<HTMLDivElement>(null);
  const [codeContent, setCodeContent] = useState("");
  const [open, setOpen] = useState(true);

  function replaceConsole() {
    window.originLog = window.console.log;
    window.originError = window.console.error;

    window.console.log = function log(...messages: Messages[]) {
      const timestamp =
        new Date().toLocaleString("ko", {
          hour: "2-digit",
          hour12: false,
          minute: "2-digit",
          second: "2-digit",
        }) +
        "." +
        Math.floor(Date.now() % 1000)
          .toString()
          .padStart(3, "0");
      const newMessage = {
        timestamp,
        message: messages,
      };

      setLogQueue((value) => [...value, newMessage]);
      return console.log.bind(this);
    };

    window.console.error = function error(...messages: Messages[]) {
      const timestamp =
        new Date().toLocaleString("ko", {
          hour: "2-digit",
          hour12: false,
          minute: "2-digit",
          second: "2-digit",
        }) +
        "." +
        Math.floor(Date.now() % 1000)
          .toString()
          .padStart(3, "0");
      const newMessage = {
        timestamp,
        message: messages,
      };
      setLogQueue((value) => [...value, newMessage]);
      return console.error.bind(this);
    };
  }

  function revertConsole() {
    console.log = window.originLog;
    console.error = window.originError;
  }

  function excute() {
    if (codeContent.length === 0) return;
    // originLog(codeContent);
    const func = () => new Function("", codeContent);
    let temp;
    try {
      replaceConsole();
      const result = func();
      temp =
        result
          ?.toString()
          ?.split("\n")
          ?.slice(2, -1)
          ?.filter((_) => _) || [];
      result?.();
    } catch (error) {
      console.error(error);
    } finally {
      if (temp instanceof Array && temp.length > 0) {
        const lastOne = temp[temp.length - 1];
        if (!lastOne.startsWith("return")) {
          new Function("", `console.log(${lastOne.replace(/;$/, "")})`)();
        }
      }
      revertConsole();
    }
  }

  function handleChangeCode(e: ChangeEvent<HTMLTextAreaElement>) {
    const target = e.target;
    if (!target) return;
    setCodeContent(target.value);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Tab") {
      e.preventDefault();
      console.log("tab");
    }
  }

  function handleOpenLog() {
    setOpen(!open);
  }

  const writeLog = useCallback((log: MessageType) => {
    if (log.message[0] instanceof Error) {
      return log.message.map((msg, i) => (
        <div key={i + "|" + msg} style={{ padding: "0 0.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              fontFamily: "monospace",
            }}>
            <time dateTime={log.timestamp}>[{log.timestamp}]</time>
            <Box component='details'>
              <Box
                component='summary'
                sx={{
                  px: 1,
                }}>
                {(msg as Error).message}
              </Box>
              <Box sx={{ mt: 2, ml: 2.7 }}>
                {(msg as Error).stack
                  ? (msg as Error).stack
                      ?.split("\n")
                      .map((q) => <div key={q}>{q}</div>)
                  : ""}
              </Box>
            </Box>
          </div>
        </div>
      ));
    } else {
      return (
        <div
          style={{
            display: "flex",
            fontFamily: "monospace",
            gap: 10,
            padding: "0 0.5rem",
          }}>
          <time dateTime={log.timestamp}>[{log.timestamp}]</time>
          {log.message.map((msg, i) => (
            <div key={i + "|" + msg}>
              {typeof msg === "string"
                ? (msg as string)
                : JSON.stringify(msg, null, 2)}
            </div>
          ))}
        </div>
      );
    }
  }, []);

  return (
    <Stack sx={{ height: "inherit" }}>
      <Stack gap={2} sx={{ mx: 2 }}>
        <Typography
          component='h5'
          variant='h5'
          fontWeight={700}
          sx={{
            textTransform: "uppercase",
          }}>
          code runner
        </Typography>
        <Box>
          <TextField
            multiline
            fullWidth
            autoFocus
            InputProps={{
              rows: innerHeight / 40,
            }}
            sx={{
              backgroundColor: "#181e30",
              fontFamily: "monospace",
              border: "1px solid #181e30",
              borderRadius: 2,
              [`.MuiInputBase-root.MuiOutlinedInput-root`]: {
                flex: 1,
                flexDirection: "column",
              },
              [`.MuiOutlinedInput-notchedOutline`]: {
                border: "none !important",
              },
              [`textarea`]: {
                outline: "none",
                color: "#e1e1e1",
                flex: 1,
              },
              minHeight: 300,
              maxHeight: 500,
              overflow: "auto",
            }}
            onChange={handleChangeCode}
            onKeyDown={handleKeyDown}
          />
        </Box>
        <div>
          <Button variant='contained' onClick={excute}>
            excute
          </Button>
        </div>
      </Stack>
      <Divider sx={{ my: 2, flex: 1 }} />
      <div>
        <div>
          <Button
            variant='contained'
            color='inherit'
            sx={{ borderEndEndRadius: 0, borderEndStartRadius: 0, mx: 2 }}
            onClick={handleOpenLog}>
            tab ({logQueue.length})
          </Button>
          <Box sx={{ height: 5, backgroundColor: "grey" }} />
        </div>
        <div
          ref={logger}
          style={{
            maxHeight: 200,
            height: open ? "100vh" : 0,
            display: "flex",
            flexDirection: "column",
            flex: 1,
            fontFamily: "monospace",
            overflow: "auto",
            color: "lime",
            backgroundColor: "black",
            transition: "150ms ease-in-out",
            padding: open ? "1rem 0" : 0,
          }}>
          {logQueue.toReversed().map((log, i, o) => (
            <div key={i + "|" + log.message.join("")}>
              {writeLog(log)}
              {o.length - 1 !== i && (
                <Divider sx={{ my: 2, borderColor: "#ffffff56" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </Stack>
  );
}

export default Home;
