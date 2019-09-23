// Source: https://weeknumber.net/how-to/javascript
// Returns the ISO week of the date.
Date.prototype.getWeek = function() {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

var main = new Luna(); //stores the main object
main.init(); //initiates the main object
document.body.scrollTop = 0; //unscrolls the body

/*EVENTS
**creates all event listeners for the interaction with Luna
*/
window.onkeydown = function(e) {//when a key is pressed
   var key = e.keyCode; //gets the respective keycode from the event
   switch(key){ //switch on the key code
     case 37: //left arrow
      main.calendar.changeSelection(-1); //changes the selected element by -1
     break;
     case 38: //up arrow
      if(main.settings.open){
        main.settings.changeSelection(-1); //changes the selected setting by -1
      }
      else{
         main.calendar.changeSelection(-7); //changes the selected element by -7
      }
     break;
     case 39: //right arrow
       main.calendar.changeSelection(1); //changes the selected element by 1
     break;
     case 40: //down arrow
       if(main.settings.open){
         main.settings.changeSelection(1); //changes the selected setting by 1
       }
       else{
          main.calendar.changeSelection(7); //changes the selected element by 7
       }
     break;
     case 0: //any of the two softkeys
       if(main.credits.open){
         main.credits.toggle();
       }
       else{
        main.settings.toggle();
       }
     break;
     case 27: //esc button, for testing purposes replacing softkeys on laptop
       if(main.credits.open){
         main.credits.toggle();
       }
       else{
        main.settings.toggle();
       }
       break;
     case 13: //center button
       if(main.credits.open){
         main.credits.toggle(); //changes the selected setting by 1
       }
       else if(main.settings.open){
         main.settings.select(); //changes the selected setting by 1
       }
       else{
         main.detail.toggle();; //changes the selected element by 7
       }
     break;
     break;
   }
}

/*LUNA
**main object that hold all other objects
*/
function Luna(){
  this.calendar;
  this.ui;
  this.detail = new Detail();
  this.settings = new Settings();
  this.credits = new Credits();
  this.latitude; //sets to fallback
  this.longitude;
  /*SAFE
  **saves all important variables
  */
  this.safe = function(){
    localStorage.setItem('showWeeknumbers', this.calendar.showWeeknumbers);
    localStorage.setItem('calendarSpan', this.calendar.span);
    localStorage.setItem('latitude', this.latitude);
    localStorage.setItem('longitude', this.longitude);
    localStorage.setItem('theme', this.ui.theme);
  }
  /*INIT
  **initiates all elements held by the main element
  */
  this.init = function(){
    let showWeeknumbers = false;
    if(localStorage.getItem('showWeeknumbers')){
      showWeeknumbers = (localStorage.getItem('showWeeknumbers') == "true");
    }
    let calendarSpan = 31;
    if(localStorage.getItem('calendarSpan')){
      calendarSpan = localStorage.getItem('calendarSpan');
    }
    this.calendar = new Calendar(calendarSpan, showWeeknumbers); //stores the virtual calendar
    let theme = "dark";
    if(localStorage.getItem('theme')){
      theme = localStorage.getItem('theme');
    }
    this.ui = new UI(theme); //stores the UI elements
    if(localStorage.getItem('latitude') && localStorage.getItem('longitude')){
      this.latitude = localStorage.getItem('latitude');
      this.longitude = localStorage.getItem('longitude');
    }
    else{
      console.log("h");
      this.setLocation();
    }
    this.calendar.init();
    this.ui.init();
    this.settings.setOptionsAmount();
  }
  /*CHANGECALENDAR
  **changes the amount of days in the virtual calandar
  */
  this.changeCalendar = function(num){
    this.calendar = new Calendar(num);
    this.calendar.init();
  }
  /*SETLATITUDE
  **sets the latitude value with checking for a correct input
  */
  this.setLatitude = function(lat){
    this.latitude = lat;
  }
  /*SETLONGITUDE
  **sets the longitude value with checking for a correct input
  */
  this.setLongitude = function(lat){
    this.longitude = lat;
  }
  /*SETLOCATION
  **sets the current location
  */
  this.setLocation = function(){
    if (navigator.geolocation) { //checks if geolocation feature is present
       navigator.geolocation.getCurrentPosition(function (p) { //gets current GPS position, passes it through the function
         main.setLatitude(p.coords.latitude); //sets lat to the correct ordinate
         main.setLongitude(p.coords.longitude); //sets long to the correct ordinate
       });
    }
    else { //if the geolocation feature is present
      alert('Geo Location feature must be present and location access needs to be allowed'); //shows an error message
    }
    this.safe();
  }
}
/*UI
**holds all the UI getElementsByTagName
*/
function UI(theme){
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
  this.nav = document.getElementsByTagName("NAV")[0]; //stores the nav element
  this.settings = this.nav.getElementsByTagName("LI");
  this.credits = document.getElementById("credits");
  this.moon = new Moon(this.canvas);
  this.theme = theme;
  this.mainEntitys = []; //stores all elements held by the main object for virtual access
  /*INIT
  **initiates the whole UI
  */
  this.init = function(){
    if(this.theme == "dark"){
      document.documentElement.classList.remove("light-theme");
    }
    else{
      document.documentElement.classList.add("light-theme");
    }
    this.initMain(); //initiates the main element
    this.render(); //renders the whole UI after initialisation
  }
  /*INITMAIN
  **initiates the whole UI
  */
  this.initMain = function(){
    this.main.innerHTML = ""; //empty the main element

    this.mainEntitys = []; //resets mainEntitys

    /*sets bodyclass*/
    if(main.calendar.showWeeknumbers){
      document.body.classList.add("show-weeknumbers");
    }
    else{
      document.body.classList.remove("show-weeknumbers");
    }
    /*end*/

    /*when there are weeknumbers and the first date is not a monday*/
    if(main.calendar.showWeeknumbers && main.calendar.days[0].date.getDay() != 1){
      let weeknumber = document.createElement("DIV"); //create a new div
      weeknumber.classList = "weeknumber";
      weeknumber.innerText = main.calendar.days[0].date.getWeek();
      this.main.appendChild(weeknumber); //appends the div to the main element
    }

    /*adds spacer elements to keep a clean calendar look*/
    var n;
    if(main.calendar.days[0].date.getDay() == 0){ //if its a sunday
      n = 6; //add 6 spaces
    }
    else{ //on any other day
      n = main.calendar.days[0].date.getDay() - 1; //add spaces corresponding to the day
    }
    for(n > 0; n--;){
      var entity = document.createElement("DIV"); //create a new div
      this.main.appendChild(entity); //appends the div to the main element
      //div is not added to the holding array to be unselectable
    }
    /*end*/
    for(var i = 0; i < main.calendar.span; i++){//for all days held by the calendar
      if(main.calendar.showWeeknumbers && main.calendar.days[i].date.getDay() == 1){
        let weeknumber = document.createElement("DIV"); //create a new div
        weeknumber.classList = "weeknumber";
        weeknumber.innerText = main.calendar.days[i].date.getWeek();
        this.main.appendChild(weeknumber); //appends the div to the main element
      }
      var entity = document.createElement("DIV"); //create a new div
      var img = document.createElement("IMG"); //create a new img
      img.src = "images/moonphases/" + main.calendar.days[i].description + ".png"; //set the source of the img to the correct image
      entity.appendChild(img); //appends the img to the div
      this.mainEntitys.push(entity); //pushes the div into the holding array
      this.main.appendChild(entity); //appends the div to the main element
    }
  }
  /*TOGGLETHEME
  **toggles the currently used theme
  */
  this.toggleTheme = function(){
    if(this.theme == "dark"){
      this.theme = "light";
      document.documentElement.classList.add("light-theme");
    }
    else{
      this.theme = "dark";
      document.documentElement.classList.remove("light-theme");
    }
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
    this.date.innerText = object.date.getDate() + "." + (object.date.getMonth() + 1) + "." + object.date.getFullYear();
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
    this.select(main.calendar.selected); //render selection
    this.setTimes(main.calendar.days[main.calendar.selected]); //render rise and set time
    this.setDetails(main.calendar.days[main.calendar.selected]); //render detail view
    this.moon.render(main.calendar.days[main.calendar.selected].phase);
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
  /*TOGGLESETTINGS
  **toggles the display of the setting element
  */
  this.toggleSettings = function(){
    if(main.settings.open){
      this.nav.style.display = "inherit";
    }
    else{
      this.nav.style.display = "none";
    }
  }
  /*SELECTSETTING
  **sets a active class for the currently selected setting in the UI
  */
  this.selectSetting = function(pos){
    for(var i = 0; i < this.settings.length; i++){ //loops over all settings elements
      this.settings[i].classList.remove("selected"); //removes the selected class when present
    }
    this.settings[pos].classList.add("selected");
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
function Calendar(span, showWeeknumbers){
  this.days = []; //stores the Day elements
  this.span = span; //stores the timespan over which the calendar should range
  this.showWeeknumbers = showWeeknumbers; //stores if weeknumber should be shown or not
  // this.entity = document.getElementsByTagName("MAIN")[0];
  // this.entitys = [];
  this.selected = 0; //stores the currently selected element, default is 0, the first one
  /*INIT
  **initiates the calendar by creating and storing Day objects equal to the timespan
  */
  this.init = function(){
    this.days = []; //resets days
    var currentDate = new Date(); //gets and stores the date of today
    for(var i = 0; i < this.span; i++){ //loops for the timespan
      var date = new Date(); //stores a new date
      date.setDate(currentDate.getDate() + i); //upps the day of the date by the loop variable
      this.days.push(new Day(date)); //pushes a new Day element for the respective date
    }
  }
  /*SETSPAN
  **sets the amount of days held by the calendar
  */
  this.setSpan = function(number){
    this.span = number;
  }
  /*TOGGLEWEEKNUMBERS
  **toggles if weeknumbers should be shown or note
  */
  this.toggleWeeknumbers = function(){
    this.showWeeknumbers = !this.showWeeknumbers; //toggles the showWeeknumbers property
  }
  /*CHANGESELECTION
  **changes the currently selected element by a given amount
  **makes the sure the virtually selected element actually exists
  */
  this.changeSelection = function(amount){
    main.ui.deselect(this.selected); //deselects the currently selected element for UI purposes
    this.selected += amount; //changes the selection by the amount passed to the function
    if(this.selected == -1){ //if the amount is one past the first
      this.selected = this.span - 1; //sets the selection to the last element
    }
    else if(this.selected < -1){ //if the amount is larger the the amount of selectable Days
      this.selected = 0; //sets the selection to the first element
    }
    else if(this.selected == this.span){ //if the amount is larger the the amount of selectable Days
      this.selected = 0; //sets the selection to the first element
    }
    else if(this.selected > this.span){ //if the amount is larger the the amount of selectable Days
      this.selected = this.span - 1; //sets the selection to the first element
    }
    main.ui.render(); //calls render on the UI as selection has changed
  }
}
/*DAY
**object that represents a single day, stores all data connected with that day
*/
function Day(date){
  this.date = date; //stores the date of the day
  this.phase = SunCalc.getMoonIllumination(this.date).phase; //stores the phase of this day
  this.rise = SunCalc.getMoonTimes(this.date, main.latitude, main.longitude).rise; //gets and stores the risetime for this day
  this.rise ? this.rise = this.rise : this.rise = new Date(); //fallback when rise can not be calculated
  this.set = SunCalc.getMoonTimes(this.date, main.latitude, main.longitude).set; //gets and stores the settime for this day
  this.set ? this.set = this.set : this.set = new Date(); //fallback when rise can not be calculated
  this.sunset = SunCalc.getTimes(this.date, main.latitude, main.longitude).sunset; //gets and stores the start of the night for this day
  this.night = SunCalc.getTimes(this.date, main.latitude, main.longitude).night; //gets and stores the start of the night for this day
  this.nadir = SunCalc.getTimes(this.date, main.latitude, main.longitude).nadir; //gets and stores the darkest time of the night for this day
  this.altitude = SunCalc.getMoonPosition(this.date, main.latitude, main.longitude).altitude; //gets and stores the moons altitude for this day
  this.distance = SunCalc.getMoonPosition(this.date, main.latitude, main.longitude).distance; //gets and stores the distance to the moon for this day
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

/*DETAIL*/
function Detail(){
  this.open = false;
  this.toggle = function(){
    if(this.open){
      main.ui.aside.style.display = "none";
    }
    else{
      main.ui.aside.style.display = "inherit";
    }
    this.open = !this.open;
  }
}

/*SETTINGS*/
function Settings(){
  this.open = false;
  this.selected = 0;
  this.optionsAmount = 0;
  this.toggle = function(){
    this.selected = 0; //resets selection to the first element
    this.open = !this.open; //inverts the open flag
    main.ui.selectSetting(this.selected); //selects the currently selected setting in the UI
    main.ui.toggleSettings(); //toggles the display of the setting element in the UI
  }
  this.changeSelection = function(dir){
    this.selected += dir; //changes the selected element based on the parameter
    if(this.selected < 0){ //if the element before the first is selected
      this.selected = (this.optionsAmount - 1); //select last element
    }
    else if(this.selected > this.optionsAmount - 1){ //if the element beyond the last is selected
      this.selected = 0; //select the first element
    }
    main.ui.selectSetting(this.selected); //change selection visually
  }
  /*SETOPTIONSAMOUNT
  **sets the amount of different settingoptions based on the html
  */
  this.setOptionsAmount = function(){
    this.optionsAmount = main.ui.settings.length;
  }
  /*SELECT
  **calls the correct function for the currently selected option
  */
  this.select = function(){
    switch(this.selected){
      case 0:
        main.calendar.setSpan(prompt("Days in calendar:"));
        main.safe(); //safes the changed stats
        main.init(); //inits the main element to reflect changes
        break;
      case 1:
        main.calendar.toggleWeeknumbers();
        main.safe(); //safes the changed stats
        main.init(); //inits the main element to reflect changes
      case 2:
        main.setLocation();
        main.safe(); //safes the changed stats
        main.init(); //inits the main element to reflect changes
        break;
      case 3:
        main.setLatitude(prompt("Set latitude to:"));
        main.safe(); //safes the changed stats
        main.init(); //inits the main element to reflect changes
        break;
      case 4:
        main.setLongitude(prompt("Set longitude to:"));
        main.safe(); //safes the changed stats
        main.init(); //inits the main element to reflect changes
        break;
      case 5:
        main.ui.toggleTheme();
        main.safe(); //safes the changed stats
        break;
      case 6:
        localStorage.clear();
        main.init(); //inits the main element to reflect changes
        break;
      case 7:
        main.credits.toggle();
        break;
    }
  }
}

/*CREDITS*/
function Credits(){
  this.open = false;
  this.toggle = function(){
    this.open = !this.open;
    if(this.open){
      main.ui.credits.style.display = "inherit";
    }
    else{
      main.ui.credits.style.display = "none";
    }
  }
}

/*MOON*/
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
