package com.example.demo.repositories;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entities.FUser;

@Component
public class UserRepository {
    @Autowired
    SessionFactory sessionFactory;
	
	@Transactional(isolation = Isolation.READ_COMMITTED)
    public void addUser(String username,
    			String password,
    			String role) {
    	Session session = sessionFactory.getCurrentSession();
    	
    	FUser user = new FUser();
    	user.setUsername(username);
    	user.setPassword(password);
    	user.setRole(role);
    	
    	session.persist(user);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public String getPassword(String username) {
    	Session session = sessionFactory.getCurrentSession();
    	FUser user =  (FUser) session.get(FUser.class, username);
    	return user.getPassword();
    }
    


}
