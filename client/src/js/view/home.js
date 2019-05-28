import Hogan from 'hogan.js';
import EventEmitter from 'events';
import GraphDataHandler from 'data/GraphDataHandler';

const SERVER_URL = "http://localhost:4000/graphql";
const USER_ID = null; //"5ceaf2857c3d3e71de86581a";

const TEMPLATE = `
  <div class="view home">
  <div class="launches">
    <h1>LAUNCHES</h1>
    {{#launch}}
      <div class="launch">
        <div class="title">
          <span class="launch-num">{{flight_number}}.</span><h2>{{mission_name}}</h2>
        </div>
        <p class="description">{{description}}</p>
        <div data-launch-id="{{flight_number}}" class="button">
          <div class="label">FAVORITE</div>
        </div>
      </div>
    {{/launch}}
    </div>
  </div>
`;


class Home {


  constructor (el) {

    this.el = el;
    this.template = Hogan.compile(TEMPLATE);
  }


  init (launch_data, user_data) {

    // render template with latest data
    this.data = { launch:launch_data, user:user_data };
    this.render(this.el, this.template, this.data);

    // convert htmlCollection to array
    const buttons = [...document.querySelectorAll('.button')];
    this.setupButtons(buttons, this.data.user);
  }


  render (el, template, data) {

    let html = template.render(data);
    el.innerHTML = html;
  }


  setupButtons (buttons, user_data) {

    buttons.forEach((el) => {

      let favoriteID = el.dataset.launchId;
      let favorites = user_data.favorites;

      // check if user previously favorited any launches
      for (let i = 0; i < favorites.length; i++) {
        if (favoriteID === favorites[i].favoriteID) {
          el.classList.add('active');
        }
      }

      el.addEventListener('click', (e) => {
        this.on_BUTTON_CLICK(e, el);
      });
    });
  }


  async on_BUTTON_CLICK (e, el) {

    let favoriteID = el.dataset.launchId;
    let res;

    if (el.classList.contains('active')) {

      res = await this.removeFavorite(SERVER_URL, USER_ID, favoriteID);
      if (res) el.classList.remove('active');

    } else {

      let res = await this.addFavorite(SERVER_URL, USER_ID, favoriteID);
      if (res) el.classList.add('active');
    }
  }


  async addFavorite (url, id, favorite_id) {

    let res = await GraphDataHandler.addFavorite(url, id, favorite_id);
    return res;
  }


  async removeFavorite (url, id, favorite_id) {

    let res = await GraphDataHandler.removeFavorite(url, id, favorite_id);
    return res;
  }


  resize (w, h) {

  }
}

export default Home;
