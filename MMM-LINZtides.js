/* global Module */

/* Magic Mirror
 * Module: MMM-LINZtides
 *
 * 
 * 
 *(very) based on MMM-Worldtides:
 * 
 * By Stefan Krause http://yawns.de
 * MIT Licensed.
*/

Module.register('MMM-LINZtides',{

	defaults: {
		numberOfDays: 4,
		units: config.units,
		animationSpeed: 1000,
		timeFormat: config.timeFormat,
		lang: config.language,

		tideStation: "Auckland",

		lowtideSymbol: "fa fa-download",
		hightideSymbol: "fa fa-upload",
		boldHightide: true,
		boldLowtide: false,
		announceNextHigh: true,

		updateInterval: 23, //hours
		initialLoadDelay: 0, // 0 seconds delay
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define requird styles
	getStyles: function() {
		return ["font-awesome.css"];
	},

	start: function() {
		Log.info('Starting module: ' + this.name);
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.updateTimer = null;

		this.config.header = "HALLO";

		var self = this;
		setInterval(function() {
			self.updateDom();
		}, this.config.animationSpeed);

	},

	getDom: function() {
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = this.translate('LOADING');
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.tides.length) {
			wrapper.innerHTML = "No data";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var currentDate = this.tides[0].date;

		var table = document.createElement("table");
		table.className = "small";

		var row = document.createElement("tr");
		table.appendChild(row);
		var dayHeader = document.createElement("th");
		dayHeader.className = "day";
		dayHeader.innerHTML = "&nbsp;";
		row.appendChild(dayHeader);

		for (var f = 0; f < 4; f++)
		{
			var tideSymbol =  document.createElement("span");
			tideSymbol.className = ( (this.tides[f].type == "Low") ? this.config.lowtideSymbol : this.config.hightideSymbol );
			var extremeHeader = document.createElement("th");
			extremeHeader.className = "thin light";
			extremeHeader.setAttribute("style", "text-align: center");
			extremeHeader.appendChild(tideSymbol);
			row.appendChild(extremeHeader);
		}

		var row = document.createElement("tr");
		table.appendChild(row);
		var dayCell = document.createElement("td");
		dayCell.className = "day";
		dayCell.innerHTML = this.tides[0].day;
		row.appendChild(dayCell);
		var nextHighIndex =-1;
		var nextLowIndex = -1;

		for (var i in this.tides) {

			var currentTide = this.tides[i];

			if (currentDate != currentTide.date) {
				var row = document.createElement("tr");
				table.appendChild(row);
				currentDate = currentTide.date;

				var dayCell = document.createElement("td");
				dayCell.className = "day";
				dayCell.innerHTML = currentTide.day;
				row.appendChild(dayCell);
				currentExtremeCol = 0

				if (this.tides[i].type != this.tides[0].type){
					var tideExtremeCell = document.createElement("td"); // create empty cell for when only 3 peaks in a day
				}

			}


			var tideExtremeCell = document.createElement("td");
			tideExtremeCell.style.paddingLeft = "10px";
			tideExtremeCell.innerHTML = currentTide.time;

			if ( moment().unix() > currentTide.dt ) {
				tideExtremeCell.className = "dimmed light small";
			} else if (currentTide.type == "High"){
				if (this.config.boldHightide){
					tideExtremeCell.className = "bright";
				}
				if (nextHighIndex==-1){
					nextHighIndex=i;
				}
			} else if (currentTide.type == "Low"){
				if (this.config.boldLowtide){
					tideExtremeCell.className = "bright";
				}
				if (nextLowIndex==-1){
					nextLowIndex=i;
				}
			} 

			row.appendChild(tideExtremeCell);
		}
		wrapper.appendChild(table);

		if (this.config.announceNextHigh){
			var announceDiv = document.createElement("div");
			announceDiv.className = "normal";
			const prevMinutesThreshold = moment.relativeTimeThreshold('m');
			moment.relativeTimeThreshold('m', 15);
			announceDiv.innerHTML = "Next <span class=\"bright\">high tide</span> " + moment(this.tides[nextHighIndex].dt,"X").fromNow();
			moment.relativeTimeThreshold('m', prevMinutesThreshold);
			wrapper.appendChild(announceDiv);
		}

		return wrapper;
	},

	/* updateTides
	 * Loads tide data from LINZ csv
	 * Calls updateDom when done on successful response.
	 */
	updateTides: function(callback) {
		const inputFile='public/'+ this.config.tideStation + ' ' + new Date().getFullYear()+'.csv';

		const xobj = new XMLHttpRequest(),
		path = this.file(inputFile)
		xobj.overrideMimeType("text/csv");
		xobj.open("GET", path, true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState === 4 && xobj.status === 200) {	
				callback(xobj.responseText);
			}
			
		};
		xobj.send(null);
		this.scheduleUpdate(-1);
	},

	process : function(data) {
		
		const rows = data.split(/\n/);//data.split(/\s+/);
        let rowNum;
        let cells;
		this.tides = []
		let dayCount = 0;
        
        for (rowNum = 3 ;rowNum < rows.length; ++rowNum) {
			cells = rows[rowNum].split(",");
			let date = new Date(cells[3],cells[2]-1,cells[0]); // extract date from first 3(actually 4) columns. January is 0 in JS world
			if (!(date instanceof Date) || isNaN(date)) break;
			if (moment(date).isBefore(moment(), 'day')){ //we are not interested in bygone days.
				 continue;
			} else {
				if (dayCount>=this.config.numberOfDays) break; //we're done - have all days we need.
				dayCount++;
			}
			let i = 4;
			let high;
			while (true) { 
				//go thru each columns of csv
				//data is in time-height pairs
				const ht = parseFloat(cells[i+1]);
				if (isNaN(ht)) break;
		
				const ts = cells[i].split(':');
				date.setHours(parseInt(ts[0]));
				date.setMinutes(parseInt(ts[1]));
		
				
				if (i == 4 ){ //5th column
					let nextht = parseFloat(cells[i+3]); // look forward for first one
					high = (ht>nextht);
				} else {
					high = !high;
				}
		
				i +=2;
				this.tides.push({
					dt: ~~(+date / 1000),
					date: moment(date).format("YYYY-MM-DD"),
					day: moment(date).format("ddd"),
					time: moment(date).format("hh:mm a"),
					type: high ? "High" : "Low"
				});
			}
        }

		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		let nextupdate = this.config.updateInterval * 60 * 60 * 1000;

		if (typeof delay !== "undefined" && delay >= 0) {
			nextupdate = delay;
		}
		var self = this;
		setTimeout(function() {
			self.updateTides((response) => {
				self.process(response);
			});
		}, nextupdate);
	},

});
