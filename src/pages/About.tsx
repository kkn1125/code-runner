import { Box, keyframes, Stack } from "@mui/material";

function About() {
  const ani1 = keyframes`
  0% {left: 0}
  50% { left: 1rem}
  100% { left: 0}
  `;
  return (
    <Stack>
      <Box
        sx={{
          position: "absolute",
          animation: `${ani1} 2s ease-in-out infinite`,
        }}>
        qwe
      </Box>
    </Stack>
  );
}

export default About;
