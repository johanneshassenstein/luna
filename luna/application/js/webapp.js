/*LOCATION
**stores longitude and latitude, defaults to the pole.
**Throws an error message when permission is denied or the feature is not present.
*/
document.body.scrollTop = 0;

var _main = new Luna(); //stores the main object
_main.init(); //initiates the main object
_main.setLocation();
document.body.scrollTop = 0; //unscrolls the body



/*EVENTS
**creates all event listeners for the interaction with Luna
*/
window.onkeydown = function(e) {//when a key is pressed
   var key = e.keyCode; //gets the respective keycode from the event
   switch(key){ //switch on the key code
     case 37: //left arrow
      _main.calendar.changeSelection(-1); //changes the selected element by -1
     break;
     case 38: //up arrow
      if(_main.settings.open){
        _main.settings.changeSelection(-1); //changes the selected setting by -1
      }
      else{
         _main.calendar.changeSelection(-7); //changes the selected element by -7
      }
     break;
     case 39: //right arrow
       _main.calendar.changeSelection(1); //changes the selected element by 1
     break;
     case 40: //down arrow
       if(_main.settings.open){
         _main.settings.changeSelection(1); //changes the selected setting by 1
       }
       else{
          _main.calendar.changeSelection(7); //changes the selected element by 7
       }
     break;
     case 0: //any of the two softkeys
       _main.settings.toggle();
     break;
     case 27: //esc button
       _main.settings.toggle();
       break;
     case 13: //center button
       if(_main.settings.open){
         _main.settings.select(); //changes the selected setting by 1
       }
       else{
         _main.detail.toggle();; //changes the selected element by 7
       }
     break;
     break;
   }
}

/*LUNA
**main object that hold all other objects
*/
function Luna(){
  this.calendar = new Calendar(31); //stores the virtual calendar
  this.ui = new UI(); //stores the UI elements
  this.detail = new Detail();
  this.settings = new Settings();
  this.latitude = 53.57727810000001; //sets to fallback
  this.longitude = 10.0170888;
  /*INIT
  **initiates all elements held by the main element
  */
  this.init = function(){
    this.calendar.init();
    this.ui.init();
  }
  /*CHANGECALENDAR
  **changes the amount of days in the virtual calandar
  */
  this.changeCalendar = function(num){
    this.ui.emptyMain();
    this.calendar = new Calendar(num);
    this.init();
  }
  /*CHANGELOCATION
  **changes the current location
  */
  this.setLocation = function(){
    if (navigator.geolocation) { //checks if geolocation feature is present
       navigator.geolocation.getCurrentPosition(function (p) { //gets current GPS position, passes it through the function
         this.latitude = p.coords.latitude; //sets lat to the correct ordinate
         this.longitude = p.coords.longitude; //sets long to the correct ordinate
       });
    }
    else { //if the geolocation feature is present
      alert('Geo Location feature must be present and location access needs to be allowed'); //shows an error message
    }
  }
}
/*UI
**holds all the UI getElementsByTagName
*/
function UI(){
  this.rise = document.getElementsByTagName("HEADER")[0].getElementsByTagName("DIV")[0].getElementsByTagName("SPAN")[0]; //stores the UI element, representing the risetime
  this.set = document.getElementsByTagName("HEADER")[0].getElementsByTagName("DIV")[1].getElementsByTagName("SPAN")[0]; //stores the UI element, representing the settime
  this.main = document.getElementsByTagName("MAIN")[0]; //Stores the main object
  this.aside = document.getElementsByTagName("ASIDE")[0]; //stores the aside element
  this.date = this.aside.getElementsByTagName("LI")[0].getElementsByTagName("SPAN")[0];
  this.sunset = this.aside.getElementsByTagName("LI")[1].getElementsByTagName("SPAN")[1];
  this.night = this.aside.getElementsByTagName("LI")[2].getElementsByTagName("SPAN")[1];
  this.nadir = this.aside.getElementsByTagName("LI")[3].getElementsByTagName("SPAN")[1];
  this.distance = this.aside.getElementsByTagName("LI")[4].getElementsByTagName("SPAN")[1];
  this.canvas = document.body.getElementsByTagName("CANVAS")[0];
  this.nav = document.getElementsByTagName("NAV")[0]; //stores the aside element
  this.moon = new Moon(this.canvas);
  this.mainEntitys = []; //stores all elements held by the main object for virtual access
  /*INIT
  **initiates the whole UI
  */
  this.init = function(){
    this.initMain(); //initiates the main element
    this.render(); //renders the whole UI after initialisation
  }
  /*INITMAIN
  **initiates the whole UI
  */
  this.initMain = function(){
    /*adds spacer elements to keep a clean calendar look*/
    var n;
    if(_main.calendar.days[0].date.getDay() == 0){ //if its a sunday
      n = 6; //add 6 spaces
    }
    else{ //on any other day
      n = _main.calendar.days[0].date.getDay() - 1; //add spaces corresponding to the day
    }
    for(n > 0; n--;){
      var entity = document.createElement("DIV"); //create a new div
      this.main.appendChild(entity); //appends the div to the main element
      //div is not added to the holding array to be unselectable
    }
    /*end*/
    for(var i = 0; i < _main.calendar.span; i++){//for all days held by the calendar
      var entity = document.createElement("DIV"); //create a new div
      var img = document.createElement("IMG"); //create a new img
      img.src = "images/moonphases/" + _main.calendar.days[i].description + ".png"; //set the source of the img to the correct image
      entity.appendChild(img); //appends the img to the div
      this.mainEntitys.push(entity); //pushes the div into the holding array
      this.main.appendChild(entity); //appends the div to the main element
    }
  }
  /*EMPTYMAIN
  **emptys the main element
  */
  this.emptyMain = function(){
    for(var i = 0; i < this.mainEntitys.length; i++){
      this.mainEntitys[i].parentNode.removeChild(this.mainEntitys[i]);
    }
    this.mainEntitys = [];
  }
  /*SETTIMES
  **sets the rise and set time with their respective function
  **takes a Phase object as an argument
  */
  this.setTimes = function(object){
    this.setRise(object);
    this.setSet(object);
  }
  /*SETRISE
  **sets the risetime in the UI
  **takes a Phase object as an argument
  */
  this.setRise = function(object){
    this.rise.innerText = this.format(object.rise.getHours()) + ":" + this.format(object.rise.getMinutes());
  }
  /*SETDETAILS
  **sets all the UI elements for detail view
  */
  this.setDetails = function(object){
    this.date.innerText = object.date.getDate() + " " + object.date.getMonth() + " " + object.date.getFullYear();
    this.sunset.innerText = this.format(object.sunset.getHours()) + ":" + this.format(object.sunset.getMinutes());
    this.night.innerText = this.format(object.night.getHours()) + ":" + this.format(object.night.getMinutes());
    this.nadir.innerText = this.format(object.nadir.getHours()) + ":" + this.format(object.nadir.getMinutes());;
    this.distance.innerText = Math.round(object.distance);
  }
  /*SETSET
  **sets the sertime in the UI
  **takes a Phase object as an argument
  */
  this.setSet = function(object){
    this.set.innerText = this.format(object.set.getHours()) + ":" + this.format(object.set.getMinutes());
  }
  /*RENDER
  **renders the UI completely
  */
  this.render = function(){
    this.select(_main.calendar.selected); //render selection
    this.setTimes(_main.calendar.days[_main.calendar.selected]); //render rise and set time
    this.setDetails(_main.calendar.days[_main.calendar.selected]); //render detail view
    this.moon.render(_main.calendar.days[_main.calendar.selected].phase);
  }
  /*SELECT
  **adds the selected class to the object currently selected
  */
  this.select = function(selection){
    this.mainEntitys[selection].classList.add("selected");
    this.scrollTo(selection);
  }
  /*DESELECT
  **removes the selected class from the object currently selected
  */
  this.deselect = function(selection){
    this.mainEntitys[selection].classList.remove("selected");
  }
  /*SCROLL
  **scroll the body to the current selection
  */
  this.scrollTo = function(selection){
    document.body.scrollTop = this.mainEntitys[selection].offsetTop - this.main.offsetTop;
  }
  /*FORMAT
  **formats a number to always have two digits
  **!!!outputs as a string, not a number, only for use in UI!!!
  */
  this.format = function(number){
    if(number < 10){
      number = "0" + number;
    }
    return number;
  }
}
/*CALENDAR
**the virtual moonphase calendar
**takes the amount of days to hold as an argument
**default is 31
*/
function Calendar(span){
  this.days = []; //stores the Day elements
  this.span = span; //stores the timespan over which the calendar should range
  // this.entity = document.getElementsByTagName("MAIN")[0];
  // this.entitys = [];
  this.selected = 0; //stores the currently selected element, default is 0, the first one
  /*INIT
  **initiates the calendar by creating and storing Day objects equal to the timespan
  */
  this.init = function(){
    var currentDate = new Date(); //gets and stores the date of today
    for(var i = 0; i < this.span; i++){ //loops for the timespan
      var date = new Date(); //stores a new date
      date.setDate(currentDate.getDate() + i); //upps the day of the date by the loop variable
      this.days.push(new Day(date)); //pushes a new Day element for the respective date
    }
  }
  /*CHANGESELECTION
  **changes the currently selected element by a given amount
  **makes the sure the virtually selected element actually exists
  */
  this.changeSelection = function(amount){
    _main.ui.deselect(this.selected); //deselects the currently selected element for UI purposes
    this.selected += amount; //changes the selection by the amount passed to the function
    if(this.selected < 0){ //if the amount is smaller then one
      this.selected = this.span - 1; //sets the selection to the last element
    }
    else if(this.selected >= this.span){ //if the amount is larger the the amount of selectable Days
      this.selected = 0; //sets the selection to the first element
    }
    _main.ui.render(); //calls render on the UI as selection has changed
  }
}
/*DAY
**object that represents a single day, stores all data connected with that day
*/
function Day(date){
  this.date = date; //stores the date of the day
  this.phase = SunCalc.getMoonIllumination(this.date).phase; //stores the phase of this day
  this.rise = SunCalc.getMoonTimes(this.date, _main.latitude, _main.longitude).rise; //gets and stores the risetime for this day
  this.rise ? this.rise = this.rise : this.rise = new Date(); //fallback when rise can not be calculated
  this.set = SunCalc.getMoonTimes(this.date, _main.latitude, _main.longitude).set; //gets and stores the settime for this day
  this.set ? this.set = this.set : this.set = new Date(); //fallback when rise can not be calculated
  this.sunset = SunCalc.getTimes(this.date, _main.latitude, _main.longitude).sunset; //gets and stores the start of the night for this day
  this.night = SunCalc.getTimes(this.date, _main.latitude, _main.longitude).night; //gets and stores the start of the night for this day
  this.nadir = SunCalc.getTimes(this.date, _main.latitude, _main.longitude).nadir; //gets and stores the darkest time of the night for this day
  this.altitude = SunCalc.getMoonPosition(this.date, _main.latitude, _main.longitude).altitude; //gets and stores the moons altitude for this day
  this.distance = SunCalc.getMoonPosition(this.date, _main.latitude, _main.longitude).distance; //gets and stores the distance to the moon for this day
  this.description = "unset"; //stores the description of this day
  /*SETDESCRIPTION
  **sets the description corresponding to the phase
  **description is approximattaly, not mathematically correct
  */
  this.setDescription = function(){
    if(this.phase < 0.025){
      this.description = "newmoon";
    }
    else if(this.phase < 0.175){
      this.description = "waxingcrescent";
    }
    else if(this.phase < 0.325){
      this.description = "firstquarter";
    }
    else if(this.phase < 0.475){
      this.description = "waxinggibbous";
    }
    else if(this.phase < 0.525){
      this.description = "fullmoon";
    }
    else if(this.phase < 0.675){
      this.description = "waninggibbous";
    }
    else if(this.phase < 0.825){
      this.description = "lastquarter";
    }
    else if(this.phase < 0.975){
      this.description = "waningcrescent";
    }
    else{
      this.description = "newmoon";
    }
  }
  this.setDescription(); //calls the setDescription function to actually set the description
}

function Detail(){
  this.open = false;
  this.toggle = function(){
    if(this.open){
      _main.ui.aside.style.display = "none";
    }
    else{
      _main.ui.aside.style.display = "inherit";
    }
    this.open = !this.open;
  }
}

function Settings(){
  this.open = false;
  this.selected = 0;
  this.optionsAmount = 4;
  this.toggle = function(){
    if(this.open){
      _main.ui.nav.style.display = "none";
    }
    else{
      this.selected = 0;
      _main.ui.nav.getElementsByTagName("LI")[1].classList.add("selected");
      _main.ui.nav.style.display = "inherit";
    }
    this.open = !this.open;
  }
  this.changeSelection = function(dir){
    _main.ui.nav.getElementsByTagName("LI")[this.selected + 1].classList.remove("selected");
    this.selected += dir;
    if(this.selected < 0){
      this.selected = (this.optionsAmount - 1);
    }
    else if(this.selected > this.optionsAmount - 1){
      this.selected = 0;
    }
    _main.ui.nav.getElementsByTagName("LI")[this.selected + 1].classList.add("selected");
  }
  this.select = function(){
    switch(this.selected){
      case 0:
        this.toggle();
        _main.changeCalendar(prompt("Days in calendar?"));
        _main.changeCalendar(_main.calendar.span);
        break;
      case 1:
        _main.latitude = prompt("Set latitude to?");
        _main.changeCalendar(_main.calendar.span);
        break;
      case 2:
        _main.longitude = prompt("Set longitude to?");
        _main.changeCalendar(_main.calendar.span);
        break;
      case 3:
        _main.setLocation();
        break;
    }
  }
}
function Moon(canvas){
	this.lineWidth = 10;
	this.radius = canvas.width / 4;
	this.offset = canvas.width / 4;
  this.canvas = canvas;
	this.ctx = canvas.getContext( '2d' );
  this.drawDisc = function(){
    this.ctx.translate( this.offset, this.offset ) ;
		this.ctx.beginPath();
		this.ctx.arc( this.radius, this.radius, this.radius, 0, 2 * Math.PI, true );
		this.ctx.closePath();
		this.ctx.fillStyle = '#fff';
		this.ctx.strokeStyle = '#fff';
		this.ctx.lineWidth = this.lineWidth;

		this.ctx.fill();
		this.ctx.stroke();
  }
  this.drawPhase = function(phase){
    this.ctx.beginPath();
		this.ctx.arc( this.radius, this.radius, this.radius, -Math.PI/2, Math.PI/2, true );
		this.ctx.closePath();
		this.ctx.fillStyle = '#000';
		this.ctx.fill();

		this.ctx.translate( this.radius, this.radius );
		this.ctx.scale( phase, 1 );
		this.ctx.translate( -this.radius, -this.radius );
		this.ctx.beginPath();
		this.ctx.arc( this.radius, this.radius, this.radius, -Math.PI/2, Math.PI/2, true );
		this.ctx.closePath();
		this.ctx.fillStyle = phase > 0 ? '#fff' : '#000';
		this.ctx.fill();
  }
  this.render = function(phase){
  		this.ctx.save();
  		this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );

  		if ( phase <= 0.5 ) {
  			this.drawDisc();
  			this.drawPhase( 4 * phase - 1 );
  		}
      else {
  			this.ctx.translate( this.radius + 2 * this.offset, this.radius + 2 * this.offset );
  			this.ctx.rotate( Math.PI );
  			this.ctx.translate( -this.radius, -this.radius );

  			this.drawDisc();
  			this.drawPhase( 4 * ( 1 - phase ) - 1 );
  		}
  		this.ctx.restore();
  	}
  }
