// Create "game" variable, to hold functions called against the overall game state
var Game = function() {
  // Initialize game variables
  this.paused = false;
  this.gameOn = false;
  this.storyIndex = 0;

  /* Create array of text items to be displayed on screen. Set storyIndex
   * to keep track of item being displayed.
   */

  this.storyTextIntro = [
        ['Hi there! Are you ready to play this game?',
        '',
        '',
        '1. Collect five gems each to increase',
        '   Player life by 1.',
        '2. Collect Red Heart add life.'],
        ['',
        '',
        '',
        '                       Game Over         ',
        '',
        '']
      ]
};

/* Toggle between paused and un-paused states by blocking updates.
 * This boolean is used in Enemy.update and Player.handleInput
 */
Game.prototype.togglePause = function() {
  this.paused = !this.paused;
};

// Increase number of enemies at end of succesful run count by player count variable
Game.prototype.addAnEnemy = function() {
  /* Determine what row to put the new enemy on. This is determined
   * by finding how many enemies there are, and adding one to the next
   * stone row. When all rows are filled, start again at the first stone row.
   */

  var rows = 4;
  var count = allEnemies.length + 1;

  // Loop to top if count > rows available.
  if (count > rows) {
    count -= rows;
  }

  // Add the new enemy to the allEnemies array
  var enemy = new Enemy(-100, (count * 83) - 21);
  allEnemies.push(enemy);
}

/* Initialize game asset variables. This is called on startup of the game,
 * or if the player presses R on the keyboard.
 */
Game.prototype.gameReset = function() {
  // Place all enemy objects in an array called allEnemies
  allEnemies = [];
  for(var i=1; i<5; i++){
    var enemy = new Enemy(0-i*101, 83*i-21);
    allEnemies.push(enemy);
  }

  /* Instantiate gem offscreen, then randomize its location to start
   * Do not use 'var', so that it becomes global.
   */
  gem = new Gem(-100, -100);
  gem.reset();

  /* Place the player object in a variable called player
   * Do not use 'var', so that it becomes global.
   */
  player = new Player(303, 404);
  
  //Place the PowerUp object in a variable called powerup
  powerup = new PowerUp(-100, -100);
  powerup.reset();

  // Turn on game indicator. This will start game rendering.
  this.gameOn = true;
};

/* Handle keyboard input during intro scene. When all text for intro
 * is complete, show gameplay instructions below game board and start game.
 * @param {String} key Value of keypress, as determined in the event listener.
 */
Game.prototype.handleInput = function(key) {
  switch(key) {
    case 'spacebar':
      if (game.storyIndex < 0){
        game.storyIndex++;
        game.speakerToggle();
      } else {
        game.storyIndex = 1;
        document.getElementById('instructions').className = '';
        game.gameReset();
      }
      break;
  }
};

/* Enemies our player must avoid. Rate is randomized on instantiation.
 * @param {number} x    X coordinate of enemy displayed.
 * @param {number} y    Y coordinate of enemy displayed.
 */
var Enemy = function(x, y) {
  this.sprite = 'images/enemy-bug.png';
  this.x = x;
  this.y = y;
  this.rate = 100 + Math.floor(Math.random() * 150);
};

/* Update the enemy's position, required method for game
 * @param {number} dt A time delta between ticks.
 */
Enemy.prototype.update = function(dt) {
  if (!game.paused){
    this.x = this.x + (dt * this.rate);
  }

  // When bug goes off one side, reappear on the other side
  if (this.x > 700){
    this.x = - Math.random() * 177;
  }
};

// Randomize start location of enemy
Enemy.prototype.reset = function() {
  this.x = 0 - Math.random() * 200;
};

// Increase speed of enemies slightly
Enemy.prototype.increaseRate = function() {
  this.rate += 50;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


/* Player class, to represent our player.
 * @param {number} x    X coordinate of player location.
 * @param {number} y    Y coordinate of player location.
 */
var Player = function(x,y) {
  this.sprite = 'images/char-boy.png';
  this.x = x;
  this.y = y;
  this.carryGem = false;
  this.carryPowerUp = false;
  this.playerLives = 3;
  this.blueGemScore = 0;
  this.orangeGemScore = 0;
  this.greenGemScore = 0;
  this.totalScore = 0;
  this.resetScore = 0; //need for powerup
  this.count = 0; //count how many times player reach to top row
};

//update score according to gem type
Player.prototype.score = function() {
  if(gem.sprite === "images/Gem-Blue.png"){
      this.blueGemScore++;
      gem.blueGemCount++;
      this.resetScore+=30;
  } else if(gem.sprite === "images/Gem-Orange.png"){
      this.orangeGemScore++;
      gem.orangeGemCount++;
      this.resetScore+=30;
  } else if(gem.sprite === "images/Gem-Green.png"){
      this.greenGemScore++;
      gem.greenGemCount++;
      this.resetScore+=30;
  } else {
    this.playerLives++;
  }
}

// Reset player's position to start location
Player.prototype.reset = function() {
  //reset player sprite to char-boy
  if (this.y > 0 || (this.y < 0 && (!this.carryGem || !this.carryPowerUp))) {
    this.sprite = 'images/char-boy.png';
  }

  //  If player is carrying a Gem or powerup, set carryGem to false and carryPowerUp to false and
  //  * modify sprite name to no longer display that Gem or powerup
   
  if (this.carryGem || this.carryPowerUp) {
    this.carryGem = false;
    this.carryPowerUp = false;
    this.sprite = 'images/char-boy.png';
  }
    //reset back to intial location 
    this.x = 303;
    this.y = 404;
};

/* Handle keyboard input during gameplay.
 * 'IF' statements verify movement will not allow the player outside the
 * canvas boundaries before the movement is calculated.
 * @param {String} key, the keyCode from the key pressed
 */
Player.prototype.handleInput = function(key) {
  switch(key) {
    case 'up':
      if (this.y > 0 && !game.paused){
        this.y -= 83;
      }
      break;
    case 'down':
      if (this.y < 404 && !game.paused) {
        this.y += 83;
      }
      break;
    case 'left':
      if (this.x > 0 && !game.paused) {
        this.x -= 101;
      }
      break;
    case 'right':
      if (this.x < 656 && !game.paused){
        this.x += 101;
      }
      break;
    case 'pause':
      game.togglePause();
      break;
    case 'restart':
      game.gameReset();
      break;
  }
};

//Draw player on the screen
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


//array of gem images
gemImages = [
          'images/Gem-Blue.png',
          'images/Gem-Orange.png',
          'images/Gem-Green.png',
          'images/Heart.png'
        ];


/* Gem class, to represent gem to collect.
 * @param {number} x    X coordinate of gem location.
 * @param {number} y    Y coordinate of gem location.
 */
var Gem = function (x, y) {
  this.sprite = gemImages[Math.floor(Math.random() * 4)];
  this.x = x;
  this.y = y;
  this.visible = true;
  this.blueGemCount = 0;    // count blue gem collect
  this.orangeGemCount = 0;  // count orange gem collect
  this.greenGemCount = 0;   // count green gem collect
};

// Steps to be carried out when an Gem is picked up by the player
Gem.prototype.pickup = function() {
  // Set parameters for objects
  this.visible = false;
  player.carryGem = true;

  // Change player sprite name to show Gem carried 
  player.sprite = 'images/char-boy-w-bag.png';

  // Hide Gem off screen (to be reused on reset)
  this.x = -101;
  this.y = -101;
};

// Drop Gem on game board, update entities to match state.
Gem.prototype.drop = function() {
  this.visible = true;
  player.carryGem = false;
  this.x = player.x;
  this.y = player.y;
};

// Reset will set Gem on game board to be picked up again.
Gem.prototype.reset = function() {
  this.x = Math.floor(Math.random() * 5) * 101;
  this.y = Math.ceil(Math.random() * 4) * 83 - 11;
  this.visible = true;
  this.sprite = gemImages[Math.floor(Math.random() * 4)];
};

// Hide Gem when no longer needed (end game, etc.)
Gem.prototype.hide = function() {
  this.visible = false;
  player.carryGem = false;
};

// Draw the Gem on the game board
Gem.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


/* PowerUp class, to represent powerup to collect.
 * @param {number} x    X coordinate of PowerUp location.
 * @param {number} y    Y coordinate of PowerUp location.
 */

var PowerUp = function (x, y) {
  this.x = x;
  this.y = y;
  this.sprite = 'images/Star.png';
  this.activated = false;   //powerup activate state
  this.deactivated = true;  //powerup deactivate state
  this.timer = 30;          // powerup length; timer for powerup to deactivate
};

// Steps to be carried out when an PowerUp is picked up by the player
PowerUp.prototype.pickup = function() {
  // Set parameters for objects
  player.carryPowerUp = true;
  this.activated = true;
  this.deactivated = false;
  
  // Change player sprite name to show PowerUp carried 
  player.sprite = 'images/char-boy-w-star.png';

  powerup.hide();
};

//hide powerup when needed
PowerUp.prototype.hide = function () {
  // Hide PowerUp off screen (to be reused on reset)
  this.x = -101;
  this.y = -101;
}

// Reset will set PowerUp on game board to be picked up.
PowerUp.prototype.reset = function() {
  this.x = Math.floor(Math.random() * 5) * 101;
  this.y = Math.ceil(Math.random() * 4) * 83 - 11;
  this.activated = false;
  this.deactivated = true;
  this.sprite = 'images/Star.png';
};

// Draw the PowerUp on the game board
PowerUp.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// powerup activate method
PowerUp.prototype.activate = function() {
    this.deactivated = false;
    timeout();
    allEnemies.forEach(function(enemy) {
      enemy.rate = 50;
    });
};

// Gem deactivate method
PowerUp.prototype.deactivate = function() {
    // deactivate the gem
    allEnemies.forEach(function(enemy) {
      enemy.rate = 100 + Math.floor(Math.random() * 150);
    });
};

//Initialize game (implicity global)
game = new Game();

/* This listens for key presses and sends the keys to your handleInput() methods.
 * Also prevents standard responses to key presses.
 */
document.addEventListener('keydown', function(e) {
  var allowedKeys;
  if (!game.gameOn) {
    allowedKeys = {
      32: 'spacebar'
    };
    game.handleInput(allowedKeys[e.keyCode]);
  } else {
    allowedKeys = {
      32: 'spacebar',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
      80: 'pause',
      82: 'restart'
    };
    player.handleInput(allowedKeys[e.keyCode]);
  }
  if (e.keyCode in allowedKeys){
    e.preventDefault();
  }
});

//timeout method to update timer on canvas
  function timeout() {   
  var id = setInterval(frame, 30000);
  function frame() {
    if(powerup.timer > 0) {
      powerup.timer--;
    } else {
      clearInterval(id);
    }
  }
}
