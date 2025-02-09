package com.example.demo.repositories;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.hibernate.LockMode;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.player.DCharacter;
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
	public boolean tryEnter(long room_id, String username) {
		Session session = sessionFactory.getCurrentSession();
    	FUser user =  session.get(FUser.class, username, LockMode.PESSIMISTIC_WRITE);
    	FRoom room =  session.getReference(FRoom.class, room_id);
    	
    	if (user.getCharacter() != null)
    		return false;
    	
    	FParticipationToken token = session.createNativeQuery(
    			"SELECT * "
    		  + "FROM fparticipationtoken t "
  			  + "WHERE t.room_id = :room_id AND t.free = true "
  			  + "LIMIT 1 "
  			  + "FOR UPDATE SKIP LOCKED", FParticipationToken.class)
				.setParameter("room_id", room_id).getSingleResultOrNull();
    	
    	if (token == null)
    		return false;
    	
    	FCharacter character = session.getReference(FCharacter.class, new FCharacterId(room, token.getPindex()));
    	
    	user.setOnline(false);
    	user.setToken(token);
    	user.setCharacter(character);
    	
    	token.setFree(false);
    	
    	session.createMutationQuery("update FCharacter c set c.version = c.version + 1 where c = :character")
    		.setParameter("character", character).executeUpdate();
    	
		session.createMutationQuery("update FRoom r set r.playersCount = r.playersCount + 1 where r.id = :room_id" )
			.setParameter("room_id", room_id).executeUpdate();
		
		return true;
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED)
	public boolean tryExit(long room_id, String username) {
		Session session = sessionFactory.getCurrentSession();
    	FUser user =  session.get(FUser.class, username, LockMode.PESSIMISTIC_WRITE);
    	
    	if (user.getCharacter() == null || user.getCharacter().getRoom().getId() != room_id)
    		return true;
    		
    	session.createMutationQuery("update FCharacter c set c.version = c.version + 1 where c = :character")
			.setParameter("character", user.getCharacter()).executeUpdate();
    	
    	user.setCharacter(null);
    	user.getToken().setFree(true);
    	user.setToken(null);
    	
		session.createMutationQuery("update FRoom r set r.playersCount = r.playersCount - 1 where r.id = :room_id" )
			.setParameter("room_id", room_id).executeUpdate();
		
		return true;
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED)
	public void switchOnline(String username) {
    	Session session = sessionFactory.getCurrentSession();
    	FUser user =  session.get(FUser.class, username, LockMode.PESSIMISTIC_WRITE);
    	
    	user.setOnline(user.getOnline() ^ true);
    	
    	session.createMutationQuery("update FCharacter c set c.version = c.version + 1 where c = :character")
			.setParameter("character", user.getCharacter()).executeUpdate();
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED)
	public void imperius(long room_id, String username, short pindex) {
    	Session session = sessionFactory.getCurrentSession();
    	FRoom room = session.get(FRoom.class, room_id);
    	FUser user = session.get(FUser.class, username, LockMode.PESSIMISTIC_WRITE);
    	
    	if (user.getCharacter() == null || user.getCharacter().getRoom().getId() != room_id)
    		throw new RuntimeException();
    	
    	if (room.getStatus().equals("waiting")) {
    		throw new RuntimeException();
    	}
    	
    	short old_pindex = user.getCharacter().getPindex();
    
    	if (old_pindex < pindex) {
    		session.createMutationQuery("update FCharacter c set c.version = c.version + 1 where c.room.id = :room_id and c.pindex = :pindex")
    			.setParameter("room_id", room_id).setParameter("pindex", old_pindex).executeUpdate();
    		
    		session.createMutationQuery("update FCharacter c set c.version = c.version + 1 where c.room.id = :room_id and c.pindex = :pindex")
				.setParameter("room_id", room_id).setParameter("pindex", pindex).executeUpdate();
    	} else {
    		session.createMutationQuery("update FCharacter c set c.version = c.version + 1 where c.room.id = :room_id and c.pindex = :pindex")
				.setParameter("room_id", room_id).setParameter("pindex", pindex).executeUpdate();
		
			session.createMutationQuery("update FCharacter c set c.version = c.version + 1 where c.room.id = :room_id and c.pindex = :pindex")
				.setParameter("room_id", room_id).setParameter("pindex", old_pindex).executeUpdate();
    	}
    	
    	user.setCharacter(session.getReference(FCharacter.class, new FCharacterId(room, pindex)));
	}

    @Transactional(isolation = Isolation.READ_COMMITTED, readOnly=true)
	public DCharacter getCharacter(long room_id, short pindex) {
    	Session session = sessionFactory.getCurrentSession();
		FRoom room =  session.getReference(FRoom.class, room_id);
		FCharacter character = session.get(FCharacter.class, new FCharacterId(room, pindex));
		
		List<FUser> players = session.createSelectionQuery(
				"from FUser u where u.character = :character", FUser.class)
				.setParameter("character", character)
				.getResultList();
		
		DCharacter dcharacter = new DCharacter();
		dcharacter.setPlayers(players.stream().map(item -> new DPlayer(item.getUsername(), item.getOnline())).toList());
		dcharacter.setPindex(pindex);
		dcharacter.setVersion(character.getVersion());
		return dcharacter;
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED, readOnly=true)
	public List<DCharacter> getCharacters(long room_id) {
    	Session session = sessionFactory.getCurrentSession();
		FRoom room =  (FRoom) session.get(FRoom.class, room_id);
		List<FUser> players = session.createSelectionQuery(
				"from FUser u join fetch u.character where u.character.room = :room", FUser.class)
				.setParameter("room", room)
				.getResultList();
		
		List<FCharacter> fcharacters = session.createSelectionQuery(
				"from FCharacter c where c.room = :room order by c.pindex", FCharacter.class)
				.setParameter("room", room).getResultList();
		
		Map<Short, List<FUser> > characters = players.stream().collect(Collectors.groupingBy(player -> player.getCharacter().getPindex()));
		List<DCharacter> dcharacters = new ArrayList<>();
		
		for (Map.Entry<Short, List<FUser> > entry : characters.entrySet()) {
		    DCharacter dcharacter = new DCharacter();
		    dcharacter.setPindex(entry.getKey());
		    dcharacter.setVersion(fcharacters.get(entry.getKey()).getVersion());
		    dcharacter.setPlayers(entry.getValue().stream().map(fuser -> new DPlayer(fuser.getUsername(), fuser.getOnline())).toList());
		    dcharacters.add(dcharacter);
		}
		
		for (short pindex = 0; pindex < room.getMax_population(); pindex++) {
			if (!characters.containsKey(pindex)) {
			    DCharacter dcharacter = new DCharacter();
			    dcharacter.setPindex(pindex);
			    dcharacter.setVersion(fcharacters.get(pindex).getVersion());
			    dcharacter.setPlayers(new ArrayList<>());
			    dcharacters.add(dcharacter);
			}
		}
		
		return dcharacters;
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED, readOnly=true)
	public List<String> getPlayers(long room_id) {
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
