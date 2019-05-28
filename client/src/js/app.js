import "@babel/polyfill";
import Home from 'view/home';
import GraphDataHandler from 'data/GraphDataHandler';
import SpaceDataHandler from 'data/SpaceDataHandler';

// environment variables
const LAUNCHES_URL = "https://api.spacexdata.com/v3/launches";
const ROCKETS_URL = "https://api.spacexdata.com/v3/rockets";
const SERVER_URL = "http://localhost:4000/graphql";
const USER_ID = null; //"5ceaf2857c3d3e71de86581a";


class App {


	constructor () {

	}


	async init () {

		this.spaceData = await SpaceDataHandler.request(LAUNCHES_URL, ROCKETS_URL);
		this.userData = await GraphDataHandler.requestUser(SERVER_URL, USER_ID);

		this.home = new Home(document.getElementsByClassName('views')[0]);
		this.home.init(this.spaceData, this.userData.user);

		window.onresize = this.resize.bind(this);
	}


	update () {

		window.requestAnimationFrame(this.update.bind(this));
	}


	resize () {

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.home.resize(this.width, this.height);
	}
}

var app = new App();
app.init();
