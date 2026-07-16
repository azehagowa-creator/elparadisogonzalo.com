import React from "react";
import "./App.css";

export default function App() {
  const features = [
    {
      title: "Modern Web Experience",
      description:
        "Fast, responsive, and accessible user interface built with React.",
    },
    {
      title: "Android Ready",
      description:
        "Powered by Capacitor for seamless Android application deployment.",
    },
    {
      title: "Open Source",
      description:
        "Community-driven development with GitHub collaboration.",
    },
    {
      title: "Secure",
      description:
        "Designed with modern security practices and HTTPS-first deployment.",
    },
  ];

  return (
    <div className="app">
      <header className="hero">
        <h1>Elparadisogonzalo</h1>
        <p>
          A modern cross-platform application built with React, Capacitor,
          Android, and modern web technologies.
        </p>

        <div className="hero-buttons">
          <a
            href="https://github.com/azehagowa-creator/elparadisogonzalo.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>

          <a
            href="https://elparadisogonzalo.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Website
          </a>
        </div>
      </header>

      <main>
        <section>
          <h2>Features</h2>

          <div className="features">
            {features.map((feature) => (
              <article key={feature.title} className="card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2>Technology Stack</h2>

          <ul>
            <li>React</li>
            <li>Capacitor</li>
            <li>Android</li>
            <li>Java</li>
            <li>Gradle</li>
            <li>GitHub Actions</li>
            <li>Node.js</li>
          </ul>
        </section>

        <section>
          <h2>Mission</h2>

          <p>
            Elparadisogonzalo aims to provide a reliable platform combining
            modern web technologies with Android deployment while remaining
            open source and community friendly.
          </p>
        </section>

        <section>
          <h2>Get Started</h2>

          <ol>
            <li>Clone the repository.</li>
            <li>Install dependencies using npm.</li>
            <li>Run the development server.</li>
            <li>Build the Android application using Gradle.</li>
          </ol>
        </section>
      </main>

      <footer>
        <p>
          © {new Date().getFullYear()} Elparadisogonzalo. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
