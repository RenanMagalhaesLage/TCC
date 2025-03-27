import React, { useState, useEffect } from "react";
import { useTheme,useMediaQuery } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { mockBarData as data } from "../data/mockData";
import { colorSchemes } from "@nivo/colors";
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";

const BarChart = ({isDashboard, safraId}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery("(max-width: 800px)");
  const isSmallDivice = useMediaQuery("(max-width: 1400px)");
  const isMediumDivice = useMediaQuery("(max-width: 1800px)");
  const nivoColors = colorSchemes.nivo;

  const [userData, setUserData] = useState(null);
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    const storedUser = secureLocalStorage.getItem('userData'); 
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (userData && userData.email) { 
      const fetchBarData = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/custos-glebas-bar-chart`, {
            params: { safraId: safraId }
          });
          console.log(response.data)            
          setBarData(response.data); 
                        
        } catch (error) {
          console.log("ERRO - ao buscar no banco de dados.");
        }
      };
      fetchBarData();
    }
  }, [userData]);  


  return (
  <ResponsiveBar
        data={barData}
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
        keys={[
            'defensivos',
            'operações',
            'semente',
            'arrendamento',
            'administrativo',
            'corretivos e fertilizantes'
        ]}
        indexBy="gleba"
        margin={isMobile ? { top: 20, right: 20, bottom: 50, left: 60 } : { top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.5}
        innerPadding={3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.6
                ]
            ]
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'glebas',
            legendPosition: 'middle',
            legendOffset: 32,
            truncateTickAt: 0,
            tickValues: isMobile ? [] : undefined
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: isDashboard && isMobile ? '' : 'custos',
            legendPosition: 'middle',
            legendOffset: -48,
            truncateTickAt: 0
        }}
        enableTotals={true}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.6
                ]
            ]
        }}
        legends={[
            {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
        role="application"
        ariaLabel="Nivo bar chart demo"
        barAriaLabel={e=>e.id+": "+e.formattedValue+" in country: "+e.indexValue}
    />
  );
};

export default BarChart;