(function() {

	var socket;

	game.network = {

		connect: function() {
			socket = io.connect(window.location.href);
			return socket;
		},
	
		setEventHandlers: function() {
			socket.on('connect', this.onSocketConnected);
			socket.on('client id', this.onClientId);
			socket.on('disconnect', this.onSocketDisconnect);
			socket.on('new player', this.onNewPlayer);
			socket.on('move player', this.onMovePlayer);
			socket.on('remove player', this.onRemovePlayer);
			socket.on('new projectile', this.onNewProjectile);
			socket.on('remove projectile', this.onRemoveProjectile);
			socket.on('deaths', this.onDeaths);
			socket.on('kills', this.onKills);
			socket.on('chunk', this.onChunk);
		},

		onChunk: function(data) {
			console.log(data);
		},

		onSocketConnected: function() {
			console.log('Connected to socket server, requesting client id');
			game.socket.emit('request id', {});
			game.loadChunks();
		},

		onClientId: function(data) {
			game.clientId = data.id;
			console.log('network id acquired: ' + game.clientId);

			/*game.entities[game.clientId] = game.createEntity({
				playerId: game.clientId,
				image: game.loader.getAsset('fighter.png'),
				x: game.entities['map'].width/2,
				y: game.entities['map'].height/2,
				screenX: game.width/2,
				screenY: game.height/2,
				angle: 0,
				offsetX: -game.assetManager.getAsset('fighter.png').width/2,
				offsetY: -game.assetManager.getAsset('fighter.png').height/2,
				collision: 'circle',
				zIndex: 2
			}, [game.component.entity,
				game.component.moveable,
				game.component.damageable]);*/

			

			console.log('requesting already connected players.');
			game.socket.emit('get clients', {});
			game.lastUpdate = Date.now();
			//game.run();
		},

		onSocketDisconnect: function() {
			console.log('Disconnected from socket server');
		},

		onNewPlayer: function(data) {
			console.log('New player connected: ' + data.id + ':' + data.name);

			game.entities[data.id] = game.createEntity({
				playerId: data.id,
				name: data.name,
				image: game.assetManager.getAsset('fighter.png'),
				x: data.x,
				y: data.y,
				r: 20,
				angle: 0,
				offsetX: -game.assetManager.getAsset('fighter.png').width/2,
				offsetY: -game.assetManager.getAsset('fighter.png').height/2,
				width: game.assetManager.getAsset('fighter.png').width,
				height: game.assetManager.getAsset('fighter.png').height,
				collision: 'circle',
				zIndex: 2,
				kills: data.kills,
				deaths: data.deaths
			}, [game.component.entity,
				game.component.moveable,
				game.component.drawable]);

			game.nPlayers++;

			game.addPlayerToScoreboard(game.entities[data.id]);
		},

		onMovePlayer: function(data) {
			game.entities[data.id].screenX = data.x - game.entities[game.clientId].x + game.entities[game.clientId].screenX;
			game.entities[data.id].screenY = data.y - game.entities[game.clientId].y + game.entities[game.clientId].screenY;
			game.entities[data.id].x = data.x;
			game.entities[data.id].y = data.y;
			game.entities[data.id].velX = data.velX;
			game.entities[data.id].velY = data.velY;
			game.entities[data.id].angle = data.angle;
		},

		onRemovePlayer: function(data) {
			if (!game.entities[data.id]) {
				console.log('Player not found: ' + data.id);
				return;
			}
			
			game.removePlayerFromScoreboard(game.entities[data.id]);
			delete game.entities[data.id];
			game.nPlayers--;
			console.log('player has been disconnected: ' + data.id);
		},

		onNewProjectile: function(data) {
			game.entities['Projectile' + data.id] = game.createEntity({
				id: data.id,
				image: game.assetManager.getAsset('projectile.png'),
				playerId: data.playerId,
				x: data.x,
				y: data.y,
				velX: data.velX,
				velY: data.velY,
				collision: 'circle',
				dp: 1,
				zIndex: 1
			}, [game.component.entity,
				game.component.moveable,
				game.component.drawable,
				game.component.projectile]);
		},

		onRemoveProjectile: function(data) {
			var removeProjectile = projectileById(data.id);

			if (!removeProjectile) {
				console.log('Projectile not found: ' + this.id);
			};

			game.projectiles.splice(game.projectiles.indexOf(removeProjectile));
		},

		onDeaths: function(data) {
			game.entities[data.id].deaths = data.deaths;
			game.entities[data.id + '.deathsLabel'].label = game.entities[data.id].deaths;
		},

		onKills: function(data) {
			game.entities[data.id].kills = data.kills;
			game.entities[data.id + '.killsLabel'].label = game.entities[data.id].kills;
		}

	}

}());