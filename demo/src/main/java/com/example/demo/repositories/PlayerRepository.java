package com.example.demo.repositories;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.LockMode;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.player.DPlayer;
import com.example.demo.entities.FCharacter;
import com.example.demo.entities.FCharacterId;
import com.example.demo.entities.FParticipationToken;
import com.example.demo.entities.FRoom;
import com.example.demo.entities.FUser;
import com.example.demo.views.UsernamePindex;

@Component
public class PlayerRepository {
    @Autowired
    SessionFactory sessionFactory;

    @Transactional(isolation = Isolation.READ_COMMITTED)
	public DPlayer tryEnter(long room_id, String username) {
		Session session = sessionFactory.getCurrentSession();
    	FUser user =  session.get(FUser.class, username, LockMode.PESSIMISTIC_WRITE);
    	FRoom room =  session.getReference(FRoom.class, room_id);
    	
    	if (user.getCharacter() != null)
    		throw new RuntimeException("Пользователь уже играет");
    	
    	FParticipationToken token = session.createNativeQuery(
    			"SELECT * "
    		  + "FROM fparticipationtoken t "
  			  + "WHERE t.room_id = :room_id AND t.free = true "
  			  + "LIMIT 1 "
  			  + "FOR UPDATE SKIP LOCKED", FParticipationToken.class)
				.setParameter("room_id", room_id).getSingleResultOrNull();
    	
    	if (token == null)
    		throw new RuntimeException("В комнате нет свободных мест");
    	
    	FCharacter character = session.getReference(FCharacter.class, new FCharacterId(room, token.getPindex()));
    	
    	user.setOnline(false);
    	user.setToken(token);
    	user.setCharacter(character);
    	
    	token.setFree(false);
    	token.setVersion(token.getVersion() + 1);
    	
		session.createMutationQuery("update FRoom r set r.playersCount = r.playersCount + 1 where r.id = :room_id" )
			.setParameter("room_id", room_id).executeUpdate();
		
    	DPlayer dplayer = new DPlayer();
    	dplayer.setUsername(username);
    	dplayer.setPindex(token.getPindex());
    	dplayer.setOnline(false);
    	dplayer.setToken(token.getPindex());
    	dplayer.setVersion(token.getVersion());
		
		return dplayer;
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED)
	public DPlayer tryExit(long room_id, String username) {
		Session session = sessionFactory.getCurrentSession();
    	FUser user =  session.get(FUser.class, username, LockMode.PESSIMISTIC_WRITE);
    	
    	if (user.getCharacter() == null || user.getCharacter().getRoom().getId() != room_id)
    		throw new RuntimeException("Игрока нет в комнате");
    	
    	FParticipationToken token = user.getToken(); 
    	user.setCharacter(null);
    	user.setToken(null);
    	
    	token.setFree(true);
    	token.setVersion(token.getVersion() + 1);
    	
    	DPlayer dplayer = new DPlayer();
    	dplayer.setUsername(null);
    	dplayer.setPindex(null);
    	dplayer.setOnline(null);
    	dplayer.setToken(token.getPindex());
    	dplayer.setVersion(token.getVersion());
    	
		session.createMutationQuery("update FRoom r set r.playersCount = r.playersCount - 1 where r.id = :room_id" )
			.setParameter("room_id", room_id).executeUpdate();
		
		return dplayer;
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED)
	public DPlayer switchOnline(String username) {
    	Session session = sessionFactory.getCurrentSession();
    	FUser user =  session.get(FUser.class, username, LockMode.PESSIMISTIC_WRITE);
    	
    	user.setOnline(user.getOnline() ^ true);
    	FParticipationToken token = user.getToken();
    	token.setVersion(token.getVersion() + 1);
    	
    	DPlayer dplayer = new DPlayer();
    	dplayer.setUsername(username);
    	dplayer.setPindex(user.getCharacter().getPindex());
    	dplayer.setOnline(user.getOnline());
    	dplayer.setToken(token.getPindex());
    	dplayer.setVersion(token.getVersion());
    	
    	return dplayer;
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED)
	public DPlayer imperius(long room_id, String username, short pindex) {
    	Session session = sessionFactory.getCurrentSession();
    	FRoom room = session.get(FRoom.class, room_id);
    	FUser user = session.get(FUser.class, username, LockMode.PESSIMISTIC_WRITE);
    	
    	if (user.getCharacter() == null || user.getCharacter().getRoom().getId() != room_id)
    		throw new RuntimeException();
    	
    	if (room.getStatus().equals("waiting")) {
    		throw new RuntimeException();
    	}
    	
    	user.setCharacter(session.getReference(FCharacter.class, new FCharacterId(room, pindex)));
    	FParticipationToken token = user.getToken();
    	token.setVersion(token.getVersion() + 1);
    	
    	DPlayer dplayer = new DPlayer();
    	dplayer.setUsername(username);
    	dplayer.setPindex(pindex);
    	dplayer.setOnline(user.getOnline());
    	dplayer.setToken(token.getPindex());
    	dplayer.setVersion(token.getVersion());
    	
    	return dplayer;
	}

    @Transactional(isolation = Isolation.REPEATABLE_READ, readOnly=true)
	public List<DPlayer> getPlayers(long room_id) {
    	Session session = sessionFactory.getCurrentSession();
		FRoom room =  (FRoom) session.get(FRoom.class, room_id);
		
		List<Object[]> raw_players = session.createSelectionQuery(
				"select pt.user, pt from FParticipationToken pt left join pt.user where pt.room = :room", Object[].class)
				.setParameter("room", room)
				.getResultList();
		
		//System.out.println("####" + raw_players.size());
		
		List<DPlayer> dplayers = new ArrayList<>();
		for (Object[] obj : raw_players) {
			FUser user = (FUser) obj[0];
			FParticipationToken token = (FParticipationToken) obj[1];
			
	    	DPlayer dplayer = new DPlayer();
	    	if (user != null) {
		    	dplayer.setUsername(user.getUsername());
		    	dplayer.setPindex(user.getCharacter().getPindex());
		    	dplayer.setOnline(user.getOnline());
	    	}
	    	dplayer.setToken(token.getPindex());
	    	dplayer.setVersion(token.getVersion());
		    dplayers.add(dplayer);
		}
		
		return dplayers;
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED, readOnly=true)
	public List<String> getPlayerUsernames(long room_id) {
		Session session = sessionFactory.getCurrentSession();

    	return session.createSelectionQuery("select u.username from FUser u where u.character.room.id = :room_id", String.class)
    			.setParameter("room_id", room_id).getResultList();
	}

    @Transactional(isolation = Isolation.READ_COMMITTED, readOnly=true)
	public List<UsernamePindex> getPlayersAndPindexes(long room_id) {
		Session session = sessionFactory.getCurrentSession();
    	
    	return session.createSelectionQuery("select u.username, u.character.pindex from FUser u where u.character.room.id = :room_id", UsernamePindex.class)
    			.setParameter("room_id", room_id).getResultList();
	}
}
