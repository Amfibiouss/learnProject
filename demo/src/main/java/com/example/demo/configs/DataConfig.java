package com.example.demo.configs;

import java.util.Properties;

import javax.sql.DataSource;

import org.hibernate.SessionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.hibernate5.LocalSessionFactoryBuilder;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.vendor.HibernateJpaDialect;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@EnableTransactionManagement
@Configuration
public class DataConfig {
	
	@Bean
	SessionFactory entityManagerFactory(DataSource dataSource) {
		LocalSessionFactoryBuilder builder = new LocalSessionFactoryBuilder(dataSource);
		builder.scanPackages("com.example.demo.entities");

		Properties properties = new Properties();
		//properties.setProperty("hibernate.hbm2ddl.auto", "update");
		properties.setProperty("hibernate.hbm2ddl.auto", "create");
		//properties.setProperty("hibernate.dialect", "org.hibernate.dialect.H2Dialect");
		//properties.setProperty("hibernate.show_sql", "true");
		//properties.setProperty("hibernate.format_sql", "true");
		builder.addProperties(properties);
		return builder.buildSessionFactory();
	}
	
	@Bean
	JpaTransactionManager jpaTransactionManager(SessionFactory sessionFactory) {
		final JpaTransactionManager transactionManager = new JpaTransactionManager();
		transactionManager.setEntityManagerFactory(sessionFactory);
		transactionManager.setJpaDialect(new HibernateJpaDialect());
		return transactionManager;
	}
}
