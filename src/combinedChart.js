import React from 'react';
import Highcharts from 'highcharts';
import {
  HighchartsChart, Chart, Tooltip, withHighcharts, XAxis, YAxis, Title, Legend, ColumnSeries, PieSeries
} from 'react-jsx-highcharts';

const CombinedChart = (props) => (
      <div className="app">
        <HighchartsChart>
          <Chart />

          <Title>Combined Chart</Title>
		  <Tooltip />

          <Legend />

          <XAxis categories={props.xAxisCategories} />

          <YAxis>
            <ColumnSeries name="Average Assesment" data={props.columnSeries} />
            <PieSeries name="" title="manu" data={props.pieSeries} center={[340, 100]} size={150} showInLegend={false} />
          </YAxis>
        </HighchartsChart>

      </div>
);

export default withHighcharts(CombinedChart, Highcharts);
