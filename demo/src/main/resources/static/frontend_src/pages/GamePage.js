import React from "react";
import { useParams } from "react-router"
import '../Main.css';
import Button from "../common_components/Button.js";
import PseudoServer from "../servers/PseudoServer.js";
import RealServer from "../servers/RealServer.js";
import Engine from "../engine/Engine.js";


class GamePage extends React.Component {
		
	constructor(props) {
	    super(props);
		
		let room_id = document.getElementById("room_id").value;
		let mode = document.getElementById("mode").value;
		let isHost = document.getElementById("isHost").value === "true";
		let server;
		
		if (mode === "dev")
			server = new PseudoServer(this.onReceiveMessage, this.onChangeStatus, room_id);
		else 
			server = new RealServer(this.onReceiveMessage, 
									this.onChangeStatus, 
									this.onChangeState,
									this.onChangePlayer,
									this.onChangePoll,
									this.loadStateAndMessages, 
									this.loadInitialInfo,
									room_id);
		
		this.pending_player_changes = null;
		this.messages_load_id = 0; 
		this.pending_messages = null;
		this.state_load_id = 0; 
		this.pending_votes = null; 
		this.countdown = 0;
		this.state_version = -1;
		this.messages_version = -1;
		
		this.pindex = -1;
		this.stage = null;
		this.room_id = room_id;
		
		this.state = {polls: [], 
					channels: [], 
					players: [],
					server: server,
					engine: new Engine(), 
					status: "waiting",
					stages: [],
					stage: null,
					pindex: -1,
					isHost: isHost};		
	}
	
	loadStateAndMessages = () => {
		
		this.pending_votes = [];		
		let _state_load_id = ++this.state_load_id;
		
		this.state.server.getState((state) => {
			
			if (_state_load_id !== this.state_load_id)
				return;
						
			if (this.state_version > state.version) {
				this.pending_votes = null;
				return;
			}
				
			this.onChangeState(state);
						
			for (const vote of this.pending_votes)
				this.addVote(vote);
			this.pending_votes = null;
			
			this.pending_messages = [];
			let _messages_load_id = ++this.messages_load_id;
			
			this.state.server.getMessages(this.pindex, (messages) => {
				
				if (_messages_load_id !==  this.messages_load_id)
					return;
					
				if (messages.pindex !== this.pindex) {
					this.pending_messages = null;
					return;
				}
				
				messages.stages.forEach((stage) => {
					stage.messages = stage.messages.concat(stage.rowMessages);
				});
				
				let stages = messages.stages;
				let cnt = 0;
			
				for (const stage of stages) {
					
					cnt += stage.messages.length;
					
					for (const msg of stage.messages) {
						msg.date = new Date(msg.date);
					}
					
					if (stage.messages.length > 0) {
						stage.date = stage.messages[0].date;
					} else {
						stage.date = new Date(0);
					}
				}
				
				if (cnt > this.messages_version) {
					this.messages_version = cnt;
					
					stages.sort((a, b) => a.date - b.date);
					this.state.stages = stages;
					this.setState({stages: stages});
					
					for (const msg of this.pending_messages)
						this.addMessage(msg);
				}
				this.pending_messages = null;
			});
		});
		/*
		this.state.server.getPlayers((players) => {
			this.setState({players: players});
		});
		*/
	}
	
	loadInitialInfo = () => {
		this.loadStateAndMessages();
		
		this.pending_player_changes = [];
		
		this.state.server.getPlayers((players) => {
			this.setState({players: players});
				
			for (const change of this.pending_player_changes)
				this.refreshPlayer(change);
			
			this.pending_player_changes = null;
		});
	}
	
	addVote = (candidateState) => {
		if (this.stage != candidateState.stage)
			return;

		let poll = this.state.polls.find((item) => item.id === candidateState.pollId);

		if (!poll) 
			return;

		let candidate = poll.candidates.find((item) => item.id === candidateState.candidateId)

		if (candidate && candidate.votes < candidateState.votes) {
			candidate.votes = candidateState.votes;
			this.setState({polls: this.state.polls});
		}
	}
	
	onChangePoll = (candidateStates) => {
		
		if (this.pending_votes !== null) {
			for (let candidateState of candidateStates)
				this.pending_votes.push(candidateState);
		} else {
			for (let candidateState of candidateStates)
				this.addVote(candidateState);
		}
	}
	
	refreshPlayer(player) {
		let old_player = this.state.players.find((item) => item.pindex === player.pindex);

		//console.log(player);
		
		if (!old_player)
			return;
		
		if (player.version > old_player.version) {
			old_player.version = player.version;
			old_player.players = player.players;
			old_player.pindex = player.pindex;
			
			this.setState({players: this.state.players});
		}
	}
	
	onChangePlayer = (player) => {
		
		if (this.pending_player_changes !== null) {
			this.pending_player_changes.push(player);
		} else {
			this.refreshPlayer(player);
		}
	}
	
	addMessage = (message) => {
		let stage = this.state.stages.find((stage) => stage.name === message.stage);

		if (!stage) {
			stage = {name: message.stage, date: message.date, messages: [message]};
			this.state.stages.push(stage);
			this.state.stages.sort((a, b) => a.date - b.date);
			this.setState({stages: this.state.stages});	
			return;
		} else {
			if (stage.messages.length === 0) {
				stage.date = message.date;
				this.state.stages.sort((a, b) => a.date - b.date);
			}
		}

		if (stage.messages.find((msg) => msg.id === message.id))
			return;
			
		stage.messages.push(message);
		stage.messages.sort((a, b) => a.date - b.date);
		
		this.setState({stages: this.state.stages});	
	}
	
	onReceiveMessage = (message) => {

		message.date = new Date(message.date);
		
		if (this.pending_messages !== null)
			this.pending_messages.push(message);
		else
			this.addMessage(message);
	};
	
	toFuture = () => {
		if (this.state.status !== "run")
			return;
			
		if (this.timerId) {
			clearInterval(this.timerId);
		}
		
		this.state.server.getPollResults((poll_results) => {
			var new_state_room = this.state.engine.update(poll_results);					
			this.state.server.update(new_state_room);
		});
	}
	
	toPast = () => {
		if (this.state.status !== "run")
			return;
		
		if (this.timerId) {
			clearInterval(this.timerId);
		}
		
		var new_state_room = this.state.engine.toPast();	
		
		if (new_state_room)				
			this.state.server.toPast(new_state_room);
	}
	
	stopTime = () => {
		
		if (this.state.status !== "run" && this.state.status !== "pause")
			return;
		
		if (this.state.status === "run") {
			if (this.timerId) {
				clearInterval(this.timerId);
			}
			this.state.server.pause(this.countdown);
		} else {
			this.state.server.unpause();
		}	
	}
	
	startCountdown = (timeout) => {
		
		if (timeout < 0) {
			return;
		}
	
		this.countdown = timeout;
		var date_end = Number(new Date()) + timeout;
		var timer = document.getElementById("timer");
		timer.innerHTML = Math.round(timeout / 1000);
		
		this.timerId = setInterval(() => {
			this.countdown = (Number(date_end) - Number(new Date()));
			timer.innerHTML = Math.round(this.countdown / 1000);
			
			if (this.countdown <= 0) {
				clearInterval(this.timerId);
				
				if (isHost)
					this.toFuture();
			}
			
		}, 1000);
	}
	
	onPause = (interval) => {
		this.setState({status: "pause"});
		
		if (this.timerId)
			clearInterval(this.timerId);
		
		var timer = document.getElementById("timer");
		timer.innerHTML = "Пауза... " + Math.round(Number(interval) / 1000);
		this.countdown = interval;
	}
	
	onUnpause = () => {
		this.setState({status: "run"});
		this.startCountdown(this.countdown);
	}
	
	onChangeStatus = (status, duration) => {
		
		if (this.state_version >= status.version) 
			return;
			
		this.state_version = status.version;
		
		this.setState({status: status});
		
		if (status === "proccessing" || status === "pause" || status === "closed") {
			
			if (this.timerId)
				clearInterval(this.timerId);
		}
		
		if (status === "run") {
			this.startCountdown(duration);
			return;
		}		
		var timer = document.getElementById("timer");
		
		if (timer && status === "pause") {
			timer.innerHTML = "Пауза... " + Math.round(Number(duration) / 1000);
			this.countdown = duration;
		}
		
		if (timer && status === "initializing")
			timer.innerHTML = "Инициализация...";
				
		if (timer && status === "processing")
			timer.innerHTML = "Обработка...";
		
		if (timer && status === "closed")
			timer.innerHTML = "Комната закрыта";
	}
	
	onChangeState = (state_room) => {
		
		if (this.state_version > state_room.version) 
			return;
		
		if (this.pindex != state_room.pindex) {
			this.messages_version = -1;
		}
			
		this.state_version = state_room.version;
		
		if (this.timerId)
			clearInterval(this.timerId);
		
		let timer = document.getElementById("timer");
		
		if (timer && state_room.status === "initializing")
			timer.innerHTML = "Инициализация...";
				
		if (timer && state_room.status === "processing")
			timer.innerHTML = "Обработка...";
		
		if (timer && state_room.status === "pause")
			timer.innerHTML = "Пауза... " + Math.round(Number(state_room.duration) / 1000);

		if (timer && state_room.status === "finished")
			timer.innerHTML = "Игра окончена";
		
		if (timer && state_room.status === "closed")
			timer.innerHTML = "Комната закрыта";
		
		this.setState({
			status: state_room.status,
			channels: state_room.staticState.channels,
			polls: state_room.polls,
			stage: state_room.staticState.stage,
			pindex: state_room.pindex
		});
		
		if (state_room.duration && state_room.status === "run")
			this.startCountdown(state_room.duration);

		this.pindex = state_room.pindex;
		this.stage = state_room.staticState.stage;
	};
	
	onSendVote = (pollName, selected) => {
		this.state.server.sendVote({
			selected: selected,
			roomId: this.room_id,
			pollName: pollName,
			stage: this.stage,
			pindex: this.pindex,
		});
	}
	
	onSendMessage = (channelName, text) => {
		this.state.server.sendMessage({
			text: text, 
			roomId: this.room_id,
			channelName: channelName,
			stage: this.stage,
			pindex: this.pindex,
		});
	}

	render() {
		return <div className="flex-1 flex flex-col">
			<TopBar status={this.state.status} 
					server={this.state.server}
					toFuture={this.toFuture}
					stopTime={this.stopTime}
					toPast={this.toPast}
					onStart={() => {
						this.state.server.start((config) => {
							var init_data = this.state.engine.start(config);
							this.state.server.init(init_data);
						});
					}}>
			</TopBar>
			<div className="flex flex-col grow items-center z-10">
				<MainWindow stages={this.state.stages} 
							stage={this.state.stage} 
							polls={this.state.polls} 
							channels={this.state.channels} 
							players={this.state.players}
							pindex={this.state.pindex}
							server={this.state.server}
							onSendVote={this.onSendVote}
							onSendMessage={this.onSendMessage}>
				</MainWindow>
			</div>
		</div>
    }
}

class TopBar extends React.Component {
	
	constructor(props) {
	    super(props);
			
		this.state = {showTimeMenu: false};		
	}
	
	render() {
		let isHost = document.getElementById("isHost").value === "true";
		let showStartButton = (this.props.status === "waiting" && isHost);
		
		return <div className="dark:border-white border-black border-b-2 min-h-8 text-center bg-gray-300 dark:bg-gray-800 relative">
			<button className="absolute bottom-0 left-0 p-2 flex gap-2" 
				onClick={()=>{this.props.server.tryExit();}}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-7 h-7" viewBox="0 0 16 16">
				  <path d="M8.5 10c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1"/>
				  <path d="M10.828.122A.5.5 0 0 1 11 .5V1h.5A1.5 1.5 0 0 1 13 2.5V15h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V1.5a.5.5 0 0 1 .43-.495l7-1a.5.5 0 0 1 .398.117M11.5 2H11v13h1V2.5a.5.5 0 0 0-.5-.5M4 1.934V15h6V1.077z"/>
				</svg>
				<span className="text-lg">Выйти</span>
			</button>
			<div>
				<div style={(!showStartButton)? {} : {display: "none"}}>
					<span className="text-2xl" id="timer" onClick={()=>{this.setState({showTimeMenu: !this.state.showTimeMenu});}}></span>	
					<div className="relative" style={(isHost && this.state.showTimeMenu)? {} : {display: "none"}}>
						<TimeMenu toFuture={this.props.toFuture}
								toPast={this.props.toPast}
								stopTime={this.props.stopTime}></TimeMenu>
					</div>			
				</div>
				<div style={showStartButton? {} : {display: "none"}}>
					<Button value="Начать" onClick={this.props.onStart}></Button>
				</div>
			</div>
		</div>
	}
}

class TimeMenu extends React.Component {
	
	render() {
		return 	<div className="absolute flex justify-center" style={{top:0, left: 0, right: 0}}>
			<div className="border-black dark:border-white border-2 h-12 w-fit p-2 bg-gray-300 dark:bg-gray-800 z-20">
				<button onClick={this.props.toPast}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-8 w-8" viewBox="0 0 16 16">
					  <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
					</svg>
				</button>
				<button onClick={this.props.stopTime}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-8 w-8" viewBox="0 0 16 16">
					  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
					</svg>
				</button>
				<button onClick={this.props.toFuture}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-8 w-8" viewBox="0 0 16 16">
					  <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
					</svg>
				</button>
			</div>
		</div>
	}
}

class MainWindow extends React.Component {
	
	constructor(props) {
		super(props);
				
		this.state = {active_tab: -1};	
	}
	
	render() {

		if (this.state.active_tab !== -2 && !this.props.polls.find((poll) => poll.name === this.state.active_tab)) {
			this.state.active_tab = -1;
		}
		
		let pollWindow = this.props.polls.map((poll) => 
			<PollWindow key={this.props.pindex + ":" + poll.name} 
					name={poll.name} 
					pindex={this.props.pindex}
					showVotes={poll.showVotes}
					description={poll.description} 
					max_selection={poll.max_selection} 
					min_selection={poll.min_selection} 
					candidates={poll.candidates} 
					active={this.state.active_tab === poll.name}
					server={this.props.server}
					onSendVote={this.props.onSendVote}>
			</PollWindow>
		);
		
		const tab_list = <>
			<Tab name="Чат" key={-1} active={this.state.active_tab === -1} onClick={()=>{this.setState({active_tab: -1});}}></Tab>
			{this.props.polls.map((poll) => 
					<Tab  key={poll.name} active={this.state.active_tab === poll.name} name={poll.name} onClick={()=>{this.setState({active_tab: poll.name});}}></Tab>)}
				
			<Tab name="Игроки" key={-2} active={this.state.active_tab === -2} onClick={()=>{this.setState({active_tab: -2});}}></Tab>	
		</>;
			
		return <div className="flex flex-col grow" style={{minWidth: "min(100%, 40rem)", maxWidth: "min(100%, 40rem)"}}>
					<div className="flex border-black dark:border-white border-b-2 min-w-full overflow-x-auto min-h-max">{tab_list}</div>
					<div className={"flex flex-col grow"}>
						<ChatWindow active={this.state.active_tab === -1} 
									stages={this.props.stages} 
									stage={this.props.stage} 
									channels={this.props.channels} 
									onSendMessage={this.props.onSendMessage}
									server={this.props.server}>
						</ChatWindow>
						{pollWindow}
						<PlayerWindow active={this.state.active_tab === -2}
									  players={this.props.players} 
									  server={this.props.server}>
						</PlayerWindow>
					</div>
				</div>
    }
}

class PollWindow extends React.Component {

	
	constructor(props) {
		super(props);
					
		this.state = {selected: [], voted: false};		
	}

	onSelect = (id) => {
		
		if (this.state.selected.indexOf(id) >= 0) {
			this.state.selected.splice(this.state.selected.indexOf(id), 1);
			this.setState({selected: this.state.selected});
			return;
		}
		
		
		if (this.state.selected.length < this.props.max_selection) {
			this.state.selected.push(id);
			this.setState({selected: this.state.selected});
		}
	};
	
	sendVote = () => {
		this.props.onSendVote(this.props.name, this.state.selected);
		//this.props.server.sendVote(this.props.name, this.state.selected);
		this.setState({voted: true});
	};
	
	render() {

		let voted = this.state.voted;
				
		if (this.props.candidates.find((candidate) => candidate.selected))
			voted = true;
		
		return 	<><div className="overflow-y-auto" style={(!this.props.active)? 
						{display: "none"} : {maxHeight: "calc(100vh - 12rem)"}}>
						
			<div className="flex flex-col gap-2 p-2">
				<div className="text-center text-2xl">{this.props.name}</div>
				<div>{this.props.description}</div>
				<div className="flex justify-center flex-wrap gap-2">{this.props.candidates.map((candidate) => 
					<PollOption key={candidate.id} 
								name={candidate.name} 
								id={candidate.id} 
								showVotes={this.props.showVotes}
								votes={candidate.votes}  
								onSelect={(voted)? ()=>{} : this.onSelect} 
								selected={candidate.selected || this.state.selected.indexOf(candidate.id) >= 0}
								canVote = {!voted && !candidate.blocked
									&& (this.state.selected.indexOf(candidate.id) >= 0 || this.state.selected.length < this.props.max_selection)}>
					</PollOption>
				)}</div>
			</div>
		</div>
		{(this.props.active && this.state.selected.length >= this.props.min_selection && !voted)? 
			<div className="text-center text-xl">
				<Button value="Голосовать" onClick={this.sendVote}></Button>
			</div>
		 : <></>}</>
    }
}

class PollOption extends React.Component {

	render() {
		
		let votesCounter = (this.props.showVotes)? <span className={"flex justify-center items-center w-12 h-12 text-2xl font-mono rounded-2xl" 
			+ (this.props.canVote? " bg-gray-300 dark:bg-gray-700" : " bg-gray-200 dark:bg-gray-800")}>{this.props.votes}</span>
			: <div className="w-12 h-12"></div>;
		
		return <div className = "flex justify-center items-center w-64 h-16">
			<button className = {"flex justify-around items-center w-full h-full rounded-2xl transition-[margin] duration-300 "
				 + (this.props.selected? "m-0 bg-gray-400 dark:bg-gray-600" : 
					(this.props.canVote? "m-2 hover:m-0 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700" : "m-2 bg-gray-100 dark:bg-gray-900"))} 
					onClick={()=>{ if (this.props.canVote) this.props.onSelect(this.props.id);}}>
				<span className="w-12 h-12">
					{this.props.selected? 
						<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-12 w-12" viewBox="0 0 16 16">
						  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
						</svg> 
						: <></>}
				</span>
				<span className="text-xl">{this.props.name}</span>
				{votesCounter}
			</button> 
		</div>
    }
}

class PlayerWindow extends React.Component {
	render() {
		let players_limit = Number(document.getElementById("players_limit").value);
		let population = this.props.players.filter((character) => character.players.length > 0).length;

		let playersTab = this.props.players.map((character) => {
			if (character.players.length > 0) {
				return character.players.map((player) =>
					<Player key={player.username + ":" + character.pindex}
							username={player.username} 
							pindex={character.pindex} 
							online={player.online} 
							server={this.props.server}>
					</Player>)
			} else { 
				return <Player key={":" + character.pindex}
						username={null} 
						pindex={character.pindex} 
						online={false} 
						server={this.props.server}>
				</Player>
			}
		});
		
		return <div className="overflow-y-auto px-2" 
			style={(this.props.active)? {minHeight: "calc(100vh - 9rem)", maxHeight: "calc(100vh - 9rem)"} : {display: "none"}}>
			<div className="text-3xl p-2">{"Игроков " + population + " / " + players_limit}</div>
			{playersTab}
		</div>;
	}
}

class Player extends React.Component {
	render() {
		let isHost = document.getElementById("isHost").value === "true";
		let bg_color = (this.props.online)? "bg-gray-400 dark:bg-gray-600" : (this.props.username)? "bg-gray-300 dark:bg-gray-700" : "bg-gray-200 dark:bg-gray-800"; 
		
		return <div className = {bg_color + " flex gap-2 p-2 justify-between mb-1 last:mb-32 rounded-xl"}>
			<div className="flex gap-2 text-lg">
				<span>{this.props.pindex}</span>
				<span>{(this.props.username)? (this.props.username + ((this.props.online)? "" : " (оффлайн)")) : "Пусто"}</span>
			</div>
			<div className={"relative group" + ((isHost)? "" : " hidden")}>
				<button className="flex gap-2">			
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-7 h-7" viewBox="0 0 16 16">
					  <path d="M9.5 2.672a.5.5 0 1 0 1 0V.843a.5.5 0 0 0-1 0zm4.5.035A.5.5 0 0 0 13.293 2L12 3.293a.5.5 0 1 0 .707.707zM7.293 4A.5.5 0 1 0 8 3.293L6.707 2A.5.5 0 0 0 6 2.707zm-.621 2.5a.5.5 0 1 0 0-1H4.843a.5.5 0 1 0 0 1zm8.485 0a.5.5 0 1 0 0-1h-1.829a.5.5 0 0 0 0 1zM13.293 10A.5.5 0 1 0 14 9.293L12.707 8a.5.5 0 1 0-.707.707zM9.5 11.157a.5.5 0 0 0 1 0V9.328a.5.5 0 0 0-1 0zm1.854-5.097a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L8.646 5.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0l1.293-1.293Zm-3 3a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L.646 13.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0z"/>
					</svg>
					<span className="text-lg">Магия</span>
				</button>
				<div className="absolute right-0 hidden group-hover:flex group-hover:flex-col bg-gray-300 dark:bg-gray-700 border-2 dark:border-white border-black z-20">
					<button className="hover:bg-gray-400 dark:hover:bg-gray-600 whitespace-nowrap p-2" onClick={() => {this.props.server.useMagic("imperius", this.props.pindex);}}>
						Империус
					</button>
					{(this.props.username)? <>
						<button className="hover:bg-gray-400 dark:hover:bg-gray-600 border-t-2 dark:border-white border-black whitespace-nowrap p-2" onClick={() => {this.props.server.useMagic("avada_kedavra", this.props.username);}}>
							Авада Кедавра
						</button>
						<button className="hover:bg-gray-400 dark:hover:bg-gray-600 border-t-2 dark:border-white border-black whitespace-nowrap p-2" onClick={() => {this.props.server.useMagic("cruciatus", this.props.pindex);}}>
							Круциатус
						</button>
					</> : <></>}
				</div>
			</div>
		</div>
		
	}
}

class ChatWindow extends React.Component {
	constructor(props) {
		super(props);
				
		this.state = {onBottom: true};	
		
		setInterval(() => {
			if (this.state.onBottom) {
				const window = document.getElementById("chat_window");
				if (window) {
					window.scrollTop = window.scrollHeight - window.clientHeight;
				}
			}
		}, 100);
	}

	handleScroll = () => {
		const window = document.getElementById("chat_window");
		const onBottom = (window.scrollHeight - window.clientHeight <= window.scrollTop);
		this.setState({onBottom: onBottom});
	};

	toBottom = () => {
		this.setState({onBottom: true});
	}

	render() {
		
		let chatTab = this.props.stages.filter((stage) => (stage.messages.length > 0))
					.map((stage) => <Stage key={stage.name} name={stage.name} messages={stage.messages}></Stage>);
		
		let current_stage = this.props.stages.find((item) => item.name === this.props.stage);
		if ((!current_stage || current_stage.messages.length == 0) && this.props.stage) {

			let stage_name = this.props.stage;
			let index = stage_name.lastIndexOf("@");
			if (index !== -1)
				stage_name = stage_name.substring(0, index);
			
			chatTab.push(<div key={this.props.stage} className="text-center text-3xl">{stage_name}</div>);
		}
					
		return <>
			<div id="chat_window" className="overflow-y-auto border-black dark:border-white border-b-2 dark:bg-gray-900" onScroll={this.handleScroll} 
				style={(this.props.active)? 
					{maxHeight: "calc(100vh - 16rem)", minHeight: "calc(100vh - 16rem)"} : {display: "none"}}>
				{chatTab}
			</div>
			<InputForm show = {this.props.active} 
					channels={this.props.channels} 
					server={this.props.server} 
					onSend={this.toBottom}
					onSendMessage={this.props.onSendMessage}>
			</InputForm>
		</>;
	}
}

class Stage extends React.Component {

	render() {
		const message_list = this.props.messages.map((message) =>
						<Message key={message.id}
									id={message.id} 
									text={message.text} 
									imageText={message.imageText}
									username={message.username}  
									date={message.date}
									channel_name={message.channel_name}
									channel_color={message.channel_color}>
						</Message>);
		
		let stage_name = this.props.name;
		let index = this.props.name.lastIndexOf("@");
		if (index !== -1)
			stage_name = this.props.name.substring(0, index);
						
		return <div>
				<div className="text-center text-3xl">{stage_name}</div>
				<div className="flex flex-col gap-2 p-2">{message_list}</div>
			</div>
    }
}

class Message extends React.Component {

	getDateFormat(date) {
		return ((date.getHours() < 10)?"0":"") + date.getHours() + ":" + 
				((date.getMinutes() < 10)?"0":"") + date.getMinutes();
	}
	
	render() {

		let isSystem = (this.props.channel_name === "Система");
				
		let showIcon = this.props.imageText !== "";
		
		return <div className="flex gap-5">
			<div className={"flex flex-col justify-center text-center w-14 min-w-14 h-14" 
				+ ((showIcon)? " rounded-[50%] border-2 border-black bg-gray-300 dark:bg-gray-700" : "")}>
				<span className="text-4xl font-mono">{this.props.imageText}</span>
			</div>
			<div>
				<div className="flex gap-1">
					<span className="font-semibold">{(isSystem)? "" : this.props.username}</span>
					<span className="font-semibold" style={{color: this.props.channel_color}}>{"[" + this.props.channel_name + "]"}</span>
					<span className="text-gray-500">{this.getDateFormat(this.props.date)}</span>
				</div>
				<div className={`whitespace-pre-line ${(isSystem)? " text-lg italic " : ""}`}>{this.props.text}</div>
			</div>
		</div>
    }
}

class Tab extends React.Component {

	render() {
		return <button onClick={this.props.onClick} 
		className={"hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors duration-300 p-1 whitespace-nowrap min-w-[7rem] "
			 + ((this.props.active)? "bg-gray-400 dark:bg-gray-700" : "bg-gray-300 dark:bg-gray-800")}>
			{this.props.name}
		</button>
    }
}

class InputForm extends React.Component {
	
	constructor(props) {
	    super(props);
			
		this.state = {showFilterMenu: false};		
	}

	
	sendMessage = (event) => {
		event.preventDefault();
		var formData = new FormData(event.target);
		var channelName = formData.get("select_input_channel");
		var text = formData.get("input_text");
		this.props.onSendMessage(channelName, text);
		//this.props.server.sendMessage(text, channelName);
		this.props.onSend();
		document.getElementById("input_text").value = "";
	}

	render() {
		
		var channels_for_write = this.props.channels.filter((channel) => channel.canWrite);
		
		return <div style={(this.props.show)? {} : {display: "none"}}>
			<div className="relative">
				<div className="flex flex-col absolute bottom-0 bg-gray-300 dark:bg-gray-800" style={(this.state.showFilterMenu)? {} : {display: "none"}}>{this.props.channels.map((channel) => 
									<label key={channel.name} className={"p-1 " + ((channel.canRead)? "bg-gray-400 dark:bg-gray-700" : "")}>
										<input type="checkbox" defaultChecked={true}/>
										{" " + channel.name}
									</label>
				)}</div>
			</div>
			<form className="bg-gray-300 dark:bg-gray-800 p-3" onSubmit={this.sendMessage}>
				<div className="flex flex-wrap justify-between gap-2 mb-3">
					<Button onClick={(event)=>{this.setState({showFilterMenu: !this.state.showFilterMenu}); event.preventDefault();}} value="Фильтр"></Button>
					<div className="flex gap-2" style = {(channels_for_write.length > 0)? {} : {display: "none"}}>
						<select name = "select_input_channel" className="bg-gray-300 dark:bg-gray-800 border-2 dark:border-white border-black">{
							channels_for_write.map((channel) => 
								<option key={channel.name} value={channel.name} >{channel.name}</option>)}</select>
						<Button  className="text-xl" value="Отправить"></Button>
					</div>
				</div>
				<textarea id="input_text" name="input_text" className="border-2 border-black bg-gray-100 dark:bg-gray-500 w-full p-1"></textarea>
			</form>
		</div>
    }
}


export default GamePage;