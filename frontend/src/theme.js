import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";
//Comando --> ctrl + k + ctrl + g

// color design tokens export
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#3d3d3d",
          800: "#292929",
          900: "#141414",
        },
        primary: {
          100: "#d0d1d5",
          200: "#a1a4ab",
          300: "#727681",
          400: "#1F2A40",
          500: "#141b2d",
          600: "#101624",
          700: "#0c101b",
          800: "#080b12",
          900: "#040509",
        },
        greenAccent: {
          100: "#dbf5ee",
          200: "#b7ebde",
          300: "#94e2cd",
          400: "#70d8bd",
          500: "#4cceac",
          600: "#3da58a",
          700: "#2e7c67",
          800: "#1e5245",
          900: "#0f2922",
        },
        redAccent: {
          100: "#f8dcdb",
          200: "#f1b9b7",
          300: "#e99592",
          400: "#e2726e",
          500: "#db4f4a",
          600: "#af3f3b",
          700: "#832f2c",
          800: "#58201e",
          900: "#2c100f",
        },
        blueAccent: {
          100: "#d8e3f4",
          200: "#b1c6ea",
          300: "#89aadf",
          400: "#628dd5",
          500: "#3b71ca",
          600: "#2f5aa2",
          700: "#234479",
          800: "#182d51",
          900: "#0c1728"
        },
        mygreen: {
          900: "#d8ecd8",
          800: "#b1d8b1",
          700: "#89c589",
          600: "#62b162",
          500: "#3b9e3b",
          400: "#2f7e2f",
          300: "#235f23",
          200: "#183f18",
          100: "#0c200c"
      },
      orangeAccent: {
          100: "#feedd3",
          200: "#fddba7",
          300: "#fcc97c",
          400: "#fbb750",
          500: "#faa524",
          600: "#fbb800",
          700: "#966316",
          800: "#64420e",
          900: "#322107",
      },
      purpleAccent: {
          100: "#e2d9f3",
          200: "#c5b3e6",
          300: "#a98eda",
          400: "#8c68cd",
          500: "#6f42c1",
          600: "#59359a",
          700: "#432874",
          800: "#2c1a4d",
          900: "#160d27"
      },
      yellowAccent: {
          100: "#fcf9cc",
          200: "#f8f399",
          300: "#f5ed67",
          400: "#f1e734",
          500: "#eee101",
          600: "#beb401",
          700: "#8f8701",
          800: "#5f5a00",
          900: "#302d00"
},
      }
    : {
        grey: {
          100: "#141414",
          200: "#292929",
          300: "#3d3d3d",
          400: "#525252",
          500: "#666666",
          600: "#858585",
          700: "#a3a3a3",
          800: "#c2c2c2",
          900: "#e0e0e0",
        },
        primary: {
          100: "#040509",
          200: "#080b12",
          300: "#0c101b",
          400: "#f2f0f0", // manually changed
          500: "#141b2d",
          600: "#1F2A40",
          700: "#727681",
          800: "#a1a4ab",
          900: "#d0d1d5",
        },
        greenAccent: {
          100: "#0f2922",
          200: "#1e5245",
          300: "#2e7c67",
          400: "#3da58a",
          500: "#4cceac",
          600: "#70d8bd",
          700: "#94e2cd",
          800: "#b7ebde",
          900: "#dbf5ee",
        },
        redAccent: {
          100: "#2c100f",
          200: "#58201e",
          300: "#832f2c",
          400: "#af3f3b",
          500: "#db4f4a",
          600: "#e2726e",
          700: "#e99592",
          800: "#f1b9b7",
          900: "#f8dcdb",
        },
        blueAccent: {
          900: "#d8e3f4",
          800: "#b1c6ea",
          700: "#89aadf",
          600: "#628dd5",
          500: "#3b71ca",
          400: "#2f5aa2",
          300: "#234479",
          200: "#182d51",
          100: "#0c1728"
        },
        mygreen: {
            100: "#d8ecd8",
            200: "#b1d8b1",
            300: "#89c589",
            400: "#62b162",
            500: "#3b9e3b",
            600: "#2f7e2f",
            700: "#235f23",
            800: "#183f18",
            900: "#0c200c"
        },
        orangeAccent: {
            100: "#feedd3",
            200: "#fddba7",
            300: "#fcc97c",
            400: "#fbb750",
            500: "#faa524",
            600: "#fbb800",
            700: "#966316",
            800: "#64420e",
            900: "#322107"
        },
      }),
});

// mui theme settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            // palette values for dark mode
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.primary[500],
            },
          }
        : {
            // palette values for light mode
            primary: {
              main: colors.primary[100],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: "#fcfcfc",
            },
          }),
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
  };
};

// context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};




/*
myblue: {
    100: "#d9e1f9",
    200: "#b3c3f3",
    300: "#8da5ed",
    400: "#6787e7",
    500: "#4169e1",
    600: "#3454b4",
    700: "#273f87",
    800: "#1a2a5a",
    900: "#0d152d"
},

myred: {
    100: "#fed5d1",
    200: "#fdaba3",
    300: "#fd8276",
    400: "#fc5848",
    500: "#fb2e1a",
    600: "#c92515",
    700: "#971c10",
    800: "#64120a",
    900: "#320905"
},*/