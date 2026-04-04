package project.TeamFive.ExLMS;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ExLmsApplication { // cap nhat

	public static void main(String[] args) {
		// Load .env from project root or current dir
		String userDir = System.getProperty("user.dir");
		System.out.println("DEBUG: Current Working Directory: " + userDir);

		Dotenv dotenv = Dotenv.configure()
				.directory("./")
				.ignoreIfMissing()
				.load();

		if (dotenv.entries().isEmpty()) {
			System.out.println("DEBUG: .env not found in ./ searching in ..");
			dotenv = Dotenv.configure()
					.directory("..")
					.ignoreIfMissing()
					.load();
		}

		System.out.println("DEBUG: Number of .env entries loaded: " + dotenv.entries().size());

		dotenv.entries().forEach(entry -> {
			System.setProperty(entry.getKey(), entry.getValue());
		});

		SpringApplication.run(ExLmsApplication.class, args);
	}

}
