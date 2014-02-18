(function() {
	
	window.game = {

		gravity: 12,
		draggin: false,
		lastMousePosition: 0,
		targetDestroyed: false,
		lightSource: {
			x: 800,
			y: -300
		},
		height: window.innerHeight,
		width: window.innerWidth,

		reset: function() {
			game.score = 0;
			/*game.ship.position.x = 30;
			game.ship.position.y = 300;*/

			game.ship.velocity.x = 0;
			game.ship.velocity.y = 0;

			game.level.position.x = 0;

			game.nexttext.visible = false;
			game.replaytext.visible = false;

			//game.ship.state = 'ready';
			game.ship.visible = true;
			//game.aimLine.visible = true;
		},

		win: function() {
			game.ship.state = 'idle';
			game.replaytext.visible = true;
			game.nexttext.visible = true;
			game.explosion.onComplete = function() { game.reset(); }
		},

		clearLevel: function() {
			for (var i = game.level.children.length - 1; i >= 0; i--) {
				game.level.removeChild(game.level.children[i]);
			};
			game.planets.length = 0;
			game.shadows.length = 0;
		},

		init: function() {

			var assetsToLoader = ["Spritesheet.json", "sprites/background.png"];

			game.loader = new PIXI.AssetLoader(assetsToLoader);

			game.loader.onComplete = game.assetsLoaded;

			game.loader.load();

			game.mouse = {
				position: {
					x: 0,
					y: 0
				}
			}

			var interactive = true;
			game.stage = new PIXI.Stage(0x000000, interactive);

			window.addEventListener('keyup', function(event) { game.key.onKeyup(event); }, false);
			window.addEventListener('keydown', function(event) { game.key.onKeydown(event); }, false);

			game.stage.mousemove = function(data) {
				var newPosition = data.getLocalPosition(this);
				//console.log(newPosition.x + ', ' + newPosition.y);
				game.mouse.position.x = newPosition.x;
				game.mouse.position.y = newPosition.y;
			}

			game.stage.click = function(data) {
				if (game.ship.state == 'ready') {
					game.aimLine.visible = false;
					game.ship.state = 'launched';

					game.ship.thrust = getDistance(game.mouse, game.aimLine) / 50;

					var vector = new Vector(game.aimLine.position.x, game.mouse.position.x, 
											game.aimLine.position.y, game.mouse.position.y);

					game.ship.velocity.x = vector.x * game.ship.thrust;
					game.ship.velocity.y = vector.y * game.ship.thrust;

					mag = Math.sqrt(this.deltaX * this.deltaX + this.deltaY * this.deltaY);
				}
			}

			game.stage.mousedown = function(data) {
				if (game.ship.state == 'idle') {
					game.dragging = true;
				}
				else if (game.ship.state == 'launched') {
					//game.ship.rocketThrust = 10;
				}
			}

			game.stage.mouseup = function(data) {
				if (game.ship.state == 'idle') {
					game.dragging = false;
				}
				else if (game.ship.state == 'launched') {
					//game.ship.rocketThrust = 0;
				}
			}

			// create a renderer instance.
    		game.renderer = PIXI.autoDetectRenderer(game.width, game.height);

    		// add the renderer view element to the DOM
    		document.body.appendChild(game.renderer.view);

    		//requestAnimFrame(game.run);

    		game.level = new PIXI.DisplayObjectContainer();
    		game.level.position.x = 0;
    		game.level.position.y = 0;
    		game.stage.addChild(game.level);
		},

		assetsLoaded: function() {

			game.levels = [];
			var levelsLoaded = 0;
			var numberLevels = 1;
			game.level.current = 0;

			for (var l = 1; l <= numberLevels; l++) {
				var levelLoader = new PIXI.JsonLoader('map.json');
				levelLoader.on('loaded', function(evt) {
					game.levels.push(evt.content.json);
					levelsLoaded++;
					if (levelsLoaded === numberLevels) {
						game.levelsLoaded();
					}
				});
				levelLoader.load();
			}

		},

		levelsLoaded: function() {

			game.level.json = game.levels[game.level.current];

			game.backgroundImage = new PIXI.Texture.fromImage('sprites/background.png');
			game.background = new PIXI.TilingSprite(game.backgroundImage, game.width, game.height);
			game.background.position.x = 0;
			game.background.position.y = 0;
			game.background.tilePosition.x = 0;
			game.background.tilePosition.y = 0;
			game.level.addChild(game.background);

			game.midgroundImage = new PIXI.Texture.fromImage('sprites/midground.png');
			game.midground = new PIXI.TilingSprite(game.midgroundImage, game.width, game.height);
			game.midground.position.x = 0;
			game.midground.position.y = 0;
			game.midground.tilePosition.x = 0;
			game.midground.tilePosition.y = 0;
			game.level.addChild(game.midground);

    		game.aimLine = new PIXI.Graphics();
			game.aimLine.position.x = 15;
			game.aimLine.position.y = 150;
			game.aimLine.visible = false;
    		game.level.addChild(game.aimLine);

    		game.explosionTextures = [];

    		for (var i =0 ; i < 26; i++) {
            	var texture = PIXI.Texture.fromFrame("Explosion_Sequence_A " + (i+1) + ".png");
                game.explosionTextures.push(texture);
            };

    		game.explosion = new PIXI.MovieClip(game.explosionTextures);
    		game.explosion.anchor.x = 0.5;
    		game.explosion.anchor.y = 0.5;
    		game.explosion.visible = false;
    		game.explosion.scale.x = 0.65;
    		game.explosion.scale.y = 0.65;
    		game.explosion.loop = false;
			game.explosion.onComplete = function() { game.reset(); }
    		game.level.addChild(game.explosion);

			game.planets = [];
			game.shadows = [];

			for (var p = 0; p < game.level.json.layers[0].objects.length; p++) {
				var planet = new PIXI.Sprite.fromImage(game.level.json.layers[0].objects[p].properties.texture);
				planet.target = game.level.json.layers[0].objects[p].properties['target'];
				planet.position.x = game.level.json.layers[0].objects[p].x;
				planet.position.y = game.level.json.layers[0].objects[p].y;
				planet.anchor.x = 0.5;
				planet.anchor.y = 0.5;
				planet.scale.x = game.level.json.layers[0].objects[p].width / 400;
				planet.scale.y = game.level.json.layers[0].objects[p].height / 400;
				planet.radius = 200 * planet.scale.x;
				planet.mass = planet.scale.x * 100;

				game.level.addChild(planet);
				game.planets.push(planet);

				var planetShadow = new PIXI.Sprite.fromImage('planet_shadow.png');
				planetShadow.position.x = planet.position.x;
				planetShadow.position.y = planet.position.y;
				planetShadow.anchor.x = planet.anchor.x;
				planetShadow.anchor.y = planet.anchor.y;
				planetShadow.scale.x = planet.scale.x;
				planetShadow.scale.y = planet.scale.y;

				game.level.addChild(planetShadow);
				game.shadows.push(planetShadow);

			}

			game.ship = new PIXI.Sprite.fromImage("fighter.png");
			game.ship.interactive = true;
			game.ship.position.x = game.width/2;
			game.ship.position.y = game.height/2;
			game.ship.anchor.x = 0.5;
			game.ship.anchor.y = 0.5;
			game.ship.scale.x = 1;
			game.ship.scale.y = 1;
			game.ship.mass = 1;
			game.ship.thrust = 0.2;
			game.ship.state = 'launched';
			game.ship.radius = 30 * game.ship.scale.x;
			game.ship.rotation = 0;
			game.ship.velocity = {
				x: 0,
				y: 0
			};
			game.ship.vector = {
				x: 0,
				y: 0
			};

			game.level.addChild(game.ship);

			game.score = 0;

			game.scoreContainer = new PIXI.DisplayObjectContainer();
			game.scoreContainer.position.x = 10;
			game.scoreContainer.position.y = 10;
			game.stage.addChild(game.scoreContainer);

			game.scoretext = new PIXI.Text(game.score, {font: "bold 13pt Arial", fill: "#000000", align: "center", stroke: "#FFFFFF", strokeThickness: 3});

			game.scoreContainer.addChild(game.scoretext);

			game.replaytext = new PIXI.Text(game.score, {font: "bold 36pt Arial", fill: "#000000", align: "center", stroke: "#FFFFFF", strokeThickness: 3});
			game.replaytext.position.x = (game.width/2) - 140;
			game.replaytext.position.y = game.height/2;
			game.replaytext.anchor.x = 0.5;
			game.replaytext.anchor.y = 0.5;
			game.replaytext.interactive = true;
			game.replaytext.setText('REPLAY');
			game.replaytext.visible = false;
			game.stage.addChild(game.replaytext);

			game.replaytext.mouseover = function() {
				game.replaytext.setStyle({font: "bold 36pt Arial", fill: "#000000", align: "center", stroke: "#FF9933", strokeThickness: 3});
			}
			game.replaytext.mouseout = function() {
				game.replaytext.setStyle({font: "bold 36pt Arial", fill: "#000000", align: "center", stroke: "#FFFFFF", strokeThickness: 3});
			}

			game.replaytext.click = function() {
				game.reset();
			}

			game.nexttext = new PIXI.Text(game.score, {font: "bold 36pt Arial", fill: "#000000", align: "center", stroke: "#FFFFFF", strokeThickness: 3});
			game.nexttext.position.x = (game.width/2) + 120;
			game.nexttext.position.y = game.height/2;
			game.nexttext.anchor.x = 0.5;
			game.nexttext.anchor.y = 0.5;
			game.nexttext.interactive = true;
			game.nexttext.setText('NEXT');
			game.nexttext.visible = false;
			game.stage.addChild(game.nexttext);

			game.nexttext.mouseover = function() {
				game.nexttext.setStyle({font: "bold 36pt Arial", fill: "#000000", align: "center", stroke: "#00cc00", strokeThickness: 3});
			}
			game.nexttext.mouseout = function() {
				game.nexttext.setStyle({font: "bold 36pt Arial", fill: "#000000", align: "center", stroke: "#FFFFFF", strokeThickness: 3});
			}
			game.nexttext.click = function() {
				game.level.current++;
				game.clearLevel();
				game.reset();
				game.levelsLoaded();
			}

			game.run();
		},

		run: function() {
			requestAnimFrame(game.run);

			game.update();

			game.renderer.render(game.stage);
		},

		update: function() {
			game.aimLine.clear();
			game.aimLine.lineStyle(2, 0xff0000, 0.7);
			game.aimLine.moveTo(game.aimLine.position.x, game.aimLine.position.y);
			game.aimLine.lineTo(game.mouse.position.x, game.mouse.position.y);

			game.background.tilePosition.x -= 0.4 * game.ship.velocity.x;
			game.midground.tilePosition.x -= 0.2 * game.ship.velocity.x;
			game.background.tilePosition.y -= 0.4 * game.ship.velocity.y;
			game.midground.tilePosition.y -= 0.2 * game.ship.velocity.y;

			for (var s = 0; s < game.shadows.length; s++) {
				var shadowAngle = getAngle(game.lightSource.x + game.level.position.x, game.shadows[s].position.x,
											game.lightSource.y, game.shadows[s].position.y);
				game.shadows[s].rotation = shadowAngle;
			}

			for (var p = 0; p < game.planets.length; p++) {
				var lightAngle = getAngle(game.lightSource.x + game.level.position.x, game.planets[p].position.x,
											game.lightSource.y, game.planets[p].position.y);
				game.planets[p].rotation = lightAngle;
			}

			game.ship.rotation = getAngle(game.mouse.position.x, game.ship.position.x, game.mouse.position.y, game.ship.position.y);

			if (game.ship.state === 'launched') {
				for (var p = 0; p < game.planets.length; p++) {
					var distance = getDistance(game.planets[p], game.ship);

					var planetVector = new Vector(game.ship.position.x, game.planets[p].position.x,
											game.ship.position.y, game.planets[p].position.y);

					var topSpeed = 10;

					var gravitationalForce = (game.gravity * game.ship.mass * game.planets[p].mass)/Math.pow(distance,2);

					if (distance < game.ship.radius + game.planets[p].radius) {
						//game.ship.state = 'colliding';
						/*if (game.planets[p].target == 'true') {
							game.explosion.onComplete = function() { game.win(); }
						}*/

						game.ship.vector.x = -planetVector.x;
						game.ship.vector.y = -planetVector.y;

					}
					else {
						game.ship.vector.x += planetVector.x * gravitationalForce;
						game.ship.vector.y += planetVector.y * gravitationalForce;
					}

					var mouseVector = new Vector(game.ship.position.x, game.mouse.position.x,
												game.ship.position.y, game.mouse.position.y);

					var acceleration = .02;

					if (game.key.isDown(game.key.UP)) {
						game.ship.vector.x += mouseVector.x * acceleration;
						game.ship.vector.y += mouseVector.y * acceleration;
					}
					if (game.key.isDown(game.key.DOWN)) {
						game.ship.vector.x -= mouseVector.x * acceleration;
						game.ship.vector.y -= mouseVector.y * acceleration;
					}

					if (Math.abs(game.ship.vector.x) > topSpeed) {
						game.ship.vector.x = (Math.abs(game.ship.vector.x)/game.ship.vector.x) * topSpeed;
					}
					if (Math.abs(game.ship.vector.y) > topSpeed) {
						game.ship.vector.y = (Math.abs(game.ship.vector.y)/game.ship.vector.y) * topSpeed;
					}

					game.planets[p].position.x -= game.ship.velocity.x;
					game.planets[p].position.y -= game.ship.velocity.y;
					game.shadows[p].position.x -= game.ship.velocity.x;
					game.shadows[p].position.y -= game.ship.velocity.y;
				}

				game.ship.velocity.x = game.ship.vector.x;
				game.ship.velocity.y = game.ship.vector.y;
				//console.log(game.ship.velocity.x);
			}
			else if (game.ship.state == 'colliding') {
				/*if (!game.explosion.playing) {
					game.ship.visible = false;
					game.ship.velocity.x = 0;
					game.ship.velocity.y = 0;
					game.explosion.position.x = game.ship.position.x;
					game.explosion.position.y = game.ship.position.y;
					game.explosion.visible = true;
					game.explosion.gotoAndPlay(0);
				}*/
				

			}
			else {
				
				if (game.dragging === true && game.level.position.x <= 0) {
					game.level.position.x -= (game.lastMousePosition - game.mouse.position.x) * 2;
					if (game.level.position.x > 0) {
						game.level.position.x = 0;
					}
					
				}
				game.lastMousePosition = game.mouse.position.x;

				game.ship.click = function(data) {
					if (game.ship.state == 'idle') {
						game.aimLine.visible = true;
						game.ship.state = 'ready';
					}
					else if (game.ship.state == 'ready') {
						game.aimLine.visible = false;
						game.ship.state = 'idle';
					}
				}
			}

			game.gutter = 200;

			if (game.ship.position.x < -game.gutter || game.ship.position.x > (game.level.json.width * game.level.json.tilewidth) + game.gutter ||
				game.ship.position.y < -game.gutter || game.ship.position.y > (game.level.json.height * game.level.json.tileheight) + game.gutter) {
				
				game.reset();
			
			}
		}
	};

	game.key = {
		_pressed: {},

		LEFT: 65,
		UP: 87,
		RIGHT: 68,
		DOWN: 83,
		TAB: 9,
		ENTER: 13,

		isDown: function(keyCode) {
			return this._pressed[keyCode];
		},

		onKeydown: function(event) {
			this._pressed[event.keyCode] = true;
			if (event.keyCode == game.key.TAB) {
				event.preventDefault();
				return false;
			}
		},

		onKeyup: function(event) {
			delete this._pressed[event.keyCode];
		}
	};

})();