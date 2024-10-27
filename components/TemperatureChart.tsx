import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';

const useOrientation = () => {
  const [orientation, setOrientation] = useState('portrait');

  const handleOrientationChange = () => {
    const { width, height } = Dimensions.get('window');
    setOrientation(width > height ? 'landscape' : 'portrait');
  };

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', handleOrientationChange);
    handleOrientationChange(); 
    return () => subscription?.remove();
  }, []);

  return orientation;
};

const TemperatureChart: React.FC = () => {
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const channelId = '1293177'; 
  const fieldId = '5'; 

  const orientation = useOrientation(); 

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://api.thingspeak.com/channels/${channelId}/fields/${fieldId}.json?results=15`
      );

      const values = response.data.feeds
        .map((feed: any) => parseFloat(feed[`field${fieldId}`]))
        .filter((value: number) => !isNaN(value));

      const times = response.data.feeds
        .map((feed: any) => new Date(feed.created_at).toLocaleTimeString())
        .slice(0, values.length);

      setData(values);
      setLabels(times);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={{ padding: 20, flex: 1, flexDirection: orientation === 'portrait' ? 'column' : 'row' }}>
      <Text style={{ fontSize: 20, marginBottom: 10, color: '#D0D0D0'}}>SD Wind</Text>
      <LineChart
        data={{
          labels: labels.length ? labels : ['Loading...'],
          datasets: [
            {
              data: data.length ? data : [0],
              strokeWidth: 2,
            },
          ],
        }}
        width={screenWidth - 40}
        height={orientation === 'portrait' ? 220 : 300}
        yAxisLabel="Wind"
        xAxisLabel="Date"
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ffa726',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

export default TemperatureChart;
