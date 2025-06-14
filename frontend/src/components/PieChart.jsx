import React, { useState, useEffect } from "react";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
import { useTheme, useMediaQuery } from "@mui/material";
//import { mockPieData as data } from "../data/mockData";
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";

const PieChart = ({isDashboard, safraId }) => {
  const token = secureLocalStorage.getItem('auth_token');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery("(max-width: 800px)");
  const isSmallDivice = useMediaQuery("(max-width: 1000px)");
  const isMediumDivice = useMediaQuery("(max-width: 1800px)");
  const [userData, setUserData] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [emptyData, setEmptyData] = useState(false);
  
  useEffect(() => {
      const storedUser = secureLocalStorage.getItem('userData'); 
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
  }, []);

  useEffect(() => {
    if (userData && userData.email) { 
      const fetchPieData = async () => {
        try {
          if(safraId === '0' || safraId === 0){
            const response = await axios.get(`http://localhost:3000/all-custos-pie-chart`, {
              headers: {Authorization: `Bearer ${token}`}
            });

            if (response.data.length === 0) {
              setEmptyData(true);
              setPieData([]);
            } else {
              setEmptyData(false);
              setPieData(response.data);
            }

          }else{
            const response = await axios.get(`http://localhost:3000/custos-pie-chart`, {
              params: { safraId: safraId }, headers: {Authorization: `Bearer ${token}`}
            });  
            setPieData(response.data); 
            setEmptyData(false);
          }
                        
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setEmptyData(true);
            console.log("Nenhum dado encontrado (404)");
          } else if (error.response?.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            secureLocalStorage.removeItem('userData');
            secureLocalStorage.removeItem('auth_token');
            window.location.href = '/login';
          } else {
            console.error("Erro ao buscar dados:", error);
          }
        }
      };
      fetchPieData();
    }
  }, [userData]);  

  return (
    emptyData ? (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <img src="/farm-img.svg" alt="Farm" style={{ width:isMobile ?"200px" : "300px" }} />
        <p style={{ color: "#aaa", marginTop: "1rem", marginBottom:"-1px" }}>Nenhum dado disponível para exibir</p>
        <a style={{ color: colors.mygreen[300]}} href="https://storyset.com/nature">Nature illustrations by Storyset</a>
      </div>
    ) : (
    <ResponsivePie
      data={pieData}
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
                color: (theme.palette.mode === 'dark' ? colors.grey[800] : colors.grey[100]),
            },
        }
        
      }}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      sortByValue={false}
      activeOuterRadiusOffset={8}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabel={isMobile ? "value" : isDashboard ? "id" : e=>e.id+" ("+e.value+")"}
      enableArcLinkLabels={isMobile? true : true}
      arcLinkLabelsOffset={5}
      arcLinkLabelsDiagonalLength={20}
      arcLinkLabelsStraightLength={20}
      arcLinkLabelsSkipAngle={5}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={false}
      arcLabelsRadiusOffset={0.5}
      arcLabelsSkipAngle={7}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      legends={
        isSmallDivice 
          ?  [{
            anchor: 'bottom-left',
            direction: 'column',
            justify: false,
            translateX: -60,
            translateY: isDashboard ? 80 : 0,
            itemWidth: 100,
            itemHeight: 20,
            itemsSpacing: 0,
            symbolSize: 20,
            itemDirection: 'left-to-right'
          }] 
          : [
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 70,
              itemsSpacing: 10,
              itemWidth: 110,
              itemHeight: 18,
              itemTextColor: "#999",
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 15,
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemTextColor: "#000",
                  },
                },
              ],
            },
          ]
        }
    />
  ));
};

export default PieChart;