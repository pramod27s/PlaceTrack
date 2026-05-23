package org.pramod.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * PlaceTrack API — the personal placement-season command center.
 *
 * <p>Authentication is handled entirely by our stateless JWT filter
 * (see {@code SecurityConfig}); no session or form login is used.
 */
@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

}
