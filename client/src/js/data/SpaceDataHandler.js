
var _this_ = null;

class SpaceDataHandler {


  constructor () {

    if (_this_ === null) _this_ = this;
  }


  async request (launch_url, rocket_url) {

    let launchRes = await this.makeRequest(launch_url);
    let rocketRes = await this.makeRequest(rocket_url);

    return this.filterData(launchRes, rocketRes);
  }


  async makeRequest (url, user_options = null) {

		const DEFAULT_OPTIONS = {
	    method: "get",
	    headers: { "Content-Type": "application/json" }
	  };

		const OPTIONS = (user_options === null) ? DEFAULT_OPTIONS : user_options;

	  return fetch(url, OPTIONS)
	    .then(res => res.json())
			.catch(err => console.error(err));
	}


  filterData (launch_data, rocket_data) {

    // trim data object
		return launch_data.map((launch_obj) => {

				let rocket = this.filterRocket(launch_obj.rocket.rocket_id, rocket_data);
				let payloads = this.filterPayload(launch_obj.rocket.second_stage.payloads);

				return {
					flight_number: launch_obj.flight_number,
				  mission_name: launch_obj.mission_name,
				  description: launch_obj.description || launch_obj.details,
				  launch_date_unix: launch_obj.launch_date_unix,
					rocket: rocket,
					payload: payloads
				};
		});
	}


	filterPayload (data) {

			return data.map((payload) => {
				return {
					payload_id: (payload.hasOwnProperty("payload_id")) ? payload.payload_id : '',
				  reused: Boolean(payload.reused),
				  nationality: payload.nationality,
				  manufacturer: payload.manufacturer,
				  type: payload.payload_type,
				  customers: payload.customers
				}
			});
	}


	filterRocket (id, data) {

		for (var i = 0; i < data.length; i++) {

			if (id === data[i].rocket_id) {

				let rocket = data[i];

				return {
					rocket_id: rocket.rocket_id,
			    rocket_name: rocket.rocket_name,
			    description: rocket.description,
			    country: rocket.country,
			    company: rocket.company,
			    cost_per_launch: rocket.cost_per_launch,
			    images: rocket.flickr_images
				};
			}
		}
	}
}

export default (_this_ === null) ? new SpaceDataHandler() : _this_;
