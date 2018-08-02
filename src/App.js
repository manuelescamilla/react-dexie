import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BounceLoader } from 'react-spinners';

import db from './db';
import { countBy, toString, mean } from 'ramda';
import CombinedChart from './combinedChart';

const API = 'https://data.providenceri.gov/resource/r6n7-qjr6.json';
const limit = '?$limit=50000';

class App extends Component {
	constructor() {
		super();
		this.state = {
			pieSeries: [],
			columnSeries: [],
			xAxisCategories: [],
			isLoading: false,
			error: null
		};
	}

	addBulkDataToIndexedDB(data) {
		return new Promise((resolve, reject) => {
		db.table('dataset').bulkAdd(data)
			.then(data => {
				resolve(data);
			})
		})
	}

	// We may write query methods later
	getAllFromIndexedDB() {
		return new Promise((resolve, reject) => {
			db.table('dataset')
				.toArray()
				.then(data => {
					resolve(data);
				})
		})
	}

	fetchAPI() {
		return new Promise((resolve, reject) => {
			fetch(`${API}${limit}`)
				.then(response => {
					if (response.status >= 200 && response.status < 300) {
						resolve(response.json())
					} else {
						const error = new Error(`HTTP Error ${response.statusText}`);
						error.status = response.statusText;
						error.response = response;
						console.log(error);
						throw error;
					}
				})
				.catch(error => {
					this.setState({ error, isLoading: false})
					reject(error);
				});
		})
	}

	stateFromDB() {
		this.getAllFromIndexedDB()
			.then(dataset => this.updateState(dataset));
	}

	stateFromAPI() {
			this.fetchAPI()
			.then(data => this.addBulkDataToIndexedDB(data))
			.then(this.getAllFromIndexedDB)
			.then(dataset => this.updateState(dataset));
	}

	getPieSeries(dataset) {
		const levyCodeArray = dataset.map(datum => datum.levy_code_desc);
		const levyCodeSummary = (countBy(toString)(levyCodeArray));
		const xAxisCategories = Object.keys(levyCodeSummary).map(key => key.replace(/"/g, ""));

		const pieSeries = Object.keys(levyCodeSummary).map(key => ({
				name: key.replace(/"/g, ""),
				y: levyCodeSummary[key]
			})
		);

		return { pieSeries, xAxisCategories };
	}

	getColumnSeries(dataset, xAxisCategories) {
		let columnSeries = [];

		const totalAssesmentArray = dataset.map(datum => {
			const {levy_code_desc, total_assessment} = datum;
			return { levy_code_desc : levy_code_desc, total_assessment: total_assessment};
		});

		xAxisCategories.forEach(code => {
			const category = totalAssesmentArray.filter(item => {
				return code === item.levy_code_desc;
			});
			const mapTotalAssesment = category.map(datum => datum.total_assessment);
			columnSeries.push(Number.parseFloat(mean(mapTotalAssesment).toFixed(0)));
		});

		return columnSeries;
	}

	updateState(dataset) {
		const pieChart = this.getPieSeries(dataset);
		const columnChart = this.getColumnSeries(dataset, pieChart.xAxisCategories);

		this.setState({
			pieSeries: pieChart.pieSeries,
			xAxisCategories: pieChart.xAxisCategories,
			columnSeries: columnChart,
			isLoading: false
		});
	}

	componentDidMount() {

		this.setState({ isLoading: true });

		db.table('dataset')
			.count()
			.then(count => count === 0 ? this.stateFromAPI() : this.stateFromDB() );
	}

  render() {

		const { isLoading, pieSeries, columnSeries, xAxisCategories } = this.state;

		if (isLoading) {
      return (
				<div className='loading'>
					<div className="loading__icon">
						<BounceLoader
							color={'#36D7B7'}
						/>
					</div>
      </div>
			);
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
				<div className="chart">
					<CombinedChart
						pieSeries={pieSeries}
						columnSeries={columnSeries}
						xAxisCategories={xAxisCategories}
					/>
				</div>
				<div className="notes">
					<h4>Notes</h4>
					<p>Using this chart I want to show the distribution of levy code and its correlation with assessment.</p>
					<p>I didn’t choose to show more charts because my focus is to better understand a certain aspect of the data.</p>
					<p>There are potentially many things to show from the data</p>
					<p><strong>API</strong> https://data.providenceri.gov/Finance/2017-Property-Tax-Roll/ku9m-5rhr</p>
					<p><strong>Stack</strong> React, IndexedDB, Dexie.js, Ramda.js, react-jsx-highcharts <span role="img" aria-label="monitor">🖥️ </span> Better viewing experience at 1024px+</p>
					<p><span role="img" aria-label="monitor">🦄 </span>Thanks for taking the time to view my code - Manuel</p>
				</div>
      </div>
    );
  }
}

export default App;
