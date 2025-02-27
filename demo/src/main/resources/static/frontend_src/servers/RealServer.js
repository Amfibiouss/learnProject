class RealServer {
	
	constructor(onReceiveMessage, 
				onChangeStatus, 
				onChangeState, 
				onChangePlayer,
				onChangePoll,
				loadStateAndMessages, 
				loadInitialInfo,
				room_id) {
					
		this.playerCount = Number(document.getElementById("players_limit").value);
		this.onReceiveMessage = onReceiveMessage;
		this.onChangeState = onChangeState;
		this.onChangeStatus = onChangeStatus;
		this.onChangePlayer = onChangePlayer;
		this.onChangePoll = onChangePoll;
		this.loadStateAndMessages = loadStateAndMessages;
		this.socket = new WebSocket("ws:" + "//" + window.location.host + "/api/socket");
		this.socket.onmessage = this.messageHandler;
		this.socket.onopen = loadInitialInfo;
		this.room_id = room_id;
	}
	
	sendMessage(data, onSuccess, onError) {	
		let csrf_token = document.getElementById("_csrf").value;
				
		fetch("/api/room/" + this.room_id + "/send_message", {
			headers: {
				"X-CSRF-TOKEN": csrf_token,
				"Content-Type": "application/json"
			},
			method: "post",
			body: JSON.stringify(data)
		}).then((response) => {
			if (response.status != 200) {
				console.log("Не удалось отправить сообщение!");
				onError();
				return;
			} else {
				onSuccess();
			}
		});
		/*
		this.socket.send(JSON.stringify(
		{
			type: "message", 
			data: JSON.stringify(data)
		}));
		*/
	}
	
	sendVote(data, onSuccess, onError) {
		let csrf_token = document.getElementById("_csrf").value;
				
		fetch("/api/room/" + this.room_id + "/send_vote", {
			headers: {
				"X-CSRF-TOKEN": csrf_token,
				"Content-Type": "application/json"
			},
			method: "post",
			body: JSON.stringify(data)
		}).then((response) => {
			if (response.status != 200) {
				console.log("Не удалось отправить голос!");
				onError();
				return;
			} else {
				onSuccess();
			}
		});
	}
	
	messageHandler = (event) => {
		const msg = JSON.parse(event.data);
		
		switch (msg.type) {
			case "message":
				this.onReceiveMessage(JSON.parse(msg.data));
				break;
				
			case "status":
				let obj = JSON.parse(msg.data);
				this.onChangeStatus(obj.status, obj.duration, obj.version);
				break;
				
			case "state":
				this.onChangeState(JSON.parse(msg.data));
				break;
				
			case "player":
				this.onChangePlayer(JSON.parse(msg.data));
				break;
				
			case "poll":
				this.onChangePoll(JSON.parse(msg.data));
				break;
			case "imperius":
				this.loadStateAndMessages(JSON.parse(msg.data));
				break;
		}
	}
	
	getMessages(pindex, onComplete) {
		fetch("/api/room/" + this.room_id + "/messages?" + new URLSearchParams({pindex : pindex}))
		.then((response) => {
				if (response.status !== 200) {
					console.log("Не удалось загрузить сообщения");
					return;
				}
				
				response.json().then(onComplete);
			}
		);
	}
	
	getPlayers(onComplete) {
		fetch("/api/rooms/players/" + this.room_id)
		.then((response) => {
				if (response.status !== 200) {
					console.log("Не удалось загрузить игроков");
					return;
				}
				
				response.json().then(onComplete);
			}
		);
	}
	
	getState(onComplete) {
		fetch("/api/room/" + this.room_id + "/state")
		.then((response) => {
				if (response.status !== 200) {
					console.log("Не удалось загрузить состояние");
					return;
				}
				
				response.json().then(onComplete);
			}
		);
	}
	
	
	#sendState(data, operation, onComplete) {
		
		let url = "/api/room/" + this.room_id + "/";
		url += operation;
		
		let csrf_token = document.getElementById("_csrf").value;
				
		fetch(url, {
			headers: {
				"X-CSRF-TOKEN": csrf_token,
				"Content-Type": "application/json"
			},
			method: "post",
			body: JSON.stringify(data)
		}).then((response) => {
			if (response.status != 200) {
				console.log("Сервер не принял данные о новом состоянии игры, отправленные движком");
				return;
			}
			
			onComplete();
		});
	}
	
	init(initData, onComplete) {
		this.#sendState(initData, "init", onComplete);
	}
	
	update(data) {
		this.#sendState(data, "update", () => {});
	}
	
	getPollResults(onComplete) {
		fetch("/api/room/" + this.room_id + "/update")
		.then((response) => {
				if (response.status !== 200) {
					console.log("Не удалось получить результаты голосований");
					return;
				}
				
				response.json().then(onComplete);
			}
		);
	}
	
	pause() {
		let csrf_token = document.getElementById("_csrf").value;
		
		fetch("/api/room/" + this.room_id + "/pause",
			{
				method: "post",
				headers: {"X-CSRF-TOKEN": csrf_token}
			})
		.then((response) => {
				if (response.status !== 200) {
					console.log("Не удалось поставить на паузу");
					return;
				}
			}
		);
	}
	
	unpause() {
		let csrf_token = document.getElementById("_csrf").value;
		
		fetch("/api/room/" + this.room_id + "/unpause",
			{
				method: "post",
				headers: {"X-CSRF-TOKEN": csrf_token}
			})
		.then((response) => {
				if (response.status !== 200) {
					console.log("Не удалось снять с паузы");
					return;
				}
			}
		);
	}
	
	
	useMagic(spell, username, pindex) {
		let csrf_token = document.getElementById("_csrf").value;
		let params = (spell === "imperius")? {target : username, pindex: pindex} :  {target : username};
		
		fetch("/api/room/" + this.room_id + "/" + spell + "?" + new URLSearchParams(params),
			{
				method: "post",
				headers: {"X-CSRF-TOKEN": csrf_token}
			})
		.then((response) => {
				if (response.status !== 200) {
					console.log("Не удалось закастовать " + spell);
					return;
				}
			}
		);
	}
	
	tryExit() {
		
		let csrf_token = document.getElementById("_csrf").value;
				
		fetch("/api/rooms/exit/" + this.room_id, {
			headers: {
				"X-CSRF-TOKEN": csrf_token,
				"Content-Type": "application/json"
			},
			method: "post",
		}).then((response) => {
			if (response.status != 200) {
				console.log("Не удалось отключится от комнаты");
				return;
			}
			
			window.location.href = "/public/rooms";
		});
	}

}
export default RealServer;