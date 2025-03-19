import React, { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../theme";
import { mockLineData2 as data } from "../data/mockData";
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";

const LineChart = ({ isDashboard , safraId}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery("(max-width: 800px)");
  const isSmallDivice = useMediaQuery("(max-width: 1000px)");
  const isMediumDivice = useMediaQuery("(max-width: 1800px)");
  const [userData, setUserData] = useState(null);
  const [lineData, setLineData] = useState([]);

  useEffect(() => {
    const storedUser = secureLocalStorage.getItem('userData'); 
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

useEffect(() => {
  if (userData && userData.email) { 
    const fetchLineData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/custos-glebas-line-chart`, {
          params: { safraId: 1 }
        });
                    

        setLineData(response.data); 

                      
      } catch (error) {
        console.log("ERRO - ao buscar no banco de dados.");
      }
    };
    fetchLineData();
  }
}, [userData]);  

  // Função para formatação de valores em dinheiro
  const formatCurrency = (value) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <ResponsiveLine
      data={lineData}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
        crosshair: {
          line: {
            stroke: colors.primary[100],
            strokeWidth: 2,
            strokeDasharray: "6 6",
          },
        },
      }}
      colors={{ scheme: "nivo" }}
      //colors={isDashboard ? { datum: "color" } : { scheme: "nivo" }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat={(value) => formatCurrency(value)}
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: isMobile ? 0 : 5,
        tickPadding: isMobile ? 0 : 5,
        tickRotation: isMobile ? 0 : 0,
        legend: undefined ,
        legendOffset: 36,
        legendPosition: "middle",
        format: isMobile ? () => "" : undefined,
      }}
      axisLeft={{
        orient: "left",
        tickValues: isMobile ? 0 : 5,
        tickSize: isMobile ? 0 : 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: undefined ,
        legendOffset: -40,
        legendPosition: "middle",
        //format:isMediumDivice ? (value) => formatCurrency(value): value
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      enablePointLabel={!isDashboard}
      pointLabel={e=>e.data.x+": "+e.data.y}
      pointLabelYOffset={-16}
      enableTouchCrosshair={true}
      useMesh={true}
      legends={
        isSmallDivice
          ? [] // Remove as legendas em telas pequenas
          : [
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 50,
                itemsSpacing: 0,
                itemDirection: "right-to-left",
                itemWidth: 110,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]
      }
    />
  );
};

export default LineChart;
