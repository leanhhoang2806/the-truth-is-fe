import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Button,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import Theme from "./theme";

import { useAuth0 } from "@auth0/auth0-react";
import {
  postEvaluate,
  getEvaluate,
  getAlert,
  postAnyMetric,
  deleteAlert,
  postSpecificMetric,
} from "./apis";
import { Routes, Route, Navigate } from "react-router-dom";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { addMinutes, differenceInMilliseconds } from "date-fns";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import BugReportIcon from "@mui/icons-material/BugReport";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReportIcon from "@mui/icons-material/Report";
import { LineChart } from "@mui/x-charts/LineChart";
import { format } from "date-fns";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import FormControl from "@mui/material/FormControl";
import Checkbox from "@mui/material/Checkbox";

const METRIC_OPTIONS = [
  "sentiment",
  "bias",
  "relevance",
  "completeness",
  "coherence",
  "friendliness",
];

const getToken = () => {
  const key = "@@auth0spajs@@::PM3G9YAvqYvMEKGOP5htCpZd5iG8VIxz::@@user@@";
  const userData = localStorage.getItem(key);
  const userDataJson = JSON.parse(userData);
  return userDataJson["id_token"];
};

const AlertComponent = () => {
  const { user } = useAuth0();
  const [data, setData] = useState({});
  const [alert, setAlert] = React.useState("");
  const [anyInputValue, setAnyInputValue] = useState("");
  const [selectedMetrics, setSelectedMetrics] = React.useState([]);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const handleSpecificMetricChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedMetrics(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value,
    );
  };

  const handleChange = (event) => {
    setAlert(event.target.value);
  };

  const fetchData = async () => {
    const alert = await getAlert(getToken());
    if (alert !== "null") {
      setData(alert);
    } else {
      setData({});
    }
  };
  const handleInputChange = (event) => {
    setAnyInputValue(event.target.value);
  };

  const handleSubmit = async () => {
    await postAnyMetric(anyInputValue, getToken()); // Set limit set status to true after submission
    await fetchData();
    setAnyInputValue("");
    setAlert("");
  };
  const handleSpecificMetricSubmit = async () => {
    await postSpecificMetric(anyInputValue, selectedMetrics, getToken()); // Set limit set status to true after submission
    await fetchData();
    setAnyInputValue("");
    setAlert("");
  };

  const handleRemoveAlert = async () => {
    await deleteAlert(data["_id"], getToken());
    await fetchData();
    setAnyInputValue("");
    setAlert("");
  };
  const formatMetrics = (metrics) => {
    if (!metrics || metrics.length === 0) {
      return "Any";
    }
    if (metrics.length === 1) {
      return metrics[0] + ".";
    }
    return metrics.slice(0, -1).join(", ") + ", and " + metrics.slice(-1) + ".";
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ width: "100%", display: "flex" }}>
      {/* Left side */}
      <div
        style={{
          flex: "1",
          paddingRight: "10px",
          borderRight: "1px solid #ccc",
        }}
      >
        <Typography variant="h5" component="div" sx={{ paddingBottom: "20px" }}>
          Current alert setting
        </Typography>
        {Object.keys(data).length === 0 && (
          <Typography variant="h7" component="div">
            No Alert setting
          </Typography>
        )}
        {Object.keys(data).length > 0 && (
          <Typography variant="h7" component="div">
            Metric type:{" "}
            <span style={{ color: "red" }}>
              {formatMetrics(data["metrics"])}
            </span>
          </Typography>
        )}
        {Object.keys(data).length > 0 && (
          <Typography variant="h7" component="div">
            Send notification when any metric is greateer than:{" "}
            <span style={{ color: "red" }}>{data["limit"]}</span>
          </Typography>
        )}
        {Object.keys(data).length > 0 && (
          <Typography variant="h7" component="div">
            Notifications will be sent to{" "}
            <span style={{ color: "blue" }}>{user.email}</span>
          </Typography>
        )}
        {Object.keys(data).length > 0 && (
          <Button
            variant="text"
            onClick={handleRemoveAlert}
            color="error"
            sx={{ marginTop: "10px" }}
          >
            Remove Alert
          </Button>
        )}
      </div>
      <Divider orientation="vertical" />
      {/* Right side */}
      <div style={{ flex: "1", paddingLeft: "10px" }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ paddingBottom: "20px", textAlign: "left" }}
        >
          Change alert setting
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="any-alert">Alert</InputLabel>
          <Select
            labelId="any-alert"
            id="alert-select"
            value={alert}
            label="Alert"
            onChange={handleChange}
            MenuProps={{ PaperProps: { style: { minWidth: "auto" } } }}
          >
            <MenuItem value="AnyMetric">Any Metric</MenuItem>
            <MenuItem value="SpecificMetric">Specific Metric</MenuItem>
          </Select>
          {alert === "AnyMetric" && (
            <TextField
              id="input-value"
              label="Enter Limit Value Between (1-100)"
              type="number"
              value={anyInputValue}
              onChange={handleInputChange}
              inputProps={{ min: 1, max: 100 }}
              sx={{ marginTop: "10px", marginBottom: "10px" }}
              fullWidth
            />
          )}
          {alert === "AnyMetric" && anyInputValue > 0 && (
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          )}

          {alert === "SpecificMetric" && (
            <div>
              <FormControl
                fullWidth
                sx={{ marginTop: "10px", marginBottom: "10px" }}
              >
                <InputLabel id="demo-multiple-checkbox-label">
                  Choosing metrics
                </InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={selectedMetrics}
                  onChange={handleSpecificMetricChange}
                  input={<OutlinedInput label="Tag" />}
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={MenuProps}
                >
                  {METRIC_OPTIONS.map((name) => (
                    <MenuItem key={name} value={name}>
                      <Checkbox checked={selectedMetrics.indexOf(name) > -1} />
                      <ListItemText primary={name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}
          {alert === "SpecificMetric" && selectedMetrics.length > 0 && (
            <TextField
              id="input-value"
              label="Enter Limit Value Between (1-100)"
              type="number"
              value={anyInputValue}
              onChange={handleInputChange}
              inputProps={{ min: 1, max: 100 }}
              sx={{ marginTop: "10px", marginBottom: "10px" }}
              fullWidth
            />
          )}
          {alert === "SpecificMetric" &&
            selectedMetrics.length > 0 &&
            anyInputValue > 0 && (
              <Button variant="contained" onClick={handleSpecificMetricSubmit}>
                Submit
              </Button>
            )}
        </FormControl>
      </div>
    </div>
  );
};

const DemoChart = () => {
  const demoLength = 5;

  const DemoMetricOptions = ["sentiment", "bias", "relevance"];
  const generateRandomScoreArray = () => {
    const scoreArrays = {};

    DemoMetricOptions.forEach((metric) => {
      scoreArrays[metric] = Array.from(
        { length: demoLength },
        () => Math.floor(Math.random() * 100) + 1,
      );
    });
    const displayData = DemoMetricOptions.map((label) => {
      return {
        data: scoreArrays[label],
        label,
      };
    });
    return displayData;
  };

  const generateTimestamps = () => {
    const timestamps = [];
    const startTime = new Date();
    let currentTime = new Date(startTime);
    const endTime = addMinutes(startTime, 48 * 60); // 48 hours

    const totalTime = differenceInMilliseconds(endTime, startTime);
    const numTimestamps = demoLength;
    let remainingTime = totalTime;
    let interval = totalTime / numTimestamps;

    for (let i = 0; i < numTimestamps; i++) {
      timestamps.push(currentTime.getTime());
      const nextInterval = Math.min(
        remainingTime / (numTimestamps - i - 1),
        interval * 2,
      ); // Adjust interval dynamically
      currentTime = addMinutes(
        currentTime,
        Math.ceil(nextInterval / (60 * 1000)),
      );
      remainingTime -= nextInterval;
    }

    return timestamps;
  };

  return (
    <LineChart
      xAxis={[
        {
          data: generateTimestamps(),
          valueFormatter: (timestamp) => {
            const date = new Date(timestamp);
            const formattedDate = format(date, "MM/dd/yyyy HH:mm"); // Format date as MM/DD/YYYY HH:mm
            return formattedDate;
          },
        },
      ]}
      series={generateRandomScoreArray()}
      yAxis={[{ label: "Score out of 100" }]}
      width={700}
      height={700}
      sx={{
        [`& .${axisClasses.left} .${axisClasses.label}`]: {
          transform: "translateX(-10px)",
        },
        marginLeft: "200px",
        marginTop: "auto",
        marginBottom: "auto",
      }}
    />
  );
};

const BasicLineChart = () => {
  const [evaluations, setEvaluations] = useState([]);

  const fetchData = async () => {
    const result = await getEvaluate(getToken());
    setEvaluations(result);
  };

  const convertTimestampToEpoch = (timestamp) => {
    const epochTime = new Date(timestamp).getTime();
    return epochTime;
  };

  const DisplayChart = ({ data }) => {
    const displayData = METRIC_OPTIONS.map((label) => {
      return {
        data: data.map((item) => item["evaluation"][label]),
        label,
      };
    });
    return (
      <LineChart
        xAxis={[
          {
            data: data.map((item) =>
              convertTimestampToEpoch(item["created_at"]),
            ),
            valueFormatter: (timestamp) => {
              const date = new Date(timestamp);
              const formattedDate = format(date, "MM/dd/yyyy HH:mm"); // Format date as MM/DD/YYYY HH:mm
              return formattedDate;
            },
          },
        ]}
        series={displayData}
        yAxis={[{ label: "Score out of 100" }]}
        width={1000}
        height={1000}
        sx={{
          [`& .${axisClasses.left} .${axisClasses.label}`]: {
            transform: "translateX(-10px)",
          },
        }}
      />
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  return <DisplayChart data={evaluations} />;
};

const ResponseAnalysis = () => {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const [context, setContext] = useState("");
  const [response, setResponse] = useState("");
  const [displayResult, setDisplayResult] = useState({});
  const [loading, setLoading] = useState(false);
  const { loginWithRedirect } = useAuth0();

  const handleEvaluateClick = async () => {
    setLoading(true);
    const result = await postEvaluate(
      user.email,
      context,
      response,
      getToken(),
    );
    setDisplayResult(result);
    setLoading(false);
  };

  return (
    <Container
      style={{
        flexGrow: 1,
        paddingTop: "64px",
        marginTop: "64px",
        textAlign: "center",
      }}
    >
      <Spinner loading={loading} />
      <TextareaAutosize
        style={styles.userInputBox}
        minRows={5}
        placeholder="Enter the context of the LLM response..."
        value={context}
        onChange={(event) => setContext(event.target.value)}
      />
      <TextareaAutosize
        style={styles.userInputBox}
        minRows={5}
        placeholder="Enter the response from LLM..."
        value={response}
        onChange={(event) => setResponse(event.target.value)}
      />
      <div style={styles.buttonRow}>
        {/* Evaluate button */}
        <Button
          variant="contained"
          style={{ ...styles.button, ...styles.evaluateButton }}
          onClick={handleEvaluateClick}
        >
          Evaluate
        </Button>

        {/* Evaluate with Token button (shown only when logged in) */}
        {/* {isAuthenticated && (
        <Button
          variant="contained"
          style={{
            ...styles.button,
            ...styles.evaluateWithTokenButton,
          }}
          onClick={handleEvaluateWithTokenClick}
        >
          Evaluate With Token
        </Button>
      )} */}
      </div>
      {Object.keys(displayResult).length !== 0 && (
        <div>
          <Typography variant="h6">Evaluation Result</Typography>
          <Typography variant="body1">
            Sentiment Score - {displayResult.sentiment} out of 100
          </Typography>
          <Typography variant="body1">
            Relevance Score - {displayResult.relevance} out of 100{" "}
          </Typography>
          <Typography variant="body1">
            Coherence Score - {displayResult.coherence} out of 100{" "}
          </Typography>
          <Typography variant="body1">
            Completeness Score - {displayResult.completeness} out of 100{" "}
          </Typography>
          <Typography variant="body1">
            Friendliness Score - {displayResult.friendliness} out of 100{" "}
          </Typography>
        </div>
      )}
    </Container>
  );
};

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

function MiniDrawer() {
  const iconMap = {
    Dashboard: <TrendingUpIcon />,
    Debugger: <BugReportIcon />,
    Alerts: <ReportIcon />,
  };
  const componentMap = {
    Dashboard: <BasicLineChart />,
    Debugger: <ResponseAnalysis />,
    Alerts: <AlertComponent />,
  };
  const [selectedComponent, setSelectedComponent] = useState(
    componentMap["Debugger"],
  );

  const [open, setOpen] = React.useState(false);

  const handleDrawerIcon = () => {
    setOpen(!open);
  };
  const handleItemClick = (text) => {
    setSelectedComponent(componentMap[text]);
  };

  return (
    <Theme>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Drawer variant="permanent" open={open} hidden={false}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerIcon}>
              {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {["Dashboard", "Debugger", "Alerts"].map((text, index) => (
              <ListItem key={text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => handleItemClick(text)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {iconMap[text]}
                  </ListItemIcon>
                  <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "70px",
          }}
        >
          <DrawerHeader />
          {selectedComponent}
        </Box>
      </Box>
    </Theme>
  );
}

const styles = {
  topAppBar: {
    backgroundColor: "#fff", // White background
    color: "#000", // Black text
    boxShadow: "none", // Remove the default shadow
    marginBottom: 0, // Remove default bottom margin
  },
  bottomAppBar: {
    backgroundColor: "#333", // Dark gray color
    color: "#fff", // White text
    boxShadow: "none", // Remove the default shadow
    top: "auto",
    bottom: 0,
  },
  menuButton: {
    marginLeft: "auto",
  },
  userInputBox: {
    width: "90%",
    height: "50px", // Adjust the height as needed
    margin: "auto",
    marginTop: "20px",
    marginBottom: "20px", // Add bottom margin to separate from footer app bar
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    resize: "vertical", // Allow vertical resizing
  },
  buttonRow: {
    width: "90%", // Match the width of the input box
    margin: "auto", // Center the button row horizontally
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  button: {
    borderRadius: "5px",
    padding: "10px 20px",
    fontWeight: "bold",
  },
  evaluateButton: {
    backgroundColor: "#ddd", // Light grayish color
    color: "#000", // Black text
  },
  evaluateWithTokenButton: {
    backgroundColor: "#ffff99", // Light yellow color
    color: "#000", // Black text
  },
};

const LoadingOverlay = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress color="primary" />
    </Box>
  );
};
const Spinner = ({ loading }) => {
  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        display: loading ? "flex" : "none",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <CircularProgress color="secondary" />
    </Box>
  );
};

const App = () => {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const [context, setContext] = useState("");
  const [response, setResponse] = useState("");
  const [displayResult, setDisplayResult] = useState({});
  const [loading, setLoading] = useState(false);
  const { loginWithRedirect } = useAuth0();

  const handleEvaluateClick = async () => {
    setLoading(true);
    const key = "@@auth0spajs@@::PM3G9YAvqYvMEKGOP5htCpZd5iG8VIxz::@@user@@";
    const userData = localStorage.getItem(key);
    const userDataJson = JSON.parse(userData);
    const result = await postEvaluate(
      user.email,
      context,
      response,
      userDataJson["id_token"],
    );
    setDisplayResult(result);
    setLoading(false);
  };

  // const handleEvaluateWithTokenClick = () => {
  //   // Logic for Evaluate With Token button
  //   alert("Evaluate With Token button clicked");
  // };

  const Main = () => {
    return (
      <Theme>
        <Container
          style={{
            flexGrow: 1,
            paddingTop: "64px",
            paddingBottom: "64px",
            marginTop: "64px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "10px",
              transform: "translateY(-50%)",
              textAlign: "left",
            }}
          >
      <Typography variant="h5" sx={{ marginBottom: '20px', color: '#333', fontWeight: 'bold' }}>
        Monitor and Alert for Chatbots
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: '20px',
          color: '#555',
          backgroundColor: '#e0e0e0',
          padding: '10px',
          borderRadius: '5px'
        }}
      >
        - Chatbot behaviors are often unpredictable
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: '20px',
          color: '#555',
          backgroundColor: '#d3d3d3',
          padding: '10px',
          borderRadius: '5px'
        }}
      >
        - Real-time alert system could help manage chatbot behaviors
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: '20px',
          color: '#555',
          backgroundColor: '#c4c4c4',
          padding: '10px',
          borderRadius: '5px'
        }}
      >
        - Simple and easy to understand metrics
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: '20px',
          color: '#555',
          backgroundColor: '#b6b6b6',
          padding: '10px',
          borderRadius: '5px'
        }}
      >
        - Customized alerts with multiple metrics combination for your needs
      </Typography>
            <Typography variant="body1" style={{ marginBottom: "20px" }}>
              -{" "}
              <span
                style={{
                  display: "inline-block",
                  marginRight: "10px",
                  border: "1px solid black",
                  padding: "5px",
                  cursor: "pointer",
                }}
                onClick={() => loginWithRedirect()}
              >
                Sign in{" "}
              </span>{" "}
              to experience a demo
            </Typography>
          </div>
          <div
            style={{
              position: "absolute",
              top: "64px",
              bottom: "64px",
              left: "50%",
              borderLeft: "1px solid black",
              marginLeft: "10px",
            }}
          >
            <DemoChart />
          </div>
        </Container>
      </Theme>
    );
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <Routes>
      <Route
        exact
        path="/dashboard"
        element={isAuthenticated ? <MiniDrawer /> : <Navigate to="/" />}
      />

      <Route path="/" element={<Main />} />
    </Routes>
  );
};

export default App;
