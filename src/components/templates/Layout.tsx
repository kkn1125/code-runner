import { Button, Stack } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";

function Layout() {
  const navigate = useNavigate();

  return (
    <Stack>
      <nav>
        <Button onClick={() => navigate("/")}>home</Button>
        <Button onClick={() => navigate("/about")}>about</Button>
      </nav>
      <Outlet />
    </Stack>
  );
}

export default Layout;
