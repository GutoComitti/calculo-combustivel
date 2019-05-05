import { Component, OnInit } from '@angular/core';

import { ApiService } from './shared/services/api.service';

import { Result } from './shared/models/result.model';
import { Price } from './shared/models/price.model';
import { Supply } from './shared/models/supply.model';
import { Spent } from './shared/models/spent.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
	prices: Price[] = [];
	supplies: Supply[] = [];
	spents: Spent[] = [];
	results: Result[] = [];
  constructor(private apiService: ApiService) { }
  
  ngOnInit(){
		this.apiService.getPrices().subscribe((prices) => {
  		this.prices = prices;
  		this.apiService.getSupplies().subscribe((supplies) => {
  			this.supplies = supplies;
  			this.apiService.getSpents().subscribe((spents) => {
  				this.spents = spents;
  				this.calcResult();
  				this.addResults();
  			});
  		});
  	});


  	// this.getValues().subscribe(()=>{
  	// 	this.calcResult();
  	// }).subscribe(()=>{
  	// 	this.addResults();  		
  	// });;

  	// this.getValues().then(() => {
	  // 	this.calcResult()
	  // 	.then(() => {
	  // 		this.addResult();
	  // 	});
  	// })
  }

  // getPrices(){
  // 	this.apiService.getPrices().subscribe((response) => {
  // 		this.prices = response;
  // 		console.log("Prices:");
  // 		console.log(this.prices);
  // 		return Promise.resolve();
  // 	});
  // }

  // getSupplies(){
  // 	this.apiService.getSupplies().subscribe((response) => {
  // 		this.supplies = response;
  // 		console.log("Supplies:");
  // 		console.log(this.supplies);
  // 		return Promise.resolve();
  // 	});
  // }

  // getSpents(){
  // 	this.apiService.getSpents().subscribe((response) => {
  // 		this.spents = response;
  // 		console.log("Spents:");
  // 		console.log(this.spents);
  // 		return Promise.resolve();
  // 	});
  // }

  // getValues(){
  // 	this.getSpents().subscribe(()=>{
  // 		this.getPrices();
  // 	}).subscribe(()=>{
  // 		this.getSupplies();
  // 	}).subscribe(()=>{
  // 		return Promise.resolve();  		
  // 	});
  	// this.getSpents().subscribe(() => {
  	// 	this.getPrices().subscribe(() => {
  	// 		this.getSupplies();
  	// 	})
  	// })
  // }

  calcResult(){
  	//A data onde começou a ter combustível e começou a ser possível gastar combustível
  	const consumo = 9;
  	let lastPrice;
  	let fuelAmount = 0;

  	let indPrices = 0;
  	let indSupplies = 0;
  	let indSpents = 0;

  	let increasePrices = true;
  	let increaseSupplies = true;
  	let increaseSpents = true;

  	let nextSpentDate = this.decodeDate(this.spents[indSpents].date);
  	let nextPriceDate = this.decodeDate(this.prices[indPrices].date);
  	let nextSupplyDate = this.decodeDate(this.supplies[indSupplies].date);

  	//A primeira data é a menor de todas entre as 3
  	let currentDate = nextPriceDate > nextSpentDate ? nextSpentDate.getTime() : nextPriceDate.getTime();
  	currentDate = nextSupplyDate.getTime() > currentDate ? new Date(currentDate) : new Date(nextSupplyDate.getTime());

  	//Enquanto houverem gastos e abastecimentos vai populando o array com os resultados diários
  	while(increaseSpents && increaseSupplies){


  		//Checa se chegou na data da proxima alteração de preços e se sim, ajusta as variáveis de acordo
  		/*O indPrices está sendo setado para a próxima alteração de preços, então o lastPrice vai ser 
  		setado antes de aumentar o índice*/
  		if (this.sameDates(currentDate, nextPriceDate) && increasePrices){
  			lastPrice = this.prices[indPrices].value;
  			indPrices++;
  			//Se não passou da ultima data, seta a data, caso contrário, para com as alterações de preços
  			if (indPrices < this.prices.length){
  				nextPriceDate = this.decodeDate(this.prices[indPrices].date);
  			}else{
  				increasePrices = false;
  			}
  		}

  		//Checa se foi abastecido no dia e se sim, aumenta
  		if (this.sameDates(currentDate, nextSupplyDate) && increaseSupplies){
  			fuelAmount += (this.supplies[indSupplies].value / lastPrice);
  			indSupplies++;
  			if (indSupplies >= this.supplies.length){
  				increaseSupplies = false;
  			}else{
  				nextSupplyDate = this.decodeDate(this.supplies[indSupplies].date);
  			}
  		}

  		//Checa se foi gasto no dia e se sim, diminui   		
  		if (this.sameDates(currentDate, nextSpentDate) && increaseSpents){
  			fuelAmount -= (this.spents[indSpents].value / consumo);
  			indSpents ++;
  			if (indSpents >= this.spents.length){
  				increaseSpents = false;
  			}else{
  				nextSpentDate = this.decodeDate(this.spents[indSpents].date);
  			}
  		}

  		fuelAmount = parseFloat(fuelAmount.toFixed(2));

  		this.results.push({
  			date: this.encodeDate(currentDate),
  			value: fuelAmount
  		})

  		currentDate.setDate(currentDate.getDate() +1);
  	}
  	Promise.resolve();
  }

  addResults(){
  	debugger;
  	this.apiService.addResults(this.results).subscribe((response) => {
  		alert("Response do addResults: "+response);
  		debugger;
  	}, (error) =>{
  		debugger;
  		alert("Erro do addResults: "+error);
  	});;
  }

	decodeDate(date){
  	const dateArray = date.split('/');
  	const americanDate = dateArray[1] + '/' + dateArray[0] + '/' + dateArray[2];
  	return new Date(americanDate);
  }

  encodeDate(date){
  	//Passar uma variável Date pra uma data string no formato dd/mm/yyyy
  	const year = date.getFullYear();

	  let month = (1 + date.getMonth()).toString();
	  month = month.length > 1 ? month : '0' + month;

	  let day = date.getDate().toString();
	  day = day.length > 1 ? day : '0' + day;

 	 	return day + '/' + month + '/' + year;
  }
  sameDates(date1, date2){
  	return date1.getDate() == date2.getDate() && 
  				 date1.getMonth() == date2.getMonth() && 
  				 date1.getFullYear() == date2.getFullYear();
  }

}