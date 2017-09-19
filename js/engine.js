var Engine = (function(global) {
  /* Predefine the variables we'll be using within this scope,
   * create the canvas element, grab the 2D context for that canvas
   * set the canvas elements height/width and add it to the DOM.
   */
  var doc = global.document,
    win = global.window,
    canvas = doc.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    lastTime;

  canvas.width = 707;
  canvas.height = 656;
  document.getElementById('game-board').appendChild(canvas);

  /* This function serves as the kickoff point for the game loop itself
   * and handles properly calling the update and render methods.
   */
  function main() {
    /* Get our time delta information which is required if your game
     * requires smooth animation.
     */
    var now = Date.now(),
      dt = (now - lastTime) / 1000.0;

    /* Call our update/render functions, pass along the time delta to
     * our update function since it may be used for smooth animation.
     */
    update(dt);
    render();

    /* Set our lastTime variable which is used to determine the time delta
     * for the next time this function is called.
     */
    lastTime = now;

    /* Use the browser's requestAnimationFrame function to call this
     * function again as soon as the browser is able to draw another frame.
     */
    win.requestAnimationFrame(main);
  }

  /* This function does some initial setup that should only occur once,
   * particularly setting the lastTime variable that is required for the
   * game loop.
   */
  function init() {
    lastTime = Date.now();
    main();
  }

  /* This function is called by main (our game loop) and itself calls all
   * of the functions which may need to update entity's data.
   */
  function update(dt) {
    if (game.gameOn) {
      updateEntities(dt);
      checkCollisions();
      updateScore();
      //activatePowerUp()
    }
  }

  /* This is called by the update function  and loops through all of the
   * objects within your allEnemies array as defined in app.js and calls
   * their update() methods.
   */
  function updateEntities(dt) {
    allEnemies.forEach(function(enemy) {
      enemy.update(dt);
    });
  }

  // Check collisions
  function checkCollisions(){
    /* Check for enemy collision.
     * Allow for 10 pixel difference in alignment of enemy and player
     * Y positions on the same row, due to centering of sprites.
     * Collision occurs when opposite side X coords are within 75 pixels.
     */
    allEnemies.forEach(function(enemy) {
      if(player.y - enemy.y == 10) {
        if(player.x < enemy.x + 75 && player.x + 75 > enemy.x){
          player.playerLives--;
          if(powerup.activated !== false) {
            powerup.deactivate();
          }
          // If the player is carrying an Gem, drop it.
          if (player.carryGem) {
            if(gem.sprite === "images/Heart.png"){
            gem.reset();
            } else {
              gem.drop();
            }
          }
          player.reset();
        }
      }
    });

    //Check for collision between player and the gem, and take gem.
    if(player.y === gem.y && player.x === gem.x) {
      gem.pickup();
    }

    if(player.y === powerup.y && player.x === powerup.x) {
      powerup.pickup();
    }

    //Check for powerup activate fuction.
    if(powerup.activated !== false && powerup.timer > 0){
      powerup.activate();
      ctx.lineWidth = 5;
      ctx.strokeText('PowerUp Timer: ' + powerup.timer,102,575);
      ctx.fillText('PowerUp Timer: ' + powerup.timer,102, 575);
    }
  }

  //update score
  function updateScore() {
        if (player.playerLives === 0){
          gameOver();
        }

        if(player.y < 0 && (player.carryGem || player.carryPowerUp)) {
              //update player gem score
              player.score();

              if( gem.blueGemCount === 5){
                  player.playerLives++;
                  gem.blueGemCount = 0;
              } else if( gem.orangeGemCount === 5){
                  player.playerLives++;
                  gem.orangeGemCount = 0;
              } else if( gem.greenGemCount === 5){
                  player.playerLives++;
                  gem.greenGemCount = 0;
              }

              //reset score for powerup to be appear again
              if(player.resetScroe === 150) {
                player.resetScroe = 0;
              }
              
              //update player score only when collect gem
              if(gem.sprite === "images/Heart.png"){
                player.totalScore += 0;
              } else {
                player.totalScore += 30;
              }
              //add 1 into player count to add enemy
              player.count++;
              //reset player when it reach at top
              player.reset();
              //reset gem when successfully cross to top raw
              gem.reset();
              //increase speed of enemy
              if(allEnemies.rate <=200){
                allEnemies.forEach(function(enemy) {
                  enemy.increaseRate();
                });
              };
              //add enemy until it reach allEnemies.length = 8
              if(player.count === allEnemies.length && allEnemies.length < 8) {
                game.addAnEnemy();
              }
          }
}

  // When game ends, clear game entities and set up end scene
  function gameOver() {
    allEnemies = [];
    gem.hide();
    game.gameOn = false;
  }

  /* player function initially draws the "game level", it will then call
   * the renderEntities function.
   */
  function render() {
    // Call function to render the top row.
    var topRowTiles = [
      'images/wood-block.png',
      'images/wood-block.png',
      'images/wood-block.png',
      'images/wood-block.png',
      'images/wood-block.png',
      'images/wood-block.png',
      'images/wood-block.png'
    ];

    /* This array holds the relative URL to the image used for that particular
     * row of the game level.
     */
    var rowImages = [
      'images/wood-block.png',    // Top row is wood (no longer used)
      'images/stone-block.png',   // Row 1 of 3 of stone
      'images/stone-block.png',   // Row 2 of 3 of stone
      'images/stone-block.png',   // Row 3 of 3 of stone
      'images/stone-block.png',   // Row 1 of 2 of grass
      'images/grass-block.png'    // Row 2 of 2 of grass
    ],
    numRows = 6,
    numCols = 7,
    row, col;

    // Loop through the number of columns to draw the specific top row tiles

    for (col = 0; col < numCols; col++) {
      ctx.drawImage(Resources.get(topRowTiles[col]), col * 101, -50);
      ctx.drawImage(Resources.get(topRowTiles[col]), col * 101, 0);
    }

    /* Loop through the number of rows and columns we've defined above
     * and, using the rowImages array, draw the correct image for that
     * portion of the "grid"
     */
    for (row = 1; row < numRows; row++) {
      for (col = 0; col < numCols; col++) {
        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
      }
    }

    //If showing intro, render intro entities. Otherwise, render game entities.
    if (!game.gameOn) {
      renderIntro();
    } else {
      renderEntities();
    }
  }


  /* This function is called to draw the intro/gameOver scene. It uses the
   * Actor constructor to create items, as they are not player controlled.
   */
  function renderIntro() {
    bubbleRect(125,160,460,240,25,10,'#fff','#000');
    renderStory();
  }

  /* This function takes the information from the storyText array in app.js,
   * and uses that data to render the text in the story bubble above the
   * actors. A helper text is also rendered at the bottom of the play area,
   * to indicate Spacebar functionality.
   */
  function renderStory () {
    ctx.font = '16pt Arial';
    ctx.fillStyle = '#000';
    for (var i=0; i < game.storyTextIntro[game.storyIndex].length; i++){
      ctx.fillText(game.storyTextIntro[game.storyIndex][i],150,207 + i * 25);
    }
    ctx.strokeStyle = '#fff';

    var helpText = 'Press Spacebar to continue';
    if (game.storyIndex < 1){
      helpText = 'Press Spacebar to continue';
    } else {
      helpText = 'Press Spacebar to play again';
    }
    ctx.lineWidth = 5;
    ctx.strokeText(helpText,225,515);
    ctx.fillText(helpText,225,515);
  }

  /** Code below from http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html
  * Draws a rounded rectangle using the current state of the canvas.
  * @param {Number} x The top left x coordinate.
  * @param {Number} y The top left y coordinate.
  * @param {Number} width The width of the rectangle.
  * @param {Number} height The height of the rectangle.
  * @param {Number} radius The corner radius.
  * @param {Number} lineWidth The width of the stroke.
  * @param {String} fill What color to use on the fill.
  * @param {String} stroke What color to use on the stroke.
  */
  function bubbleRect(x, y, width, height, radius, lineWidth, fill, stroke) {
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }

  /* This function is called by the render function and is called on each game
   * tick.
   */
  function renderEntities() {
    // Render Gem only if not picked up (gem.visible = true)
    if(gem.visible) {
      gem.render();
    }

    powerup.render();

    /* Loop through all of the objects within the allEnemies array and call
     * the render function you have defined.
     */
    allEnemies.forEach(function(enemy) {
      enemy.render();
    });
    //render player
    player.render();
    //render the scroing row
    renderScoringRow();
  }

  // Used by renderEntities
  function renderScoringRow () {
    //array to hold gem images including red heart
    var scoreGemImage = [
          'images/Gem Blue.png',
          'images/Gem Orange.png',
          'images/Gem Green.png',
          'images/HeartBig.png',
    ];

    //draw image of gem on top
    for (var col = 0; col < 4; col++) {
      ctx.drawImage(Resources.get(scoreGemImage[col]), (col * 202) + 10, -20);
    }

    //array to hold player gem variable
    var scoreNum = [player.blueGemScore, player.orangeGemScore, player.greenGemScore, player.playerLives]

    //array to hold gem name and player life
    var gemName = ['Blue Gem', 'Orange Gem', 'Green Gem', 'Player Life']

    //insert text for gem score and gem name on game board
    for(var i = 0; i < 4; i++) {
        ctx.lineWidth = 5;
        ctx.strokeText(scoreNum[i], (i * 200) + 45, 65);
        ctx.fillText(scoreNum[i], (i * 200) + 45, 65);
        ctx.strokeText(gemName[i], (i * 200),20);
        ctx.fillText(gemName[i],(i * 200), 20);
    }

    //insert text for player total score on game board
    ctx.lineWidth = 5;
    ctx.strokeText('Player Score: ' + player.totalScore,402,575);
    ctx.fillText('Player Score: ' + player.totalScore,402, 575);
  }

  /* Go ahead and load all of the images we know we're going to need to
   * draw our game level. Then set init as the callback method, so that when
   * all of these images are properly loaded our game will start.
   */
  Resources.load([
    'images/stone-block.png',
    'images/wood-block.png',
    'images/grass-block.png',
    'images/enemy-bug.png',
    'images/Gem-Blue.png',
    'images/Gem-Orange.png',
    'images/Gem-Green.png',
    'images/Heart.png',
    'images/char-boy.png',
    'images/char-boy-w-bag.png',
    'images/char-boy-w-star.png',
    'images/Gem Blue.png',
    'images/Gem Orange.png',
    'images/Gem Green.png',
    'images/HeartBig.png',
    'images/Star.png'
  ]);
  Resources.onReady(init);

  /* Assign the canvas' context object to the global variable (the window
   * object when run in a browser) so that developer's can use it more easily
   * from within their app.js files.
   */
  global.ctx = ctx;
})(this);
