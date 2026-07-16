package com.elparadisogonzalo;

/**
 * Elparadisogonzalo
 *
 * <p>A modern open-source Web3 platform providing:</p>
 * <ul>
 *   <li>React frontend</li>
 *   <li>Android application with Capacitor</li>
 *   <li>Ethereum and BNB Chain integration</li>
 *   <li>Wallet connectivity</li>
 *   <li>Progressive Web App support</li>
 * </ul>
 *
 * <p>Project:</p>
 * <a href="https://github.com/azehagowa-creator/elparadisogonzalo.com">
 * https://github.com/azehagowa-creator/elparadisogonzalo.com
 * </a>
 *
 * @author Elparadisogonzalo
 * @version 2.0.0
 * @since 2.0.0
 */
public final class Application {

    private Application() {
        // Prevent instantiation
    }

    /**
     * Returns the application name.
     *
     * @return application name
     */
    public static String getName() {
        return "Elparadisogonzalo";
    }

    /**
     * Returns the application version.
     *
     * @return version string
     */
    public static String getVersion() {
        return "2.0.0";
    }

    /**
     * Main entry point.
     *
     * @param args command-line arguments
     */
    public static void main(String[] args) {
        System.out.println(getName() + " " + getVersion());
    }
}
