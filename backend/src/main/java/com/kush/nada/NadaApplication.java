package com.kush.nada;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NadaApplication {


	public static void main(String[] args) {
		SpringApplication.run(NadaApplication.class, args);
		System.out.println("Habari");
	}

}
