package com.example.demo;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.example.demo.dto.message.DInputMessage;
import com.example.demo.dto.message.DOutputMessage;
import com.example.demo.dto.player.DPlayer;
import com.example.demo.dto.poll.DCandidateState;
import com.example.demo.dto.poll.DVote;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class GameWebSocketHandler extends TextWebSocketHandler {
	
	@Autowired
	DaoService daoService;
	
	@Autowired
    ObjectMapper objectMapper;
	
	ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
	
	@Override
	public void afterConnectionEstablished(WebSocketSession session) {
		String username = session.getPrincipal().getName();
		
		sessions.put(username, session);
		DPlayer dplayer = daoService.switchOnline(username);
		Long room_id = daoService.getRoomIdByPlayer(username);
		
		if (room_id == null || dplayer == null)
			return;
		
		List<String> players = daoService.getPlayerUsernames(room_id);
		sendAll(players, dplayer, "player");
	}
	
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) {
		String username = session.getPrincipal().getName();
		
		sessions.remove(session.getPrincipal().getName());
		DPlayer dplayer = daoService.switchOnline(session.getPrincipal().getName());
		Long room_id = daoService.getRoomIdByPlayer(username);
		
		if (room_id == null || dplayer == null)
			return;
		
		List<String> players = daoService.getPlayerUsernames(room_id);
		sendAll(players, dplayer, "player");
	}
	
    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {}
    
    private String serializeAndWrap(Object obj, String type) {
		String data;
		
		if (obj.getClass() == String.class) {
			data = (String) obj;
		} else {
			try {
				data = objectMapper.writeValueAsString(obj);
			} catch(Exception e) {
				throw new RuntimeException(e);
			}
		}
		
		WSMessage wsMessage = new WSMessage(type, data);
		
		try {
			data = objectMapper.writeValueAsString(wsMessage);
		} catch(Exception e) {
			throw new RuntimeException(e);
		}
		
		return data;
    }
    
    public void sendAll(List<String> usernames, Object obj, String type) {
		
    	if (obj == null)
    		return;
    	
		String data = serializeAndWrap(obj, type);
		
		for (String username : usernames) {
			WebSocketSession session = sessions.get(username);

			if (session != null) {
				synchronized(session) {
					this.sendTextMessage(session, data);
				}
			}
		}
	}
    
    public void send(Object obj, String type, String username) {
		
    	if (obj == null)
    		return;
    	
		String data = serializeAndWrap(obj, type);
		
		WebSocketSession session = sessions.get(username);
		
		if (session == null)
			return;
		
		synchronized(session) {
			this.sendTextMessage(session, data);
		}
	}
	
	private void sendTextMessage(WebSocketSession session, String data) {
		try {
			session.sendMessage(new TextMessage(data));
		} catch(IOException e) {
			try {
				session.close();
			} catch(IOException exception) {
				throw new RuntimeException(exception);
			}
		}
	}

}

class WSMessage{
	private String type;
	private String data;
	
	public WSMessage(String type, String data) {
		super();
		this.type = type;
		this.data = data;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getData() {
		return data;
	}
	public void setData(String data) {
		this.data = data;
	}
}