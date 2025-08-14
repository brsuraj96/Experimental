import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

const ChartBlock = ({
  title,
  chartType,
  data,
}: {
  title: string;
  chartType: "line" | "bar" | "pie";
  data: any;
}) => {
  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart
            data={data}
            width={300}
            height={200}
            chartConfig={chartConfig}
          />
        );
      case "bar":
        return (
          <BarChart
            data={data}
            width={300}
            height={200}
            chartConfig={chartConfig}
            yAxisLabel="$"
            yAxisSuffix="k"
          />
        );
      case "pie":
        return (
          <PieChart
            data={data}
            width={300}
            height={200}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        );
      default:
        return null;
    }
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
  };

  return (
    <View style={styles.block}>
      <Text style={styles.title}>{title}</Text>
      {renderChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});

export default ChartBlock;
