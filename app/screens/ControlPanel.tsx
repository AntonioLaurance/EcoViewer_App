import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { LineChart } from 'react-native-chart-kit';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';

const ControlPanel = ({ route }) => {
  const channelId = route.params.data.channelId === undefined? route.params.channelId : route.params.data.channelId;
  const password = route.params.data.password === undefined? route.params.password : route.params.data.password; 
  const [voltage, setVoltage] = useState(0);
  const [current, setCurrent] = useState(0);
  const [batteryOn, setBatteryOn] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [batteryCharge, setBatteryCharge] = useState(0);
  const efficiencyRange = [40, 70];
  const [graphData, setGraphData] = useState({ labels: [], datasets: [] });


  const fetchData = async () => {
    try {
      const response = password === '' ? await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json`) : await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${password}`);
      const data = await response.json();

      if (data && data.feeds && data.feeds.length > 0) {
        const latestData = data.feeds[data.feeds.length - 1];
        setVoltage(parseFloat(latestData.field1) || 0);
        setCurrent(parseFloat(latestData.field2) || 0);
        setBatteryCharge(parseFloat(latestData.field3) || 0);
        setVelocity(parseFloat(latestData.field4) || 0);
        setBatteryOn(voltage != 0);

        // Update graph data
        const labels = [...graphData.labels, new Date().toLocaleTimeString()]; // Current time as label
        const velocityData = [...graphData.datasets[0]?.data || [], parseFloat(latestData.field4) || 0];
        const currentData = [...graphData.datasets[1]?.data || [], parseFloat(latestData.field2) || 0];

        setGraphData({
          labels,
          datasets: [
            { data: velocityData, color: () => '#ff4500', strokeWidth: 2 },
            { data: currentData, color: () => '#ff6347', strokeWidth: 2 },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  //Update data
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    fetchData(); 

    const interval = setInterval(fetchData, 1000); 

    return () => clearInterval(interval); 
  }, []); 

  const calculatePower = () => voltage * current;

  const getLampIndicatorColor = () => {
    if (velocity >= efficiencyRange[0] && velocity <= efficiencyRange[1]) return 'green';
    if (velocity > efficiencyRange[1]) return 'red';
    return 'orange';
  };

  return (
    <View style={styles.container}>

{/* Top Section ----------------------------------------------------------------------------------------*/}
      <View style={styles.topSection}>

        {/* Power Usage */}
        <View style={styles.topComponent}>
          <Text style={styles.label}>P</Text>
          <Text style={styles.value}>{calculatePower().toFixed(2)} W</Text>
        </View>

        {/* Battery Status */}
        <View style={[styles.topComponent, styles.batteryStatusContainer]}>
          <Text style={[styles.batteryStatusText, batteryOn ? styles.batteryOn : styles.batteryOff]}>
            Battery {batteryOn ? 'ON' : 'OFF'}
          </Text>
        </View>

        {/* Current Usage */}
        <View style={styles.topComponent}>
          <Text style={styles.label}>I</Text>
          <Text style={styles.value}>{current.toFixed(2)} A</Text>
        </View>
      </View>

{/* Bottom Section ----------------------------------------------------------------------------------------*/}

      {/* Bottom Left: Graph of Velocity & Current */}
      <View style={styles.graphContainer}>
        <TouchableOpacity
          onStartShouldSetResponderCapture={() => true} // Use this instead
        >
        <Text style={styles.label}>Velocity & Current</Text>
        <LineChart
          data={graphData}
          width={Dimensions.get('window').width * 0.30}
          height={Dimensions.get('window').height * 0.43}
          chartConfig={{
            backgroundColor: '#1a1a1a',
            backgroundGradientFrom: '#1a1a1a',
            backgroundGradientTo: '#1a1a1a',
            color: (opacity = 1) => `rgba(255, 69, 0, ${opacity})`,
            labelColor: () => '#ff4500',
          }}
          withInnerLines={false}
          bezier
          style={styles.graphStyle}
        />
        </TouchableOpacity>
      </View>

      {/* Bottom Middle: Mileage & Battery Charge */}
      <View style={styles.speedBatteryContainer}>
        <Svg height="100%" width="100%" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="48" stroke="#ff4500" strokeWidth="2" fill="transparent" />
          <SvgText x="50" y="40" fill="#ff4500" fontSize="10" textAnchor="middle">
            {`${velocity} km/h`}
          </SvgText>
          <SvgText x="50" y="65" fill="#ff4500" fontSize="10" textAnchor="middle">
            {`Charge: ${batteryCharge}%`}
          </SvgText>
        </Svg>
      </View>

      {/* Bottom Right: Lamp Indicator */}
      <View style={styles.lampContainer}>
        <Svg height="100%" width="100%" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="40" fill={getLampIndicatorColor()} />
        </Svg>
      </View>
    </View>
  );
};

/* STYLES ----------------------------------------------------------------------------------------*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#1a1a1a',
    padding: 10,
  },
  topSection: {
    flexDirection: 'row',
    width: '100%',
    height: '30%',
    backgroundColor: '#333',
    borderColor: '#ff4500',
    borderWidth: 2,
    marginBottom: 10,
  },
  topComponent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryStatusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryStatusText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  batteryOn: {
    backgroundColor: 'green',
  },
  batteryOff: {
    backgroundColor: 'red',
  },
  graphContainer: {
    width: '33%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  graphStyle: {
    marginVertical: 8,
  },
  speedBatteryContainer: {
    width: '33%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lampContainer: {
    width: '33%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#ff4500',
    fontSize: 18,
    marginBottom: 5,
  },
  value: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default ControlPanel;
