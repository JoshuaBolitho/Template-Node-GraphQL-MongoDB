import { request } from 'graphql-request';

const USERS_QUERY = `query users {
  users {
    _id
    name
    favorites {
      favoriteID
    }
  }
}`;

const USER_QUERY = `query user($_id:String!) {
  user(_id:$_id) {
    _id
    name
    favorites {
      favoriteID
    }
  }
}`;

const ADD_USER_MUTATION = `mutation addUser($name:String!) {
  addUser(name:$name) {
    _id
    name
    favorites {
      favoriteID
    }
  }
}`;

const ADD_FAVORITE_MUTATION = `mutation addFavorite ($_id:String!, $favoriteID:String!) {
  addFavorite (_id:$_id, favoriteID:$favoriteID) {
    _id
    favorites {
      favoriteID
    }
  }
}`;

const REMOVE_FAVORITE_MUTATION = `mutation removeFavorite ($_id:String!, $favoriteID:String!) {
  removeFavorite (_id:$_id, favoriteID:$favoriteID) {
    _id
    favorites {
      favoriteID
    }
  }
}`;

var _this_ = null;

class GraphDatalHandler {


  constructor () {

    if (_this_ === null) _this_ = this;

  }


  async requestUser (url, id) {

    // spoof user
    if (id === null)
      this.defaultUserID = await this.firstRunCheck(url);

		const variables = {
		  "_id": (id) ? id : this.defaultUserID
		};

		return request(url, USER_QUERY, variables)
			.then(data => data)
			.catch(err => console.error(err));
	}


  requestUsers (url) {

		return request(url, USERS_QUERY)
			.then(data => data)
			.catch(err => console.error(err));
	}


  async firstRunCheck (url) {

    let users = await this.requestUsers(url);
    users = users.users;

    // grab first entry if exists, else add first user entry to db
    if (users.length < 1) {
      let res = await this.addUser(url, "xxx xxxxx");
      return res.addUser._id;
    } else {
      console.log(users)
      return users[0]._id;
    }
  }


  addUser (url, name) {

    const variables = {
      "name": name
    };

    return request(url, ADD_USER_MUTATION, variables)
      .then(data => data)
      .catch(err => console.error(err));
  }


  addFavorite (url, id, favorite_id) {

		const variables = {
		  "_id": (id) ? id : this.defaultUserID,
      "favoriteID": favorite_id
		};

		return request(url, ADD_FAVORITE_MUTATION, variables)
			.then(data => data)
			.catch(err => console.error(err));
	}


  removeFavorite (url, id, favorite_id) {

		const variables = {
		  "_id": (id) ? id : this.defaultUserID,
      "favoriteID": favorite_id
		};

		return request(url, REMOVE_FAVORITE_MUTATION, variables)
			.then(data => data)
			.catch(err => console.error(err));
	}

}

export default (_this_ === null) ? new GraphDatalHandler() : null;
